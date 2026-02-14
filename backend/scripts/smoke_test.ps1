# Backend smoke test: check env, hit health + debug/config, test browse endpoint
# Run from backend dir with venv activated. Exit 0 = all PASS, non-zero = FAIL.
$ErrorActionPreference = "Stop"
$backendRoot = if (Test-Path "app") { Get-Location } else { Join-Path $PSScriptRoot ".." }
$failed = $false

function Fail($msg) {
    Write-Host "FAIL: $msg" -ForegroundColor Red
    $script:failed = $true
}

function Pass($msg) {
    Write-Host "PASS: $msg" -ForegroundColor Green
}

Write-Host "=== Backend Smoke Test ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check env
Write-Host "1. Checking environment variables..." -ForegroundColor Yellow
$envScript = Join-Path $backendRoot "scripts\check_env.ps1"
$envResult = & $envScript
if ($LASTEXITCODE -ne 0) {
    Fail "Environment check failed. Run .\scripts\check_env.ps1 for details."
} else {
    Pass "Environment variables OK"
}

# Step 2: Check if server is running by hitting /health
Write-Host ""
Write-Host "2. Testing /health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -TimeoutSec 5
    if ($health.status -eq "ok") {
        Pass "/health returned ok"
    } else {
        Fail "/health returned unexpected status: $($health.status)"
    }
} catch {
    Fail "Cannot reach backend at http://127.0.0.1:8000/health - is uvicorn running?"
}

# Step 3: Check /debug/config
Write-Host ""
Write-Host "3. Testing /debug/config endpoint..." -ForegroundColor Yellow
try {
    $config = Invoke-RestMethod -Uri "http://127.0.0.1:8000/debug/config" -TimeoutSec 5
    if ($config.has_database_url -and $config.has_supabase_secret) {
        Pass "/debug/config shows required config present"
    } else {
        Fail "/debug/config missing required config"
    }
} catch {
    Fail "Cannot reach /debug/config"
}

# Step 4: Check /matching/browse returns array
Write-Host ""
Write-Host "4. Testing /matching/browse endpoint..." -ForegroundColor Yellow
try {
    $browse = Invoke-RestMethod -Uri "http://127.0.0.1:8000/matching/browse" -TimeoutSec 10
    if ($browse -is [Array]) {
        Pass "/matching/browse returned array ($($browse.Count) jobs)"
    } else {
        Fail "/matching/browse did not return an array"
    }
} catch {
    Fail "Cannot reach /matching/browse or it failed: $_"
}

Write-Host ""
if ($failed) {
    Write-Host "=== SMOKE TEST FAILED ===" -ForegroundColor Red
    exit 1
}
Write-Host "=== SMOKE TEST PASSED ===" -ForegroundColor Green
exit 0
