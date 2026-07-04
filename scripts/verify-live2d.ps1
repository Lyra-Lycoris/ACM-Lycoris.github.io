$ErrorActionPreference = 'Stop'

hugo --quiet

$indexPath = Join-Path $PSScriptRoot '..\public\index.html'
$cssPath = Join-Path $PSScriptRoot '..\public\css\main.css'
$tipsPath = Join-Path $PSScriptRoot '..\static\resources\D-Sketon\plugin-live2d\live2d-tips.json'

$html = Get-Content -Raw -Encoding UTF8 $indexPath
$css = Get-Content -Raw -Encoding UTF8 $cssPath

$missing = @()

if ($html -notmatch 'setupLive2d') {
  $missing += 'missing setupLive2d script on homepage'
}

if ($html -notmatch '/resources/D-Sketon/plugin-live2d/js/live2d-autoload\.js') {
  $missing += 'live2d autoload script is not using local plugin resource'
}

if ($html -notmatch 'resources\\?/D-Sketon\\?/plugin-live2d\\?/') {
  $missing += 'live2d base path is not local plugin resource'
}

if ($css -notmatch '#live2d-plugin[^}]*right:\s*0\s*!important') {
  $missing += 'live2d plugin is not compiled for right-side placement'
}

if ($css -notmatch '#live2d-tool[^}]*left:\s*-10px\s*!important') {
  $missing += 'live2d tool rail is not mirrored for right-side placement'
}

if ($html -notmatch '<link rel="preconnect" href="https://live2d\.fghrsh\.net"') {
  $missing += 'missing preconnect for live2d model API'
}

if ($html -notmatch '<link rel="preload" href="https://live2d\.fghrsh\.net/api/get/\?id=1-53" as="fetch"') {
  $missing += 'missing preload for default live2d model metadata'
}

if (-not (Test-Path -LiteralPath $tipsPath)) {
  $missing += 'missing local lightweight live2d tips override'
}
else {
  $tipsRaw = Get-Content -Raw -Encoding UTF8 $tipsPath
  if ($tipsRaw -match '大坏蛋') {
    $missing += 'lightweight live2d tips still contain the unwanted startup phrase'
  }
  $tips = $tipsRaw | ConvertFrom-Json
  if ($tips.message.default.Count -ne 0) {
    $missing += 'live2d default idle messages should be empty to avoid text before model load'
  }
}

if ($missing.Count -gt 0) {
  $missing | ForEach-Object { Write-Error $_ }
  exit 1
}

Write-Host 'Live2D verification passed.'
