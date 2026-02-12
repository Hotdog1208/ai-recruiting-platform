# Boot sanity check: compile app and import main. Run from repo root or backend.
# Usage (activate venv first): .\.venv\Scripts\Activate.ps1; .\scripts\check_boot.ps1
# From backend dir: .\scripts\check_boot.ps1   |  From repo root: backend\scripts\check_boot.ps1
$ErrorActionPreference = "Stop"
$backendRoot = if (Test-Path "app") { Get-Location } else { Join-Path $PSScriptRoot ".." }
Set-Location $backendRoot

Write-Host "Running: python -m compileall app"
python -m compileall app -q
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Running: python -c \"import app.main\""
python -c "import app.main"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Boot check OK."
