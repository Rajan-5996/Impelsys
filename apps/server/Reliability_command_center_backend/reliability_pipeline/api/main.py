"""FastAPI backend serving the shape command-center.html expects (README section 4/7).

Run with: uvicorn reliability_pipeline.api.main:app --reload --port 8000
Docs at:  http://localhost:8000/docs

Real data (SALES_DAILY_ETL / NorthStar Data / DataSphere / daily_sales_curated) comes
straight from sales_pipeline.duckdb via db_reader.py + governance.py -- everything else
(the other 10 suppliers, 2 of the 3 agents, policies, knowledge base, 4 of 5 curated
datasets) is static mock data from mock_data.py, matching what the original prototype's
scope explicitly left out of this pipeline build.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import (
    agents,
    ask,
    audit,
    command_center,
    data_quality,
    incidents,
    knowledge,
    pipelines,
    scorecards,
    settings,
    suppliers,
)

app = FastAPI(
    title="Agentic Data Reliability Command Center API",
    description="Backend for the SALES_DAILY_ETL governance-gated incident pipeline, "
    "shaped to match command-center.html.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (
    command_center.router,
    suppliers.router,
    pipelines.router,
    incidents.router,
    data_quality.router,
    scorecards.router,
    agents.router,
    knowledge.router,
    audit.router,
    settings.router,
    ask.router,
):
    app.include_router(router)


@app.get("/health")
def health():
    return {"status": "ok"}
