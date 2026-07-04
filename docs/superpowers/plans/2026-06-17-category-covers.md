# Category Covers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each homepage category card a non-anime, category-specific cover image.

**Architecture:** A new Hugo data file maps category names to project-local cover asset paths. The homepage category partial reads that map first, then falls back to the existing cover list only for unmapped categories. Generated images live in Hugo's assets pipeline so existing responsive image processing continues to work.

**Tech Stack:** Hugo 0.162 extended, Hugo templates, YAML data files, project-local raster assets, PowerShell verification.

---

### Task 1: Add Verification

**Files:**
- Create: `scripts/verify-category-covers.ps1`

- [x] **Step 1: Write the failing test**

Create a script that builds the site and checks the homepage for all expected category-cover asset slugs.

- [x] **Step 2: Run the test to verify it fails**

Run: `powershell -ExecutionPolicy Bypass -File scripts/verify-category-covers.ps1`

Expected: FAIL because category cover data and images do not exist yet.

### Task 2: Generate Assets

**Files:**
- Create: `assets/images/category-covers/algorithm.png`
- Create: `assets/images/category-covers/solution.png`
- Create: `assets/images/category-covers/graph-theory.png`
- Create: `assets/images/category-covers/advanced-cp.png`
- Create: `assets/images/category-covers/site-building.png`
- Create: `assets/images/category-covers/hack.png`
- Create: `assets/images/category-covers/gplt.png`

- [x] **Step 1: Generate seven non-anime technical covers**

Use the built-in image generation tool, one prompt per category when available; use the local generator for project-bound reproducible PNG assets. Save the final project-bound images into `assets/images/category-covers/`.

### Task 3: Wire Covers Into Hugo

**Files:**
- Create: `data/category_covers.yml`
- Modify: `layouts/partials/category_tree.html`

- [x] **Step 1: Add category cover data**

Map each category name to one generated asset path.

- [x] **Step 2: Update category card lookup**

Read `.Site.Data.category_covers` before checking article covers or `data/covers.yml`.

- [x] **Step 3: Run verification**

Run: `powershell -ExecutionPolicy Bypass -File scripts/verify-category-covers.ps1`

Expected: PASS.

### Task 4: Preserve Cover Sharpness In Expanded Cards

**Files:**
- Modify: `scripts/generate-category-covers.py`
- Modify: `layouts/partials/category_tree.html`
- Modify: `static/css/custom.css`
- Test: `scripts/verify-category-covers.ps1`

- [x] **Step 1: Add a clarity regression check**

The verification script checks that every source cover is at least `1920x1320` and every homepage card has a `1440w` responsive image candidate.

- [x] **Step 2: Generate high-resolution source covers**

`scripts/generate-category-covers.py` now writes `1920x1320` PNG covers.

- [x] **Step 3: Emit larger Hugo image candidates**

`layouts/partials/category_tree.html` now emits `480w`, `960w`, and `1440w` WebP candidates and uses a conservative `sizes` value so expanded cards choose a high-density image.

- [x] **Step 4: Avoid expanded-state transform scaling**

`static/css/custom.css` only applies the cover hover scale to cards that are not open.
