# Category Cover Design

## Goal

Replace generic/anime-style category card covers on the homepage with category-specific technical covers.

## Categories

The homepage should have dedicated covers for these existing categories:

- 算法
- 题解
- 图论
- 算法竞赛进阶指南
- 建站
- Hack
- GPLT天梯赛

## Visual Direction

All covers should avoid anime characters and character art. Each cover should communicate the category directly:

- 算法: abstract algorithm flow, arrays, pointers, recursion, code-like structure.
- 题解: contest problem statement, accepted result, annotations, proof notes.
- 图论: graph nodes, weighted edges, shortest paths, spanning tree cues.
- 算法竞赛进阶指南: competitive programming workstation, scoreboard, advanced data structures.
- 建站: static site building, layouts, deployment pipeline, browser/server hints.
- Hack: network configuration, terminals, routing, web-control/security-lab atmosphere.
- GPLT天梯赛: team programming contest, ladder-race structure, scoreboard and contest timeline cues.

## Implementation

Add a category-to-cover data file under `data/`. Update `layouts/partials/category_tree.html` so category cover lookup happens before fallback cover rotation. Store generated project-bound cover assets under `assets/images/category-covers/` so Hugo can process them through its existing image pipeline.

## Verification

Build the Hugo site and verify `public/index.html` includes a category card image for every category above and references the generated category cover asset family.
