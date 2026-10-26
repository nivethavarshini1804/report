import re
import sympy as sp
from typing import List, Dict, Any, Optional, Tuple
from ..models.schema import StepAnalysis, ErrorCheckResponse, StepItem
from .solver import MathSolver, safe_parse

class ErrorChecker:
    @staticmethod
    def analyze_solution(
        original_problem: str,
        student_steps: List[str],
        problem_type: str = "equation",
        final_answer: Optional[str] = None
    ) -> ErrorCheckResponse:
        original_problem = original_problem.strip()
        cleaned_steps = [s.strip() for s in student_steps if s.strip()]

        if not cleaned_steps:
            return ErrorCheckResponse(
                success=False,
                has_errors=False,
                first_error_step=None,
                step_analyses=[],
                summary_explanation="No student steps were provided to analyze.",
                overall_hint="Please enter at least one step of your work.",
                correct_solution_steps=[],
                verified=False,
                error_message="Empty steps list"
            )

        # Solve original problem independently to have ground truth steps and solutions
        ground_truth = MathSolver.solve(original_problem)
        is_equation = "=" in original_problem

        if is_equation:
            return ErrorChecker._check_equation_steps(original_problem, cleaned_steps, ground_truth)
        else:
            return ErrorChecker._check_expression_steps(original_problem, cleaned_steps, ground_truth)

    @staticmethod
    def _check_equation_steps(
        original_eq: str,
        steps: List[str],
        ground_truth: Any
    ) -> ErrorCheckResponse:
        lhs_orig, rhs_orig = original_eq.split("=", 1)
        orig_lhs = safe_parse(lhs_orig)
        orig_rhs = safe_parse(rhs_orig)
        orig_diff = sp.simplify(orig_lhs - orig_rhs)

        symbols = list(orig_lhs.free_symbols | orig_rhs.free_symbols)
        var = symbols[0] if symbols else sp.Symbol('x')

        # True solutions of the original equation
        try:
            true_solutions = sp.solve(orig_diff, var)
        except Exception:
            true_solutions = []

        step_analyses: List[StepAnalysis] = []
        first_error_idx: Optional[int] = None
        dominant_mistake_type: Optional[str] = None
        has_error = False

        prev_diff = orig_diff

        for idx, step_str in enumerate(steps, start=1):
            if "=" not in step_str:
                # Student omitted '=', e.g. wrote "2x = 10" then just "5"
                # If it's the last step and matches a solution, handle gracefully
                try:
                    val = safe_parse(step_str)
                    if true_solutions and any(sp.simplify(val - sol) == 0 for sol in true_solutions):
                        step_analyses.append(StepAnalysis(
                            step_number=idx,
                            student_step=step_str,
                            latex_step=sp.latex(val),
                            is_correct=True,
                            reason=f"Correct final solution: {var} = {val}.",
                            hint="Tip: Writing full equations like 'x = " + str(val) + "' keeps your work clear!"
                        ))
                        continue
                except Exception:
                    pass

                # If format is not equation
                step_analyses.append(StepAnalysis(
                    step_number=idx,
                    student_step=step_str,
                    latex_step=step_str,
                    is_correct=False,
                    reason="Step is missing an equals sign '='. An equation must balance both sides.",
                    mistake_type="Notation / Formatting Error",
                    corrected_step=f"{var} = {step_str}",
                    hint="Ensure you write both left and right sides separated by '='."
                ))
                if first_error_idx is None:
                    first_error_idx = idx
                    dominant_mistake_type = "Notation / Formatting Error"
                    has_error = True
                continue

            try:
                s_lhs_str, s_rhs_str = step_str.split("=", 1)
                s_lhs = safe_parse(s_lhs_str)
                s_rhs = safe_parse(s_rhs_str)
                curr_diff = sp.simplify(s_lhs - s_rhs)
            except Exception as e:
                step_analyses.append(StepAnalysis(
                    step_number=idx,
                    student_step=step_str,
                    is_correct=False,
                    reason=f"Could not parse this step mathematically: {str(e)}",
                    mistake_type="Syntax Error",
                    hint="Check for missing operators like '*' or mismatched parentheses."
                ))
                if first_error_idx is None:
                    first_error_idx = idx
                    dominant_mistake_type = "Syntax Error"
                    has_error = True
                continue

            # Check mathematical equivalence with original equation
            # Equivalence condition 1: curr_diff evaluated at all true solutions is 0
            is_step_valid = False
            if true_solutions:
                # Check if all original solutions satisfy this step's equation
                satisfies_all = True
                for sol in true_solutions:
                    try:
                        eval_diff = curr_diff.subs(var, sol)
                        if sp.simplify(eval_diff) != 0:
                            satisfies_all = False
                            break
                    except Exception:
                        satisfies_all = False
                        break

                # Also verify no extraneous roots were introduced (degree doesn't wildly increase)
                if satisfies_all:
                    try:
                        step_solutions = sp.solve(curr_diff, var)
                        if set(true_solutions) == set(step_solutions):
                            is_step_valid = True
                        elif all(sp.simplify(curr_diff.subs(var, s)) == 0 for s in true_solutions):
                            # Acceptable equivalent simplification step
                            is_step_valid = True
                    except Exception:
                        is_step_valid = satisfies_all
            else:
                # No variable or identity
                is_step_valid = (sp.simplify(curr_diff) == 0)

            # Equivalence condition 2: curr_diff is a constant non-zero multiple of prev_diff
            if not is_step_valid and prev_diff != 0:
                try:
                    ratio = sp.simplify(curr_diff / prev_diff)
                    if ratio.is_number and ratio != 0:
                        is_step_valid = True
                except Exception:
                    pass

            # If previous step already had an error, check if this step correctly followed from the erroneous step
            # (consequential consistency)
            consequential_valid = False
            if has_error and prev_diff != 0:
                try:
                    ratio = sp.simplify(curr_diff / prev_diff)
                    if ratio.is_number and ratio != 0:
                        consequential_valid = True
                except Exception:
                    pass

            latex_rep = f"{sp.latex(s_lhs)} = {sp.latex(s_rhs)}"

            if is_step_valid:
                step_analyses.append(StepAnalysis(
                    step_number=idx,
                    student_step=step_str,
                    latex_step=latex_rep,
                    is_correct=True,
                    reason="Mathematically valid transformation preserving the equation's solution.",
                    hint="Great job! The algebraic equality holds true."
                ))
                prev_diff = curr_diff
            else:
                # First or continued error
                if first_error_idx is None:
                    first_error_idx = idx
                    has_error = True

                    # Diagnose specific mistake type
                    mistake_type, why_wrong, corrected_step, hint = ErrorChecker._diagnose_mistake(
                        prev_diff, curr_diff, step_str, var, ground_truth, idx
                    )
                    dominant_mistake_type = mistake_type

                    step_analyses.append(StepAnalysis(
                        step_number=idx,
                        student_step=step_str,
                        latex_step=latex_rep,
                        is_correct=False,
                        reason=why_wrong,
                        mistake_type=mistake_type,
                        corrected_step=corrected_step,
                        hint=hint
                    ))
                else:
                    # Consequential step
                    if consequential_valid:
                        reason_msg = "Calculation was performed correctly based on your previous step, but the earlier mistake in Step " + str(first_error_idx) + " carried forward."
                    else:
                        reason_msg = "Contains an additional calculation discrepancy."
                    
                    step_analyses.append(StepAnalysis(
                        step_number=idx,
                        student_step=step_str,
                        latex_step=latex_rep,
                        is_correct=False,
                        reason=reason_msg,
                        mistake_type="Carried Error / Miscalculation",
                        hint="Review Step " + str(first_error_idx) + " to fix the root cause."
                    ))

                prev_diff = curr_diff

        # Overall summary
        if not has_error:
            summary = "Outstanding work! All of your problem-solving steps are mathematically sound and correct."
            overall_hint = "Your mathematical operations and equivalences are accurate. Keep up the great work!"
        else:
            summary = f"Identified a calculation mistake at Step {first_error_idx}: {dominant_mistake_type}."
            overall_hint = f"Focus on Step {first_error_idx}. Check your operations when moving terms across the equals sign or multiplying coefficients."

        return ErrorCheckResponse(
            success=True,
            has_errors=has_error,
            first_error_step=first_error_idx,
            step_analyses=step_analyses,
            mistake_type=dominant_mistake_type,
            summary_explanation=summary,
            overall_hint=overall_hint,
            correct_solution_steps=ground_truth.steps if hasattr(ground_truth, 'steps') else [],
            verified=True
        )

    @staticmethod
    def _check_expression_steps(
        original_expr_str: str,
        steps: List[str],
        ground_truth: Any
    ) -> ErrorCheckResponse:
        orig_expr = safe_parse(original_expr_str)
        orig_simplified = sp.simplify(orig_expr)

        step_analyses: List[StepAnalysis] = []
        first_error_idx: Optional[int] = None
        dominant_mistake_type: Optional[str] = None
        has_error = False

        prev_expr = orig_expr

        for idx, step_str in enumerate(steps, start=1):
            try:
                curr_expr = safe_parse(step_str)
            except Exception as e:
                step_analyses.append(StepAnalysis(
                    step_number=idx,
                    student_step=step_str,
                    is_correct=False,
                    reason=f"Could not parse expression: {str(e)}",
                    mistake_type="Syntax Error",
                    hint="Check your operators and parentheses."
                ))
                if first_error_idx is None:
                    first_error_idx = idx
                    dominant_mistake_type = "Syntax Error"
                    has_error = True
                continue

            diff = sp.simplify(curr_expr - orig_simplified)
            latex_rep = sp.latex(curr_expr)

            if diff == 0:
                step_analyses.append(StepAnalysis(
                    step_number=idx,
                    student_step=step_str,
                    latex_step=latex_rep,
                    is_correct=True,
                    reason="Mathematically equivalent to the original expression.",
                    hint="Correct transformation!"
                ))
                prev_expr = curr_expr
            else:
                if first_error_idx is None:
                    first_error_idx = idx
                    has_error = True
                    mistake_type, why_wrong, corrected_step, hint = ErrorChecker._diagnose_expression_mistake(
                        prev_expr, curr_expr, step_str, ground_truth, idx
                    )
                    dominant_mistake_type = mistake_type

                    step_analyses.append(StepAnalysis(
                        step_number=idx,
                        student_step=step_str,
                        latex_step=latex_rep,
                        is_correct=False,
                        reason=why_wrong,
                        mistake_type=mistake_type,
                        corrected_step=corrected_step,
                        hint=hint
                    ))
                else:
                    step_analyses.append(StepAnalysis(
                        step_number=idx,
                        student_step=step_str,
                        latex_step=latex_rep,
                        is_correct=False,
                        reason=f"Carried-forward error from Step {first_error_idx}.",
                        mistake_type="Carried Error",
                        hint=f"Fix Step {first_error_idx} to rectify this calculation."
                    ))

                prev_expr = curr_expr

        if not has_error:
            summary = "All steps are completely correct and simplify properly!"
            overall_hint = "Your simplification is fully accurate."
        else:
            summary = f"Calculation error detected at Step {first_error_idx}: {dominant_mistake_type}."
            overall_hint = f"Review Step {first_error_idx} for arithmetic or algebraic properties."

        return ErrorCheckResponse(
            success=True,
            has_errors=has_error,
            first_error_step=first_error_idx,
            step_analyses=step_analyses,
            mistake_type=dominant_mistake_type,
            summary_explanation=summary,
            overall_hint=overall_hint,
            correct_solution_steps=ground_truth.steps if hasattr(ground_truth, 'steps') else [],
            verified=True
        )

    # -------------------------------------------------------------
    # MISTAKE DIAGNOSTIC ENGINES
    # -------------------------------------------------------------
    @staticmethod
    def _diagnose_mistake(
        prev_diff: sp.Expr,
        curr_diff: sp.Expr,
        student_step_str: str,
        var: sp.Symbol,
        ground_truth: Any,
        step_num: int
    ) -> Tuple[str, str, str, str]:
        """
        Diagnoses why the equation step broke equivalence and returns:
        (mistake_type, explanation, corrected_step, hint)
        """
        # Suggest a corrected step from ground truth if step_num matches or close
        corrected_step = ""
        if hasattr(ground_truth, 'steps') and len(ground_truth.steps) >= step_num:
            gt_step = ground_truth.steps[step_num - 1]
            corrected_step = gt_step.expression

        # 1. Check Distributive Property error:
        # e.g., 2(x + 3) -> 2x + 3
        if "(" in str(prev_diff) or ")" in str(prev_diff):
            if "distribut" in str(student_step_str).lower() or "(" not in student_step_str:
                return (
                    "Distributive Property Error",
                    "A term outside parentheses was not distributed to every term inside the parentheses (e.g., a(b + c) must multiply both b and c).",
                    corrected_step or "Ensure you multiply every term inside the brackets.",
                    "Remember: 2(x + 3) = 2*x + 2*3 = 2x + 6, not 2x + 3."
                )

        # 2. Check Sign Error:
        # e.g., student added instead of subtracted
        try:
            # Check if sign inversion of constant term fixes it
            poly_curr = sp.Poly(curr_diff, var) if curr_diff.has(var) else None
            poly_prev = sp.Poly(prev_diff, var) if prev_diff.has(var) else None
            if poly_curr and poly_prev:
                c_curr = poly_curr.coeff_monomial(1)
                c_prev = poly_prev.coeff_monomial(1)
                if c_curr == -c_prev:
                    return (
                        "Sign Error",
                        "A sign was flipped incorrectly when transferring terms across the equals sign. When a positive term moves to the other side, its sign becomes negative.",
                        corrected_step or f"Change the sign of the constant term to the opposite sign.",
                        "Tip: Check whether you used addition instead of subtraction or vice-versa."
                    )
        except Exception:
            pass

        # 3. Check Inverse Operation / Division Error:
        # e.g., 2x = 8 => x = 8 - 2 = 6 instead of x = 8 / 2 = 4
        if "=" in student_step_str:
            lhs_part, rhs_part = student_step_str.split("=", 1)
            if lhs_part.strip() == str(var):
                return (
                    "Inverse Operation / Division Error",
                    f"When isolating {var}, the coefficient multiplier was not divided correctly on both sides.",
                    corrected_step or f"Divide both sides by the coefficient of {var}.",
                    f"To undo multiplication by 'a' in 'a*{var} = b', divide both sides by 'a'."
                )

        # 4. Check Fraction Arithmetic Error:
        if "/" in student_step_str:
            return (
                "Fraction Arithmetic Error",
                "Fractions were combined without obtaining a common denominator or fraction inversion was miscalculated.",
                corrected_step or "Find the lowest common denominator (LCD) before adding or subtracting fractions.",
                "Reminder: a/b + c/d requires a common denominator: (a*d + b*c) / (b*d)."
            )

        # 5. Check Exponent Rule Error:
        if "^" in student_step_str or "**" in student_step_str:
            return (
                "Exponent Rule Error",
                "An exponent law was misapplied (e.g., adding exponents when multiplying like bases, or multiplying exponents in power of a power).",
                corrected_step or "Apply standard exponent laws: x^a * x^b = x^(a+b).",
                "Check whether you multiplied exponents when you should have added them."
            )

        # Default: General Calculation Error
        return (
            "Calculation / Arithmetic Error",
            f"The mathematical operation at this step does not preserve equivalence. An arithmetic calculation mistake occurred.",
            corrected_step or "Recalculate both sides carefully step-by-step.",
            "Verify your arithmetic operations (addition, subtraction, multiplication) on both sides."
        )

    @staticmethod
    def _diagnose_expression_mistake(
        prev_expr: sp.Expr,
        curr_expr: sp.Expr,
        student_step_str: str,
        ground_truth: Any,
        step_num: int
    ) -> Tuple[str, str, str, str]:
        corrected_step = ""
        if hasattr(ground_truth, 'steps') and len(ground_truth.steps) >= step_num:
            corrected_step = ground_truth.steps[step_num - 1].expression

        # Exponent rule check
        if "^" in student_step_str or "**" in student_step_str:
            return (
                "Exponent Rule Error",
                "Exponent rules were misapplied when simplifying powers.",
                corrected_step or "Use x^a * x^b = x^(a+b) and (x^a)^b = x^(a*b).",
                "Ensure power rules are strictly followed."
            )

        # Distributive check
        if "(" in str(prev_expr) and "(" not in student_step_str:
            return (
                "Distributive Property Error",
                "Parentheses were opened without multiplying the factor to every term inside.",
                corrected_step or "Distribute the outside multiplier to all terms inside the brackets.",
                "Remember: a(b + c) = ab + ac."
            )

        # Sign error check
        if sp.simplify(curr_expr + prev_expr) == 0:
            return (
                "Sign Inversion Error",
                "The entire expression has the opposite sign.",
                corrected_step or str(prev_expr),
                "Check for an unhandled negative sign."
            )

        return (
            "Arithmetic / Simplification Error",
            "The simplified expression is not equal to the original expression.",
            corrected_step or (str(ground_truth.final_answer) if hasattr(ground_truth, 'final_answer') else ""),
            "Re-check the arithmetic and grouping of like terms."
        )
