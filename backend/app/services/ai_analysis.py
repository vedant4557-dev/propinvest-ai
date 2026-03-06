"""
AI Analysis — PropInvest AI V3
Uses OpenAI GPT-4o-mini with rich structured prompt. Falls back to rule-based mock.
"""
import os
import json
from app.models.schemas import (
    InvestmentInput, InvestmentMetrics, RiskAssessment,
    TaxAnalysis, DealAnalysis, AIAnalysis
)


def _build_prompt(
    inp: InvestmentInput,
    m: InvestmentMetrics,
    risk: RiskAssessment,
    tax: TaxAnalysis,
    deal: DealAnalysis,
) -> str:
    return f"""You are an expert Indian real estate investment advisor.

PROPERTY DATA:
- Purchase Price: ₹{inp.property_purchase_price:,.0f}
- Down Payment: ₹{inp.down_payment:,.0f} ({m.ltv_ratio:.0f}% LTV)
- City: {inp.city or "Not specified"}
- Monthly Rent: ₹{inp.expected_monthly_rent:,.0f}
- Vacancy Rate: {inp.vacancy_rate}%
- Holding Period: {inp.holding_period_years} years

FINANCIAL METRICS:
- EMI: ₹{m.emi:,.0f}/month
- Annual Cash Flow: ₹{m.annual_cash_flow:,.0f}
- Gross Rental Yield: {m.gross_rental_yield:.2f}%
- Net Rental Yield: {m.net_rental_yield:.2f}%
- Cap Rate: {m.cap_rate:.2f}%
- Cash-on-Cash Return: {m.cash_on_cash_return:.2f}%
- DSCR: {m.dscr:.2f}x
- Break-even Occupancy: {m.break_even_occupancy:.1f}%
- IRR: {m.irr:.2f}%
- NPV (10% discount): ₹{m.npv:,.0f}
- ROI: {m.roi:.1f}%
- Post-Tax IRR: {tax.post_tax_irr:.2f}%
- Future Property Value: ₹{m.future_property_value:,.0f}

RISK: {risk.label} ({risk.total_score:.0f}/100)
DEAL SCORE: {deal.deal_score:.0f}/100 — {deal.label} (Rating: {deal.rating})
RED FLAGS: {', '.join(deal.red_flags) if deal.red_flags else 'None'}

TAX:
- Section 24(b) Tax Savings: ₹{tax.tax_savings_from_interest:,.0f}
- Rental Tax Liability: ₹{tax.rental_tax_liability:,.0f}
- LTCG Tax: ₹{tax.capital_gains_tax:,.0f}

Respond ONLY with a JSON object (no markdown) with these exact keys:
{{
  "verdict": "1 sentence verdict",
  "summary": "2-3 sentence executive summary",
  "pros": ["pro 1", "pro 2", "pro 3"],
  "cons": ["con 1", "con 2", "con 3"],
  "key_risks": ["risk 1", "risk 2"],
  "fd_comparison": "1-2 sentence comparison to 7% FD",
  "recommendation": "1-2 sentence actionable recommendation",
  "exit_strategy": "Recommended exit strategy and timeline",
  "rent_optimization": "Specific advice to maximize rental income",
  "negotiation_tip": "Specific negotiation suggestion"
}}"""


