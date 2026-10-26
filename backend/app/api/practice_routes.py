from fastapi import APIRouter, Query
from typing import Optional
from ..models.schema import PracticeSubmitRequest, PracticeSubmitResponse
from ..core.practice_engine import PracticeEngine
from ..database import save_practice_record

router = APIRouter(prefix="/api/practice", tags=["Practice Zone"])

@router.get("/questions")
def list_questions(
    domain: Optional[str] = Query(None, description="Filter by domain (algebra, calculus, etc.)"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty (Easy, Medium, Hard)")
):
    questions = PracticeEngine.get_questions(domain, difficulty)
    return {"questions": questions}

@router.get("/random")
def get_random_question(domain: str = "algebra", difficulty: str = "Medium"):
    question = PracticeEngine.generate_random_question(domain, difficulty)
    return {"question": question}

@router.post("/submit", response_model=PracticeSubmitResponse)
def submit_practice_answer(request: PracticeSubmitRequest):
    eval_result = PracticeEngine.evaluate_answer(
        question_id=request.question_id,
        question_text=request.question_text,
        user_answer=request.user_answer,
        correct_answer=request.correct_answer,
        student_steps=request.student_steps
    )

    save_practice_record(
        question_id=request.question_id,
        question_text=request.question_text,
        domain=request.domain,
        difficulty=request.difficulty,
        user_answer=request.user_answer,
        correct_answer=request.correct_answer,
        is_correct=eval_result["is_correct"],
        mistake_type=eval_result["mistake_type"]
    )

    return eval_result
