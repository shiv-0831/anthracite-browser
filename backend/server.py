from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from backend.agent import run_agent_task_logic
import os

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TaskRequest(BaseModel):
    instruction: str
    cdp_url: str = "http://127.0.0.1:9222"
    target_id: str | None = None

@app.get("/")
def read_root():
    return {"status": "Poseidon Backend Running"}

@app.post("/agent/run")
async def run_agent(task: TaskRequest):
    if not os.environ.get("OPENAI_API_KEY"):
        return {"status": "error", "message": "OPENAI_API_KEY not found in environment"}

    try:
        result = await run_agent_task_logic(task.instruction, task.cdp_url, task.target_id)
        return {"status": "success", "result": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}
