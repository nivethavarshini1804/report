import random
from typing import List, Dict, Any, Optional
from .solver import MathSolver
from ..models.schema import StepItem

CURATED_PRACTICE_BANK = [
    {
        "id": "alg_lin_01",
        "question": "Solve for x: 3x + 12 = 27",
        "domain": "algebra",
        "difficulty": "Easy",
        "correct_answer": "x = 5",
        "hint": "Subtract 12 from both sides, then divide by 3.",
        "concept": "Linear Equation Isolation"
    },
    {
        "id": "alg_lin_02",
        "question": "Solve for x: 5x - 8 = 2x + 13",
        "domain": "algebra",
        "difficulty": "Medium",
        "correct_answer": "x = 7",
        "hint": "Subtract 2x from both sides to collect variables, then add 8 to both sides.",
        "concept": "Variables on Both Sides"
    },
    {
        "id": "alg_quad_01",
        "question": "Solve for x: x^2 - 7x + 12 = 0",
        "domain": "algebra",
        "difficulty": "Medium",
        "correct_answer": "x = 3, x = 4",
        "hint": "Find two numbers that multiply to 12 and add to -7, or use the quadratic formula.",
        "concept": "Factoring Quadratics"
    },
    {
        "id": "alg_quad_02",
        "question": "Solve for x: 2x^2 + 5x - 3 = 0",
        "domain": "algebra",
        "difficulty": "Hard",
        "correct_answer": "x = 1/2, x = -3",
        "hint": "Apply the quadratic formula with a=2, b=5, and c=-3.",
        "concept": "Quadratic Formula with a > 1"
    },
    {
        "id": "calc_diff_01",
        "question": "Find the derivative: d/dx [3x^4 - 5x^2 + 8]",
        "domain": "calculus",
        "difficulty": "Easy",
        "correct_answer": "12*x^3 - 10*x",
        "hint": "Apply the power rule d/dx[x^n] = n*x^(n-1) to each term.",
        "concept": "Power Rule Differentiation"
    },
    {
        "id": "calc_int_01",
        "question": "Evaluate indefinite integral: integrate 6x^2 - 4x + 5 dx",
        "domain": "calculus",
        "difficulty": "Medium",
        "correct_answer": "2*x^3 - 2*x^2 + 5*x + C",
        "hint": "Integrate term by term: ∫ x^n dx = x^(n+1)/(n+1). Don't forget + C!",
        "concept": "Polynomial Integration"
    },
    {
        "id": "trig_01",
        "question": "Simplify: sin(x)^2 + cos(x)^2 + 3",
        "domain": "trigonometry",
        "difficulty": "Easy",
        "correct_answer": "4",
        "hint": "Use the fundamental Pythagorean identity: sin^2(x) + cos^2(x) = 1.",
        "concept": "Pythagorean Identity"
    },
    {
        "id": "geom_pyth_01",
        "question": "In a right triangle, legs are a = 6 and b = 8. Find hypotenuse c.",
        "domain": "geometry",
        "difficulty": "Easy",
        "correct_answer": "10",
        "hint": "Use c = sqrt(a^2 + b^2). 6^2 + 8^2 = 36 + 64 = 100.",
        "concept": "Pythagorean Theorem"
    },
    {
        "id": "matrix_det_01",
        "question": "Compute the determinant of [[4, 2], [1, 3]]",
        "domain": "matrices",
        "difficulty": "Medium",
        "correct_answer": "10",
        "hint": "For [[a, b], [c, d]], det = ad - bc = 4*3 - 2*1.",
        "concept": "2x2 Determinant"
    },
    {
        "id": "stats_01",
        "question": "Find the mean of the numbers: 10, 20, 30, 40, 50",
        "domain": "statistics",
        "difficulty": "Easy",
        "correct_answer": "30",
        "hint": "Sum all 5 numbers (150) and divide by the count (5).",
        "concept": "Arithmetic Mean"
    }
]

