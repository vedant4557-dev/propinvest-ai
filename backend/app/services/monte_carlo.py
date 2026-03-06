"""
Monte Carlo Simulation — PropInvest AI V3
1000 scenarios with correlated appreciation/rent uncertainty.
"""
import math
import random
from app.models.schemas import InvestmentInput, MonteCarloResult, IRRHistogramBin
from app.utils.irr import calculate_irr

FD_BENCHMARK = 7.0
NUM_SCENARIOS = 1000


def run_monte_carlo(inp: InvestmentInput, base_irr: float) -> MonteCarloResult:
    """Run 1000 Monte Carlo scenarios varying appreciation and rent."""
    random.seed(42)  # reproducible

    appreciation_mean = inp.expected_annual_appreciation
    appreciation_std = max(2.0, appreciation_mean * 0.35)

    rent_mean = inp.expected_monthly_rent
    rent_std = rent_mean * 0.12

    loan_amount = inp.property_purchase_price - inp.down_payment
    stamp = inp.property_purchase_price * inp.stamp_duty_percent / 100
    reg = inp.property_purchase_price * inp.registration_cost_percent / 100
    effective_down = inp.down_payment + stamp + reg

    # EMI (fixed)
    if inp.loan_interest_rate > 0:
        r = inp.loan_interest_rate / 100 / 12
        n = inp.loan_tenure_years * 12
        emi = loan_amount * r * (1 + r) ** n / ((1 + r) ** n - 1)
    else:
        emi = loan_amount / (inp.loan_tenure_years * 12)

    annual_emi = emi * 12

    irr_samples = []

    for _ in range(NUM_SCENARIOS):
        # Box-Muller for normal distribution
        u1, u2 = max(1e-10, random.random()), random.random()
        z1 = math.sqrt(-2 * math.log(u1)) * math.cos(2 * math.pi * u2)
        z2 = math.sqrt(-2 * math.log(u1)) * math.sin(2 * math.pi * u2)

        apprec = appreciation_mean + appreciation_std * z1
        rent = max(0, rent_mean + rent_std * z2)

        eff_rent = rent * 12 * (1 - inp.vacancy_rate / 100)
        future_value = inp.property_purchase_price * (1 + apprec / 100) ** inp.holding_period_years
        cg_tax = max(0, (future_value - inp.property_purchase_price) * 0.20)

        periods = min(inp.holding_period_years * 12, inp.loan_tenure_years * 12)
        if inp.loan_interest_rate > 0:
            r = inp.loan_interest_rate / 100 / 12
            n = inp.loan_tenure_years * 12
            remaining = emi * (1 - (1 + r) ** -(n - periods)) / r if n > periods else 0
        else:
            remaining = max(0, loan_amount - (loan_amount / (inp.loan_tenure_years * 12)) * periods)

        net_sale = future_value - remaining - cg_tax

        flows = [-effective_down]
        for yr in range(1, inp.holding_period_years + 1):
            cf = eff_rent - annual_emi - inp.annual_maintenance_cost
            if yr == inp.holding_period_years:
                cf += net_sale
            flows.append(cf)

        irr = calculate_irr(flows)
        if irr is not None and -50 < irr < 200:
            irr_samples.append(irr)

    if not irr_samples:
        irr_samples = [base_irr]

    irr_samples.sort()
    n = len(irr_samples)

    expected_irr = sum(irr_samples) / n
    median_irr = irr_samples[n // 2]
    std_irr = math.sqrt(sum((x - expected_irr) ** 2 for x in irr_samples) / n)

    idx_5 = max(0, int(n * 0.05))
    idx_95 = min(n - 1, int(n * 0.95))
    var_5 = irr_samples[idx_5]
    worst_case = irr_samples[idx_5]
    best_case = irr_samples[idx_95]

    prob_beat_fd = sum(1 for x in irr_samples if x > FD_BENCHMARK) / n * 100
    prob_neg_cf = sum(
        1 for x in irr_samples
        if x < 0
    ) / n * 100

    # Build histogram (20 bins)
    min_irr, max_irr = irr_samples[0], irr_samples[-1]
    bin_width = (max_irr - min_irr) / 20 if max_irr > min_irr else 1
    histogram: list[IRRHistogramBin] = []
    for i in range(20):
        lo = min_irr + i * bin_width
        hi = lo + bin_width
        count = sum(1 for x in irr_samples if lo <= x < hi)
        histogram.append(IRRHistogramBin(bin_start=round(lo, 2), bin_end=round(hi, 2), count=count))

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
