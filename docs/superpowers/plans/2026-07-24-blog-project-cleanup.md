# Blog Project Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove obsolete CSDN and generated clutter, give the Waline backend and maintenance scripts clear homes, and leave the rendered Hugo site unchanged.

**Architecture:** Keep the Hugo rendering boundary (`content/`, `layouts/`, `assets/`, `static/`, `config/`, and theme submodules) intact. Remove non-site runtime state and diagnostics, relocate independent tooling without changing its outputs, and prove preservation by comparing complete Hugo output manifests before and after the cleanup.

**Tech Stack:** Hugo 0.162 extended, Git, PowerShell, Node.js built-in test runner, Python maintenance scripts, Waline Node.js backend source.

## Global Constraints

- Do not change site layout, colors, fonts, animation, content presentation, or retained static asset URLs.
- Do not edit `hugo.toml`, `config/_default/params.yml`, `layouts/`, `assets/`, `static/css/`, `static/js/`, site images, or theme submodules.
- Keep the configured Waline `serverURL` and the deployed comment service unchanged.
- Preserve the earlier requested deletion of `content/posts/网络环境配置.md` and `static/downloads/Clash.Verge_2.5.1_x64-setup.exe`.
- Do not rewrite Git history, upgrade dependencies, or push to a remote.
- The post-cleanup Hugo output must match the baseline byte-for-byte.

---

### Task 1: Record the Clean Baseline and Finish the Earlier Deletion

**Files:**
- Delete already present in working tree: `content/posts/网络环境配置.md`
- Delete already present in working tree: `static/downloads/Clash.Verge_2.5.1_x64-setup.exe`
- Generate outside repository: `E:/blog/blog-cleanup-before.sha256`

**Interfaces:**
- Consumes: Current Hugo source tree after the user-requested network tutorial deletion.
- Produces: A committed deletion and a SHA-256 manifest used by Task 5.

- [ ] **Step 1: Verify only the expected earlier changes are pending**

Run:

```powershell
git status --short
```

Expected: exactly the two deleted paths above plus this plan document before it is committed.

- [ ] **Step 2: Build the baseline site**

Run:

```powershell
hugo --cleanDestinationDir
```

Expected: exit code `0`; warnings already emitted by the theme are allowed.

- [ ] **Step 3: Run the interactive visualizer tests**

Run:

```powershell
node --test static/js/graph-visualizer.test.mjs
```

Expected: all tests pass.

- [ ] **Step 4: Save a deterministic output manifest**

Run:

```powershell
$siteRoot = (Resolve-Path public).Path
Get-ChildItem public -Recurse -File |
  Sort-Object FullName |
  ForEach-Object {
    $relative = $_.FullName.Substring($siteRoot.Length + 1).Replace('\', '/')
    $hash = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash
    "$hash  $relative"
  } |
  Set-Content -Encoding utf8 E:\blog\blog-cleanup-before.sha256
```

Expected: `E:/blog/blog-cleanup-before.sha256` exists and contains one line per generated file.

- [ ] **Step 5: Commit the earlier deletion separately**

Run:

```powershell
git add -- "content/posts/网络环境配置.md" "static/downloads/Clash.Verge_2.5.1_x64-setup.exe"
git commit -m "content: remove network proxy tutorial"
```

Expected: one commit containing only the two deletions.

---

### Task 2: Remove CSDN, Backup, Log, and Generated Repository Clutter

**Files:**
- Delete: `.playwright-csdn-profile/`
- Delete: `.backup_20260520_135007/`
- Delete: `scripts/csdn-detect.js`
- Delete: `scripts/csdn-diag.js`
- Delete: `scripts/csdn-diag2.js`
- Delete: `scripts/csdn-diag3.js`
- Delete: `scripts/csdn-diag4.js`
- Delete: `scripts/csdn-diag5.js`
- Delete: `scripts/csdn-explore-richeditor.js`
- Delete: `scripts/csdn-full-scan.js`
- Delete: `scripts/csdn-test-fullflow.js`
- Delete: `scripts/csdn-test-hybrid.js`
- Delete: `scripts/csdn-test-moreactions.js`
- Delete: `scripts/csdn-test-title-meta.js`
- Delete: `scripts/publish-to-csdn.js`
- Delete: root `csdn-*.json`, `csdn-*.png`, and `diag3-*.png`
- Delete: `server.log`
- Stop tracking: `.hugo_build.lock`
- Stop tracking: `resources/_gen/`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: CSDN automation state and diagnostics that are not part of Hugo rendering.
- Produces: A repository without CSDN or local generated files, plus ignore rules preventing recurrence.

- [ ] **Step 1: Expand ignore rules**

Append these exact rules to `.gitignore`:

```gitignore

# Local browser automation and diagnostics
.playwright-*/
csdn-*.json
csdn-*.png
diag3-*.png

# Local logs and generated verification output
*.log

# Hugo-generated local state
.hugo_build.lock
resources/
!static/resources/
!static/resources/**
```

Keep the existing `public/`, `.worktrees/`, Vercel, Node, and Waline archive rules.

- [ ] **Step 2: Remove tracked CSDN and backup directories**

Run:

```powershell
git rm -r -- .playwright-csdn-profile .backup_20260520_135007
git rm -- scripts/csdn-detect.js scripts/csdn-diag.js scripts/csdn-diag2.js scripts/csdn-diag3.js scripts/csdn-diag4.js scripts/csdn-diag5.js scripts/csdn-explore-richeditor.js scripts/csdn-full-scan.js scripts/csdn-test-fullflow.js scripts/csdn-test-hybrid.js scripts/csdn-test-moreactions.js scripts/csdn-test-title-meta.js scripts/publish-to-csdn.js
```

Expected: every named file is staged as deleted.

- [ ] **Step 3: Remove root diagnostics and local build state**

Run `git rm` on the tracked root diagnostic files discovered by:

```powershell
git -c core.quotepath=false ls-files |
  Where-Object {
    $_ -match '^csdn-.*\.(json|png)$' -or
    $_ -match '^diag3-.*\.png$' -or
    $_ -eq 'server.log' -or
    $_ -eq '.hugo_build.lock' -or
    $_ -like 'resources/_gen/*'
  }
```

Expected removed set: all matched paths and no files under `static/resources/`.

- [ ] **Step 4: Prove no CSDN files remain tracked**

Run:

```powershell
$remaining = git -c core.quotepath=false ls-files |
  Where-Object {
    $_ -match '(^|/)\.playwright-csdn-profile/' -or
    $_ -match '(^|/)csdn-' -or
    $_ -match '^diag3-' -or
    $_ -eq 'scripts/publish-to-csdn.js'
  }
if ($remaining) { $remaining; exit 1 }
```

Expected: exit code `0` with no paths.

- [ ] **Step 5: Commit the cleanup**

Run:

```powershell
git add -- .gitignore
git commit -m "chore: remove obsolete CSDN and generated files"
```

Expected: one commit containing the CSDN, backup, log, cache, and ignore-rule cleanup.

---

### Task 3: Relocate Waline and Cover Maintenance Tooling

**Files:**
- Move: `package/` → `services/waline/`
- Move: `fetch_covers.py` → `scripts/fetch-covers.py`
- Modify: `scripts/fetch-covers.py`
- Create: `services/README.md`
- Create: `scripts/README.md`

**Interfaces:**
- Consumes: Existing Waline backend source and cover download script.
- Produces: `services/waline/` as an independent backend source tree and `scripts/fetch-covers.py` with unchanged output locations.

- [ ] **Step 1: Move the existing source trees**

Run:

```powershell
New-Item -ItemType Directory -Path services -Force | Out-Null
git mv package services/waline
git mv fetch_covers.py scripts/fetch-covers.py
```

Expected: Git records renames without changing file contents.

- [ ] **Step 2: Preserve cover script output paths**

Change:

```python
BASE = Path(__file__).parent
```

to:

```python
ROOT = Path(__file__).resolve().parents[1]
IMG_DIR = ROOT / "static" / "images" / "covers"
DATA_FILE = ROOT / "data" / "covers.yml"
```

Remove the former `BASE`-based `IMG_DIR` and `DATA_FILE` assignments. No network request is run during verification.

- [ ] **Step 3: Document the services boundary**

Create `services/README.md` with:

```markdown
# Auxiliary Services

This directory contains service source code that supports the blog but is not
part of the Hugo or GitHub Pages build.

## Waline

`waline/` is the retained Waline comment backend source. The live blog uses the
CloudBase endpoint configured in `config/_default/params.yml`; moving this source
directory does not change that deployed endpoint.
```

- [ ] **Step 4: Document the maintenance scripts**

Create `scripts/README.md` listing:

- `fetch-covers.py`: downloads optional rotating post covers into `static/images/covers/` and rewrites `data/covers.yml`.
- `generate-category-covers.py`: deterministically generates category cover artwork.
- `verify-category-covers.ps1`: checks category-cover mapping and files.
- `verify-live2d.ps1`: checks the current Live2D-disabled configuration.
- `verify-suffix-array-article.ps1`: checks the suffix-array article contract.

Include the exact invocation form `python scripts/<name>.py` or `powershell -File scripts/<name>.ps1`.

- [ ] **Step 5: Check the moved Python script without running downloads**

Run:

```powershell
python -m py_compile scripts/fetch-covers.py
```

Expected: exit code `0`.

- [ ] **Step 6: Commit the relocations**

Run:

```powershell
git add -- services scripts/fetch-covers.py scripts/README.md
git commit -m "refactor: organize services and maintenance scripts"
```

Expected: one commit containing only the Waline and script organization.

---

### Task 4: Refresh Repository Documentation

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: Final directory organization from Tasks 2–3.
- Produces: Accurate onboarding and project-boundary documentation.

- [ ] **Step 1: Remove stale content descriptions**

Delete “network setup” from the technical experiments description because that article was removed.

- [ ] **Step 2: Update local commands**

Use repository-local commands:

```powershell
hugo server -D
hugo --minify=false
node --test static/js/graph-visualizer.test.mjs
```

Do not document machine-specific `..\Hugo\hugo.exe` paths.

- [ ] **Step 3: Replace the project structure block**

Document these boundaries:

```text
content/                  Blog posts and standalone pages
layouts/                  Hugo template overrides
assets/                   Hugo-pipeline styles and source images
static/                   Files served at stable public URLs
config/_default/          Theme and site parameters
data/                     Cover, friend, and vendor data
scripts/                  Local maintenance and verification tools
services/waline/          Waline backend source, outside the Hugo build
themes/                   Hugo theme submodules
docs/                     Operational guides, designs, and plans
```

- [ ] **Step 4: Explain Waline deployment separation**

Add one paragraph stating that GitHub Pages builds only Hugo, while the live Waline backend is deployed separately and selected through `config/_default/params.yml`.

- [ ] **Step 5: Validate README references**

Run:

```powershell
Select-String -Path README.md -Pattern '\.\.\\Hugo|network setup|package/'
```

Expected: no matches.

- [ ] **Step 6: Commit documentation**

Run:

```powershell
git add -- README.md
git commit -m "docs: clarify blog repository structure"
```

Expected: one documentation-only commit.

---

### Task 5: Verify the Site Is Byte-for-Byte Unchanged

**Files:**
- Generate outside repository: `E:/blog/blog-cleanup-after.sha256`
- Delete after comparison: `E:/blog/blog-cleanup-before.sha256`
- Delete after comparison: `E:/blog/blog-cleanup-after.sha256`

**Interfaces:**
- Consumes: Baseline manifest from Task 1 and the organized repository.
- Produces: Evidence that site rendering and retained functionality are unchanged.

- [ ] **Step 1: Run repository verification scripts**

Run:

```powershell
powershell -File scripts/verify-category-covers.ps1
powershell -File scripts/verify-live2d.ps1
powershell -File scripts/verify-suffix-array-article.ps1
node --test static/js/graph-visualizer.test.mjs
```

Expected: every command exits `0`.

- [ ] **Step 2: Rebuild the entire site**

Run:

```powershell
hugo --cleanDestinationDir
```

Expected: exit code `0`.

- [ ] **Step 3: Produce the post-cleanup output manifest**

Run the same manifest command as Task 1, writing to:

```text
E:/blog/blog-cleanup-after.sha256
```

- [ ] **Step 4: Compare all generated files and hashes**

Run:

```powershell
$before = Get-Content E:\blog\blog-cleanup-before.sha256
$after = Get-Content E:\blog\blog-cleanup-after.sha256
$difference = Compare-Object $before $after
if ($difference) { $difference; exit 1 }
```

Expected: exit code `0` and no differences.

- [ ] **Step 5: Verify protected site files were not edited**

Run:

```powershell
git diff HEAD~4..HEAD --name-only -- hugo.toml config layouts assets static/css static/js static/images themes
```

Expected: no output. The only intended `static/` change is the earlier deletion under `static/downloads/`, outside these protected paths.

- [ ] **Step 6: Verify Waline configuration**

Run:

```powershell
Select-String -Path config/_default/params.yml -Pattern 'serverURL:'
```

Expected: the existing CloudBase `/waline` endpoint.

- [ ] **Step 7: Verify repository cleanliness and size reduction**

Run:

```powershell
git status --short
git -c core.quotepath=false ls-files |
  ForEach-Object {
    $item = Get-Item -LiteralPath $_ -ErrorAction SilentlyContinue
    if ($item) { $item.Length }
  } |
  Measure-Object -Sum
```

Expected: no pending tracked changes. Current checkout size drops by roughly 60 MB even though historical Git objects remain.

- [ ] **Step 8: Remove verification manifests**

Delete only these exact files after their paths and contents have been verified:

```text
E:/blog/blog-cleanup-before.sha256
E:/blog/blog-cleanup-after.sha256
```

Expected: both files are absent and no project files are removed.