def _mock_analysis(
    m: InvestmentMetrics,
    risk: RiskAssessment,
    deal: DealAnalysis,
    tax: TaxAnalysis,
) -> AIAnalysis:
    """Rule-based fallback when OpenAI is not configured."""
    irr = m.irr
    verdict = (
        "Strong Buy" if irr >= 12 else
        "Buy" if irr >= 9 else
        "Hold" if irr >= 7 else
        "Avoid"
    )

    pros = []
    cons = []

    if m.irr >= 10:
        pros.append(f"Strong {m.irr:.1f}% IRR — well above 7% FD benchmark")
    if m.annual_cash_flow > 0:
        pros.append(f"Positive cash flow of ₹{m.annual_cash_flow:,.0f}/year from day one")
    if m.dscr >= 1.2:
        pros.append(f"Healthy DSCR of {m.dscr:.2f}x — rental income comfortably covers EMI")
    if m.net_rental_yield >= 4:
        pros.append(f"Above-average net yield of {m.net_rental_yield:.1f}%")
    if tax.net_tax_benefit > 0:
        pros.append(f"Section 24(b) delivers ₹{tax.net_tax_benefit:,.0f}/year net tax benefit")

    if m.annual_cash_flow < 0:
        cons.append(f"Negative cash flow of ₹{abs(m.annual_cash_flow):,.0f}/year requires monthly top-up")
    if m.dscr < 1.0:
        cons.append(f"DSCR {m.dscr:.2f}x — rent does not cover EMI, requiring personal income support")
    if m.irr < 7:
        cons.append(f"IRR {m.irr:.1f}% underperforms a risk-free 7% FD")
    if m.ltv_ratio > 75:
        cons.append(f"High {m.ltv_ratio:.0f}% LTV increases financial risk")
    if m.break_even_occupancy > 85:
        cons.append(f"High break-even occupancy {m.break_even_occupancy:.0f}% leaves little margin for vacancy")

    # Ensure at least 2 pros/cons
    if len(pros) < 2:
        pros.append("Real estate provides portfolio diversification from equity markets")
    if len(cons) < 2:
        cons.append("Illiquid asset — exit takes 3-6 months in Indian market")

    fd_comp = (
        f"With {m.irr:.1f}% IRR vs 7% FD, this property {'outperforms' if m.irr > 7 else 'underperforms'} "
        f"risk-free instruments by {abs(m.irr - 7):.1f}pp. "
        f"{'The premium compensates for illiquidity and management overhead.' if m.irr > 9 else 'The risk-adjusted return does not justify preference over FD.'}"
    )

    rec = (
        f"{'Proceed with acquisition' if irr in ['Strong Buy', 'Buy'] else 'Reconsider or negotiate price down'}. "
        f"{'Target {:.1f}% yield improvement through rent optimization.'.format(max(0, 4 - m.net_rental_yield)) if m.net_rental_yield < 4 else 'Maintain occupancy above {:.0f}% to preserve returns.'.format(m.break_even_occupancy)}"
    )

    exit_strategy = (
        f"Optimal exit at year {min(inp_years, 10) if (inp_years := 10) else 10} when capital gains benefit from full indexation. "
        f"Target ₹{m.future_property_value * 1.1:,.0f} exit price to absorb 10% agent fees and LTCG."
        if m.capital_gains > 0
        else "Hold for full tenure to maximize equity build-up before selling."
    )

    rent_opt = (
        f"Current ₹{m.annual_rental_income / 12:,.0f}/month is "
        f"{'below market' if m.gross_rental_yield < 3.5 else 'at market rate'}. "
        f"{'Consider furnished rental (+20-30% premium) or short-term let via platforms for higher yield.' if m.gross_rental_yield < 4 else 'Escalate rent 5-8% annually, add parking/storage as premium add-ons.'}"
    )

    return AIAnalysis(
        verdict=verdict,
        summary=(
            f"{verdict}: {m.irr:.1f}% IRR with {deal.label.lower()} deal quality ({deal.deal_score:.0f}/100). "
            f"DSCR of {m.dscr:.2f}x and {m.net_rental_yield:.1f}% net yield "
            f"{'supports' if m.dscr >= 1 else 'challenges'} the investment thesis. "
            f"Post-tax IRR stands at {tax.post_tax_irr:.1f}% after India-specific tax treatment."
        ),
        pros=pros[:4],
        cons=cons[:4],
        key_risks=[r for r in deal.red_flags[:3]] or [
            "Market liquidity risk in exit scenario",
            "Interest rate sensitivity on floating rate loans"
        ],
        fd_comparison=fd_comp,
        recommendation=rec,
        exit_strategy=exit_strategy,
        rent_optimization=rent_opt,
        negotiation_tip=deal.negotiation_suggestion,
    )


async def get_ai_analysis(
    inp: InvestmentInput,
    m: InvestmentMetrics,
    risk: RiskAssessment,
    tax: TaxAnalysis,
    deal: DealAnalysis,
) -> AIAnalysis:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return _mock_analysis(m, risk, deal, tax)

    try:
        import httpx
        prompt = _build_prompt(inp, m, risk, tax, deal)
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                    "max_tokens": 800,
                },
            )
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]
            data = json.loads(content)
            return AIAnalysis(**data)
    except Exception:
        return _mock_analysis(m, risk, deal, tax)
