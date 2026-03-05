"""
PropInvest AI - FastAPI Backend Entry Point
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.analyze import router as analyze_router


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(name)s %(levelname)s %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown lifecycle."""
    yield


app = FastAPI(
    title="PropInvest AI",
    description="AI-powered Real Estate Investment Analyzer for Indian investors",
    version="1.0.0",
    lifespan=lifespan,
)

# IMPORTANT: allow requests from Vercel + local
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://propinvest-ai-smoky.vercel.app",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router)


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "propinvest-ai"}
