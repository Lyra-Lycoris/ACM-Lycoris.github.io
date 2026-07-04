$ErrorActionPreference = 'Stop'

$expected = @{
  '算法' = 'algorithm'
  '题解' = 'solution'
  '图论' = 'graph-theory'
  '算法竞赛进阶指南' = 'advanced-cp'
  '建站' = 'site-building'
  'Hack' = 'hack'
  'GPLT天梯赛' = 'gplt'
}

hugo --quiet

$assetRoot = Join-Path $PSScriptRoot '..\assets\images\category-covers'
$indexPath = Join-Path $PSScriptRoot '..\public\index.html'
$html = Get-Content -Raw -Encoding UTF8 $indexPath

$missing = @()
foreach ($entry in $expected.GetEnumerator()) {
  $category = $entry.Key
  $slug = $entry.Value
  $assetPath = Join-Path $assetRoot "$slug.png"
  if (-not (Test-Path -LiteralPath $assetPath)) {
    $missing += "missing source cover for ${category}: $assetPath"
    continue
  }
  Add-Type -AssemblyName System.Drawing
  $image = [System.Drawing.Image]::FromFile((Resolve-Path -LiteralPath $assetPath))
  try {
    if ($image.Width -lt 1920 -or $image.Height -lt 1320) {
      $missing += "source cover is too small for ${category}: $($image.Width)x$($image.Height)"
    }
  }
  finally {
    $image.Dispose()
  }

  $categoryMarker = "<span class=`"cat-card-name`">$category</span>"
  $categoryIndex = $html.IndexOf($categoryMarker)
  if ($categoryIndex -lt 0) {
    $missing += "missing category label: $category"
    continue
  }
  $windowStart = [Math]::Max(0, $categoryIndex - 1400)
  $windowLength = [Math]::Min($html.Length - $windowStart, 2200)
  $nearCategory = $html.Substring($windowStart, $windowLength)
  $expectedCover = "category-covers/$slug"
  if ($nearCategory -notmatch [regex]::Escape($expectedCover)) {
    $missing += "missing cover slug for ${category}: $slug"
  }
  if ($nearCategory -notmatch "1440w") {
    $missing += "missing high-density 1440w srcset for ${category}"
  }
}

if ($missing.Count -gt 0) {
  $missing | ForEach-Object { Write-Error $_ }
  exit 1
}

Write-Host 'Category cover verification passed.'
