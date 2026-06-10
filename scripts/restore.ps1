# Restore from backup (Windows PowerShell)
param(
  [Parameter(Mandatory = $true)]
  [string]$BackupPath
)

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$FullBackup = Resolve-Path $BackupPath
$FavoritesSrc = Join-Path $FullBackup "favorites.json"

if (-not (Test-Path $FavoritesSrc)) {
  Write-Error "favorites.json not found in $FullBackup"
  exit 1
}

New-Item -ItemType Directory -Force -Path "data\uploads" | Out-Null
Copy-Item $FavoritesSrc "data\favorites.json" -Force
Write-Host "[restore] Restored favorites.json"

$MediaZip = Join-Path $FullBackup "media.zip"
$MediaTar = Join-Path $FullBackup "media.tar.gz"

if (Test-Path $MediaZip) {
  Remove-Item "data\uploads\*" -Recurse -Force -ErrorAction SilentlyContinue
  Expand-Archive -Path $MediaZip -DestinationPath "data\uploads" -Force
  Write-Host "[restore] Extracted media.zip"
} elseif (Test-Path $MediaTar) {
  Write-Host "[restore] For media.tar.gz use Git Bash: bash scripts/restore.sh $FullBackup"
}

Write-Host "[restore] Done. Restart server: npm.cmd start"
