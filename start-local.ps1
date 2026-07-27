param(
  [switch]$bot,
  [switch]$stop
)

$pgBin = "$env:USERPROFILE\.local\pgsql\pgsql\bin"
$pgData = "$env:USERPROFILE\.local\pgsql\data"
$node22 = "$env:USERPROFILE\.local\node22\node-v22.14.0-win-x64"
$bunDir = "$env:USERPROFILE\.bun\bin"
$wrangler = "C:\yourrank\node_modules\.bin\wrangler.exe"
$root = "C:\yourrank"

$env:Path = "$node22;$bunDir;$root\node_modules\.bin;$env:Path"
$env:CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE = "postgresql://postgres:postgres@localhost:5432/yourrank"
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/yourrank"

if ($stop) {
  Write-Host "[stop] Stopping Workers..."
  Get-Process wrangler, workerd -ErrorAction SilentlyContinue | Stop-Process -Force
  Write-Host "[stop] Stopping Postgres..."
  & "$pgBin\pg_ctl.exe" -D "$pgData" stop 2>&1 | Out-Null
  Write-Host "[stop] Done."
  return
}

# 1. Start Postgres if not running
$pgRunning = & "$pgBin\pg_isready.exe" -h localhost 2>&1 | Select-String "accepting"
if (-not $pgRunning) {
  Write-Host "[db] Starting Postgres..."
  & "$pgBin\pg_ctl.exe" -D "$pgData" -l "$pgData\logfile.log" start 2>&1 | Out-Null
  Start-Sleep -Seconds 3
}

# 2. Ensure .dev.vars exist
if (-not (Test-Path "$root\apps\leaderboard\.dev.vars")) {
  Copy-Item "$root\apps\leaderboard\.dev.vars.example" "$root\apps\leaderboard\.dev.vars"
}
if ($bot -and -not (Test-Path "$root\apps\bot\.dev.vars")) {
  Copy-Item "$root\apps\bot\.dev.vars.example" "$root\apps\bot\.dev.vars"
}

# 3. Build shared modules
Write-Host "[build] Compiling shared TypeScript..."
$nodeExe = "$node22\node.exe"
& $nodeExe "$root\build-shared.mjs" 2>&1 | Out-Null

# 4. Build leaderboard assets
Write-Host "[build] Bundling leaderboard assets..."
Set-Location "$root\apps\leaderboard"
& $nodeExe "$root\apps\leaderboard\build.js" 2>&1 | Out-Null

# 5. Start Workers
Write-Host "[dev] Starting leaderboard Worker on http://localhost:8787"
$lbJob = Start-Process -WindowStyle Hidden -FilePath $wrangler -ArgumentList @("dev", "--port", "8787", "--ip", "127.0.0.1") -WorkingDirectory "$root\apps\leaderboard" -PassThru

if ($bot) {
  Write-Host "[dev] Starting bot Worker on http://localhost:8788"
  $botJob = Start-Process -WindowStyle Hidden -FilePath $wrangler -ArgumentList @("dev", "--port", "8788", "--ip", "127.0.0.1") -WorkingDirectory "$root\apps\bot" -PassThru
}

Write-Host ""
Write-Host "[dev] Both Workers running:"
Write-Host "      Leaderboard → http://localhost:8787"
if ($bot) { Write-Host "      Bot         → http://localhost:8788" }
Write-Host "[dev] Press Ctrl+C to stop (or run: start-local.ps1 -stop)"
Write-Host ""

# Wait for Ctrl+C
try {
  while ($true) { Start-Sleep -Seconds 1 }
} finally {
  Write-Host "[stop] Shutting down..."
  if ($lbJob -and -not $lbJob.HasExited) { $lbJob.Kill() }
  if ($botJob -and -not $botJob.HasExited) { $botJob.Kill() }
  Write-Host "[stop] Workers stopped. Postgres is still running."
}
