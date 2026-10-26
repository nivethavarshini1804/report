import os
import re
import json
from typing import Dict, Any, List, Optional
from ..models.schema import ConceptCard, TutorChatResponse
from .solver import MathSolver

MATH_CONCEPTS = {
    "linear_equation": ConceptCard(
        title="Linear Equations (ax + b = c)",
        definition="An algebraic equation where each term has an exponent of 1. Graphically, it represents a straight line.",
        formula="ax + b = c \\implies ax = c - b \\implies x = \\frac{c - b}{a}",
        example="3x + 6 = 15 \\implies 3x = 9 \\implies x = 3",
        common_pitfalls=[
            "Forgetting to change the sign when shifting a number to the other side.",
            "Dividing only one term instead of the entire opposite side by the coefficient.",
            "Dropping negative signs attached to variables (e.g. -x = 5 means x = -5)."
        ]
    ),
    "quadratic_equation": ConceptCard(
        title="Quadratic Equations (ax² + bx + c = 0)",
        definition="A second-degree polynomial equation. Can have 2 real roots, 1 repeated real root, or 2 complex roots.",
        formula="x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
        example="x^2 - 5x + 6 = 0 \\implies (x - 2)(x - 3) = 0 \\implies x = 2, 3",
        common_pitfalls=[
            "Forgetting that (-b)^2 is always positive in the discriminant.",
            "Dividing only the square root part by 2a instead of the whole numerator (-b ± √D).",
            "Missing the ± symbol, which yields two potential solutions."
        ]
    ),
    "distributive_property": ConceptCard(
        title="The Distributive Property",
        definition="Multiplying a single term across a sum or difference inside parentheses.",
        formula="a(b + c) = ab + ac",
        example="4(2x - 3) = 4(2x) - 4(3) = 8x - 12",
        common_pitfalls=[
            "Multiplying only the first term: writing 4(2x - 3) = 8x - 3 (Distributive Error).",
            "Handling negative outer multipliers: -2(x - 5) = -2x + 10, not -2x - 10."
        ]
    ),
    "derivatives": ConceptCard(
        title="Derivatives (Calculus: Rate of Change)",
        definition="The derivative of a function measures the instantaneous rate of change or the slope of the tangent line at any point.",
        formula="\\frac{d}{dx}[x^n] = n x^{n-1}, \\quad \\frac{d}{dx}[u \\cdot v] = u'v + uv'",
        example="\\frac{d}{dx}[3x^4 - 5x + 7] = 12x^3 - 5",
        common_pitfalls=[
            "Forgetting the Chain Rule when differentiating composite functions like (3x+1)^4.",
            "Thinking derivative of a constant like 7 is 7, when it is actually 0.",
            "Confusing product rule with multiplying the derivatives directly: (uv)' ≠ u'v'."
        ]
    ),
    "integrals": ConceptCard(
        title="Integrals (Calculus: Accumulation and Area)",
        definition="The inverse operation of differentiation. Calculates the accumulated area under a function curve.",
        formula="\\int x^n dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)",
        example="\\int 6x^2 dx = 6 \\left(\\frac{x^3}{3}\\right) + C = 2x^3 + C",
        common_pitfalls=[
            "Forgetting the arbitrary constant of integration (+ C) for indefinite integrals.",
            "Dividing by the wrong exponent in the power rule.",
            "Forgetting to evaluate both bounds in definite integrals [F(b) - F(a)]."
        ]
    ),
    "pythagorean_theorem": ConceptCard(
        title="Pythagorean Theorem",
        definition="In a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides.",
        formula="a^2 + b^2 = c^2 \\implies c = \\sqrt{a^2 + b^2}",
        example="a = 3, b = 4 \\implies c = \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5",
        common_pitfalls=[
            "Using the theorem on non-right triangles.",
            "Mistaking one of the legs for the hypotenuse c (the hypotenuse is always opposite the 90° angle)."
        ]
    ),
    "fractions": ConceptCard(
        title="Fraction Operations",
        definition="Rules for adding, subtracting, multiplying, and dividing rational numbers.",
        formula="\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}, \\quad \\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c}",
        example="\\frac{1}{3} + \\frac{1}{4} = \\frac{4 + 3}{12} = \\frac{7}{12}",
        common_pitfalls=[
            "Adding denominators: 1/3 + 1/4 ≠ 2/7.",
            "Forgetting to flip (invert) the divisor when dividing fractions."
        ]
    )
}

