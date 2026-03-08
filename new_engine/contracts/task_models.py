from __future__ import annotations

from pydantic import BaseModel
from typing import Optional, Literal
from uuid import UUID


TaskStatus = Literal["CREATED", "QUEUED", "RUNNING", "SUCCEEDED", "FAILED", "CANCELLED"]


class QueueMessage(BaseModel):
    taskId: UUID
    specHash: str
    dataVersion: str


class TaskUpdate(BaseModel):
    status: TaskStatus
    progress: int = 0
    message: Optional[str] = None
    resultUri: Optional[str] = None
