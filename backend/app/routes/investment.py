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
    """Stream AI investment memo via Gemini REST API (no SDK — avoids build-time credential errors)."""

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-1.5-flash:streamGenerateContent?alt=sse&key={api_key}"
    )

    payload = {
        "contents": [{"parts": [{"text": req.prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 2048,
        },
    }

    async def stream_response():
        try:
            async with httpx.AsyncClient(timeout=60) as client:
                async with client.stream("POST", url, json=payload) as response:
                    if response.status_code != 200:
                        err = await response.aread()
                        yield f"data: {json.dumps({'error': err.decode()})}\n\n"
                        return
                    async for line in response.aiter_lines():
                        if not line.startswith("data:"):
                            continue
                        raw = line[5:].strip()
                        if not raw or raw == "[DONE]":
                            continue
                        try:
                            chunk = json.loads(raw)
                            text = (
                                chunk.get("candidates", [{}])[0]
                                .get("content", {})
                                .get("parts", [{}])[0]
                                .get("text", "")
                            )
                            if text:
                                yield f"data: {json.dumps({'delta': {'text': text}})}\n\n"
                        except Exception:
                            continue
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
