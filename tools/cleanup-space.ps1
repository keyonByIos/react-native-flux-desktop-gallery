# Space cleanup helper. DRY-RUN by default (reports reclaimable size, deletes nothing).
# Usage:
#   powershell -ExecutionPolicy Bypass -File tools/cleanup-space.ps1                  # preview
#   powershell -ExecutionPolicy Bypass -File tools/cleanup-space.ps1 -Apply           # delete (excludes cargo target)
#   powershell -ExecutionPolicy Bypass -File tools/cleanup-space.ps1 -Apply -CargoClean  # also cargo clean target/ (next native build recompiles skia, slow)
#
# All targets are gitignored / git-untracked / regenerable / zero-reference dead weight. No source code is touched.
param(
  [switch]$Apply,
  [switch]$CargoClean
)
$ErrorActionPreference = 'SilentlyContinue'
$gallery = Split-Path $PSScriptRoot -Parent          # gallery/tools -> gallery
$root = Split-Path $gallery -Parent                   # gallery -> repo root
function DirSize($p) { if (Test-Path $p) { (Get-ChildItem $p -Recurse -File -Force -EA SilentlyContinue | Measure-Object Length -Sum).Sum } else { 0 } }
function MB($b) { '{0,9:N1} MB' -f ($b / 1MB) }

$desktop = Join-Path $root 'react-native-flux-desktop'
$cands = @()
# 1) dead GPU spike dir: main Cargo is single-package (not workspace), zero refs repo-wide, git-untracked, merged into main deps
$cands += [pscustomobject]@{ Path = (Join-Path $desktop 'spike-skia-gpu'); Why = 'dead GPU spike (zero-ref / untracked / merged into main)'; Group = 'dead' }
# 2) old standalone packaging output: .gitignore marks it regenerable via launcher/build.ps1
$cands += [pscustomobject]@{ Path = (Join-Path $desktop 'release'); Why = 'old standalone build output (gitignored, regenerable via launcher/build.ps1)'; Group = 'regen' }
# 3) .bak extracted dir (its .zip is kept; deleting the extracted copy = dedup)
$cands += [pscustomobject]@{ Path = (Join-Path $desktop '.bak\gpu-pre-20260929-145028'); Why = '.bak extracted dir (same-name .zip kept; this is the dedup copy)'; Group = 'dedup' }
# 4) duplicate numbered dist zips in gallery/output
$outDir = Join-Path $gallery 'output'
if (Test-Path $outDir) {
  Get-ChildItem $outDir -Filter '*.zip' -File | Where-Object { $_.Name -match '\(\d+\)' } | ForEach-Object {
    $cands += [pscustomobject]@{ Path = $_.FullName; Why = 'duplicate numbered dist zip'; Group = 'dedup' }
  }
}
$target = Join-Path $desktop 'target'

Write-Host '===== Space cleanup preview (dry-run; add -Apply to delete) =====' -ForegroundColor Cyan
$total = 0
foreach ($c in $cands) {
  $sz = DirSize $c.Path
  if ($sz -gt 0) {
    $total += $sz
    Write-Host ((MB $sz) + '  [' + $c.Group + ']  ' + $c.Path + '   <- ' + $c.Why)
  }
}
$tSz = DirSize $target
Write-Host ''
Write-Host ((MB $total) + '  = regular reclaimable (dead/regen/dedup)')
Write-Host ((MB $tSz) + '  = target/ Rust build cache (needs -Apply -CargoClean; next native build recompiles skia, slow)') -ForegroundColor Yellow

if (-not $Apply) {
  Write-Host ''
  Write-Host 'DRY-RUN: nothing deleted. Re-run with -Apply to execute.' -ForegroundColor Green
  return
}

Write-Host ''
Write-Host 'Deleting...' -ForegroundColor Magenta
foreach ($c in $cands) {
  if ((Test-Path $c.Path) -and ((DirSize $c.Path) -gt 0)) {
    Remove-Item $c.Path -Recurse -Force -EA SilentlyContinue
    if (Test-Path $c.Path) { Write-Host ('  FAILED (locked?): ' + $c.Path) -ForegroundColor Red }
    else { Write-Host ('  deleted: ' + $c.Path) }
  }
}
if ($CargoClean -and (Test-Path $target)) {
  Write-Host '  cargo clean ...' -ForegroundColor Yellow
  Push-Location $desktop; cargo clean 2>&1 | Out-Host; Pop-Location
}
Write-Host 'Done.' -ForegroundColor Green
