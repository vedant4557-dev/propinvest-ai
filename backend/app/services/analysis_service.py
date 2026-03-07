"""
Analysis Service — PropInvest AI V3.1
Single orchestrator for the full investment analysis pipeline.
"""
from app.models.schemas import InvestmentInput, AnalyzeInvestmentResponse
from app.services.financial_engine import run_engine
from app.services.tax_engine import calculate_tax
from app.services.risk_scorer import score_risk
from app.services.monte_carlo import run_monte_carlo
from app.services.sensitivity import run_sensitivity, run_stress_test
from app.services.deal_analyzer import analyze_deal
from app.services.ai_analysis import get_ai_analysis
from app.services.reality_check import validate_investment_inputs


async def analyze_single_investment(inp: InvestmentInput) -> AnalyzeInvestmentResponse:
    """Full pipeline: reality check → engine → tax → risk → MC → sensitivity → stress → deal → AI."""

    # 0. Reality check (non-blocking — warnings only)
    reality = validate_investment_inputs(inp)
    warnings_list = [
        {
            "field": w.field,
            "message": w.message,
            "severity": w.severity,
            "suggestion": w.suggestion,
        }
        for w in reality.warnings
    ]

    # 1. Core metrics + timeline
    metrics, timeline = run_engine(inp)

    # 2. Tax analysis
    tax = calculate_tax(inp, metrics)

    # 3. Risk assessment
    risk = score_risk(metrics, inp.expected_annual_appreciation)

    # 4. Monte Carlo
    mc = run_monte_carlo(inp, metrics.irr)

    # 5. Sensitivity
    sensitivity = run_sensitivity(inp, metrics.irr)

    # 6. Stress test
    stress = run_stress_test(inp, metrics.irr)

    # 7. Deal analysis
    deal = analyze_deal(inp, metrics, tax)

    # 8. AI analysis (async, may call OpenAI)
    ai = await get_ai_analysis(inp, metrics, risk, tax, deal)

    return AnalyzeInvestmentResponse(
        metrics=metrics,
        risk=risk,
        ai_analysis=ai,
        monte_carlo=mc,
        sensitivity=sensitivity,
        tax_analysis=tax,
        deal_analysis=deal,
        stress_test=stress,
        cash_flow_timeline=timeline,
        input_warnings=warnings_list,
    )
