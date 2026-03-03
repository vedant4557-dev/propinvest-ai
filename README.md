# PropInvest AI

**AI-powered Real Estate Investment Analyzer for Indian investors.**

A production-ready MVP (V2) that analyzes property investments with EMI, rental yield, cash flow, IRR, ROI, risk score, AI recommendations, Monte Carlo simulation, sensitivity analysis, and India tax details.

---

## Project Structure

```
real estate ai/
├── backend/                 # FastAPI Python backend
│   ├── app/
│   │   ├── models/          # Pydantic models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   │   ├── financial_engine.py   # Core calculations
│   │   │   ├── risk_scorer.py        # Weighted risk (1-100)
│   │   │   ├── ai_analysis.py        # LLM-based analysis
│   │   │   ├── monte_carlo.py        # 1000-scenario simulation
│   │   │   ├── sensitivity.py        # IRR sensitivity
│   │   │   └── tax_engine.py         # India tax (24b, LTCG)
│   │   └── utils/           # IRR calculation
│   ├── main.py
│   └── requirements.txt
├── frontend/                # Next.js React frontend
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   └── package.json
├── .env.example
└── README.md
```

---

## Features

- **Financial Engine**: EMI, rental yield, cash flow, capital gains, IRR, ROI
- **Risk Score**: Weighted 1–100 score (Cash flow 30%, IRR 25%, LTV 20%, Appreciation 15%, Yield 10%) with breakdown
- **Monte Carlo**: 1000 scenarios, IRR distribution, prob. beating FD, prob. negative cash flow
- **Sensitivity**: IRR impact of ±1% rate, ±2% appreciation, ±10% rent
- **India Tax**: Section 24(b), rental tax, LTCG with indexation, post-tax IRR
- **AI Analysis**: Verdict, pros/cons, FD comparison, recommendation
- **Charts**: Cash flow, property growth, IRR histogram, scenario outcomes
- **Export**: PDF report
- **Dark Mode**: Toggle with persistence

---

## Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and set `OPENAI_API_KEY` for AI analysis (optional; falls back to mock if not set).

```bash
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

### Environment

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## API

### POST /analyze-investment

**Request body (JSON):**

```json
{
  "property_purchase_price": 10000000,
  "down_payment": 2000000,
  "loan_interest_rate": 8.5,
  "loan_tenure_years": 20,
  "expected_monthly_rent": 35000,
  "annual_maintenance_cost": 36000,
  "expected_annual_appreciation": 6,
  "holding_period_years": 10,
  "investor_tax_slab": 30
}
```

**Response (V2 - backward compatible):**

```json
{
  "metrics": {
    "emi": 62753.12,
    "annual_rental_yield": 4.2,
    "annual_cash_flow": -102836.44,
    "irr": 8.45,
    "roi": 65.2,
    ...
  },
  "risk": {
    "score": 5,
    "label": "Moderate Risk",
    "explanation": "...",
    "total_score": 48,
    "breakdown": { "cash_flow_score": 0, "irr_score": 60, "ltv_score": 60, "appreciation_score": 80, "yield_score": 85 }
  },
  "monte_carlo": {
    "expected_irr": 9.69,
    "worst_case_irr": 4.2,
    "best_case_irr": 15.1,
    "probability_beating_fd": 98.7,
    "probability_negative_cashflow": 85.2,
    "irr_histogram": [...],
    "scenario_count": 1000
  },
  "sensitivity": {
    "interest_rate_impact": { "minus_1_pct": 8.5, "base": 7.86, "plus_1_pct": 7.2 },
    "appreciation_impact": {...},
    "rent_impact": {...},
    "base_irr": 7.86
  },
  "tax_analysis": {
    "tax_savings_from_interest": 180000,
    "rental_tax_liability": 45000,
    "capital_gains_tax": 0,
    "post_tax_irr": 10.58,
    "indexation_factor": 1.79
  },
  "ai_analysis": {
    "verdict": "Moderate Investment",
    "pros": [...],
    "cons": [...],
    "fd_comparison": "...",
    "recommendation": "...",
    "summary": "..."
  }
}
```

---

## V2 Architecture

| Layer | Purpose |
|-------|---------|
| `financial_engine` | Core metrics (EMI, IRR, ROI). Unchanged from V1. |
| `tax_engine` | India tax: Section 24(b) ₹2L cap, 30% standard deduction, LTCG with 6% indexation. |
| `risk_scorer` | Weighted 0–100 score. Low 0–35, Moderate 36–65, High 66–100. Backward compat: `score` 1–10. |
| `monte_carlo` | 1000 scenarios, normal(μ,σ) for appreciation/rent. Returns IRR distribution, prob. beat FD. |
| `sensitivity` | Re-runs engine with ±1% rate, ±2% appreciation, ±10% rent. |
| `ai_analysis` | Isolated LLM call. Unchanged. |

All calculations are isolated from the AI layer. Monte Carlo uses vectorized numpy for scenario generation; IRR per scenario uses existing Newton-Raphson (Python loop).

---

## V3 Architecture

| Layer | Purpose |
|-------|---------|
| `analysis_service` | Orchestrator. Single source for full investment analysis. Used by route and portfolio_engine. |
| `portfolio_engine` | Multi-property analysis. Reuses `analyze_single_investment`. Aggregates metrics, diversification score, portfolio risk. |
| `deal_analyzer` | Deal quality 0–100. Weights: IRR 25%, Post-tax IRR 15%, Yield 15%, Cash flow 15%, LTV 15%, Appreciation 15%. Returns deal_score, label, is_overpriced, fair_price_range, negotiation_suggestion, red_flags. |

**Endpoints:**
- `POST /analyze-investment` — Extended with optional `deal_analysis`. Backward compatible.
- `POST /analyze-portfolio` — New. Input: `{ investments: InvestmentInput[] }`. Returns portfolio_metrics, diversification_score, portfolio_risk_score, individual_results.

---

## Assumptions

1. **Capital gains tax**: LTCG 20% with indexation (6% inflation). Tax engine; metrics use flat 20%.
2. **Loan**: Standard EMI formula; no pre-payment or floating rate changes.
3. **Rent**: Assumed constant over holding period.
4. **Appreciation**: Compound growth applied annually.
5. **AI**: Uses OpenAI API; mock response if no API key.
6. **CORS**: Backend allows `localhost:3000` and `127.0.0.1:3000`.

---

## License

Proprietary. All rights reserved.
