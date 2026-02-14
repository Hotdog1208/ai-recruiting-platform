#!/bin/bash
# One-command dev: backend + frontend
# Run from repo root: ./scripts/dev.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

if [ ! -f "$BACKEND/.venv/bin/activate" ]; then
  echo "Create backend venv first: cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"
  exit 1
fi

cd "$BACKEND" && source .venv/bin/activate && uvicorn app.main:app --reload &
BACKEND_PID=$!
cd "$FRONTEND" && npm run dev &
FRONTEND_PID=$!
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
