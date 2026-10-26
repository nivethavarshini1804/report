import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from .config import DB_PATH

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Problem History table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS problem_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        problem_type TEXT NOT NULL, -- 'solve', 'error_check'
        input_text TEXT NOT NULL,
        domain TEXT,
        solution_data TEXT, -- JSON formatted solution/error response
        status TEXT DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Mistakes Log table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS mistake_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        problem_id INTEGER,
        problem_text TEXT,
        mistake_type TEXT NOT NULL, -- 'Sign Error', 'Distributive Property', etc.
        step_number INTEGER,
        explanation TEXT,
        student_step TEXT,
        corrected_step TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Practice Attempts table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS practice_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id TEXT,
        question_text TEXT NOT NULL,
        domain TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        user_answer TEXT,
        correct_answer TEXT,
        is_correct INTEGER NOT NULL, -- 1 for True, 0 for False
        mistake_type TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()

def save_problem_history(problem_type: str, input_text: str, domain: str, solution_data: Dict[str, Any]) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO problem_history (problem_type, input_text, domain, solution_data)
        VALUES (?, ?, ?, ?)
        """,
        (problem_type, input_text, domain, json.dumps(solution_data))
    )
    history_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return history_id

def log_mistake(problem_id: Optional[int], problem_text: str, mistake_type: str, 
                step_number: int, explanation: str, student_step: str, corrected_step: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO mistake_logs (problem_id, problem_text, mistake_type, step_number, explanation, student_step, corrected_step)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (problem_id, problem_text, mistake_type, step_number, explanation, student_step, corrected_step)
    )
    conn.commit()
    conn.close()

def save_practice_record(question_id: str, question_text: str, domain: str, 
                         difficulty: str, user_answer: str, correct_answer: str, 
                         is_correct: bool, mistake_type: Optional[str] = None):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO practice_records (question_id, question_text, domain, difficulty, user_answer, correct_answer, is_correct, mistake_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (question_id, question_text, domain, difficulty, user_answer, correct_answer, 1 if is_correct else 0, mistake_type)
    )
    conn.commit()
    conn.close()

def get_history(limit: int = 50, problem_type: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    if problem_type:
        cursor.execute(
            """
            SELECT id, problem_type, input_text, domain, solution_data, status, created_at
            FROM problem_history
            WHERE problem_type = ?
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (problem_type, limit)
        )
    else:
        cursor.execute(
            """
            SELECT id, problem_type, input_text, domain, solution_data, status, created_at
            FROM problem_history
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (limit,)
        )
    rows = cursor.fetchall()
    history = []
    for r in rows:
        data = dict(r)
        if data["solution_data"]:
            try:
                data["solution_data"] = json.loads(data["solution_data"])
            except Exception:
                pass
        history.append(data)
    conn.close()
    return history

def delete_history_item(item_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM problem_history WHERE id = ?", (item_id,))
    conn.commit()
    conn.close()

def clear_all_history():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM problem_history")
    cursor.execute("DELETE FROM mistake_logs")
    cursor.execute("DELETE FROM practice_records")
    conn.commit()
    conn.close()

def get_dashboard_statistics() -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()

    # Total problems solved / checked
    cursor.execute("SELECT COUNT(*) FROM problem_history")
    total_problems = cursor.fetchone()[0]

    # Error checks count
    cursor.execute("SELECT COUNT(*) FROM problem_history WHERE problem_type = 'error_check'")
    total_error_checks = cursor.fetchone()[0]

    # Practice stats
    cursor.execute("SELECT COUNT(*) FROM practice_records")
    total_practice = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM practice_records WHERE is_correct = 1")
    practice_correct = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM practice_records WHERE is_correct = 0")
    practice_incorrect = cursor.fetchone()[0]

    total_attempts = practice_correct + practice_incorrect
    accuracy_rate = round((practice_correct / total_attempts * 100), 1) if total_attempts > 0 else 100.0

    # Frequent mistake types
    cursor.execute("""
        SELECT mistake_type, COUNT(*) as count
        FROM mistake_logs
        GROUP BY mistake_type
        ORDER BY count DESC
        LIMIT 6
    """)
    mistake_rows = cursor.fetchall()
    frequent_mistakes = [{"type": r["mistake_type"], "count": r["count"]} for r in mistake_rows]

    # Domain breakdown
    cursor.execute("""
        SELECT domain, COUNT(*) as count
        FROM problem_history
        WHERE domain IS NOT NULL AND domain != ''
        GROUP BY domain
        ORDER BY count DESC
    """)
    domain_rows = cursor.fetchall()
    domain_breakdown = [{"domain": r["domain"], "count": r["count"]} for r in domain_rows]

    # Practice domains
    cursor.execute("""
        SELECT domain, 
               COUNT(*) as total,
               SUM(is_correct) as correct
        FROM practice_records
        GROUP BY domain
    """)
    practice_domain_rows = cursor.fetchall()
    domain_accuracy = []
    weak_areas = []
    for r in practice_domain_rows:
        tot = r["total"]
        cor = r["correct"] or 0
        rate = round((cor / tot) * 100, 1) if tot > 0 else 0
        domain_accuracy.append({"domain": r["domain"], "total": tot, "correct": cor, "rate": rate})
        if rate < 70 and tot >= 2:
            weak_areas.append(r["domain"])

    # Recent activity
    cursor.execute("""
        SELECT id, problem_type, input_text, domain, created_at
        FROM problem_history
        ORDER BY created_at DESC
        LIMIT 6
    """)
    recent_activity = [dict(r) for r in cursor.fetchall()]

    conn.close()

    # Default frequent mistakes if empty so dashboard shows meaningful visualization
    if not frequent_mistakes:
        frequent_mistakes = [
            {"type": "Sign Error", "count": 0},
            {"type": "Distributive Property", "count": 0},
            {"type": "Fraction Arithmetic", "count": 0},
            {"type": "Exponent Rules", "count": 0}
        ]

    return {
        "total_problems": total_problems,
        "total_error_checks": total_error_checks,
        "total_practice": total_practice,
        "practice_correct": practice_correct,
        "practice_incorrect": practice_incorrect,
        "accuracy_rate": accuracy_rate,
        "frequent_mistakes": frequent_mistakes,
        "domain_breakdown": domain_breakdown,
        "domain_accuracy": domain_accuracy,
        "weak_areas": weak_areas if weak_areas else ["Algebraic Simplification"],
        "recent_activity": recent_activity
    }
