param(
  [switch]$SkipHugo
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path $PSScriptRoot -Parent
$postPath = Join-Path $repoRoot 'content\posts\字符串后缀数组.md'

if (-not (Test-Path -LiteralPath $postPath)) {
  throw "Missing suffix array article: $postPath"
}

$article = Get-Content -Raw -Encoding UTF8 -LiteralPath $postPath
$required = @(
  'title: "字符串后缀数组',
  'math: true',
  '## 一、后缀数组到底是什么',
  '## 三、倍增算法',
  'suffix-array-doubling-animation',
  '## 五、LCP 与 height 数组',
  '## 六、Kasai 算法',
  '## 七、RMQ',
  '## 八、典型应用',
  'suffix-array-full-template-begin',
  'suffix-array-full-template-end'
)

foreach ($marker in $required) {
  if (-not $article.Contains($marker)) {
    throw "Missing article marker: $marker"
  }
}

$svgOpenCount = ([regex]::Matches($article, '<svg\b')).Count
$svgCloseCount = ([regex]::Matches($article, '</svg>')).Count
if ($svgOpenCount -lt 4) {
  throw "Expected at least 4 inline SVG diagrams, found $svgOpenCount"
}
if ($svgOpenCount -ne $svgCloseCount) {
  throw "Unbalanced SVG tags: $svgOpenCount opening and $svgCloseCount closing"
}
if ($article -notmatch '<animate\b') {
  throw 'The doubling diagram has no animation tags'
}
if ($article -notmatch 'animationsPaused\(\)' -or $article -notmatch 'pauseAnimations\(\)' -or $article -notmatch 'unpauseAnimations\(\)') {
  throw 'The doubling animation is missing its play/pause handler'
}
if ($article -match '!\[[^\]]*\]\(https?://' -or $article -match '<img[^>]+src=["'']https?://') {
  throw 'The article must not depend on externally hosted images'
}

$beginMarker = '// suffix-array-full-template-begin'
$endMarker = '// suffix-array-full-template-end'
$begin = $article.IndexOf($beginMarker)
$end = $article.IndexOf($endMarker, $begin + $beginMarker.Length)
if ($begin -lt 0 -or $end -lt 0) {
  throw 'Unable to locate the complete C++ template markers'
}
$template = $article.Substring($begin, $end + $endMarker.Length - $begin)

$harness = @'

int brute_lcp(const string &s, int i, int j) {
    int answer = 0;
    while (i + answer < (int)s.size() &&
           j + answer < (int)s.size() &&
           s[i + answer] == s[j + answer]) {
        ++answer;
    }
    return answer;
}

vector<int> brute_sa(const string &s) {
    vector<int> order(s.size());
    iota(order.begin(), order.end(), 0);
    sort(order.begin(), order.end(), [&](int i, int j) {
        return s.substr(i) < s.substr(j);
    });
    return order;
}

int main() {
    {
        SuffixArray index("banana");
        const vector<int> expected_sa{5, 3, 1, 0, 4, 2};
        const vector<int> expected_rk{3, 2, 5, 1, 4, 0};
        const vector<int> expected_height{0, 1, 3, 0, 0, 2};
        if (index.sa != expected_sa || index.rk != expected_rk ||
            index.height != expected_height) {
            cerr << "banana arrays do not match the article\n";
            return 1;
        }
    }

    mt19937 rng(20260715);
    for (int n = 0; n <= 40; ++n) {
        for (int trial = 0; trial < 80; ++trial) {
            string s(n, 'a');
            for (char &ch : s) ch = char('a' + rng() % 3);

            SuffixArray index(s);
            vector<int> expected = brute_sa(s);
            if (index.sa != expected) {
                cerr << "suffix order mismatch for: " << s << '\n';
                return 2;
            }
            for (int i = 0; i < n; ++i) {
                for (int j = 0; j < n; ++j) {
                    int expected_lcp = brute_lcp(s, i, j);
                    int actual_lcp = index.lcp_suffix(i, j);
                    if (actual_lcp != expected_lcp) {
                        cerr << "LCP mismatch for: " << s << " at "
                             << i << ',' << j << " expected " << expected_lcp
                             << " got " << actual_lcp << '\n';
                        return 3;
                    }
                }
            }
        }
    }

    cout << "Suffix array C++ property tests passed.\n";
    return 0;
}
'@

$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("suffix-array-article-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tempRoot | Out-Null
try {
  $cppPath = Join-Path $tempRoot 'suffix_array_test.cpp'
  $exePath = Join-Path $tempRoot 'suffix_array_test.exe'
  [System.IO.File]::WriteAllText($cppPath, $template + $harness, [System.Text.UTF8Encoding]::new($false))

  $compiler = (Get-Command g++ -ErrorAction Stop).Source
  & $compiler -std=c++17 -O2 -Wall -Wextra -pedantic $cppPath -o $exePath
  if ($LASTEXITCODE -ne 0) {
    throw "C++ template compilation failed with exit code $LASTEXITCODE"
  }
  & $exePath
  if ($LASTEXITCODE -ne 0) {
    throw "C++ property tests failed with exit code $LASTEXITCODE"
  }
}
finally {
  Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
}

if (-not $SkipHugo) {
  $hugo = (Get-Command hugo -ErrorAction Stop).Source
  & $hugo --quiet --source $repoRoot
  if ($LASTEXITCODE -ne 0) {
    throw "Hugo build failed with exit code $LASTEXITCODE"
  }

  $generatedPage = Get-ChildItem (Join-Path $repoRoot 'public\posts') -Recurse -Filter 'index.html' |
    Where-Object { (Get-Content -Raw -Encoding UTF8 -LiteralPath $_.FullName).Contains('suffix-array-doubling-animation') } |
    Select-Object -First 1
  if (-not $generatedPage) {
    throw 'Unable to find the generated suffix array article'
  }

  $html = Get-Content -Raw -Encoding UTF8 -LiteralPath $generatedPage.FullName
  foreach ($marker in @('suffix-array-doubling-animation', 'suffix-array-full-template-begin', '最长重复子串', 'Kasai')) {
    if (-not $html.Contains($marker)) {
      throw "Generated article is missing marker: $marker"
    }
  }
  if ($html.Contains('&lt;svg')) {
    throw 'Inline SVG was escaped in generated HTML'
  }
  $htmlSvgOpen = ([regex]::Matches($html, '<svg\b')).Count
  $htmlSvgClose = ([regex]::Matches($html, '</svg>')).Count
  if ($htmlSvgOpen -ne $htmlSvgClose) {
    throw "Generated HTML has unbalanced SVG tags: $htmlSvgOpen opening and $htmlSvgClose closing"
  }
}

Write-Host "Verified $svgOpenCount inline SVG diagrams."
Write-Host 'Suffix array article verification passed.'
