$ErrorActionPreference = 'Stop'

hugo --quiet

$indexPath = Join-Path $PSScriptRoot '..\public\index.html'
$paramsPath = Join-Path $PSScriptRoot '..\config\_default\params.yml'

$html = Get-Content -Raw -Encoding UTF8 $indexPath
$params = Get-Content -Raw -Encoding UTF8 $paramsPath

$problems = @()

if ($params -notmatch '(?ms)^live2d:\s*\r?\n\s+enable:\s*false\s*$') {
  $problems += 'live2d must remain disabled in params.yml'
}

if ($params -notmatch '(?ms)^live2d_widgets:\s*\r?\n\s+enable:\s*false\s*$') {
  $problems += 'live2d_widgets must remain disabled in params.yml'
}

if ($html -match 'setupLive2d') {
  $problems += 'homepage still injects setupLive2d while the feature is disabled'
}

if ($html -match '/resources/D-Sketon/plugin-live2d/js/live2d-autoload\.js') {
  $problems += 'homepage still loads the Live2D autoload script while the feature is disabled'
}

if ($html -match 'live2d\.fghrsh\.net') {
  $problems += 'homepage still connects to the Live2D model API while the feature is disabled'
}

if ($problems.Count -gt 0) {
  $problems | ForEach-Object { Write-Error $_ }
  exit 1
}

Write-Host 'Live2D disabled-state verification passed.'
