from fastapi import APIRouter, HTTPException
from ..models.schema import SolveRequest, SolveResponse
from ..core.solver import MathSolver
from ..database import save_problem_history

router = APIRouter(prefix="/api", tags=["Solver"])

@router.post("/solve", response_model=SolveResponse)
def solve_math_problem(request: SolveRequest):
    if not request.problem or not request.problem.strip():
        raise HTTPException(status_code=400, detail="Problem expression cannot be empty.")
    
    result = MathSolver.solve(
        problem_str=request.problem,
        domain=request.domain,
        variable_str=request.variable or "x",
        level=request.level or "high_school"
    )

    if result.success:
        save_problem_history(
            problem_type="solve",
            input_text=request.problem,
            domain=result.domain,
            solution_data=result.model_dump()
        )

    return result
