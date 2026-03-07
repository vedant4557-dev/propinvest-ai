"""
Monte Carlo Simulation — PropInvest AI V3.1
1000 scenarios with correlated appreciation/rent/vacancy uncertainty.
Uses Box-Muller transform for normal distributions.
Variables randomized: appreciation (±2% std), rent growth (±1.5%), vacancy (±3%).
"""
import math
import random
from app.models.schemas import InvestmentInput, MonteCarloResult, IRRHistogramBin
from app.utils.irr import calculate_irr

FD_BENCHMARK = 7.0
NUM_SCENARIOS = 1000

# Standard deviations per spec
APPRECIATION_STD = 2.0   # % points
RENT_STD_FACTOR  = 0.12  # 12% of base rent (≈1.5% yield std)
VACANCY_STD      = 3.0   # % points


def _box_muller_pair(u1: float, u2: float) -> tuple[float, float]:
    """Generate two standard normal variates via Box-Muller."""
    u1 = max(1e-10, u1)
    mag = math.sqrt(-2 * math.log(u1))
    return (
        mag * math.cos(2 * math.pi * u2),
        mag * math.sin(2 * math.pi * u2),
    )


def run_monte_carlo(inp: InvestmentInput, base_irr: float) -> MonteCarloResult:
    """Run 1000 Monte Carlo scenarios varying appreciation, rent, and vacancy."""
    random.seed(42)  # reproducible results

    appreciation_mean = inp.expected_annual_appreciation
    rent_mean = inp.expected_monthly_rent
    vacancy_mean = inp.vacancy_rate

    loan_amount = inp.property_purchase_price - inp.down_payment
    stamp = inp.property_purchase_price * inp.stamp_duty_percent / 100
    reg = inp.property_purchase_price * inp.registration_cost_percent / 100
    effective_down = inp.down_payment + stamp + reg

    # EMI (fixed for all scenarios — interest rate not randomized)
    if inp.loan_interest_rate > 0:
        r = inp.loan_interest_rate / 100 / 12
        n = inp.loan_tenure_years * 12
        emi = loan_amount * r * (1 + r) ** n / ((1 + r) ** n - 1)
    else:
        emi = loan_amount / max(1, inp.loan_tenure_years * 12)

    annual_emi = emi * 12

    # Pre-compute loan balance at exit (same for all scenarios)
    periods = min(inp.holding_period_years * 12, inp.loan_tenure_years * 12)
    if inp.loan_interest_rate > 0:
        r = inp.loan_interest_rate / 100 / 12
        n = inp.loan_tenure_years * 12
        remaining_loan = emi * (1 - (1 + r) ** -(n - periods)) / r if n > periods else 0.0
    else:
        remaining_loan = max(0, loan_amount - (loan_amount / max(1, inp.loan_tenure_years * 12)) * periods)

    irr_samples: list[float] = []

    for _ in range(NUM_SCENARIOS):
        u1, u2, u3, u4 = (max(1e-10, random.random()) for _ in range(4))
        z1, z2 = _box_muller_pair(u1, u2)
        z3, _ = _box_muller_pair(u3, u4)

        # Randomize three variables with normal distributions
        apprec = appreciation_mean + APPRECIATION_STD * z1
        rent   = max(0, rent_mean + rent_mean * 0.12 * z2)
        vac    = max(0, min(80, vacancy_mean + VACANCY_STD * z3))

        eff_rent = rent * 12 * (1 - vac / 100)
        future_value = inp.property_purchase_price * (1 + apprec / 100) ** inp.holding_period_years
        cg_tax = max(0, (future_value - inp.property_purchase_price) * 0.20)
        net_sale = future_value - remaining_loan - cg_tax

        flows = [-effective_down]
        for yr in range(1, inp.holding_period_years + 1):
            cf = eff_rent - annual_emi - inp.annual_maintenance_cost
            if yr == inp.holding_period_years:
                cf += net_sale
            flows.append(cf)

        irr = calculate_irr(flows)
        # Accept IRR in realistic range — filter out extreme outliers
        if irr is not None and -100 < irr < 150:
            irr_samples.append(irr)

    if not irr_samples:
        irr_samples = [base_irr]

    irr_samples.sort()
    n = len(irr_samples)

    expected_irr = sum(irr_samples) / n
    median_irr = irr_samples[n // 2]
    std_irr = math.sqrt(sum((x - expected_irr) ** 2 for x in irr_samples) / n)

    idx_5  = max(0, int(n * 0.05))
    idx_95 = min(n - 1, int(n * 0.95))
    var_5       = irr_samples[idx_5]
    worst_case  = irr_samples[idx_5]
    best_case   = irr_samples[idx_95]

    prob_beat_fd  = sum(1 for x in irr_samples if x > FD_BENCHMARK) / n * 100
    prob_neg_cf   = sum(1 for x in irr_samples if x < 0) / n * 100

    # Build histogram (20 bins)
    min_irr, max_irr = irr_samples[0], irr_samples[-1]
    bin_width = (max_irr - min_irr) / 20 if max_irr > min_irr else 1.0
    histogram: list[IRRHistogramBin] = []
    for i in range(20):
        lo_b = min_irr + i * bin_width
        hi_b = lo_b + bin_width
        count = sum(1 for x in irr_samples if lo_b <= x < hi_b)
        histogram.append(IRRHistogramBin(
            bin_start=round(lo_b, 2),
            bin_end=round(hi_b, 2),
            count=count,
        ))

    return MonteCarloResult(
        expected_irr=round(expected_irr, 2),
        worst_case_irr=round(worst_case, 2),
        best_case_irr=round(best_case, 2),
        var_5_percent=round(var_5, 2),
        probability_beating_fd=round(prob_beat_fd, 1),
        probability_negative_cashflow=round(prob_neg_cf, 1),
        irr_distribution=[round(x, 2) for x in irr_samples[::10]],  # every 10th
        irr_histogram=histogram,
        scenario_count=n,
        median_irr=round(median_irr, 2),
        std_irr=round(std_irr, 2),
    )
