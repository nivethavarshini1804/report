from fastapi import APIRouter
from ..models.schema import TutorChatRequest, TutorChatResponse
from ..core.ai_tutor import AITutor

router = APIRouter(prefix="/api/tutor", tags=["AI Tutor"])

@router.post("/chat", response_model=TutorChatResponse)
def tutor_chat(request: TutorChatRequest):
    return AITutor.chat_reply(
        message=request.message,
        conversation_history=request.conversation_history or [],
        current_problem=request.current_problem,
        learning_level=request.learning_level or "high_school"
    )

@router.get("/hints")
def get_progressive_hints(problem: str):
    hints = AITutor.generate_hints(problem)
    return {"problem": problem, "hints": hints}

@router.get("/concept")
def get_concept_explanation(topic: str):
    card = AITutor.get_concept_for_problem(topic)
    return {"concept": card}
