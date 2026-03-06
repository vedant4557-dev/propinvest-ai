"""
API Routes — PropInvest AI V3
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    InvestmentInput, AnalyzeInvestmentResponse,
    PortfolioRequest, AnalyzePortfolioResponse,
)
from app.services.analysis_service import analyze_single_investment
from app.services.portfolio_engine import build_portfolio

router = APIRouter()


@router.post("/analyze-investment", response_model=AnalyzeInvestmentResponse)
async def analyze_investment(inp: InvestmentInput):
    try:
        return await analyze_single_investment(inp)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-portfolio", response_model=AnalyzePortfolioResponse)
async def analyze_portfolio(req: PortfolioRequest):
    try:
        results = []
        for inv in req.investments:
            result = await analyze_single_investment(inv)
            results.append(result)
        return build_portfolio(req.investments, results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
def health():
    return {"status": "ok", "version": "3.0.0"}
