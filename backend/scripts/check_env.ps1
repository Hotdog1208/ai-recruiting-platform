# Check backend/.env exists and required vars are set and not placeholders.
# Run from repo root or backend. Exit 0 = PASS, non-zero = FAIL.
# Usage: .\scripts\check_env.ps1   (from backend) or  backend\scripts\check_env.ps1 (from repo root)
$ErrorActionPreference = "Stop"
$backendRoot = if (Test-Path "app") { Get-Location } else { Join-Path $PSScriptRoot ".." }
$envPath = Join-Path $backendRoot ".env"
$failed = $false

function Fail($msg) {
    Write-Host "FAIL: $msg" -ForegroundColor Red
    $script:failed = $true
}

function Pass($msg) {
    Write-Host "PASS: $msg" -ForegroundColor Green
}

if (-not (Test-Path $envPath)) {
    Fail "backend/.env not found. Copy backend/.env.example to backend/.env and edit it."
    exit 1
}
Pass "backend/.env exists"

$content = Get-Content $envPath -Raw
$lines = $content -split "`n"

$databaseUrl = $null
$jwtSecret = $null
foreach ($line in $lines) {
    if ($line -match '^\s*#') { continue }
    if ($line -match '^\s*DATABASE_URL\s*=\s*(.*)$') {
        $databaseUrl = $matches[1].Trim().Trim('"').Trim("'")
    }
    if ($line -match '^\s*SUPABASE_JWT_SECRET\s*=\s*(.*)$') {
        $jwtSecret = $matches[1].Trim().Trim('"').Trim("'")
    }
}

if (-not $databaseUrl) {
    Fail "DATABASE_URL is missing or empty in backend/.env. Set it to your Postgres connection URI (see .env.example)."
} elseif ($databaseUrl -match "host:port|user:password@host|:port/|/database\s*$") {
    Fail "DATABASE_URL looks like the template placeholder. Replace it with your real Postgres URI (port as number, e.g. 5432)."
} else {
    Pass "DATABASE_URL is set and not placeholder"
}

if (-not $jwtSecret) {
    Fail "SUPABASE_JWT_SECRET is missing or empty in backend/.env. Get it from Supabase: Project Settings -> API -> JWT Secret."
} elseif ($jwtSecret -match "your.supabase|your-jwt|replace.me|example" -and $jwtSecret.Length -lt 40) {
    Fail "SUPABASE_JWT_SECRET looks like a placeholder. Replace with your real JWT Secret from Supabase."
} else {
    Pass "SUPABASE_JWT_SECRET is set and not placeholder"
}

if ($failed) {
    Write-Host ""
    Write-Host "DB URL valid: no" -ForegroundColor Red
    exit 1
}
Write-Host ""
Write-Host "DB URL valid: yes" -ForegroundColor Green
Write-Host "Next: alembic upgrade head  then  uvicorn app.main:app --reload" -ForegroundColor Cyan
exit 0
