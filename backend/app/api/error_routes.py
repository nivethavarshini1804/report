from fastapi import APIRouter, HTTPException
from ..models.schema import ErrorCheckRequest, ErrorCheckResponse
from ..core.error_checker import ErrorChecker
from ..database import save_problem_history, log_mistake

router = APIRouter(prefix="/api", tags=["Error Checker"])

@router.post("/check-errors", response_model=ErrorCheckResponse)
def check_solution_errors(request: ErrorCheckRequest):
    if not request.original_problem or not request.original_problem.strip():
        raise HTTPException(status_code=400, detail="Original problem cannot be empty.")
    
    if not request.student_steps:
        raise HTTPException(status_code=400, detail="Please provide at least one step of student work.")

    result = ErrorChecker.analyze_solution(
        original_problem=request.original_problem,
        student_steps=request.student_steps,
        problem_type=request.problem_type,
        final_answer=request.final_answer
    )

    history_id = save_problem_history(
        problem_type="error_check",
        input_text=request.original_problem,
        domain="algebra",
        solution_data=result.model_dump()
    )

    # If an error occurred, log it into mistake_logs table for dashboard tracking
    if result.has_errors and result.first_error_step is not None:
        err_step_analysis = next((s for s in result.step_analyses if s.step_number == result.first_error_step), None)
        if err_step_analysis:
            log_mistake(
                problem_id=history_id,
                problem_text=request.original_problem,
                mistake_type=err_step_analysis.mistake_type or "Calculation Error",
                step_number=result.first_error_step,
                explanation=err_step_analysis.reason,
                student_step=err_step_analysis.student_step,
                corrected_step=err_step_analysis.corrected_step or ""
            )

    return result
