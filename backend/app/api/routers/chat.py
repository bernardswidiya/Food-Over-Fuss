from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import logging

from app.models import User
from app.schemas import ChatRequest, ChatResponse
from app.api.dependencies import get_db, get_current_user
from app.ai.chat import chat_with_ai

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/", response_model=ChatResponse)
def chat(req: ChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not req.messages:
        raise HTTPException(status_code=400, detail="messages tidak boleh kosong")

    history = [
        {"role": m.role, "content": m.content, "image_url": m.image_url}
        for m in req.messages
    ]

    try:
        reply = chat_with_ai(history, db, current_user)
    except Exception as e:
        logger.exception("chat_with_ai failed")
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")

    return ChatResponse(message=reply)
