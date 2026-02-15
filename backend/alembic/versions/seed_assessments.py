"""Seed sample assessments

Revision ID: seed_assessments
Revises: add_assessments
Create Date: 2026-02-15

"""
from typing import Sequence, Union
import uuid
import json

from alembic import op

revision: str = "seed_assessments"
down_revision: Union[str, Sequence[str], None] = "add_assessments"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

JS_QUESTIONS = [
    {"question": "What keyword declares a block-scoped variable in JavaScript?", "options": ["var", "let", "const", "both let and const"], "correct_index": 3},
    {"question": "Which method adds an element to the end of an array?", "options": ["push()", "append()", "add()", "insert()"], "correct_index": 0},
    {"question": "What does typeof null return?", "options": ["'null'", "'object'", "'undefined'", "'none'"], "correct_index": 1},
    {"question": "Which is used for strict equality check?", "options": ["==", "===", "=", "equals()"], "correct_index": 1},
    {"question": "What is a Promise used for?", "options": ["Looping", "Async operations", "String concat", "Math"], "correct_index": 1},
]

PYTHON_QUESTIONS = [
    {"question": "How do you define a function in Python?", "options": ["function foo():", "def foo():", "func foo():", "define foo():"], "correct_index": 1},
    {"question": "Which creates a list?", "options": ["(1,2,3)", "[1,2,3]", "{1,2,3}", "<1,2,3>"], "correct_index": 1},
    {"question": "What does len([1,2,3]) return?", "options": ["3", "4", "0", "None"], "correct_index": 0},
    {"question": "How do you open a file for reading?", "options": ["open('f', 'r')", "read('f')", "file('f')", "open('f')"], "correct_index": 0},
    {"question": "What is the output of 2 ** 3?", "options": ["6", "8", "9", "5"], "correct_index": 1},
]


def upgrade() -> None:
    from sqlalchemy import text
    conn = op.get_bind()
    for skill_name, description, questions in [
        ("JavaScript Basics", "Basic JavaScript syntax and types", JS_QUESTIONS),
        ("Python Basics", "Basic Python syntax and built-ins", PYTHON_QUESTIONS),
    ]:
        conn.execute(
            text(
                "INSERT INTO assessments (id, skill_name, description, questions, passing_score, duration_minutes, created_at) "
                "VALUES (:id, :skill_name, :description, :questions::jsonb, 70, 15, now())"
            ),
            {"id": uuid.uuid4(), "skill_name": skill_name, "description": description, "questions": json.dumps(questions)}
        )


def downgrade() -> None:
    op.execute("DELETE FROM assessments WHERE skill_name IN ('JavaScript Basics', 'Python Basics')")