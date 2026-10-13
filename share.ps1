$Host.UI.RawUI.WindowTitle = "J.A.R.V.I.S. Remote Share Gateway"
Clear-Host

Write-Host "==============================================================" -ForegroundColor Green
Write-Host "  PROJECT J.A.R.V.I.S. // Global Remote Sharing Gateway" -ForegroundColor Green
Write-Host "  Powered by Cloudflare Tunnels (100% Free, Encrypted HTTPS)" -ForegroundColor Green
Write-Host "==============================================================" -ForegroundColor Green
Write-Host ""

$JarvisDir = $PSScriptRoot
Set-Location $JarvisDir

$CloudflaredExe = Join-Path $JarvisDir "cloudflared.exe"

# 1. Download verification
if (-not (Test-Path $CloudflaredExe)) {
    Write-Host "[*] Downloading Cloudflare Tunnel engine (~30MB)..." -ForegroundColor Yellow
    curl.exe -L "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -o "$CloudflaredExe" --progress-bar
}

# 2. Check if local Jarvis is running on port 5001
Write-Host "[*] Checking local J.A.R.V.I.S. core on port 5001..." -ForegroundColor Yellow
try {
    $null = Invoke-RestMethod -Uri "http://127.0.0.1:5001/api/status" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "    [OK] Local core detected on port 5001!" -ForegroundColor Green
} catch {
    Write-Host "    [!] Note: Ensure start.bat is running in another window." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[*] Requesting secure public tunnel from Cloudflare..." -ForegroundColor Cyan
Write-Host "    (Generating temporary public HTTPS URL... Please wait 5-10 seconds)" -ForegroundColor DarkGray
Write-Host ""

# 3. Launch cloudflared process and capture output
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = $CloudflaredExe
$psi.Arguments = "tunnel --url http://127.0.0.1:5001"
$psi.RedirectStandardError = $true
$psi.RedirectStandardOutput = $true
$psi.UseShellExecute = $false
$psi.CreateNoWindow = $true

$process = [System.Diagnostics.Process]::Start($psi)

$urlFound = $false

while (-not $process.HasExited -and -not $urlFound) {
    $line = $process.StandardError.ReadLine()
    if ($line) {
        if ($line -match "https://[a-zA-Z0-9-]+\.trycloudflare\.com") {
            $tunnelUrl = $matches[0]
            $urlFound = $true
            
            # Copy URL to clipboard automatically
            try {
                Set-Clipboard -Value $tunnelUrl
            } catch {}

            Write-Host "==============================================================" -ForegroundColor Green
            Write-Host "  *** YOUR PUBLIC J.A.R.V.I.S. LINK IS READY! ***" -ForegroundColor Green
            Write-Host "==============================================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "  $tunnelUrl" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "  [OK] Copied to your clipboard automatically! Just press Ctrl+V." -ForegroundColor Yellow
            Write-Host "  [OK] Send this link to your friends anywhere in the world." -ForegroundColor Green
            Write-Host "  [OK] Works on mobile Safari and Chrome with full microphone access." -ForegroundColor Green
            Write-Host "==============================================================" -ForegroundColor Green
            Write-Host "`nKeep this window open while your friends are using it.`n" -ForegroundColor DarkGray
        }
    }
}

# Keep reading output so the process stays alive
while (-not $process.HasExited) {
    $null = $process.StandardError.ReadLine()
}

Write-Host "`nTunnel stopped. This window will stay open." -ForegroundColor Yellow