class PracticeEngine:
    @staticmethod
    def get_questions(domain: Optional[str] = None, difficulty: Optional[str] = None) -> List[Dict[str, Any]]:
        questions = CURATED_PRACTICE_BANK
        if domain and domain.lower() != "all":
            questions = [q for q in questions if q["domain"].lower() == domain.lower()]
        if difficulty and difficulty.lower() != "all":
            questions = [q for q in questions if q["difficulty"].lower() == difficulty.lower()]
        return questions

    @staticmethod
    def generate_random_question(domain: str = "algebra", difficulty: str = "Medium") -> Dict[str, Any]:
        """Generates dynamic, randomized problems so students never run out of practice."""
        if domain == "algebra":
            if difficulty == "Easy":
                a = random.randint(2, 6)
                b = random.randint(1, 15)
                x_val = random.randint(2, 9)
                c = a * x_val + b
                return {
                    "id": f"dyn_lin_{random.randint(100, 999)}",
                    "question": f"Solve for x: {a}x + {b} = {c}",
                    "domain": "algebra",
                    "difficulty": "Easy",
                    "correct_answer": f"x = {x_val}",
                    "hint": f"Subtract {b} from both sides, then divide by {a}.",
                    "concept": "Linear Equation Isolation"
                }
            else:
                # Quadratic with integer roots
                r1 = random.randint(1, 5)
                r2 = random.randint(2, 6)
                # (x - r1)(x - r2) = x^2 - (r1+r2)x + (r1*r2) = 0
                b_coeff = -(r1 + r2)
                c_const = r1 * r2
                sign_b = "-" if b_coeff < 0 else "+"
                sign_c = "-" if c_const < 0 else "+"
                return {
                    "id": f"dyn_quad_{random.randint(100, 999)}",
                    "question": f"Solve for x: x^2 {sign_b} {abs(b_coeff)}x {sign_c} {abs(c_const)} = 0",
                    "domain": "algebra",
                    "difficulty": "Medium",
                    "correct_answer": f"x = {r1}, x = {r2}",
                    "hint": "Factor into two binomials (x - p)(x - q) = 0 or use the quadratic formula.",
                    "concept": "Factoring Quadratics"
                }
        elif domain == "calculus":
            c1 = random.randint(2, 7)
            p1 = random.randint(3, 5)
            c2 = random.randint(2, 9)
            return {
                "id": f"dyn_diff_{random.randint(100, 999)}",
                "question": f"Find derivative: d/dx [{c1}x^{p1} - {c2}x]",
                "domain": "calculus",
                "difficulty": difficulty,
                "correct_answer": f"{c1 * p1}*x^{p1 - 1} - {c2}",
                "hint": "Apply the power rule to each term.",
                "concept": "Power Rule"
            }
        else:
            # Fallback random pick from bank
            candidates = [q for q in CURATED_PRACTICE_BANK if q["domain"] == domain] or CURATED_PRACTICE_BANK
            return random.choice(candidates)

    @staticmethod
    def evaluate_answer(
        question_id: str,
        question_text: str,
        user_answer: str,
        correct_answer: str,
        student_steps: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        u_ans = user_answer.strip().lower().replace(" ", "").replace("*", "")
        c_ans = correct_answer.strip().lower().replace(" ", "").replace("*", "")

        # Check direct equivalence or numerical tolerance
        is_correct = (u_ans == c_ans)
        if not is_correct:
            # Try stripping "x="
            u_clean = u_ans.replace("x=", "")
            c_clean = c_ans.replace("x=", "")
            if u_clean == c_clean:
                is_correct = True
            else:
                # Check comma-separated multiple roots (order independence)
                u_parts = sorted(u_clean.split(","))
                c_parts = sorted(c_clean.split(","))
                if u_parts == c_parts:
                    is_correct = True

        # Generate step-by-step solution for user feedback
        solution = MathSolver.solve(question_text)

        explanation = (
            "🎉 Excellent! Your answer is completely correct."
            if is_correct
            else f"Not quite. The correct answer is: {correct_answer}."
        )

        mistake_type = None if is_correct else "Calculation Error"

        return {
            "is_correct": is_correct,
            "user_answer": user_answer,
            "correct_answer": correct_answer,
            "explanation": explanation,
            "mistake_type": mistake_type,
            "steps": solution.steps
        }
