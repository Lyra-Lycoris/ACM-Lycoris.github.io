# Comment System Suspension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a standalone comment-suspension notice with a visible homepage entry and remove Waline from the blog's runtime loading path.

**Architecture:** Hugo renders `content/notice.md` as a standalone page and a static notice card in the existing homepage intro section. The existing `waline.enable` feature flag controls all theme-provided Waline markup, CSS, and client initialization; disabling it and removing the Waline-only avatar helper prevents comment resources and backend requests without deleting configuration or data.

**Tech Stack:** Hugo 0.162.1, Go templates, Markdown, CSS, PowerShell verification

## Global Constraints

- The notice is a standalone `/notice/` page and must not enter posts, archives, categories, tags, or feeds.
- The homepage notice uses only local HTML and CSS; it adds no images, fonts, JavaScript, animation, or third-party resources.
- Keep the existing Waline `serverURL`, options, backend source, and historical comment data intact.
- Do not add a navigation item, modal, carousel, or replacement comment system.
- Existing article content remains unchanged.

---

### Task 1: Standalone Notice and Homepage Entry

**Files:**
- Create: `content/notice.md`
- Modify: `layouts/index.html`
- Modify: `static/css/custom.css`
- Create: `scripts/verify-comment-suspension.ps1`

**Interfaces:**
- Consumes: Hugo's existing default single-page template, homepage `main` block, and Cyber-Reimu CSS variables.
- Produces: `/notice/`, `.home-notice`, `.home-notice__content`, and `.home-notice__link`; the verification script used by Task 2.

- [ ] **Step 1: Write the failing verification script**

Create `scripts/verify-comment-suspension.ps1` with assertions that run the repository's bundled Hugo executable, confirm `public/notice/index.html`, check the homepage notice markup and link, ensure the announcement title is absent from `public/archives.html`, and inspect a normal article page for comment runtime markers.

```powershell
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
```

- [ ] **Step 2: Run the script to verify it fails**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify-comment-suspension.ps1
```

Expected: FAIL because `/notice/` and `.home-notice` do not exist and Waline remains enabled.

- [ ] **Step 3: Create the standalone notice**

Create `content/notice.md`:

```markdown
---
title: "评论系统暂停说明"
date: 2026-07-26T00:00:00-04:00
draft: false
url: "/notice/"
description: "因预算调整，本站评论系统暂时关闭；文章阅读与后续更新不受影响。"
comments: false
---

因评论系统持续占用较多云服务资金，而本站近期预算较为紧张，现暂时关闭评论功能。

这不会影响文章的正常发布与阅读。接下来本站将优先把有限的资源投入内容整理和文章更新，并计划在集中发布更多内容后，根据预算情况重新评估评论系统。

感谢理解，也感谢此前留下评论与建议的每一位读者。评论数据会妥善保留，评论功能恢复后将另行通知。
```

- [ ] **Step 4: Add the homepage notice markup**

Inside the existing `.home-intro` section in `layouts/index.html`, before `.home-intro-card`, add:

```html
<aside class="home-notice" aria-labelledby="home-notice-title">
  <div class="home-notice__content">
    <span class="home-notice__label">站点公告</span>
    <p id="home-notice-title">评论系统因预算调整暂时关闭，不影响文章阅读与更新。</p>
  </div>
  <a class="home-notice__link" href="{{ "notice/" | relURL }}">查看说明 <span aria-hidden="true">→</span></a>
</aside>
```

Change `.home-intro` to a column layout and add the local-only notice styles next to the existing homepage intro styles in `static/css/custom.css`. Reuse `--glass-*`, `--neon-red`, `--neon-cyan`, `--ink-deep`, and dark-mode selectors; add a visible keyboard focus state and a mobile stacked layout.

- [ ] **Step 5: Build and inspect the notice deliverable**

Run:

```powershell
E:\blog\Hugo\hugo.exe --quiet --source E:\blog\ACM-Lycoris.github.io
```

Expected: exit code 0; `public/notice/index.html` exists; homepage contains `.home-notice`; the notice title is absent from `public/archives/index.html`.

- [ ] **Step 6: Commit the notice deliverable**

```powershell
git add content/notice.md layouts/index.html static/css/custom.css scripts/verify-comment-suspension.ps1
git commit -m "feat: add comment suspension notice"
```

### Task 2: Remove Waline from the Runtime Loading Path

**Files:**
- Modify: `config/_default/params.yml`
- Test: `scripts/verify-comment-suspension.ps1`

**Interfaces:**
- Consumes: The existing `waline.enable` theme feature flag and Task 1 verification script.
- Produces: Generated pages with no comments container, Waline client module, Waline CSS, Waline avatar helper, or request-bearing backend URL on ordinary article pages.

- [ ] **Step 1: Confirm the runtime assertions still fail**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify-comment-suspension.ps1
```

Expected: FAIL with `Waline must be disabled in params.yml`, `Waline-only avatar helper is still injected`, and one or more runtime-marker errors.

- [ ] **Step 2: Disable Waline and remove its dedicated helper injection**

In `config/_default/params.yml`, change only:

```yaml
waline:
  enable: false
```

Remove only this line from `injector.body_end`:

```html
<script src="/js/waline-initial-avatar.js" defer></script>
```

Keep `serverURL`, locale, limits, login options, and every other Waline setting unchanged.

- [ ] **Step 3: Run the focused verification**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify-comment-suspension.ps1
```

Expected: `Comment suspension verification passed.`

- [ ] **Step 4: Run existing regressions and a production build**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify-live2d.ps1
powershell -ExecutionPolicy Bypass -File scripts/verify-category-covers.ps1
node --test static/js/graph-visualizer.test.mjs
E:\blog\Hugo\hugo.exe --minify=false --source E:\blog\ACM-Lycoris.github.io
git diff --check
```

Expected: every verification and test exits 0; Hugo reports a successful build; `git diff --check` reports no whitespace errors.

- [ ] **Step 5: Commit the comment shutdown**

```powershell
git add config/_default/params.yml
git commit -m "perf: suspend Waline comment loading"
```

### Task 3: Final Output Audit

**Files:**
- Verify only: generated `public/` files and Git history

**Interfaces:**
- Consumes: Completed Tasks 1 and 2.
- Produces: Evidence that the approved notice and runtime shutdown are complete without unrelated tracked changes.

- [ ] **Step 1: Inspect the final diff and repository state**

Run:

```powershell
git status --short
git log -3 --oneline
git show --stat --oneline HEAD~2..HEAD
```

Expected: no uncommitted tracked changes; the recent history contains the design, notice, and runtime-shutdown commits.

- [ ] **Step 2: Audit generated resources**

Run:

```powershell
Select-String -Path public\posts\字符串后缀数组\index.html -Pattern 'id="comments"|waline-comment|@waline/client|waline-initial-avatar|waline-blog-d6geofi0wca743759'
Select-String -Path public\index.html -Pattern 'home-notice|href="/notice/"'
```

Expected: the first search returns no matches; the second returns the notice markup and `/notice/` link.
