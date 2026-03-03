"""
Investment Grade Classification.

A+ to D based on IRR and cash flow.
"""

from typing import Literal

Rating = Literal["A+", "A", "B", "C", "D"]


def get_investment_rating(irr: float, annual_cash_flow: float) -> Rating:
    """
    Investment grade:
    A+ : IRR > 14% and positive cash flow
    A  : IRR 11–14%
    B  : IRR 8–11%
    C  : IRR 6–8%
    D  : IRR < 6%
    """
    irr = float(irr)
    cash_flow = float(annual_cash_flow)

    if irr > 14 and cash_flow > 0:
        return "A+"
    if irr >= 11:
        return "A"
    if irr >= 8:
        return "B"
    if irr >= 6:
        return "C"
    return "D"
