# Suffix Array Tutorial Article Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a beginner-friendly Chinese suffix-array tutorial with an animated doubling walkthrough, verified C++17 templates, LCP/RMQ explanations, and representative applications.

**Architecture:** Keep the tutorial self-contained in one Hugo Markdown post so formulas, tables, code, and inline SVG travel together. Add one PowerShell verification script that checks required content, extracts the marked full C++ template, compiles a property-test harness, runs randomized comparisons against brute force, and builds the Hugo site.

**Tech Stack:** Hugo 0.162+, Markdown, MathJax-compatible LaTeX, inline SVG/SMIL, C++17, PowerShell, GCC.

## Global Constraints

- The target reader is a beginner in string algorithms.
- Use `banana` as the running example.
- Use C++17 and 0-based indexing throughout.
- Cover doubling construction, Kasai LCP, sparse-table RMQ, suffix sorting, pattern matching, longest repeated substring, longest common substring, and arbitrary-suffix LCP queries.
- Include a play/pause inline SVG animation for the `w=1,2,4` doubling rounds.
- Keep a complete text/table fallback for every concept shown in animation.
- Use no external image host or new runtime dependency.

---

### Task 1: Add the article contract verifier

**Files:**
- Create: `scripts/verify-suffix-array-article.ps1`
- Test: `scripts/verify-suffix-array-article.ps1`

**Interfaces:**
- Consumes: `content/posts/字符串后缀数组.md`, marker comments `suffix-array-full-template-begin` and `suffix-array-full-template-end`, `g++`, and `../Hugo/hugo.exe`.
- Produces: a nonzero exit code with a specific missing-contract message, or `Suffix array article verification passed.` on success.

- [ ] **Step 1: Write the failing structural checks**

Create a PowerShell script with `$ErrorActionPreference = 'Stop'`. It must load the post and require these exact markers:

```powershell
$required = @(
  'title: "字符串后缀数组', 'math: true', '## 一、后缀数组到底是什么',
  '## 三、倍增算法', 'suffix-array-doubling-animation',
  '## 五、LCP 与 height 数组', '## 六、Kasai 算法',
  '## 七、RMQ', '## 八、典型应用',
  'suffix-array-full-template-begin', 'suffix-array-full-template-end'
)
foreach ($marker in $required) {
  if (-not $article.Contains($marker)) { throw "Missing article marker: $marker" }
}
```

It must also count `<svg` and `</svg>` tags, require at least four balanced SVG diagrams, require animation tags and a play/pause click handler, and reject external image URLs.

- [ ] **Step 2: Run the verifier and confirm the red state**

Run `powershell -ExecutionPolicy Bypass -File scripts/verify-suffix-array-article.ps1`.

Expected: FAIL with `Missing suffix array article`.

- [ ] **Step 3: Commit the failing contract**

```powershell
git add -- scripts/verify-suffix-array-article.ps1
git commit -m "test: define suffix array article contract"
```

---

### Task 2: Write the conceptual tutorial and doubling visuals

**Files:**
- Create: `content/posts/字符串后缀数组.md`
- Test: `scripts/verify-suffix-array-article.ps1`

**Interfaces:**
- Consumes: the heading and visual contracts from Task 1.
- Produces: a valid Hugo post whose first half establishes `sa`, `rk`, doubling invariants, and both construction complexities.

- [ ] **Step 1: Add front matter and the beginner path**

Use this metadata:

```yaml
---
title: "字符串后缀数组：从 banana 到倍增、LCP 与典型应用"
date: 2026-07-15T12:00:00-04:00
draft: false
categories: ["算法", "算法竞赛进阶指南"]
description: "面向字符串算法初学者的后缀数组教程：用 banana 图解倍增构造，推导 Kasai、LCP 与 RMQ，并讲解模式匹配、最长重复子串和最长公共子串。"
tags: ["后缀数组", "字符串", "倍增", "LCP", "Kasai", "RMQ", "ACM"]
math: true
---
```

Write sections covering prerequisites, all six suffixes of `banana`, lexicographic order, and these exact arrays:

```text
sa     = [5, 3, 1, 0, 4, 2]
rk     = [3, 2, 5, 1, 4, 0]
height = [0, 1, 3, 0, 0, 2]
```

- [ ] **Step 2: Add four accessible inline SVG diagrams**

Add diagrams with responsive `viewBox`, text labels, theme-safe colors, `role="img"`, `aria-labelledby`, and `<title>` for:

1. the `banana` suffix staircase and sorted order;
2. the inverse mapping `sa[rank] = position` / `rk[position] = rank`;
3. the two-key split `[i,i+w)` and `[i+w,i+2w)`;
4. the LCP interval-minimum relation.

Every diagram must have adjacent prose or a table as a nonanimated fallback.

- [ ] **Step 3: Add the play/pause doubling animation**

Give the SVG `id="suffix-array-doubling-animation"`. Use three SMIL opacity phases to show `w=1`, `w=2`, and `w=4`, with visible text for old ranks, rank pairs, sorted order, and new ranks. Add a control group whose click handler pauses or unpauses the nearest SVG and updates its label between `⏸ 暂停` and `▶ 播放`.

- [ ] **Step 4: Explain and prove doubling**

State the invariant: before round `w`, `rk[i]` represents the lexicographic rank of the length-`w` prefix of suffix `s[i..]`. Explain why the pair `(rk[i], rk[i+w])` represents length `2w`, use `-1` for missing second keys, and include the termination condition `classes == n`.

