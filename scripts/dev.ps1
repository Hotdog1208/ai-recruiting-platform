# One-command dev: backend + frontend
# Run from repo root: .\scripts\dev.ps1

$backendDir = Join-Path $PSScriptRoot ".." "backend"
$frontendDir = Join-Path $PSScriptRoot ".." "frontend"
$venvPython = Join-Path $backendDir ".venv" "Scripts" "python.exe"

if (-not (Test-Path $venvPython)) {
    Write-Host "Create backend venv first: cd backend; python -m venv .venv; .venv\Scripts\Activate.ps1; pip install -r requirements.txt"
    exit 1
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; .\.venv\Scripts\Activate.ps1; uvicorn app.main:app --reload"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev"
Write-Host "Backend and frontend started in separate windows."
