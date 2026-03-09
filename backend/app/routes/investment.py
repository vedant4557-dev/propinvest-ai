"""
API Routes — PropInvest AI V3
"""
import os
import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from app.models.schemas import (
    InvestmentInput, AnalyzeInvestmentResponse,
    PortfolioRequest, AnalyzePortfolioResponse,
)
from app.services.analysis_service import analyze_single_investment
from app.services.portfolio_engine import build_portfolio

router = APIRouter()


# ─── AI Memo endpoint ─────────────────────────────────────────────────────────

class MemoRequest(BaseModel):
    prompt: str

@router.post("/generate-memo")
async def generate_memo(req: MemoRequest):
    """Stream AI investment memo via Google Gemini API."""
    import google.generativeai as genai

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")

    def stream_response():
        try:
            response = model.generate_content(req.prompt, stream=True)
            for chunk in response:
                if chunk.text:
                    payload = json.dumps({"delta": {"text": chunk.text}})
                    yield f"data: {payload}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        stream_response(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


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
