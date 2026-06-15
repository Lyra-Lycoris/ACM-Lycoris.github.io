import assert from 'node:assert/strict';
import test from 'node:test';
import algorithms from './graph-visualizer.js';

const sampleGraph = {
  nodes: [
    { id: 'A' },
    { id: 'B' },
    { id: 'C' },
    { id: 'D' },
  ],
  edges: [
    { from: 'A', to: 'B', weight: 2 },
    { from: 'A', to: 'C', weight: 5 },
    { from: 'B', to: 'C', weight: 1 },
    { from: 'C', to: 'D', weight: 3 },
  ],
};

test('BFS records queue-driven visit order', () => {
  assert.deepEqual(algorithms.bfs(sampleGraph, 'A').visitedOrder, ['A', 'B', 'C', 'D']);
});

test('DFS records depth-first visit order', () => {
  assert.deepEqual(algorithms.dfs(sampleGraph, 'A').visitedOrder, ['A', 'B', 'C', 'D']);
});

test('Dijkstra computes shortest distances from the start node', () => {
  assert.deepEqual(algorithms.dijkstra(sampleGraph, 'A').distances, {
    A: 0,
    B: 2,
    C: 3,
    D: 6,
  });
});

test('0-1 BFS computes shortest paths on binary weighted edges', () => {
  const graph = {
    directed: true,
    nodes: [{ id: 'S' }, { id: 'A' }, { id: 'B' }, { id: 'T' }],
    edges: [
      { from: 'S', to: 'A', weight: 0 },
      { from: 'S', to: 'B', weight: 1 },
      { from: 'A', to: 'B', weight: 0 },
      { from: 'B', to: 'T', weight: 1 },
    ],
  };

  assert.deepEqual(algorithms.zeroOneBfs(graph, 'S').distances, {
    S: 0,
    A: 0,
    B: 0,
    T: 1,
  });
});

test('SPFA computes shortest distances with negative edges', () => {
  const graph = {
    directed: true,
    nodes: [{ id: 'S' }, { id: 'A' }, { id: 'B' }, { id: 'T' }],
    edges: [
      { from: 'S', to: 'A', weight: 4 },
      { from: 'S', to: 'B', weight: 7 },
      { from: 'A', to: 'B', weight: -3 },
      { from: 'B', to: 'T', weight: 2 },
    ],
  };

  assert.deepEqual(algorithms.spfa(graph, 'S').distances, {
    S: 0,
    A: 4,
    B: 1,
    T: 3,
  });
});

test('Bellman-Ford computes shortest distances with repeated relaxation', () => {
  assert.deepEqual(algorithms.bellmanFord(sampleGraph, 'A').distances, {
    A: 0,
    B: 2,
    C: 3,
    D: 6,
  });
});

test('Floyd-Warshall computes all-pairs shortest paths', () => {
  assert.equal(algorithms.floydWarshall(sampleGraph).distances.A.D, 6);
  assert.equal(algorithms.floydWarshall(sampleGraph).distances.D.A, 6);
});

test('Floyd-Warshall preserves negative edges without negative cycles', () => {
  const graph = {
    directed: true,
    nodes: [{ id: 'A' }, { id: 'B' }, { id: 'C' }],
    edges: [
      { from: 'A', to: 'B', weight: 4 },
      { from: 'B', to: 'C', weight: -2 },
      { from: 'A', to: 'C', weight: 5 },
    ],
  };

  assert.equal(algorithms.floydWarshall(graph).distances.A.C, 2);
});

test('Prim and Kruskal both find a minimum spanning tree', () => {
  assert.equal(algorithms.prim(sampleGraph, 'A').totalWeight, 6);
  assert.equal(algorithms.kruskal(sampleGraph).totalWeight, 6);
});

