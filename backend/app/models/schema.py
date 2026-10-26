from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class StepItem(BaseModel):
    step_number: int
    title: str
    expression: str
    latex: str
    explanation: str
    rule_applied: Optional[str] = None

class SolveRequest(BaseModel):
    problem: str = Field(..., description="Mathematical expression or equation to solve")
    domain: Optional[str] = Field("auto", description="auto, arithmetic, algebra, calculus, matrices, geometry, trigonometry, statistics")
    variable: Optional[str] = Field("x", description="Main variable to solve for or differentiate with respect to")
    level: Optional[str] = Field("high_school", description="elementary, high_school, college")

class SolveResponse(BaseModel):
    success: bool
    problem: str
    domain: str
    steps: List[StepItem]
    final_answer: str
    latex_answer: str
    explanation_summary: str
    method_used: str
    verified: bool
    execution_time_ms: float
    error_message: Optional[str] = None

class StepAnalysis(BaseModel):
    step_number: int
    student_step: str
    latex_step: Optional[str] = None
    is_correct: bool
    reason: str
    mistake_type: Optional[str] = None
    corrected_step: Optional[str] = None
    hint: Optional[str] = None

class ErrorCheckRequest(BaseModel):
    original_problem: str = Field(..., description="The original problem or equation")
    student_steps: List[str] = Field(..., description="List of intermediate steps submitted by student")
    problem_type: Optional[str] = Field("equation", description="equation, expression, calculus, arithmetic")
    final_answer: Optional[str] = None

class ErrorCheckResponse(BaseModel):
    success: bool
    has_errors: bool
    first_error_step: Optional[int] = None
    step_analyses: List[StepAnalysis]
    mistake_type: Optional[str] = None
    summary_explanation: str
    overall_hint: str
    correct_solution_steps: List[StepItem]
    verified: bool
    error_message: Optional[str] = None

class TutorChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = []
    current_problem: Optional[str] = None
    learning_level: Optional[str] = "high_school"
    request_type: Optional[str] = "chat" # chat, hint, explain_concept, generate_practice

class ConceptCard(BaseModel):
    title: str
    definition: str
    formula: Optional[str] = None
    example: str
    common_pitfalls: List[str]

class TutorChatResponse(BaseModel):
    reply: str
    hints: Optional[List[str]] = None
    concept_card: Optional[ConceptCard] = None
    suggested_questions: Optional[List[str]] = None
    practice_questions: Optional[List[Dict[str, Any]]] = None

class PracticeSubmitRequest(BaseModel):
    question_id: str
    question_text: str
    domain: str
    difficulty: str
    user_answer: str
    correct_answer: str
    student_steps: Optional[List[str]] = []

class PracticeSubmitResponse(BaseModel):
    is_correct: bool
    user_answer: str
    correct_answer: str
    explanation: str
    mistake_type: Optional[str] = None
    steps: List[StepItem]

class OCRCleanRequest(BaseModel):
    raw_text: str
