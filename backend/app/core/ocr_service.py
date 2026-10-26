import re
from typing import Dict, Any, Optional

def clean_math_text(raw_text: str) -> str:
    """
    Cleans raw OCR or typed text to standard mathematical notation
    suitable for SymPy parsing and display.
    """
    if not raw_text:
        return ""

    text = raw_text.strip()

    # Replace common unicode math characters
    replacements = {
        '−': '-',
        '–': '-',
        '—': '-',
        '×': '*',
        '✕': '*',
        '•': '*',
        '·': '*',
        '÷': '/',
        '⁄': '/',
        '²': '^2',
        '³': '^3',
        '⁴': '^4',
        '⁵': '^5',
        '⁶': '^6',
        '⁷': '^7',
        '⁸': '^8',
        '⁹': '^9',
        '⁰': '^0',
        '½': '1/2',
        '¼': '1/4',
        '¾': '3/4',
        'π': 'pi',
        '∏': 'pi',
        'θ': 'theta',
        '√': 'sqrt',
        '≤': '<=',
        '≥': '>=',
        '≠': '!=',
        '±': '+-',
        '≈': '='
    }

    for orig, repl in replacements.items():
        text = text.replace(orig, repl)

    # Clean LaTeX artifacts if present
    text = re.sub(r'\\left\(|\\right\)', lambda m: '(' if '(' in m.group(0) else ')', text)
    text = re.sub(r'\\cdot', '*', text)
    text = re.sub(r'\\times', '*', text)
    text = re.sub(r'\\div', '/', text)
    text = re.sub(r'\\frac\{([^{}]+)\}\{([^{}]+)\}', r'(\1)/(\2)', text)
    text = re.sub(r'\\sqrt\{([^{}]+)\}', r'sqrt(\1)', text)
    text = re.sub(r'\\sqrt\[(\d+)\]\{([^{}]+)\}', r'(\2)**(1/\1)', text)

    # Fix common OCR misrecognitions
    # e.g. "2x + 3 = 1I" -> "2x + 3 = 11"
    # "x + S = 10" -> "x + 5 = 10"
    text = re.sub(r'(\d)\s*[lI](\s|$|[+*=\-\/])', r'\g<1>1\2', text)
    text = re.sub(r'([+*=\-\/]\s*)[lI](\d)', r'\g<1>1\2', text)
    text = re.sub(r'([+*=\-\/]\s*)S(\s|$|[+*=\-\/])', r'\g<1>5\2', text)
    
    # Fix missing multiplication: "2x" -> "2*x" when appropriate for sympy parsing,
    # but keep readable for user display
    # Keep standard representation
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def parse_extracted_problem(raw_text: str) -> Dict[str, Any]:
    cleaned = clean_math_text(raw_text)
    
    # Heuristic guess of domain
    lower = cleaned.lower()
    guessed_domain = "algebra"
    if any(k in lower for k in ["d/dx", "diff", "derivative", "integrate", "integral", "lim", "limit", "int "]):
        guessed_domain = "calculus"
    elif any(k in lower for k in ["sin", "cos", "tan", "sec", "csc", "cot", "theta"]):
        guessed_domain = "trigonometry"
    elif any(k in lower for k in ["mean", "median", "mode", "variance", "std"]):
        guessed_domain = "statistics"
    elif any(k in lower for k in ["matrix", "det", "[", "eigen"]):
        guessed_domain = "matrices"
    elif "=" in cleaned:
        if "^2" in cleaned or "**2" in cleaned:
            guessed_domain = "quadratic_equation"
        else:
            guessed_domain = "linear_equation"
    else:
        # Check if pure arithmetic numbers
        if not re.search(r'[a-zA-Z]', cleaned) or all(c in "0123456789+-*/().^ " for c in cleaned):
            guessed_domain = "arithmetic"

    return {
        "raw_text": raw_text,
        "cleaned_expression": cleaned,
        "guessed_domain": guessed_domain,
        "confidence": 0.92 if cleaned else 0.0
    }
