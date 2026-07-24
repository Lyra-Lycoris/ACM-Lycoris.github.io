# ACM-Lycoris's Blog

> A personal technical blog about competitive programming, graph algorithms, web experiments, and the long road toward ICPC excellence.

<p align="center">
  <a href="https://acm-lycoris.cn/"><strong>Live Site</strong></a>
  ·
  <a href="https://acm-lycoris.cn/algorithm-visualizer/"><strong>Interactive Algorithm Lab</strong></a>
  ·
  <a href="https://github.com/ACM-Lycoris/ACM-Lycoris.github.io"><strong>Repository</strong></a>
</p>

<p align="center">
  <img alt="Hugo" src="https://img.shields.io/badge/Hugo-0.162+-ff4088?style=flat-square&logo=hugo&logoColor=white">
  <img alt="GitHub Pages" src="https://img.shields.io/badge/Deploy-GitHub%20Pages-181717?style=flat-square&logo=github&logoColor=white">
  <img alt="Focus" src="https://img.shields.io/badge/Focus-ACM%20%2F%20ICPC-00bcd4?style=flat-square">
  <img alt="Interactive" src="https://img.shields.io/badge/Feature-Algorithm%20Visualization-ff003c?style=flat-square">
</p>

---

## Overview

**ACM-Lycoris's Blog** is a Hugo-powered personal site focused on competitive programming, algorithm notes, problem editorials, and technical experiments.

The site is written from the perspective of an ACM/ICPC learner: not only collecting templates and explanations, but also turning abstract algorithms into visual, interactive learning tools.

The highlight of this project is the **Interactive Algorithm Lab**, an embedded graph algorithm visualizer where readers can drag nodes, add edges, run algorithms step by step, and watch the corresponding C++ template lines light up in real time.

## What You Can Find Here

- **Competitive programming notes**: sliding window, hashing, bit operations, recursion, recurrence, graph theory, and problem-solving patterns.
- **Graph algorithm tutorials**: shortest paths, minimum spanning trees, tree algorithms, connectivity, matching, and network flow.
- **Problem editorials**: detailed write-ups for Luogu, GPLT, ICPC-style training, and contest practice.
- **Interactive learning tools**: visual algorithm playback with editable graphs and synchronized code highlighting.
- **Blog engineering notes**: Hugo customization, Waline comments, SEO metadata, deployment, and site design.
- **Technical experiments**: Python web automation and small practical tools.

## Interactive Algorithm Lab

The algorithm lab currently includes:

`BFS` · `0-1 BFS` · `DFS` · `Dijkstra` · `SPFA` · `Bellman-Ford` · `Floyd-Warshall` · `Prim` · `Kruskal` · `Tree Diameter` · `Binary Lifting LCA` · `Tarjan SCC` · `Bridge Finding` · `Topological Sort` · `Connected Components` · `Bipartite Check` · `Dinic Max Flow` · `Hopcroft-Karp`

Each algorithm page state provides:

- A classic preset graph for the selected algorithm
- Drag-and-drop node editing
- Custom edge creation and edge weight editing
- Step-by-step execution logs
- ICPC-style C++ templates
- Line-level code highlighting synchronized with the visualization

The goal is simple: make graph algorithms less like black-box templates and more like something you can see, test, and reason about.

## Tech Stack

- **Static site generator**: Hugo
- **Theme base**: hugo-theme-reimu
- **Deployment target**: GitHub Pages with a custom domain
- **Interactive widgets**: vanilla JavaScript + SVG
- **Styling**: custom CSS with a cyber-inspired visual system
- **Comments**: Waline
- **SEO**: canonical URLs, Open Graph, Twitter Cards, JSON-LD, robots.txt, and sitemap.xml

## Local Development

Clone the repository:

```powershell
git clone https://github.com/ACM-Lycoris/ACM-Lycoris.github.io.git
cd ACM-Lycoris.github.io
```

Run the local Hugo server:

```powershell
hugo server -D
```

Build the static site:

```powershell
hugo --minify=false
```

Run algorithm visualizer tests:

```powershell
node --test static/js/graph-visualizer.test.mjs
```

## Project Structure

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

GitHub Pages builds only the Hugo site. The live Waline comment backend is
deployed separately, and the blog selects that service through the `serverURL`
in `config/_default/params.yml`. The retained source under `services/waline/`
does not participate in the static-site build.

## SEO and Sharing

The site includes shared metadata infrastructure for better search discovery and social previews:

- Canonical URLs
- Meta descriptions and keywords
- Open Graph tags
- Twitter Card tags
- BlogPosting / WebSite JSON-LD
- robots.txt
- sitemap.xml

The purpose is not keyword stuffing. The goal is to help search engines and readers understand what each page is about, especially for algorithm tutorials and contest editorials.

## About the Author

I am **ACM-Lycoris**, a competitive programming learner documenting my training, mistakes, tools, and thoughts along the way.

Have feedback? Join the discussion: <你的 discussion 链接>!

This blog is where I turn notes into articles, templates into explanations, and algorithms into interactive pages.

Visit the site: <https://acm-lycoris.cn/>
