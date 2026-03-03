"""
Financial Engine - Core calculation logic for property investment analysis.

All formulas implemented as per Indian real estate investment conventions.
"""

from typing import List

from app.models.investment import InvestmentInput, InvestmentMetrics


def calculate_emi(principal: float, annual_rate: float, tenure_months: int) -> float:
    """
    Calculate EMI using standard formula:
    EMI = P * r * (1+r)^n / ((1+r)^n - 1)

    Where:
        P = Principal (loan amount)
        r = Monthly interest rate (annual_rate / 12 / 100)
        n = Number of monthly installments

    Args:
        principal: Loan principal in INR
        annual_rate: Annual interest rate as percentage (e.g., 8.5 for 8.5%)
        tenure_months: Loan tenure in months

    Returns:
        Monthly EMI in INR
    """
    if principal <= 0 or tenure_months <= 0:
        return 0.0

    r = (annual_rate / 100) / 12  # Monthly rate as decimal
    factor = (1 + r) ** tenure_months
    denom = factor - 1
    if denom <= 0:  # Prevent divide-by-zero (e.g. r ≈ 0)
        return round(principal / tenure_months, 2)
    emi = principal * r * factor / denom
    return round(emi, 2)


def calculate_rental_yield(annual_rent: float, property_price: float) -> float:
    """
    Annual Rental Yield = (Annual Rent / Property Price) * 100

    Args:
        annual_rent: Total annual rent in INR
        property_price: Property purchase price in INR

    Returns:
        Rental yield as percentage
    """
    if property_price <= 0:
        return 0.0
    return round((annual_rent / property_price) * 100, 2)


def calculate_annual_cash_flow(
    annual_rent: float, annual_emi: float, annual_maintenance: float
) -> float:
    """
    Annual Net Cash Flow = Annual Rent - (EMI * 12) - Annual Maintenance

    Positive = property generates more than it costs.
    Negative = investor must subsidize from pocket.

    Args:
        annual_rent: Total annual rent in INR
        annual_emi: Total annual EMI (monthly_emi * 12) in INR
        annual_maintenance: Annual maintenance cost in INR

    Returns:
        Net annual cash flow in INR
    """
    return round(annual_rent - annual_emi - annual_maintenance, 2)


def calculate_future_property_value(
    purchase_price: float, appreciation_rate: float, years: int
) -> float:
    """
    Future Property Value = Price * (1 + appreciation_rate)^holding_period

    Args:
        purchase_price: Current property price in INR
        appreciation_rate: Annual appreciation as decimal (e.g., 0.06 for 6%)
        years: Holding period in years

    Returns:
        Projected future value in INR
    """
    return round(purchase_price * ((1 + appreciation_rate / 100) ** years), 2)


def calculate_total_interest_paid(
    principal: float, emi: float, annual_rate: float, months_paid: int
) -> float:
    """
    Calculate total interest paid over a period using amortization.

    For each month: interest = remaining_principal * monthly_rate
    We simulate the loan and sum interest paid.

    Args:
        principal: Loan principal in INR
        emi: Monthly EMI in INR
        annual_rate: Annual interest rate as percentage
        months_paid: Number of months over which we calculate (holding period * 12)

    Returns:
        Total interest paid in INR
    """
    if principal <= 0 or emi <= 0 or months_paid <= 0:
        return 0.0

    monthly_rate = (annual_rate / 100) / 12
    remaining = principal
    total_interest = 0.0

    for _ in range(months_paid):
        interest = remaining * monthly_rate
        principal_payment = emi - interest
        total_interest += interest
        remaining -= principal_payment
        if remaining <= 0:
            break

    return round(total_interest, 2)


def calculate_total_equity_built(
    principal: float, emi: float, annual_rate: float, months_paid: int
) -> float:
    """
    Total equity built = Total principal repaid over the period.

    Args:
        principal: Initial loan amount
        emi: Monthly EMI
        annual_rate: Annual interest rate
        months_paid: Months of payments

    Returns:
        Total principal repaid (equity built) in INR
    """
    if principal <= 0 or emi <= 0 or months_paid <= 0:
        return 0.0

    monthly_rate = (annual_rate / 100) / 12
    remaining = principal
    total_principal_paid = 0.0

    for _ in range(months_paid):
        interest = remaining * monthly_rate
        principal_payment = min(emi - interest, remaining)
        total_principal_paid += principal_payment
        remaining -= principal_payment
        if remaining <= 0:
            break

    return round(total_principal_paid, 2)


