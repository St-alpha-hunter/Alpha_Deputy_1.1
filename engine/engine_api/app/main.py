from fastapi import FastAPI
from pydantic import BaseModel
import os
import redis

app = FastAPI()

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
QUEUE_KEY = os.getenv("QUEUE_KEY", "backtest:queue")

r = redis.from_url(REDIS_URL, decode_responses=True)

class EnqueueReq(BaseModel):
    task_id: str

@app.get("/healthz")
def healthz():
    return {"ok": True}

@app.post("/enqueue")
def enqueue(req: EnqueueReq):
    # List 队列：LPUSH/RPUSH + BRPOP
    r.rpush(QUEUE_KEY, req.task_id)
    return {"ok": True, "queued": req.task_id, "queue": QUEUE_KEY}
