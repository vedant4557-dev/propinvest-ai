"""
PropInvest AI — FastAPI Backend V3
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.investment import router
from app.routes.listings import router as listings_router

app = FastAPI(
    title="PropInvest AI",
    description="AI-powered Real Estate Investment Analyzer for Indian investors",
    version="3.0.0",
)

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

app.include_router(router)
app.include_router(listings_router)