def calculate_capital_gains_tax(capital_gains: float, tax_rate: float = 20.0) -> float:
    """
    Capital Gains Tax - Simplified for MVP: flat 20% with indexation.
    In India, LTCG on property is 20% with indexation benefit.
    For MVP we use flat 20% as specified.

    Args:
        capital_gains: Capital gains amount in INR
        tax_rate: Tax rate as percentage (default 20%)

    Returns:
        Tax amount in INR
    """
    if capital_gains <= 0:
        return 0.0
    return round(capital_gains * (tax_rate / 100), 2)


def run_financial_engine(input_data: InvestmentInput) -> InvestmentMetrics:
    """
    Execute full financial analysis and return all metrics.

    Args:
        input_data: InvestmentInput with all parameters

    Returns:
        InvestmentMetrics with all calculated values
    """
    # Extract inputs
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
    holding_months = holding_years * 12

    # 1) EMI
    emi = calculate_emi(loan_amount, annual_rate, tenure_months)

    # 2) Annual Rental Yield
    rental_yield = calculate_rental_yield(annual_rent, purchase_price)

    # 3) Annual & Monthly Cash Flow
    annual_cash_flow = calculate_annual_cash_flow(annual_rent, emi * 12, maintenance)
    monthly_cash_flow = round(annual_cash_flow / 12, 2)

    # 4) Future Property Value
    future_value = calculate_future_property_value(purchase_price, appreciation, holding_years)

    # 5) Total Interest Paid (over holding period, not full loan tenure)
    months_paid = min(holding_months, tenure_months)
    total_interest = calculate_total_interest_paid(loan_amount, emi, annual_rate, months_paid)

    # 6) Total Equity Built
    total_equity = calculate_total_equity_built(
        loan_amount, emi, annual_rate, months_paid
    )

    # 5) Capital Gains
    capital_gains = round(future_value - purchase_price, 2)

    # 6) Capital Gains Tax (20% flat for MVP)
    cap_gains_tax = calculate_capital_gains_tax(capital_gains, 20.0)

    # Build cash flows for IRR
    annual_net_cf = annual_rent - (emi * 12) - maintenance
    cash_flows = [-down_payment]

    for year in range(holding_years - 1):
        cash_flows.append(annual_net_cf)

    # Last year: annual CF + sale proceeds
    remaining_loan = max(0, loan_amount - total_equity)
    sale_proceeds = future_value - cap_gains_tax - remaining_loan
    cash_flows.append(annual_net_cf + sale_proceeds)

    # 7) IRR
    from app.utils.irr import calculate_irr

    irr_decimal = calculate_irr(cash_flows)
    irr_percent = round(irr_decimal * 100, 2)

    # 8) ROI & Total Invested
    # Total invested = down payment + net cash outflow over holding period
    # When annual_cash_flow is negative, we add money each year
    total_emi_paid = emi * min(holding_months, tenure_months)
    total_rent_received = annual_rent * holding_years
    total_maintenance_paid = maintenance * holding_years
    net_annual_outflow = (emi * 12) + maintenance - annual_rent  # Positive = we pay from pocket
    total_invested = down_payment + max(0, net_annual_outflow * holding_years)

    # Net profit = sale proceeds + rent received - EMI paid - maintenance - down payment
    net_profit = sale_proceeds + total_rent_received - total_emi_paid - total_maintenance_paid - down_payment
    roi = round((net_profit / total_invested) * 100, 2) if total_invested > 0 else 0.0

    return InvestmentMetrics(
        emi=emi,
        annual_rental_yield=rental_yield,
        annual_cash_flow=annual_cash_flow,
        monthly_cash_flow=monthly_cash_flow,
        total_interest_paid=total_interest,
        total_equity_built=total_equity,
        future_property_value=future_value,
        capital_gains=capital_gains,
        capital_gains_tax=cap_gains_tax,
        irr=irr_percent,
        roi=roi,
        total_invested=round(total_invested, 2),
    )