- [ ] **Step 5: Add both construction implementations**

Include an explanatory `std::sort` implementation with `O(n log^2 n)` time, plus a count/radix-sort implementation with `O(n log n)` time and `O(n)` memory. Mark the optimized implementation with:

```cpp
// suffix-array-full-template-begin
struct SuffixArray {
    // public vectors: sa, rk, height
};
// suffix-array-full-template-end
```

- [ ] **Step 6: Run the structural verifier**

Expected: it advances past conceptual-section and SVG checks; compilation may remain red until Task 3 completes the struct.

- [ ] **Step 7: Commit the conceptual half**

```powershell
git add -- content/posts/字符串后缀数组.md
git commit -m "post: explain suffix array doubling visually"
```

---

### Task 3: Complete LCP, RMQ, applications, and executable template

**Files:**
- Modify: `content/posts/字符串后缀数组.md`
- Modify: `scripts/verify-suffix-array-article.ps1`
- Test: `scripts/verify-suffix-array-article.ps1`

**Interfaces:**
- Consumes: `SuffixArray(string)` from Task 2.
- Produces: `sa`, `rk`, `height`, `lcp_suffix(int i, int j) const`, and an extracted C++17 template that passes brute-force property tests.

- [ ] **Step 1: Finish the `SuffixArray` interface**

The marked template must expose:

```cpp
struct SuffixArray {
    int n;
    std::string s;
    std::vector<int> sa, rk, height, lg;
    std::vector<std::vector<int>> st;
    explicit SuffixArray(std::string str);
    int lcp_suffix(int i, int j) const;
};
```

Construction must handle `n=0` without accessing `sa[0]`, build LCP with Kasai in `O(n)`, and build the sparse table only when `n>0`.

- [ ] **Step 2: Add executable randomized verification**

Extend the PowerShell verifier to extract the marked template into a temporary `.cpp` file. Append a deterministic C++ `main()` that checks `banana`, then generates random strings of length `0..40` over `abc` with seed `20260715`, compares `sa` with substring sorting, and compares every `lcp_suffix(i,j)` with a character-by-character brute force implementation. Compile with:

```powershell
g++ -std=c++17 -O2 -Wall -Wextra -pedantic $cppPath -o $exePath
```

Run the executable, require exit code zero, and clean the temporary directory in `finally`.

- [ ] **Step 3: Explain Kasai and its invariant**

Define `height[r] = LCP(s[sa[r]..], s[sa[r-1]..])`, show the `banana` table, and explain why moving from suffix `i` to `i+1` allows `k = max(k-1, 0)`. Connect the proof to the template.

- [ ] **Step 4: Explain RMQ and arbitrary-suffix LCP**

For ranks `x < y`, justify:

$$
LCP(sa[x],sa[y])=\min_{k=x+1}^{y} height[k].
$$

Show that the query interval is `[rk[i]+1, rk[j]]` after ordering ranks, and document `lcp_suffix(i,i)=n-i`.

- [ ] **Step 5: Add four applications**

Add complete reasoning and compact C++ functions for suffix sorting and pattern matching; longest repeated substring; longest common substring with `A + separator + B`; and arbitrary-suffix LCP.

- [ ] **Step 6: Add summary material**

End with an array relationship table, complexity table, seven indexing/separator pitfalls from the design, and a practice path.

- [ ] **Step 7: Run randomized verification**

Run `powershell -ExecutionPolicy Bypass -File scripts/verify-suffix-array-article.ps1 -SkipHugo`.

Expected: `Suffix array C++ property tests passed.` followed by `Suffix array article verification passed.`

- [ ] **Step 8: Commit the complete algorithm content**

```powershell
git add -- content/posts/字符串后缀数组.md scripts/verify-suffix-array-article.ps1
git commit -m "post: add LCP RMQ and suffix array applications"
```

---

### Task 4: Render and release verification

**Files:**
- Modify: `content/posts/字符串后缀数组.md` only if rendering reveals defects.
- Test: `scripts/verify-suffix-array-article.ps1`

**Interfaces:**
- Consumes: the complete article and verifier.
- Produces: a clean Hugo build and verified generated page.

- [ ] **Step 1: Build the full site**

Run `powershell -ExecutionPolicy Bypass -File scripts/verify-suffix-array-article.ps1`.

Expected: C++ property tests pass, Hugo exits zero, and the verifier prints `Suffix array article verification passed.`

- [ ] **Step 2: Inspect the generated HTML contract**

Locate the generated page under `public/posts/`. Require the HTML to contain `suffix-array-doubling-animation`, `suffix-array-full-template-begin`, `最长重复子串`, and `Kasai`. Verify balanced `<svg>` tags and no escaped `&lt;svg` diagram.

- [ ] **Step 3: Run repository hygiene checks**

```powershell
git diff --check
git status --short
```

Expected: no whitespace errors; only intentional article/verifier/plan changes appear.

- [ ] **Step 4: Commit render-only corrections if needed**

```powershell
git add -- content/posts/字符串后缀数组.md scripts/verify-suffix-array-article.ps1
git commit -m "fix: polish suffix array article rendering"
```

- [ ] **Step 5: Record final evidence**

Report the article path, diagram count, verified `banana` arrays, randomized test scope, Hugo build result, and final commit identifiers.
