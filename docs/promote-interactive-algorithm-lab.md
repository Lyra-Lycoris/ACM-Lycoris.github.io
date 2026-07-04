# I Built an Interactive Graph Algorithm Lab for Competitive Programming

Learning graph algorithms is one of the most painful parts of competitive programming.

At first, every algorithm looks like a wall of code:

- BFS uses a queue.
- Dijkstra uses a priority queue.
- Floyd-Warshall has three nested loops.
- Tarjan carries `dfn` and `low`.
- Dinic mixes BFS levels with DFS augmenting paths.

You can memorize templates, but memorization alone is fragile. The moment a problem changes the graph shape, edge weights, or constraints, the template stops feeling obvious.

So I built a small interactive tool for my personal blog:

**Interactive Algorithm Lab**  
https://acm-lycoris.cn/algorithm-visualizer/

## What It Does

The lab lets you experiment with graph algorithms directly in the browser.

You can:

- drag nodes around
- add new nodes
- create weighted edges
- switch between directed and undirected graphs
- run algorithms step by step
- watch the execution log update in real time
- read the corresponding ICPC-style C++ template below the graph
- see the active code lines highlighted while the algorithm runs

The goal is to connect three things that are often separated when learning algorithms:

1. the graph structure
2. the algorithm process
3. the contest template code

When these three views move together, the algorithm becomes much easier to reason about.

## Supported Algorithms

The current version includes classic graph algorithms frequently used in competitive programming:

- BFS
- 0-1 BFS
- DFS
- Dijkstra
- SPFA
- Bellman-Ford
- Floyd-Warshall
- Prim
- Kruskal
- Tree Diameter
- Binary Lifting LCA
- Tarjan SCC
- Bridge Finding
- Topological Sort
- Connected Components
- Bipartite Check
- Dinic Max Flow
- Hopcroft-Karp

Each algorithm comes with a preset graph designed for that topic. For example, shortest path algorithms use weighted graphs, Floyd-Warshall includes negative edges, tree algorithms use tree-shaped presets, and flow algorithms use a source-sink network.

## Why I Made It

I am an ACM/ICPC learner, and I often feel that algorithm explanations are either too abstract or too template-driven.

Many tutorials say what the code does, but they do not show how the state changes.

Many visualizers show animation, but they do not connect the animation back to the exact code you would write in a contest.

I wanted something in between:

- simple enough to open inside a blog post
- practical enough for competitive programming
- visual enough to explain the idea
- code-oriented enough to help with real contest templates

This is not meant to replace serious practice. It is meant to make the first few hours with a difficult algorithm less painful.

## Built With

The blog is built with:

- Hugo
- vanilla JavaScript
- SVG
- custom CSS
- GitHub Pages

No heavy frontend framework is required. The visualizer is intentionally lightweight so it can live inside a static blog.

Repository:

https://github.com/ACM-Lycoris/ACM-Lycoris.github.io

## What Comes Next

I want to keep improving the lab as I learn more algorithms.

Possible next steps:

- add more data structure visualizations
- add more advanced graph algorithms
- improve mobile interaction
- add English explanations for every algorithm
- create more contest-style examples
- connect articles directly with interactive presets

## Try It

If you are learning graph algorithms, preparing for ICPC, or teaching competitive programming, feel free to try it:

https://acm-lycoris.cn/algorithm-visualizer/

If you find it useful, a star on GitHub would mean a lot:

https://github.com/ACM-Lycoris/ACM-Lycoris.github.io

Feedback is welcome. I am still learning, and this project is part of that journey.

