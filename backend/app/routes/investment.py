"""
AI Memo endpoint — PropInvest AI V3
Uses httpx to call Gemini REST API directly (no SDK = no build errors)

SECURITY:
- /test-gemini endpoint REMOVED (was publicly exposing API key info)
- Rate limiting: 5 memo requests per IP per hour via slowapi
"""

import os
import json
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address
import httpx

from app.models.schemas import (
    InvestmentInput, AnalyzeInvestmentResponse,
    PortfolioRequest, AnalyzePortfolioResponse,
)
from app.services.analysis_service import analyze_single_investment
from app.services.portfolio_engine import build_portfolio

router = APIRouter()

# ── Rate limiter (5 AI memo requests per IP per hour) ──────────────────────
limiter = Limiter(key_func=get_remote_address)


# ── AI Memo endpoint ────────────────────────────────────────────────────────

class MemoRequest(BaseModel):
    prompt: str


@router.post("/generate-memo")
@limiter.limit("5/hour")
async def generate_memo(req: MemoRequest, request: Request):
    """Stream AI investment memo via Gemini REST API.
    Rate limited: 5 requests per IP per hour.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")

    # gemini-2.5-flash — latest, confirmed available
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.5-flash:streamGenerateContent?alt=sse&key={api_key}"
    )

    payload = {
        "contents": [{"parts": [{"text": req.prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 4096,
        },
    }

    async def stream_response():
        try:
            async with httpx.AsyncClient(timeout=120) as client:
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


# ── Investment analysis ─────────────────────────────────────────────────────

@router.post("/analyze-investment", response_model=AnalyzeInvestmentResponse)
async def analyze_investment(inp: InvestmentInput):
    try:
        return await analyze_single_investment(inp)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Portfolio analysis ──────────────────────────────────────────────────────

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


# ── Health check ────────────────────────────────────────────────────────────

@router.get("/health")
def health():
    return {"status": "ok", "version": "3.9.0"}
