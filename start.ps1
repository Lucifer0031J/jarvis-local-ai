$Host.UI.RawUI.WindowTitle = "J.A.R.V.I.S. Core Terminal"
Clear-Host

Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "  PROJECT J.A.R.V.I.S. // Local Neural Assistant" -ForegroundColor Cyan
Write-Host "  Architect : Gangadhar Poosarla" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""

$JarvisDir = $PSScriptRoot
Set-Location $JarvisDir

# Step 1: Check Ollama Service
Write-Host "[1/3] Verifying Ollama neural service..." -ForegroundColor Yellow
try {
    $res = Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "      [OK] Ollama is active on port 11434!" -ForegroundColor Green
} catch {
    Write-Host "      [!] Ollama is not responding. Attempting to start Ollama..." -ForegroundColor DarkYellow
    $ollamaExe = "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe"
    if (Test-Path $ollamaExe) {
        Start-Process $ollamaExe
        Start-Sleep -Seconds 4
        Write-Host "      [OK] Ollama background service launched!" -ForegroundColor Green
    } else {
        Write-Host "      [WARN] Could not find ollama.exe at default location. Please ensure Ollama is open." -ForegroundColor Red
    }
}

# Step 2: Activate Virtual Environment
Write-Host "[2/3] Loading Python virtual environment..." -ForegroundColor Yellow
$VenvScript = Join-Path $JarvisDir "..\llm-vapt-lab\venv\Scripts\Activate.ps1"
if (Test-Path $VenvScript) {
    & $VenvScript
    Write-Host "      [OK] Environment loaded with all dependencies!" -ForegroundColor Green
} else {
    Write-Host "      [WARN] Venv not found at $VenvScript. Falling back to system Python." -ForegroundColor DarkYellow
}

# Step 3: Run J.A.R.V.I.S.
Write-Host "[3/3] Booting J.A.R.V.I.S. Core..." -ForegroundColor Yellow
Write-Host ""
Write-Host "--------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  Desktop Access : http://localhost:5001" -ForegroundColor Cyan
Write-Host "  Press CTRL+C to stop the assistant at any time." -ForegroundColor DarkGray
Write-Host "--------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host ""

# Run app.py directly in the visible foreground terminal
try {
    py app.py
} catch {
    Write-Host "`n[ERROR] Failed to execute app.py: $_" -ForegroundColor Red
}

Write-Host "`nProcess finished. This terminal will stay open for review." -ForegroundColor Yellow
