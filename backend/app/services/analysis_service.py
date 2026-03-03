"""
Analysis orchestrator - Single source for full investment analysis.

Reused by analyze-investment route and portfolio_engine.
Avoids duplication of financial logic.
"""

from app.models.investment import (
    InvestmentInput,
    AnalyzeInvestmentResponse,
    MonteCarloResult,
    SensitivityResult,
    TaxAnalysis,
    DealAnalysis,
    StressTestResult,
)
from app.services.financial_engine import run_financial_engine
from app.services.risk_scorer import calculate_risk_score
from app.services.ai_analysis import generate_ai_analysis
from app.services.monte_carlo import run_monte_carlo
from app.services.sensitivity import run_sensitivity_analysis
from app.services.tax_engine import run_tax_analysis
from app.services.stress_test import run_stress_test
from app.services.deal_analyzer import analyze_deal_from_response


def analyze_single_investment(input_data: InvestmentInput) -> AnalyzeInvestmentResponse:
    """
    Run full analysis for a single property investment.

    Reuses all engines. No duplication of financial calculations.
    """
    metrics = run_financial_engine(input_data)
    risk = calculate_risk_score(input_data, metrics)
    ai_analysis = generate_ai_analysis(input_data, metrics, risk)
    monte_result = run_monte_carlo(input_data)
    sensitivity_result = run_sensitivity_analysis(input_data)
    tax_result = run_tax_analysis(input_data)
    stress_result = run_stress_test(input_data)

    deal_result = analyze_deal_from_response(input_data, metrics, tax_result)

    # Ensure var_5_percent for backward compat
    if "var_5_percent" not in monte_result:
        monte_result["var_5_percent"] = monte_result.get("worst_case_irr", 0)

    return AnalyzeInvestmentResponse(
        metrics=metrics,
        risk=risk,
        ai_analysis=ai_analysis,
        monte_carlo=MonteCarloResult(**monte_result),
        sensitivity=SensitivityResult(**sensitivity_result),
        tax_analysis=TaxAnalysis(**tax_result),
        deal_analysis=DealAnalysis(**deal_result),
        stress_test=StressTestResult(**stress_result),
    )