class AITutor:
    @staticmethod
    def generate_hints(problem_str: str) -> List[str]:
        clean = problem_str.strip()
        hints = []
        if "=" in clean:
            if "^2" in clean or "**2" in clean:
                hints = [
                    "Hint 1: Notice this is a quadratic equation with a squared variable term.",
                    "Hint 2: Rearrange all terms to the left-hand side so the equation takes standard form: ax² + bx + c = 0.",
                    "Hint 3: Calculate the discriminant D = b² - 4ac. If D is a perfect square, you can factor it easily!",
                    "Hint 4: Use the Quadratic Formula: x = (-b ± √D) / (2a) to find both roots."
                ]
            else:
                hints = [
                    "Hint 1: Look at the positions of the variable terms and the constant terms.",
                    "Hint 2: Group all variable terms on one side (e.g. left) and all constant numbers on the opposite side (right).",
                    "Hint 3: Simplify both sides by combining like terms.",
                    "Hint 4: Divide both sides by the coefficient in front of the variable to isolate it completely."
                ]
        elif any(k in clean.lower() for k in ["d/dx", "diff", "derivative"]):
            hints = [
                "Hint 1: Differentiate each term one by one using the Sum Rule.",
                "Hint 2: For polynomial terms like a·xⁿ, apply the Power Rule: bring down the exponent n and reduce power by 1.",
                "Hint 3: Remember that the derivative of any constant number is always 0.",
                "Hint 4: If you have composite terms or products, check if Chain Rule or Product Rule is needed."
            ]
        elif any(k in clean.lower() for k in ["int", "integrate"]):
            hints = [
                "Hint 1: Integration is the reverse of differentiation.",
                "Hint 2: For power terms xⁿ, add 1 to the exponent and divide by the new exponent: x^(n+1) / (n+1).",
                "Hint 3: If it's a definite integral with bounds [a, b], calculate F(b) - F(a).",
                "Hint 4: Don't forget to include the constant of integration (+ C) for indefinite integrals!"
            ]
        else:
            hints = [
                "Hint 1: Check the order of operations: Parentheses, Exponents, Multiplication & Division, Addition & Subtraction (PEMDAS).",
                "Hint 2: Expand any brackets first using the Distributive Property.",
                "Hint 3: Group similar terms together (terms with the same power/variable).",
                "Hint 4: Simplify arithmetic step-by-step."
            ]
        return hints

    @staticmethod
    def get_concept_for_problem(problem_str: str) -> Optional[ConceptCard]:
        clean = problem_str.lower()
        if "d/dx" in clean or "diff" in clean or "derivative" in clean:
            return MATH_CONCEPTS["derivatives"]
        if "int" in clean or "integrate" in clean:
            return MATH_CONCEPTS["integrals"]
        if "pythagor" in clean or "triangle" in clean:
            return MATH_CONCEPTS["pythagorean_theorem"]
        if "/" in clean and not any(k in clean for k in ["d/dx", "x/"]):
            return MATH_CONCEPTS["fractions"]
        if "^2" in clean or "**2" in clean:
            return MATH_CONCEPTS["quadratic_equation"]
        if "(" in clean and ")" in clean:
            return MATH_CONCEPTS["distributive_property"]
        if "=" in clean:
            return MATH_CONCEPTS["linear_equation"]
        return MATH_CONCEPTS["distributive_property"]

    @staticmethod
    def chat_reply(
        message: str,
        conversation_history: List[Dict[str, str]] = [],
        current_problem: Optional[str] = None,
        learning_level: str = "high_school"
    ) -> TutorChatResponse:
        msg_lower = message.lower()

        # Check for hints request
        if any(w in msg_lower for w in ["hint", "clue", "help me start", "next step"]):
            prob = current_problem or "2x + 6 = 14"
            hints = AITutor.generate_hints(prob)
            reply = (
                f"Here is a progressive hint to guide your thinking on **{prob}**:\n\n"
                f"🎯 **{hints[0]}**\n\n"
                f"💡 *Would you like the next hint or want to try doing this step yourself?*"
            )
            return TutorChatResponse(
                reply=reply,
                hints=hints,
                suggested_questions=[
                    "Give me the next hint",
                    "Why do we move terms to the other side?",
                    "Can you show a similar practice problem?"
                ]
            )

        # Check for concept explanation
        concept_match = None
        for key, card in MATH_CONCEPTS.items():
            if key.replace("_", " ") in msg_lower or card.title.lower() in msg_lower:
                concept_match = card
                break

        if concept_match or "explain" in msg_lower or "concept" in msg_lower or "what is" in msg_lower:
            card = concept_match or AITutor.get_concept_for_problem(current_problem or "linear_equation")
            
            # Level adaptation
            if learning_level == "elementary":
                level_intro = "In simple terms, think of this like a balanced scale! Whatever you do to one side, you must do to the other to keep it balanced."
            elif learning_level == "college":
                level_intro = "From a formal perspective, this operation relies on field axioms, equivalence relations, and algebraic structures."
            else: # high_school
                level_intro = "In high school algebra, this fundamental technique lets you systematically isolate unknowns and solve for values."

            reply = (
                f"### 📚 Concept Guide: {card.title}\n\n"
                f"{level_intro}\n\n"
                f"**Definition:** {card.definition}\n\n"
                f"**Formula:** $${card.formula}$$\n\n"
                f"**Example Walkthrough:**\n"
                f"$${card.example}$$\n\n"
                f"⚠️ **Common Student Traps:**\n"
                + "\n".join([f"- {p}" for p in card.common_pitfalls])
            )

            return TutorChatResponse(
                reply=reply,
                concept_card=card,
                suggested_questions=[
                    f"Give me a practice problem on {card.title}",
                    "What is a common mistake here?",
                    "Can you explain this with smaller numbers?"
                ]
            )

        # Check for practice problem generation request
        if "practice" in msg_lower or "similar problem" in msg_lower or "quiz" in msg_lower:
            sample_practice = [
                {
                    "question": "Solve for x: 3x - 7 = 14",
                    "domain": "algebra",
                    "difficulty": "Easy",
                    "answer": "x = 7",
                    "hint": "Add 7 to both sides, then divide by 3."
                },
                {
                    "question": "Find the derivative of f(x) = 4x^3 - 2x + 9",
                    "domain": "calculus",
                    "difficulty": "Medium",
                    "answer": "12x^2 - 2",
                    "hint": "Apply the power rule d/dx[x^n] = n*x^(n-1)."
                }
            ]
            reply = (
                "🎯 Here are customized practice problems based on your topic. "
                "Try writing out your steps in the **Error Checker** or **Practice Zone**!"
            )
            return TutorChatResponse(
                reply=reply,
                practice_questions=sample_practice,
                suggested_questions=[
                    "How do I solve problem 1?",
                    "Give me a harder problem",
                    "Review my steps"
                ]
            )

        # General interactive math tutor response
        prob_context = f" for `{current_problem}`" if current_problem else ""
        reply = (
            f"Hello! I am your AI Math Tutor. I'm here to help you master mathematics step-by-step{prob_context}.\n\n"
            f"Here are ways I can assist you right now:\n"
            f"1. **Provide Socratic Hints** – I'll give clues without giving away the full answer so you can learn by doing.\n"
            f"2. **Explain Any Concept** – Ask me about quadratic equations, derivatives, matrix determinants, or fractions.\n"
            f"3. **Analyze Your Working** – Explain why a particular step feels confusing or where you think you got stuck.\n"
            f"4. **Generate Practice Problems** – Test your skills with instant automatic grading.\n\n"
            f"What would you like to explore next?"
        )

        return TutorChatResponse(
            reply=reply,
            suggested_questions=[
                "Give me a hint for the current problem",
                "Explain the Distributive Property",
                "Why do negative times negative equal positive?",
                "Give me a practice challenge"
            ]
        )
