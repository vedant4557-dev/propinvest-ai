"""Unit tests for investment rating."""

import pytest

from app.services.rating import get_investment_rating


def test_rating_a_plus():
    """A+ requires IRR > 14% and positive cash flow."""
    assert get_investment_rating(15, 50000) == "A+"
    assert get_investment_rating(14.1, 1000) == "A+"
    assert get_investment_rating(20, 100000) == "A+"


def test_rating_a():
    """A: IRR 11–14%."""
    assert get_investment_rating(12, -10000) == "A"
    assert get_investment_rating(11, 0) == "A"
    assert get_investment_rating(14, -50000) == "A"


def test_rating_b():
    """B: IRR 8–11%."""
    assert get_investment_rating(9, 0) == "B"
    assert get_investment_rating(8, -1000) == "B"


def test_rating_c():
    """C: IRR 6–8%."""
    assert get_investment_rating(7, 0) == "C"
    assert get_investment_rating(6, -5000) == "C"


def test_rating_d():
    """D: IRR < 6%."""
    assert get_investment_rating(5, 100000) == "D"
    assert get_investment_rating(0, 0) == "D"
    assert get_investment_rating(-5, 0) == "D"
