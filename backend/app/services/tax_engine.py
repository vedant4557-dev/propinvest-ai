"""
India Tax Engine — PropInvest AI V3
Section 24(b), rental taxation, LTCG with indexation, stamp duty.
"""
from app.models.schemas import InvestmentInput, InvestmentMetrics, TaxAnalysis
from app.utils.irr import calculate_irr


SECTION_24B_CAP = 200_000          # ₹2 lakh cap on home loan interest deduction
RENTAL_STANDARD_DEDUCTION = 0.30   # 30% standard deduction on rental income
LTCG_RATE = 0.20                   # LTCG rate with indexation
INDEXATION_RATE = 0.06             # Assumed 6% annual inflation for indexation


def calculate_tax(inp: InvestmentInput, metrics: InvestmentMetrics) -> TaxAnalysis:
    tax_slab = inp.investor_tax_slab / 100

    # ── Acquisition taxes ─────────────────────────────────────────────────────
    stamp_duty_paid = inp.property_purchase_price * inp.stamp_duty_percent / 100
    reg_cost_paid = inp.property_purchase_price * inp.registration_cost_percent / 100
    total_acquisition_tax = stamp_duty_paid + reg_cost_paid

    # ── Section 24(b) interest deduction ─────────────────────────────────────
    # Annual interest (approximate: total interest / tenure)
    annual_interest_approx = metrics.total_interest_paid / inp.loan_tenure_years
    deductible_interest = min(annual_interest_approx, SECTION_24B_CAP)
    tax_savings = deductible_interest * tax_slab

    # ── Rental income taxation ────────────────────────────────────────────────
    gross_rent = metrics.annual_rental_income
    # 30% standard deduction allowed
    taxable_rental = gross_rent * (1 - RENTAL_STANDARD_DEDUCTION)
    rental_tax = taxable_rental * tax_slab

    # ── LTCG with indexation ──────────────────────────────────────────────────
    # Indexed cost = purchase_price × (1 + inflation)^years
    indexation_factor = (1 + INDEXATION_RATE) ** inp.holding_period_years
    indexed_cost = inp.property_purchase_price * indexation_factor
    indexed_gains = max(0, metrics.future_property_value - indexed_cost)

    if inp.holding_period_years >= 2:
        cg_tax = indexed_gains * LTCG_RATE
    else:
        # Short-term: taxed at slab
        cg_tax = max(0, (metrics.future_property_value - inp.property_purchase_price)) * tax_slab

    # ── Post-tax IRR ──────────────────────────────────────────────────────────
    # Re-compute IRR factoring in actual tax impacts
    annual_emi = metrics.emi * 12
    eff_rent = metrics.effective_annual_rent
    maintenance = inp.annual_maintenance_cost
    annual_after_tax_cf = eff_rent - annual_emi - maintenance - rental_tax + tax_savings

    net_sale = metrics.future_property_value - cg_tax
    # subtract remaining loan balance from sale
    loan_remaining = metrics.loan_amount - metrics.total_equity_built
    net_sale_proceeds = net_sale - max(0, loan_remaining)

    flows = [-metrics.effective_down_payment]
    for yr in range(1, inp.holding_period_years + 1):
        cf = annual_after_tax_cf
        if yr == inp.holding_period_years:
            cf += net_sale_proceeds
        flows.append(cf)

    post_tax_irr_raw = calculate_irr(flows) or metrics.irr
    # Guard: IRR solver can return extreme values on pathological inputs
    import math as _math
    post_tax_irr = post_tax_irr_raw if _math.isfinite(post_tax_irr_raw) else metrics.irr
    post_tax_irr = max(-100.0, min(post_tax_irr, 300.0))

    net_tax_benefit = tax_savings - rental_tax

    return TaxAnalysis(
        stamp_duty_paid=round(stamp_duty_paid, 2),
        registration_cost_paid=round(reg_cost_paid, 2),
        total_acquisition_tax=round(total_acquisition_tax, 2),
        tax_savings_from_interest=round(tax_savings, 2),
        rental_income_taxable=round(taxable_rental, 2),
        rental_tax_liability=round(rental_tax, 2),
        capital_gains=round(metrics.capital_gains, 2),
        indexed_cost=round(indexed_cost, 2),
        indexed_capital_gains=round(indexed_gains, 2),
        capital_gains_tax=round(cg_tax, 2),
        indexation_factor=round(indexation_factor, 3),
        post_tax_irr=round(post_tax_irr, 2),
        net_tax_benefit=round(net_tax_benefit, 2),
    )
