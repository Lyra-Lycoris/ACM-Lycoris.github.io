$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$hugoPath = (Resolve-Path (Join-Path $repoRoot '..\Hugo\hugo.exe')).Path

& $hugoPath --quiet --source $repoRoot

$homePath = Join-Path $repoRoot 'public\index.html'
$feedPath = Join-Path $repoRoot 'public\index.xml'
$noticePath = Join-Path $repoRoot 'public\notice\index.html'
$archivePath = Join-Path $repoRoot 'public\archives\index.html'
$articlePath = Join-Path $repoRoot 'public\posts\字符串后缀数组\index.html'
$paramsPath = Join-Path $repoRoot 'config\_default\params.yml'

$problems = @()

if (-not (Test-Path -LiteralPath $noticePath)) {
  $problems += 'standalone notice page was not generated at /notice/'
}

$homeHtml = Get-Content -Raw -Encoding UTF8 $homePath
if ($homeHtml -notmatch 'class="home-notice"') {
  $problems += 'homepage notice card is missing'
}
if ($homeHtml -notmatch 'href="/notice/"') {
  $problems += 'homepage notice does not link to /notice/'
}

if (Test-Path -LiteralPath $noticePath) {
  $notice = Get-Content -Raw -Encoding UTF8 $noticePath
  if ($notice -notmatch '评论系统暂停说明') {
    $problems += 'notice page title is missing'
  }
}

$archive = Get-Content -Raw -Encoding UTF8 $archivePath
if ($archive -match '评论系统暂停说明') {
  $problems += 'notice page leaked into the post archive'
}

$feed = Get-Content -Raw -Encoding UTF8 $feedPath
if ($feed -match '评论系统暂停说明') {
  $problems += 'notice page leaked into the site feed'
}

$params = Get-Content -Raw -Encoding UTF8 $paramsPath
if ($params -notmatch '(?ms)^waline:\s*\r?\n\s+enable:\s*false\s*$') {
  $problems += 'Waline must be disabled in params.yml'
}
if ($params -match 'waline-initial-avatar\.js') {
  $problems += 'Waline-only avatar helper is still injected'
}

$article = Get-Content -Raw -Encoding UTF8 $articlePath
foreach ($marker in @(
  'id="comments"',
  'waline-comment',
  '@waline/client',
  'waline-initial-avatar.js',
  'waline-blog-d6geofi0wca743759-1424401485.ap-shanghai.app.tcloudbase.com'
)) {
  if ($article -match [regex]::Escape($marker)) {
    $problems += "article output still contains comment runtime marker: $marker"
  }
}

if ($problems.Count -gt 0) {
  $problems | ForEach-Object { Write-Error $_ }
  exit 1
}

Write-Host 'Comment suspension verification passed.'
