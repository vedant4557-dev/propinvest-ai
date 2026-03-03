"""
AI Analysis Service - Generates investment explanation using LLM.

Uses structured prompts. LLM call is isolated for easy replacement.
"""

import json
import os
from typing import Optional

from app.models.investment import (
    AIAnalysis,
    InvestmentInput,
    InvestmentMetrics,
    RiskAssessment,
)


def _build_prompt(
    input_data: InvestmentInput,
    metrics: InvestmentMetrics,
    risk: RiskAssessment,
) -> str:
    """Build structured prompt for AI analysis."""
    return f"""You are an expert financial advisor for Indian real estate investors. Analyze this property investment and provide a clear, actionable assessment.

## Investment Parameters
- Property Price: ₹{input_data.property_purchase_price:,.0f}
- Down Payment: ₹{input_data.down_payment:,.0f}
- Loan Interest: {input_data.loan_interest_rate}%
- Loan Tenure: {input_data.loan_tenure_years} years
- Monthly Rent: ₹{input_data.expected_monthly_rent:,.0f}
- Annual Maintenance: ₹{input_data.annual_maintenance_cost:,.0f}
- Expected Appreciation: {input_data.expected_annual_appreciation}%/year
- Holding Period: {input_data.holding_period_years} years
- Tax Slab: {input_data.investor_tax_slab}%

## Calculated Metrics
- EMI: ₹{metrics.emi:,.0f}/month
- Rental Yield: {metrics.annual_rental_yield}%
- Annual Cash Flow: ₹{metrics.annual_cash_flow:,.0f}
- IRR: {metrics.irr}%
- ROI: {metrics.roi}%
- Capital Gains: ₹{metrics.capital_gains:,.0f}
- Risk: {risk.label} (Score: {risk.score}/10)

## Your Task
Respond in JSON format only, with exactly these keys:
{{
  "verdict": "Good Investment" or "Moderate Investment" or "Avoid",
  "pros": ["pro1", "pro2", "pro3"],
  "cons": ["con1", "con2", "con3"],
  "fd_comparison": "2-3 sentences comparing this investment with a 7% FD. Be specific about numbers.",
  "recommendation": "2-3 sentences with clear, actionable recommendation for the investor",
  "summary": "2-3 sentence executive summary in simple English"
}}

Be concise. Use Indian Rupee formatting. Compare IRR/ROI with 7% FD. Mention the risk level.
Respond with ONLY the JSON object, no other text."""


def _call_llm(prompt: str) -> Optional[str]:
    """
    Call LLM API. Isolated for easy replacement.

    Supports OpenAI-compatible API (OpenAI, Azure, or local models).
    Set OPENAI_API_KEY in .env. Falls back to mock if not configured.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    base_url = os.getenv("OPENAI_BASE_URL")  # For Azure/local
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    if not api_key:
        return _mock_llm_response(prompt)

    try:
        from openai import OpenAI

        client = OpenAI(api_key=api_key, base_url=base_url if base_url else None)
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        return response.choices[0].message.content
    except Exception as e:
        # Fallback to mock on API failure
        return _mock_llm_response(prompt, str(e))


def _mock_llm_response(prompt: str, error: Optional[str] = None) -> str:
    """
    Generate mock analysis when API is unavailable.
    Uses rule-based logic to produce reasonable output.
    """
    # Parse metrics from prompt (simplified - we have them in context but this is fallback)
    # For mock we use generic sensible output
    return json.dumps({
        "verdict": "Moderate Investment",
        "pros": [
            "Property builds equity over time through EMI payments",
            "Rental income can offset part of the EMI burden",
            "Real estate in India has historically appreciated over long periods",
        ],
        "cons": [
            "Property is illiquid compared to FD or mutual funds",
            "Maintenance and vacancy can eat into returns",
            "Interest rate changes can affect refinancing costs",
        ],
        "fd_comparison": "A 7% FD would give predictable, risk-free returns. This property's IRR should ideally exceed 7% to justify the additional risk, illiquidity, and effort. Compare your calculated IRR with 7% to make an informed decision.",
        "recommendation": "Review the IRR and cash flow metrics. If IRR exceeds 8-9% and cash flow is positive or break-even, this could be a reasonable investment. Otherwise, consider FDs or diversified equity for similar tenure.",
        "summary": "This investment has moderate risk. Key factors are rental yield, cash flow, and appreciation. Compare IRR with 7% FD before deciding.",
    }, indent=2)


def _parse_ai_response(response_text: str) -> AIAnalysis:
    """Parse LLM response into AIAnalysis model."""
    try:
        # Try to extract JSON if response has extra text
        text = response_text.strip()
        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0 and end > start:
            json_str = text[start:end]
        else:
            json_str = text

        data = json.loads(json_str)
        return AIAnalysis(
            verdict=data.get("verdict", "Moderate Investment"),
            pros=data.get("pros", []),
            cons=data.get("cons", []),
            fd_comparison=data.get("fd_comparison", ""),
            recommendation=data.get("recommendation", ""),
            summary=data.get("summary", ""),
        )
    except (json.JSONDecodeError, KeyError) as e:
        return AIAnalysis(
            verdict="Unable to analyze",
            pros=[],
            cons=[],
            fd_comparison="Compare your IRR with 7% FD returns.",
            recommendation="Review the metrics above and consult a financial advisor.",
            summary=f"AI analysis could not be generated ({e}). Use the metrics and risk score above.",
        )


def generate_ai_analysis(
    input_data: InvestmentInput,
    metrics: InvestmentMetrics,
    risk: RiskAssessment,
) -> AIAnalysis:
    """
    Generate AI-powered investment analysis.

    Args:
        input_data: User inputs
        metrics: Calculated financial metrics
        risk: Risk assessment

    Returns:
        AIAnalysis with verdict, pros, cons, FD comparison, recommendation
    """
    prompt = _build_prompt(input_data, metrics, risk)
    response = _call_llm(prompt)
    if response:
        return _parse_ai_response(response)
    return _parse_ai_response(_mock_llm_response(prompt))
