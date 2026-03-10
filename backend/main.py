"""
PropInvest AI — FastAPI Backend V3.9
SECURITY FIXES:
- CORS locked to exact production domain only
- slowapi rate limiter registered on app
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.routes.investment import router
from app.routes.listings import router as listings_router

# ── Rate limiter setup ──────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="PropInvest AI",
    description="AI-powered Real Estate Investment Analyzer for Indian investors",
    version="3.9.0",
)

# Register rate limiter on app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS — locked to production domain only ─────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://propinvest-ai-smoky.vercel.app",  # exact production domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ─────────────────────────────────────────────────────────────────
app.include_router(router)
app.include_router(listings_router)
