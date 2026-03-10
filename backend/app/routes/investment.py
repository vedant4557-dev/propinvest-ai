"""
AI Memo endpoint — PropInvest AI V3
Uses httpx to call Gemini REST API directly (no SDK = no build errors)
"""

import os
import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import httpx

from app.models.schemas import (
    InvestmentInput, AnalyzeInvestmentResponse,
    PortfolioRequest, AnalyzePortfolioResponse,
)
from app.services.analysis_service import analyze_single_investment
from app.services.portfolio_engine import build_portfolio

router = APIRouter()


# ── AI Memo endpoint ────────────────────────────────────────────────────────

class MemoRequest(BaseModel):
    prompt: str


@router.post("/generate-memo")
async def generate_memo(req: MemoRequest):
    """Stream AI investment memo via Gemini REST API (no SDK — avoids build-time credential errors)."""

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")

    # ✅ Using gemini-2.5-flash — latest, fastest, confirmed available on this account
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.5-flash:streamGenerateContent?alt=sse&key={api_key}"
    )

    payload = {
        "contents": [{"parts": [{"text": req.prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 4096,  # increased — 2048 was cutting off 7-section memo
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
                            # Gemini REST shape: candidates[0].content.parts[0].text
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
    return {"status": "ok", "version": "3.0.0"}


# ── Gemini debug endpoint (GET /test-gemini) ─────────────────────────────────
# Visit https://propinvest-ai-production.up.railway.app/test-gemini to verify key + model

@router.get("/test-gemini")
async def test_gemini():
    """Debug: test Gemini API key and model availability."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return {"error": "GEMINI_API_KEY not set in Railway Variables"}

    results = {}

    # 1. List available models
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(
                f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
            )
            data = r.json()
            if "error" in data:
                results["key_status"] = f"INVALID KEY: {data['error'].get('message', 'unknown')}"
            else:
                model_names = [m["name"] for m in data.get("models", [])]
                flash_models = [m for m in model_names if "flash" in m]
                results["key_status"] = "VALID"
                results["flash_models_available"] = flash_models
    except Exception as e:
        results["key_check_error"] = str(e)

    # 2. Quick non-streaming test with gemini-2.5-flash
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}",
                json={"contents": [{"parts": [{"text": "Say: OK"}]}],
                      "generationConfig": {"maxOutputTokens": 10}},
            )
            data = r.json()
            if "error" in data:
                results["gemini_2_5_flash"] = f"ERROR: {data['error'].get('message')}"
            else:
                text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                results["gemini_2_5_flash"] = f"OK — response: {text!r}"
    except Exception as e:
        results["gemini_2_5_flash_error"] = str(e)

    return results
