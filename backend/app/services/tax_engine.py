"""
Detailed Tax Engine - India-specific tax calculations.

Implements:
- Section 24(b) interest deduction (up to ₹2L/year)
- Rental income tax (30% standard deduction, interest deduction)
- LTCG with simplified indexation
- Post-tax IRR
"""

from app.models.investment import InvestmentInput
from app.services.financial_engine import (
    calculate_emi,
    calculate_total_interest_paid,
    calculate_total_equity_built,
    calculate_future_property_value,
)
from app.utils.irr import calculate_irr

SECTION_24_B_LIMIT = 200_000  # ₹2 lakh per year
STANDARD_DEDUCTION_RATE = 0.30  # 30% on rental income
LTCG_TAX_RATE = 0.20  # 20%
INFLATION_ASSUMPTION = 0.06  # 6% for indexation


def _annual_interest_approx(
    loan_amount: float, emi: float, annual_rate: float, holding_years: int
) -> float:
    """Approximate average annual interest (total / years)."""
    months_paid = min(holding_years * 12, 30 * 12)  # Cap at 30 years
    total = calculate_total_interest_paid(
        loan_amount, emi, annual_rate, months_paid
    )
    return total / holding_years if holding_years > 0 else 0


def run_tax_analysis(input_data: InvestmentInput) -> dict:
    """
    Compute detailed India tax analysis.

    Returns:
        tax_savings_from_interest: Annual savings from Section 24(b)
        rental_tax_liability: Total tax on rental income over holding period
        capital_gains_tax: LTCG with indexation
        post_tax_irr: IRR after tax impacts
    """
    purchase_price = input_data.property_purchase_price
    down_payment = input_data.down_payment
    loan_amount = purchase_price - down_payment
    annual_rate = input_data.loan_interest_rate
    tenure_years = input_data.loan_tenure_years
    tenure_months = tenure_years * 12
    monthly_rent = input_data.expected_monthly_rent
    annual_rent = monthly_rent * 12
    maintenance = input_data.annual_maintenance_cost
    appreciation = input_data.expected_annual_appreciation
    holding_years = input_data.holding_period_years
    tax_slab = input_data.investor_tax_slab / 100  # As decimal

    emi = calculate_emi(loan_amount, annual_rate, tenure_months)
    holding_months = holding_years * 12
    months_paid = min(holding_months, tenure_months)

    # Average annual interest for Section 24(b)
    total_interest = calculate_total_interest_paid(
        loan_amount, emi, annual_rate, months_paid
    )
    avg_annual_interest = total_interest / holding_years if holding_years > 0 else 0

    # Section 24(b): Deduction up to ₹2L per year
    deductible_interest_per_year = min(avg_annual_interest, SECTION_24_B_LIMIT)
    tax_savings_per_year = deductible_interest_per_year * tax_slab
    tax_savings_from_interest = round(
        tax_savings_per_year * holding_years, 2
    )

    # Rental income tax
    # Taxable = (Rent - 30% standard) - min(interest, 2L)
    #        = 0.7 * rent - min(interest, 2L)
    gross_annual_value = annual_rent
    standard_deduction = gross_annual_value * STANDARD_DEDUCTION_RATE
    interest_deduction = deductible_interest_per_year
    taxable_rent_per_year = max(
        0,
        gross_annual_value - standard_deduction - interest_deduction
    )
    rental_tax_per_year = taxable_rent_per_year * tax_slab
    rental_tax_liability = round(rental_tax_per_year * holding_years, 2)

    # LTCG with indexation
    future_value = calculate_future_property_value(
        purchase_price, appreciation, holding_years
    )
    capital_gains_nominal = max(0, future_value - purchase_price)

    # Indexation: indexed cost = purchase * (1 + inflation)^years
    indexation_factor = (1 + INFLATION_ASSUMPTION) ** holding_years
    indexed_cost = purchase_price * indexation_factor
    indexed_capital_gains = max(0, future_value - indexed_cost)
    capital_gains_tax = round(indexed_capital_gains * LTCG_TAX_RATE, 2)

    # Post-tax cash flows for IRR
    total_equity = calculate_total_equity_built(
        loan_amount, emi, annual_rate, months_paid
    )
    remaining_loan = max(0, loan_amount - total_equity)

    annual_emi = emi * 12
    annual_net_cf_before_tax = annual_rent - annual_emi - maintenance

    # Post-tax annual CF: before_tax - rental_tax + tax_saving_interest
    post_tax_annual_cf = (
        annual_net_cf_before_tax
        - rental_tax_per_year
        + tax_savings_per_year
    )

    sale_proceeds = future_value - capital_gains_tax - remaining_loan

    cash_flows = [-down_payment]
    for _ in range(holding_years - 1):
        cash_flows.append(post_tax_annual_cf)
    cash_flows.append(post_tax_annual_cf + sale_proceeds)

    irr_decimal = calculate_irr(cash_flows)
    post_tax_irr = round(irr_decimal * 100, 2)

    return {
        "tax_savings_from_interest": tax_savings_from_interest,
        "rental_tax_liability": rental_tax_liability,
        "capital_gains_tax": capital_gains_tax,
        "post_tax_irr": post_tax_irr,
        "indexed_capital_gains": round(indexed_capital_gains, 2),
        "indexation_factor": round(indexation_factor, 4),
    }
