# Backup (Windows PowerShell)
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (Test-Path ".env") {
  Get-Content ".env" | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') {
      Set-Variable -Name $matches[1].Trim() -Value $matches[2].Trim() -Scope Script
    }
  }
}

$BackupRoot = if ($env:BACKUP_DIR) { $env:BACKUP_DIR } else { Join-Path $Root "backups" }
$Stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$Dest = Join-Path $BackupRoot "backup_$Stamp"

New-Item -ItemType Directory -Force -Path $Dest, "data\uploads" | Out-Null

if (-not (Test-Path "data\favorites.json")) {
  "[]" | Set-Content "data\favorites.json" -Encoding utf8
}

Copy-Item "data\favorites.json" (Join-Path $Dest "favorites.json")
Compress-Archive -Path "data\uploads\*" -DestinationPath (Join-Path $Dest "media.zip") -Force

@{
  app     = "weather-informer"
  created = $Stamp
  files   = @("favorites.json", "media.zip")
} | ConvertTo-Json | Set-Content (Join-Path $Dest "manifest.json") -Encoding utf8

Write-Host "[backup] Created: $Dest"