test('Tree algorithms expose diameter and LCA preprocessing steps', () => {
  const tree = {
    nodes: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }],
    edges: [
      { from: '1', to: '2', weight: 1 },
      { from: '2', to: '3', weight: 1 },
      { from: '2', to: '4', weight: 1 },
    ],
  };

  assert.equal(algorithms.treeDiameter(tree, '1').length, 2);
  assert.equal(algorithms.lcaBinaryLifting(tree, '1').depth['3'], 2);
});

test('Tarjan SCC and bridge finding identify classical structures', () => {
  const directed = {
    directed: true,
    nodes: [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }],
    edges: [
      { from: 'A', to: 'B', weight: 1 },
      { from: 'B', to: 'A', weight: 1 },
      { from: 'B', to: 'C', weight: 1 },
      { from: 'C', to: 'D', weight: 1 },
      { from: 'D', to: 'C', weight: 1 },
    ],
  };
  const undirected = {
    nodes: directed.nodes,
    edges: [
      { from: 'A', to: 'B', weight: 1 },
      { from: 'B', to: 'C', weight: 1 },
      { from: 'C', to: 'D', weight: 1 },
      { from: 'D', to: 'B', weight: 1 },
    ],
  };

  assert.deepEqual(algorithms.tarjanScc(directed).components.map((component) => component.sort()), [['C', 'D'], ['A', 'B']]);
  assert.deepEqual(algorithms.bridgeFinding(undirected).bridges, ['A->B']);
});

test('Dinic computes max flow and Hopcroft-Karp computes maximum matching', () => {
  const flow = algorithms.dinicMaxFlow(algorithms.catalog.dinicMaxFlow.preset, 'S');
  const matching = algorithms.hopcroftKarp(algorithms.catalog.hopcroftKarp.preset);

  assert.equal(flow.maxFlow, 17);
  assert.equal(matching.matchingSize, 3);
});

test('Every selectable algorithm has a preset graph and C++ template', () => {
  const selectable = [
    'bfs',
    'zeroOneBfs',
    'dfs',
    'dijkstra',
    'spfa',
    'bellmanFord',
    'floydWarshall',
    'dinicMaxFlow',
    'hopcroftKarp',
    'prim',
    'kruskal',
    'treeDiameter',
    'lcaBinaryLifting',
    'tarjanScc',
    'bridgeFinding',
    'topologicalSort',
    'connectedComponents',
    'bipartiteCheck',
  ];

  for (const name of selectable) {
    assert.ok(algorithms.catalog[name], name);
    assert.ok(algorithms.catalog[name].preset.nodes.length > 0, name);
    assert.match(algorithms.catalog[name].code, /#include <bits\/stdc\+\+\.h>/, name);
    const uncommented = algorithms.catalog[name].code
      .split('\n')
      .filter((line) => line.trim() && !line.includes('//'));
    assert.deepEqual(uncommented, [], name);
  }
});

test('Topological sort orders every DAG edge from left to right', () => {
  const dag = {
    nodes: [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }],
    edges: [
      { from: 'A', to: 'B', weight: 1 },
      { from: 'A', to: 'C', weight: 1 },
      { from: 'B', to: 'D', weight: 1 },
      { from: 'C', to: 'D', weight: 1 },
    ],
  };
  const order = algorithms.topologicalSort(dag).order;
  const position = Object.fromEntries(order.map((id, index) => [id, index]));

  assert.equal(order.length, 4);
  for (const edge of dag.edges) {
    assert.ok(position[edge.from] < position[edge.to]);
  }
});

test('Connected components and bipartite check classify graph structure', () => {
  const graph = {
    nodes: [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'X' }],
    edges: [
      { from: 'A', to: 'B', weight: 1 },
      { from: 'B', to: 'C', weight: 1 },
    ],
  };

  assert.deepEqual(algorithms.connectedComponents(graph).components, [['A', 'B', 'C'], ['X']]);
  assert.equal(algorithms.bipartiteCheck(graph).isBipartite, true);
});
