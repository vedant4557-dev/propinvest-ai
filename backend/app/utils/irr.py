"""
IRR (Internal Rate of Return) calculation using Newton-Raphson method.
IRR is the discount rate that makes NPV = 0.

Includes convergence fallback and edge-case handling.
"""

from typing import List

# Absolute tolerance for NPV convergence
TOLERANCE = 1e-7
# Fallback guesses if primary fails (decimal rates)
FALLBACK_GUESSES = [0.05, 0.10, 0.15, 0.20, -0.05, 0.01]
MAX_ITERATIONS = 100


def _npv(rate: float, cash_flows: List[float]) -> float:
    """Compute NPV at given discount rate."""
    return sum(cf / ((1 + rate) ** t) for t, cf in enumerate(cash_flows))


def _npv_derivative(rate: float, cash_flows: List[float]) -> float:
    """Compute derivative of NPV w.r.t. rate."""
    result = 0.0
    for t, cf in enumerate(cash_flows):
        if t > 0:
            result -= t * cf / ((1 + rate) ** (t + 1))
    return result


def calculate_irr(cash_flows: List[float], guess: float = 0.1) -> float:
    """
    Calculate IRR using Newton-Raphson iteration.

    Args:
        cash_flows: List of cash flows. cash_flows[0] is initial investment (negative).
        guess: Initial guess for IRR (decimal, e.g. 0.1 = 10%).

    Returns:
        IRR as decimal (e.g., 0.085 for 8.5%). Returns 0 if all attempts fail.
    """
    if not cash_flows or len(cash_flows) < 2:
        return 0.0

    # Avoid divide-by-zero: check for constant cash flows
    if len(set(cash_flows)) == 1:
        return 0.0

    for initial_guess in [guess] + FALLBACK_GUESSES:
        rate = initial_guess
        for _ in range(MAX_ITERATIONS):
            npv = _npv(rate, cash_flows)
            if abs(npv) < TOLERANCE:
                return rate

            dnpv = _npv_derivative(rate, cash_flows)
            if abs(dnpv) < 1e-15:
                break

            rate = rate - npv / dnpv
            rate = max(-0.99, min(0.99, rate))

    # Final fallback: return 0 (no convergence)
    return 0.0
