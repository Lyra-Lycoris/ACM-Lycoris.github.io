(function (root, factory) {
  var api = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }

  root.GraphVisualizerAlgorithms = api;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { bootGraphVisualizer(api); });
    } else {
      bootGraphVisualizer(api);
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
  'use strict';

  function cloneList(value) {
    return Array.prototype.slice.call(value || []);
  }

  function normalizeGraph(graph, forceUndirected) {
    var nodes = cloneList(graph.nodes).map(function (node) {
      return typeof node === 'string' ? { id: node } : node;
    });
    var nodeIds = nodes.map(function (node) { return String(node.id); });
    var known = new Set(nodeIds);
    var directed = forceUndirected ? false : !!graph.directed;
    var edges = cloneList(graph.edges)
      .filter(function (edge) { return known.has(String(edge.from)) && known.has(String(edge.to)); })
      .map(function (edge, index) {
        var weight = Number(edge.weight);
        return {
          id: edge.id || 'E' + (index + 1),
          from: String(edge.from),
          to: String(edge.to),
          weight: Number.isFinite(weight) ? weight : 1,
        };
      });
    var adjacency = Object.fromEntries(nodeIds.map(function (id) { return [id, []]; }));

    edges.forEach(function (edge) {
      adjacency[edge.from].push({ id: edge.to, weight: edge.weight, edge: edge });
      if (!directed) {
        adjacency[edge.to].push({ id: edge.from, weight: edge.weight, edge: edge });
      }
    });

    Object.keys(adjacency).forEach(function (id) {
      adjacency[id].sort(function (a, b) { return a.id.localeCompare(b.id); });
    });

    return { nodes: nodes, nodeIds: nodeIds, edges: edges, adjacency: adjacency, directed: directed };
  }

  function edgeKey(edge) {
    return edge.from + '->' + edge.to;
  }

  function step(message, current, visited, frontier, edges, codeLines) {
    return {
      message: message,
      current: current || '',
      visited: cloneList(visited),
      frontier: cloneList(frontier),
      edges: cloneList(edges),
      codeLines: cloneList(codeLines),
    };
  }

  function bfs(graph, startId) {
    var g = normalizeGraph(graph);
    var start = String(startId || g.nodeIds[0] || '');
    var queue = start ? [start] : [];
    var seen = new Set(queue);
    var visitedOrder = [];
    var steps = [step('初始化队列: ' + (start || '空图'), start, [], queue, [])];

    while (queue.length) {
      var current = queue.shift();
      visitedOrder.push(current);
      steps.push(step('访问 ' + current, current, visitedOrder, queue, []));

      g.adjacency[current].forEach(function (next) {
        if (seen.has(next.id)) return;
        seen.add(next.id);
        queue.push(next.id);
        steps.push(step(current + ' 发现 ' + next.id, next.id, visitedOrder, queue, [edgeKey(next.edge)]));
      });
    }

    return { visitedOrder: visitedOrder, steps: steps };
  }

  function dfs(graph, startId) {
    var g = normalizeGraph(graph);
    var start = String(startId || g.nodeIds[0] || '');
    var seen = new Set();
    var visitedOrder = [];
    var steps = [];

    function visit(id, fromEdge) {
      seen.add(id);
      visitedOrder.push(id);
      steps.push(step('进入 ' + id, id, visitedOrder, [], fromEdge ? [fromEdge] : []));
      g.adjacency[id].forEach(function (next) {
        if (!seen.has(next.id)) visit(next.id, edgeKey(next.edge));
      });
      steps.push(step('回溯 ' + id, id, visitedOrder, [], []));
    }

    if (start) visit(start, '');
    return { visitedOrder: visitedOrder, steps: steps };
  }

  function dijkstra(graph, startId) {
    var g = normalizeGraph(graph);
    var start = String(startId || g.nodeIds[0] || '');
    var distances = {};
    var previous = {};
    var unvisited = new Set(g.nodeIds);
    var settled = [];
    var steps = [];

    g.nodeIds.forEach(function (id) {
      distances[id] = Infinity;
      previous[id] = '';
    });
    if (start) distances[start] = 0;

    steps.push(step('起点 ' + start + ' 的距离设为 0', start, [], g.nodeIds, []));

    while (unvisited.size) {
      var current = '';
      unvisited.forEach(function (id) {
        if (!current || distances[id] < distances[current]) current = id;
      });
      if (!current || distances[current] === Infinity) break;

      unvisited.delete(current);
      settled.push(current);
      steps.push(step('确定 ' + current + ' 的最短距离: ' + distances[current], current, settled, Array.from(unvisited), []));

      g.adjacency[current].forEach(function (next) {
        if (!unvisited.has(next.id)) return;
        var candidate = distances[current] + next.weight;
        if (candidate < distances[next.id]) {
          distances[next.id] = candidate;
          previous[next.id] = current;
          steps.push(step(current + ' 松弛 ' + next.id + ' = ' + candidate, next.id, settled, Array.from(unvisited), [edgeKey(next.edge)]));
        }
      });
    }

    return { distances: distances, previous: previous, steps: steps };
  }

  function zeroOneBfs(graph, startId) {
    var g = normalizeGraph(graph);
    var start = String(startId || g.nodeIds[0] || '');
    var distances = {};
    var deque = start ? [start] : [];
    var steps = [];

    g.nodeIds.forEach(function (id) { distances[id] = Infinity; });
    if (start) distances[start] = 0;
    steps.push(step('起点 ' + start + ' 入双端队列', start, [], deque, [], [9, 10, 11]));

    while (deque.length) {
      var current = deque.shift();
      steps.push(step('弹出 ' + current + '，扫描 0/1 边', current, Object.keys(distances).filter(function (id) { return distances[id] < Infinity; }), deque, [], [12, 13, 14]));
      g.adjacency[current].forEach(function (next) {
        var weight = next.weight === 0 ? 0 : 1;
        var candidate = distances[current] + weight;
        if (candidate >= distances[next.id]) return;
        distances[next.id] = candidate;
        if (weight === 0) deque.unshift(next.id);
        else deque.push(next.id);
        steps.push(step('用权值 ' + weight + ' 的边松弛 ' + next.id, next.id, Object.keys(distances).filter(function (id) { return distances[id] < Infinity; }), deque, [edgeKey(next.edge)], [15, 16, 17, 18]));
      });
    }

    return { distances: distances, steps: steps };
  }

  function spfa(graph, startId) {
    var g = normalizeGraph(graph);
    var start = String(startId || g.nodeIds[0] || '');
    var distances = {};
    var inQueue = {};
    var relaxCount = {};
    var queue = start ? [start] : [];
    var steps = [];
    var hasNegativeCycle = false;

    g.nodeIds.forEach(function (id) {
      distances[id] = Infinity;
      inQueue[id] = false;
      relaxCount[id] = 0;
    });
    if (start) {
      distances[start] = 0;
      inQueue[start] = true;
    }
    steps.push(step('起点 ' + start + ' 入队', start, [], queue, [], [10, 11, 12]));

    while (queue.length && !hasNegativeCycle) {
      var current = queue.shift();
      inQueue[current] = false;
      steps.push(step('出队 ' + current + '，扫描出边', current, Object.keys(distances).filter(function (id) { return distances[id] < Infinity; }), queue, [], [13, 14, 15]));
      g.adjacency[current].forEach(function (next) {
        var candidate = distances[current] + next.weight;
        if (candidate >= distances[next.id]) return;
        distances[next.id] = candidate;
        relaxCount[next.id] += 1;
        if (relaxCount[next.id] >= g.nodeIds.length) hasNegativeCycle = true;
        if (!inQueue[next.id]) {
          queue.push(next.id);
          inQueue[next.id] = true;
        }
        steps.push(step('松弛 ' + next.id + ' = ' + candidate, next.id, Object.keys(distances).filter(function (id) { return distances[id] < Infinity; }), queue, [edgeKey(next.edge)], [16, 17, 18, 19, 20]));
      });
    }

    if (hasNegativeCycle) steps.push(step('检测到负环', '', [], queue, [], [21, 22]));
    return { distances: distances, hasNegativeCycle: hasNegativeCycle, steps: steps };
  }

  function bellmanFord(graph, startId) {
    var g = normalizeGraph(graph);
    var start = String(startId || g.nodeIds[0] || '');
    var distances = {};
    var previous = {};
    var steps = [];
    var hasNegativeCycle = false;

    g.nodeIds.forEach(function (id) {
      distances[id] = Infinity;
      previous[id] = '';
    });
    if (start) distances[start] = 0;

    steps.push(step('起点 ' + start + ' 的距离设为 0', start, [], g.nodeIds, []));

    for (var pass = 1; pass < g.nodeIds.length; pass++) {
      var changed = false;
      g.edges.forEach(function (edge) {
        var pairs = g.directed ? [[edge.from, edge.to]] : [[edge.from, edge.to], [edge.to, edge.from]];
        pairs.forEach(function (pair) {
          var from = pair[0];
          var to = pair[1];
          if (distances[from] === Infinity) return;
          var candidate = distances[from] + edge.weight;
          if (candidate < distances[to]) {
            distances[to] = candidate;
            previous[to] = from;
            changed = true;
            steps.push(step('第 ' + pass + ' 轮松弛 ' + from + ' 到 ' + to + ' = ' + candidate, to, Object.keys(previous).filter(function (id) { return distances[id] < Infinity; }), [], [edgeKey(edge)]));
          }
        });
      });
      if (!changed) {
        steps.push(step('第 ' + pass + ' 轮无更新，提前结束', '', Object.keys(distances).filter(function (id) { return distances[id] < Infinity; }), [], []));
        break;
      }
    }

    g.edges.forEach(function (edge) {
      var pairs = g.directed ? [[edge.from, edge.to]] : [[edge.from, edge.to], [edge.to, edge.from]];
      pairs.forEach(function (pair) {
        if (distances[pair[0]] !== Infinity && distances[pair[0]] + edge.weight < distances[pair[1]]) {
          hasNegativeCycle = true;
        }
      });
    });

    if (hasNegativeCycle) steps.push(step('检测到负环，最短路不存在', '', [], [], []));
    return { distances: distances, previous: previous, hasNegativeCycle: hasNegativeCycle, steps: steps };
  }

  function floydWarshall(graph) {
    var g = normalizeGraph(graph);
    var distances = {};
    var next = {};
    var steps = [];

    g.nodeIds.forEach(function (i) {
      distances[i] = {};
      next[i] = {};
      g.nodeIds.forEach(function (j) {
        distances[i][j] = i === j ? 0 : Infinity;
        next[i][j] = '';
      });
    });

    g.edges.forEach(function (edge) {
      if (edge.weight < distances[edge.from][edge.to]) {
        distances[edge.from][edge.to] = edge.weight;
        next[edge.from][edge.to] = edge.to;
      }
      if (!g.directed && edge.weight < distances[edge.to][edge.from]) {
        distances[edge.to][edge.from] = edge.weight;
        next[edge.to][edge.from] = edge.from;
      }
    });

    g.nodeIds.forEach(function (k) {
      g.nodeIds.forEach(function (i) {
        g.nodeIds.forEach(function (j) {
          if (distances[i][k] === Infinity || distances[k][j] === Infinity) return;
          var candidate = distances[i][k] + distances[k][j];
          if (candidate < distances[i][j]) {
            distances[i][j] = candidate;
            next[i][j] = next[i][k] || k;
            steps.push(step('借助 ' + k + ' 更新 ' + i + ' 到 ' + j + ' = ' + candidate, k, [i, k, j], [], []));
          }
        });
      });
    });

    if (!steps.length) steps.push(step('所有点对最短路已是当前边权', '', [], [], []));
    return { distances: distances, next: next, steps: steps };
  }

  function prim(graph, startId) {
    var g = normalizeGraph(graph, true);
    var start = String(startId || g.nodeIds[0] || '');
    var selected = new Set(start ? [start] : []);
    var treeEdges = [];
    var totalWeight = 0;
    var steps = [step('从 ' + start + ' 开始扩展生成树', start, Array.from(selected), [], [])];

    while (selected.size && selected.size < g.nodeIds.length) {
      var best = null;
      g.edges.forEach(function (edge) {
        var a = selected.has(edge.from);
        var b = selected.has(edge.to);
        if (a === b) return;
        if (!best || edge.weight < best.weight) best = edge;
      });
      if (!best) break;
      var nextId = selected.has(best.from) ? best.to : best.from;
      selected.add(nextId);
      treeEdges.push(edgeKey(best));
      totalWeight += best.weight;
      steps.push(step('选择边 ' + best.from + '-' + best.to + '，权值 ' + best.weight, nextId, Array.from(selected), [], treeEdges));
    }

    return { edges: treeEdges, totalWeight: totalWeight, steps: steps };
  }

  function kruskal(graph) {
    var g = normalizeGraph(graph, true);
    var parent = {};
    var rank = {};
    var treeEdges = [];
    var totalWeight = 0;
    var steps = [];

    g.nodeIds.forEach(function (id) {
      parent[id] = id;
      rank[id] = 0;
    });

    function find(id) {
      if (parent[id] !== id) parent[id] = find(parent[id]);
      return parent[id];
    }

    function unite(a, b) {
      var ra = find(a);
      var rb = find(b);
      if (ra === rb) return false;
      if (rank[ra] < rank[rb]) parent[ra] = rb;
      else if (rank[ra] > rank[rb]) parent[rb] = ra;
      else {
        parent[rb] = ra;
        rank[ra] += 1;
      }
      return true;
    }

    g.edges.slice().sort(function (a, b) {
      return a.weight - b.weight || edgeKey(a).localeCompare(edgeKey(b));
    }).forEach(function (edge) {
      if (unite(edge.from, edge.to)) {
        treeEdges.push(edgeKey(edge));
        totalWeight += edge.weight;
        steps.push(step('加入边 ' + edge.from + '-' + edge.to + '，权值 ' + edge.weight, '', [], [], treeEdges));
      } else {
        steps.push(step('跳过成环边 ' + edge.from + '-' + edge.to, '', [], [], [edgeKey(edge)]));
      }
    });

    return { edges: treeEdges, totalWeight: totalWeight, steps: steps };
  }

  function dinicMaxFlow(graph, startId) {
    var g = normalizeGraph(Object.assign({}, graph, { directed: true }));
    var source = String(startId || 'S');
    var sink = g.nodeIds.includes('T') ? 'T' : g.nodeIds[g.nodeIds.length - 1];
    var index = Object.fromEntries(g.nodeIds.map(function (id, i) { return [id, i]; }));
    var network = g.nodeIds.map(function () { return []; });
    var level = [];
    var iter = [];
    var steps = [step('Dinic 源点 ' + source + '，汇点 ' + sink, source, [source], [], [], [43, 44])];

    function addFlowEdge(from, to, capacity, originalEdge) {
      var forward = { to: to, rev: network[to].length, cap: capacity, edge: originalEdge };
      var backward = { to: from, rev: network[from].length, cap: 0, edge: null };
      network[from].push(forward);
      network[to].push(backward);
    }

    g.edges.forEach(function (edge) {
      if (edge.weight > 0) addFlowEdge(index[edge.from], index[edge.to], edge.weight, edge);
    });

    function buildLevel() {
      level = g.nodeIds.map(function () { return -1; });
      var queue = [index[source]];
      level[index[source]] = 0;
      steps.push(step('BFS 建层次图', source, [source], [source], [], [13, 14, 15]));
      for (var head = 0; head < queue.length; head += 1) {
        var u = queue[head];
        network[u].forEach(function (edge) {
          if (edge.cap <= 0 || level[edge.to] !== -1) return;
          level[edge.to] = level[u] + 1;
          queue.push(edge.to);
          steps.push(step('层次边 ' + g.nodeIds[u] + ' -> ' + g.nodeIds[edge.to], g.nodeIds[edge.to], [g.nodeIds[u], g.nodeIds[edge.to]], queue.map(function (id) { return g.nodeIds[id]; }), edge.edge ? [edgeKey(edge.edge)] : [], [18, 19, 20]));
        });
      }
      return level[index[sink]] !== -1;
    }

    function pushFlow(u, flow) {
      if (u === index[sink]) return flow;
      for (; iter[u] < network[u].length; iter[u] += 1) {
        var edge = network[u][iter[u]];
        if (edge.cap <= 0 || level[edge.to] !== level[u] + 1) continue;
        var pushed = pushFlow(edge.to, Math.min(flow, edge.cap));
        if (!pushed) continue;
        edge.cap -= pushed;
        network[edge.to][edge.rev].cap += pushed;
        steps.push(step('沿 ' + g.nodeIds[u] + ' -> ' + g.nodeIds[edge.to] + ' 推流 ' + pushed, g.nodeIds[edge.to], [g.nodeIds[u], g.nodeIds[edge.to]], [], edge.edge ? [edgeKey(edge.edge)] : [], [31, 32, 33, 34]));
        return pushed;
      }
      return 0;
    }

    var maxFlow = 0;
    while (buildLevel()) {
      iter = g.nodeIds.map(function () { return 0; });
      var pushed = pushFlow(index[source], Number.POSITIVE_INFINITY);
      while (pushed) {
        maxFlow += pushed;
        steps.push(step('当前最大流 = ' + maxFlow, sink, [source, sink], [], [], [44, 45, 46, 47]));
        pushed = pushFlow(index[source], Number.POSITIVE_INFINITY);
      }
    }
    steps.push(step('汇点不可达，最大流 = ' + maxFlow, sink, [source, sink], [], [], [49, 50]));
    return { maxFlow: maxFlow, steps: steps };
  }

  function hopcroftKarp(graph) {
    var g = normalizeGraph(graph, true);
    var left = g.nodeIds.filter(function (id) { return /^L/.test(id); });
    var right = g.nodeIds.filter(function (id) { return /^R/.test(id); });
    if (!left.length || !right.length) {
      var half = Math.ceil(g.nodeIds.length / 2);
      left = g.nodeIds.slice(0, half);
      right = g.nodeIds.slice(half);
    }
    var matchLeft = {};
    var matchRight = {};
    var dist = {};
    var matchedEdges = [];
    var steps = [step('BFS 分层，寻找多条最短增广路', '', left, left, [], [18, 19, 20])];

    function buildLayers() {
      var queue = [];
      var found = false;
      left.forEach(function (u) {
        if (!matchLeft[u]) {
          dist[u] = 0;
          queue.push(u);
        } else {
          dist[u] = -1;
        }
      });
      for (var head = 0; head < queue.length; head += 1) {
        var u = queue[head];
        g.adjacency[u].forEach(function (next) {
          if (!right.includes(next.id)) return;
          var paired = matchRight[next.id];
          if (!paired) {
            found = true;
            steps.push(step('找到未匹配右点 ' + next.id, next.id, [u, next.id], queue, [edgeKey(next.edge)], [17, 18, 19]));
          } else if (dist[paired] === -1) {
            dist[paired] = dist[u] + 1;
            queue.push(paired);
          }
        });
      }
      return found;
    }

    function searchAugment(u) {
      var choices = g.adjacency[u].filter(function (next) { return right.includes(next.id); });
      for (var i = 0; i < choices.length; i += 1) {
        var next = choices[i];
        var paired = matchRight[next.id];
        if (paired && dist[paired] !== dist[u] + 1) continue;
        if (!paired || searchAugment(paired)) {
          matchLeft[u] = next.id;
          matchRight[next.id] = u;
          steps.push(step('增广匹配 ' + u + ' - ' + next.id, next.id, [u, next.id], [], [edgeKey(next.edge)], [29, 30, 31, 32]));
          return true;
        }
      }
      dist[u] = -1;
      return false;
    }

    while (buildLayers()) {
      left.forEach(function (u) {
        if (!matchLeft[u]) searchAugment(u);
      });
    }

    matchedEdges = Object.keys(matchLeft).map(function (u) {
      var v = matchLeft[u];
      var next = g.adjacency[u].find(function (item) { return item.id === v; });
      return next ? edgeKey(next.edge) : u + '->' + v;
    });
    steps.push(step('当前匹配数: ' + matchedEdges.length, '', Object.keys(matchLeft).concat(Object.keys(matchRight)), [], matchedEdges, [42, 43, 44]));
    return { matchingSize: matchedEdges.length, edges: matchedEdges, steps: steps };
  }

  function topologicalSort(graph) {
    var g = normalizeGraph(Object.assign({}, graph, { directed: true }));
    var indegree = Object.fromEntries(g.nodeIds.map(function (id) { return [id, 0]; }));
    g.edges.forEach(function (edge) { indegree[edge.to] += 1; });

    var queue = g.nodeIds.filter(function (id) { return indegree[id] === 0; }).sort();
    var order = [];
    var steps = [step('入度为 0 的节点入队', '', [], queue, [])];

    while (queue.length) {
      var current = queue.shift();
      order.push(current);
      steps.push(step('输出 ' + current, current, order, queue, []));
      g.adjacency[current].forEach(function (next) {
        indegree[next.id] -= 1;
        if (indegree[next.id] === 0) {
          queue.push(next.id);
          queue.sort();
          steps.push(step(next.id + ' 入度归零', next.id, order, queue, [edgeKey(next.edge)]));
        }
      });
    }

    var hasCycle = order.length !== g.nodeIds.length;
    if (hasCycle) steps.push(step('图中存在环，拓扑排序停止', '', order, [], []));
    return { order: order, hasCycle: hasCycle, steps: steps };
  }

  function connectedComponents(graph) {
    var g = normalizeGraph(graph, true);
    var seen = new Set();
    var components = [];
    var steps = [];

    g.nodeIds.forEach(function (id) {
      if (seen.has(id)) return;
      var component = [];
      var queue = [id];
      seen.add(id);

      while (queue.length) {
        var current = queue.shift();
        component.push(current);
        g.adjacency[current].forEach(function (next) {
          if (seen.has(next.id)) return;
          seen.add(next.id);
          queue.push(next.id);
        });
      }

      components.push(component);
      steps.push(step('找到连通分量: ' + component.join(', '), id, component, [], []));
    });

    return { components: components, steps: steps };
  }

  function bipartiteCheck(graph) {
    var g = normalizeGraph(graph, true);
    var colors = {};
    var isBipartite = true;
    var conflict = null;
    var steps = [];

    g.nodeIds.forEach(function (start) {
      if (colors[start] || !isBipartite) return;
      colors[start] = 1;
      var queue = [start];
      steps.push(step(start + ' 染为左侧颜色', start, [start], queue, []));

      while (queue.length && isBipartite) {
        var current = queue.shift();
        g.adjacency[current].forEach(function (next) {
          if (!isBipartite) return;
          if (!colors[next.id]) {
            colors[next.id] = -colors[current];
            queue.push(next.id);
            steps.push(step(next.id + ' 染为相反颜色', next.id, Object.keys(colors), queue, [edgeKey(next.edge)]));
          } else if (colors[next.id] === colors[current]) {
            isBipartite = false;
            conflict = [current, next.id];
            steps.push(step(current + ' 与 ' + next.id + ' 颜色冲突', current, Object.keys(colors), queue, [edgeKey(next.edge)]));
          }
        });
      }
    });

    return { isBipartite: isBipartite, colors: colors, conflict: conflict, steps: steps };
  }

  function treeDiameter(graph, startId) {
    var g = normalizeGraph(graph, true);
    function farthest(start) {
      var dist = {};
      var parent = {};
      var queue = [start];
      g.nodeIds.forEach(function (id) {
        dist[id] = Infinity;
        parent[id] = '';
      });
      dist[start] = 0;
      while (queue.length) {
        var current = queue.shift();
        g.adjacency[current].forEach(function (next) {
          if (dist[next.id] !== Infinity) return;
          dist[next.id] = dist[current] + 1;
          parent[next.id] = current;
          queue.push(next.id);
        });
      }
      var best = start;
      g.nodeIds.forEach(function (id) {
        if (dist[id] > dist[best]) best = id;
      });
      return { node: best, dist: dist, parent: parent };
    }

    var firstStart = String(startId || g.nodeIds[0] || '');
    if (!firstStart) return { endpoints: [], length: 0, steps: [] };
    var first = farthest(firstStart);
    var second = farthest(first.node);
    var path = [];
    var cursor = second.node;
    while (cursor) {
      path.push(cursor);
      if (cursor === first.node) break;
      cursor = second.parent[cursor];
    }
    path.reverse();
    var pathEdges = [];
    for (var i = 0; i + 1 < path.length; i++) {
      pathEdges.push(path[i] + '->' + path[i + 1]);
    }
    return {
      endpoints: [first.node, second.node],
      length: Math.max(0, path.length - 1),
      path: path,
      steps: [
        step('第一次 BFS，找到端点 ' + first.node, first.node, [firstStart, first.node], [], [], [12, 13, 14]),
        step('从 ' + first.node + ' 再 BFS，找到另一端 ' + second.node, second.node, [first.node, second.node], [], [], [15, 16, 17]),
        step('直径路径: ' + path.join(' - '), '', path, [], pathEdges, [18, 19, 20]),
      ],
    };
  }

  function lcaBinaryLifting(graph, startId) {
    var g = normalizeGraph(graph, true);
    var rootId = String(startId || g.nodeIds[0] || '');
    var depth = {};
    var parent = {};
    var steps = [];
    g.nodeIds.forEach(function (id) {
      depth[id] = -1;
      parent[id] = '';
    });
    if (!rootId) return { depth: depth, parent: parent, steps: steps };

    var queue = [rootId];
    depth[rootId] = 0;
    steps.push(step('以 ' + rootId + ' 为根，初始化深度', rootId, [rootId], queue, [], [17, 18]));
    while (queue.length) {
      var current = queue.shift();
      g.adjacency[current].forEach(function (next) {
        if (next.id === parent[current] || depth[next.id] !== -1) return;
        parent[next.id] = current;
        depth[next.id] = depth[current] + 1;
        queue.push(next.id);
        steps.push(step('设置 ' + next.id + ' 的父亲为 ' + current + '，深度 ' + depth[next.id], next.id, Object.keys(depth).filter(function (id) { return depth[id] >= 0; }), queue, [edgeKey(next.edge)], [19, 20, 21]));
      });
    }

    var nodes = g.nodeIds.slice().sort(function (a, b) { return depth[b] - depth[a]; });
    var queryA = nodes[0] || rootId;
    var queryB = nodes[1] || rootId;
    steps.push(step('示例查询 LCA(' + queryA + ', ' + queryB + ')，先把深度拉齐', queryA, [queryA, queryB], [], [], [33, 34, 35]));
    steps.push(step('同步上跳，直到两个点的父亲相同', queryB, [queryA, queryB], [], [], [36, 37, 38, 39]));
    return { depth: depth, parent: parent, query: [queryA, queryB], steps: steps };
  }

  function tarjanScc(graph) {
    var g = normalizeGraph(Object.assign({}, graph, { directed: true }));
    var index = 0;
    var dfn = {};
    var low = {};
    var inStack = {};
    var stack = [];
    var components = [];
    var steps = [];

    function dfsScc(id) {
      dfn[id] = low[id] = ++index;
      stack.push(id);
      inStack[id] = true;
      steps.push(step('访问 ' + id + '，压栈并记录 dfn/low', id, Object.keys(dfn), stack, [], [11, 12, 13]));
      g.adjacency[id].forEach(function (next) {
        if (!dfn[next.id]) {
          dfsScc(next.id);
          low[id] = Math.min(low[id], low[next.id]);
          steps.push(step('回到 ' + id + '，用子树 low 更新', id, Object.keys(dfn), stack, [edgeKey(next.edge)], [18, 19]));
        } else if (inStack[next.id]) {
          low[id] = Math.min(low[id], dfn[next.id]);
          steps.push(step(id + ' 通过返祖边更新 low', id, Object.keys(dfn), stack, [edgeKey(next.edge)], [20, 21]));
        }
      });
      if (low[id] === dfn[id]) {
        var component = [];
        var top = '';
        do {
          top = stack.pop();
          inStack[top] = false;
          component.push(top);
        } while (top !== id);
        components.push(component);
        steps.push(step('弹出强连通分量: ' + component.join(', '), id, component, stack, [], [24, 25, 26, 27, 28]));
      }
    }

    g.nodeIds.forEach(function (id) {
      if (!dfn[id]) dfsScc(id);
    });
    return { components: components, steps: steps };
  }

  function bridgeFinding(graph) {
    var g = normalizeGraph(graph, true);
    var index = 0;
    var dfn = {};
    var low = {};
    var bridges = [];
    var steps = [];

    function dfsBridge(id, parentId) {
      dfn[id] = low[id] = ++index;
      steps.push(step('访问 ' + id + '，记录 dfn/low', id, Object.keys(dfn), [], [], [10, 11]));
      g.adjacency[id].forEach(function (next) {
        if (next.id === parentId) return;
        if (!dfn[next.id]) {
          dfsBridge(next.id, id);
          low[id] = Math.min(low[id], low[next.id]);
          if (low[next.id] > dfn[id]) {
            bridges.push(edgeKey(next.edge));
            steps.push(step(id + '-' + next.id + ' 是桥', next.id, Object.keys(dfn), [], bridges, [17, 18, 19]));
          }
        } else {
          low[id] = Math.min(low[id], dfn[next.id]);
          steps.push(step(id + ' 遇到返祖边 ' + next.id, id, Object.keys(dfn), [], [edgeKey(next.edge)], [20, 21]));
        }
      });
    }

    g.nodeIds.forEach(function (id) {
      if (!dfn[id]) dfsBridge(id, '');
    });
    return { bridges: bridges, steps: steps };
  }

  function graphFrom(nodes, edges, directed) {
    return {
      directed: !!directed,
      nodes: nodes.map(function (node) {
        return { id: node[0], x: node[1], y: node[2] };
      }),
      edges: edges.map(function (edge, index) {
        return { id: 'E' + (index + 1), from: edge[0], to: edge[1], weight: edge[2] };
      }),
    };
  }

  function tpl(lines) {
    var width = lines.reduce(function (best, row) {
      return Math.max(best, row[0].length);
    }, 0);
    return lines.map(function (row) {
      if (!row[0]) return row[1] ? row[0].padEnd(width + 1) + '// ' + row[1] : '';
      return row[0].padEnd(width + 1) + '// ' + row[1];
    }).join('\n');
  }

  var catalog = {
    bfs: {
      title: 'BFS 广度优先搜索',
      intro: '队列分层扩展，是无权图最短路、网格搜索、状态最短步数的基本功。',
      preset: graphFrom(
        [['A', 150, 210], ['B', 310, 120], ['C', 320, 300], ['D', 500, 105], ['E', 520, 300], ['F', 700, 200]],
        [['A', 'B', 1], ['A', 'C', 1], ['B', 'D', 1], ['C', 'E', 1], ['D', 'F', 1], ['E', 'F', 1]],
        false
      ),
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        '',
        'vector<int> bfsShortestDistance(const vector<vector<int>>& adjacencyList, int sourceVertex) {',
        '    int vertexCount = (int)adjacencyList.size();',
        '    vector<int> distance(vertexCount, -1);',
        '    queue<int> pendingVertices;',
        '    distance[sourceVertex] = 0;',
        '    pendingVertices.push(sourceVertex);',
        '    while (!pendingVertices.empty()) {',
        '        int currentVertex = pendingVertices.front();',
        '        pendingVertices.pop();',
        '        for (int nextVertex : adjacencyList[currentVertex]) {',
        '            if (distance[nextVertex] != -1) continue;',
        '            distance[nextVertex] = distance[currentVertex] + 1;',
        '            pendingVertices.push(nextVertex);',
        '        }',
        '    }',
        '    return distance;',
        '}',
      ].join('\n'),
      defaultLines: [10, 11, 12],
    },
    dfs: {
      title: 'DFS 深度优先搜索',
      intro: '递归深入并回溯，是树、图连通性、搜索剪枝和 Tarjan 类算法的基础。',
      preset: graphFrom(
        [['A', 165, 120], ['B', 330, 95], ['C', 505, 110], ['D', 315, 285], ['E', 500, 310], ['F', 690, 240]],
        [['A', 'B', 1], ['B', 'C', 1], ['B', 'D', 1], ['D', 'E', 1], ['E', 'F', 1], ['C', 'F', 1]],
        false
      ),
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        '',
        'void depthFirstSearch(int currentVertex, const vector<vector<int>>& adjacencyList, vector<int>& visited) {',
        '    visited[currentVertex] = 1;',
        '    for (int nextVertex : adjacencyList[currentVertex]) {',
        '        if (visited[nextVertex]) continue;',
        '        depthFirstSearch(nextVertex, adjacencyList, visited);',
        '    }',
        '}',
      ].join('\n'),
      defaultLines: [4, 5, 6, 7, 8],
    },
    dijkstra: {
      title: 'Dijkstra 最短路',
      intro: '适用于非负边权。堆优化写法是 ICPC 最常用版本，复杂度 O((n+m)logn)。',
      preset: graphFrom(
        [['S', 120, 260], ['A', 300, 130], ['B', 310, 360], ['C', 520, 150], ['D', 535, 340], ['T', 735, 250]],
        [['S', 'A', 4], ['S', 'B', 2], ['A', 'C', 5], ['A', 'B', 1], ['B', 'D', 7], ['B', 'C', 8], ['C', 'T', 3], ['D', 'T', 1]],
        false
      ),
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'const long long INF = (1LL << 60);',
        '',
        'vector<long long> dijkstraShortestPath(int vertexCount, const vector<vector<pair<int,int>>>& adjacencyList, int sourceVertex) {',
        '    vector<long long> distance(vertexCount, INF);',
        '    priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<pair<long long,int>>> minHeap;',
        '    distance[sourceVertex] = 0;',
        '    minHeap.push({0, sourceVertex});',
        '    while (!minHeap.empty()) {',
        '        auto [currentDistance, currentVertex] = minHeap.top();',
        '        minHeap.pop();',
        '        if (currentDistance != distance[currentVertex]) continue;',
        '        for (auto [nextVertex, edgeWeight] : adjacencyList[currentVertex]) {',
        '            long long candidateDistance = currentDistance + edgeWeight;',
        '            if (candidateDistance >= distance[nextVertex]) continue;',
        '            distance[nextVertex] = candidateDistance;',
        '            minHeap.push({candidateDistance, nextVertex});',
        '        }',
        '    }',
        '    return distance;',
        '}',
      ].join('\n'),
      defaultLines: [10, 11, 12, 14, 15, 16, 17, 18],
    },
    bellmanFord: {
      title: 'Bellman-Ford 最短路',
      intro: '允许负边，重复松弛 n-1 轮；第 n 轮仍可松弛说明存在负环。',
      preset: graphFrom(
        [['S', 120, 255], ['A', 300, 120], ['B', 315, 360], ['C', 520, 135], ['D', 535, 350], ['T', 735, 255]],
        [['S', 'A', 6], ['S', 'B', 7], ['A', 'C', 5], ['A', 'B', 8], ['B', 'C', -3], ['B', 'D', 9], ['C', 'T', 2], ['D', 'T', -2]],
        true
      ),
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'const long long INF = (1LL << 60);',
        'struct DirectedEdge { int fromVertex, toVertex, weight; };',
        '',
        'bool bellmanFord(int vertexCount, int sourceVertex, const vector<DirectedEdge>& edges, vector<long long>& distance) {',
        '    distance.assign(vertexCount, INF);',
        '    distance[sourceVertex] = 0;',
        '    for (int round = 1; round <= vertexCount - 1; ++round) {',
        '        bool relaxedInThisRound = false;',
        '        for (const DirectedEdge& edge : edges) {',
        '            if (distance[edge.fromVertex] == INF) continue;',
        '            long long candidateDistance = distance[edge.fromVertex] + edge.weight;',
        '            if (candidateDistance < distance[edge.toVertex]) {',
        '                distance[edge.toVertex] = candidateDistance;',
        '                relaxedInThisRound = true;',
        '            }',
        '        }',
        '        if (!relaxedInThisRound) break;',
        '    }',
        '    for (const DirectedEdge& edge : edges) {',
        '        if (distance[edge.fromVertex] != INF && distance[edge.fromVertex] + edge.weight < distance[edge.toVertex]) return false;',
        '    }',
        '    return true;',
        '}',
      ].join('\n'),
      defaultLines: [9, 10, 11, 12, 13, 14, 15],
    },
    floydWarshall: {
      title: 'Floyd-Warshall 多源最短路',
      intro: '经典三重循环。允许负权边，但不能有负环；常用于点数较小的全源最短路和传递闭包变形。',
      preset: graphFrom(
        [['A', 170, 150], ['B', 410, 100], ['C', 650, 160], ['D', 560, 360], ['E', 280, 360]],
        [['A', 'B', 3], ['A', 'C', 8], ['B', 'D', 1], ['D', 'C', 2], ['C', 'E', -4], ['E', 'B', 2], ['A', 'E', 7]],
        true
      ),
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'const long long INF = (1LL << 60);',
        '',
        'void floydWarshall(vector<vector<long long>>& shortestDistance) {',
        '    int vertexCount = (int)shortestDistance.size();',
        '    for (int middleVertex = 0; middleVertex < vertexCount; ++middleVertex) {',
        '        for (int fromVertex = 0; fromVertex < vertexCount; ++fromVertex) {',
        '            if (shortestDistance[fromVertex][middleVertex] == INF) continue;',
        '            for (int toVertex = 0; toVertex < vertexCount; ++toVertex) {',
        '                if (shortestDistance[middleVertex][toVertex] == INF) continue;',
        '                shortestDistance[fromVertex][toVertex] = min(',
        '                    shortestDistance[fromVertex][toVertex],',
        '                    shortestDistance[fromVertex][middleVertex] + shortestDistance[middleVertex][toVertex]',
        '                );',
        '            }',
        '        }',
        '    }',
        '}',
      ].join('\n'),
      defaultLines: [7, 8, 10, 12, 13, 14],
    },
    prim: {
      title: 'Prim 最小生成树',
      intro: 'MST 不在二叉树上求，而是在带权无向连通图上求；输出结果才是一棵树。这里用经典稠密小图演示。',
      preset: graphFrom(
        [['A', 170, 130], ['B', 390, 90], ['C', 625, 140], ['D', 250, 360], ['E', 515, 360], ['F', 740, 280]],
        [['A', 'B', 4], ['A', 'D', 2], ['B', 'C', 6], ['B', 'D', 3], ['B', 'E', 5], ['C', 'E', 1], ['C', 'F', 7], ['D', 'E', 4], ['E', 'F', 2]],
        false
      ),
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'using WeightedEdge = pair<int,int>; // {weight, vertex}',
        '',
        'long long primMinimumSpanningTree(int vertexCount, const vector<vector<WeightedEdge>>& adjacencyList) {',
        '    vector<int> used(vertexCount, 0);',
        '    priority_queue<WeightedEdge, vector<WeightedEdge>, greater<WeightedEdge>> minHeap;',
        '    minHeap.push({0, 0});',
        '    long long totalWeight = 0;',
        '    int selectedCount = 0;',
        '    while (!minHeap.empty() && selectedCount < vertexCount) {',
        '        auto [edgeWeight, currentVertex] = minHeap.top();',
        '        minHeap.pop();',
        '        if (used[currentVertex]) continue;',
        '        used[currentVertex] = 1;',
        '        totalWeight += edgeWeight;',
        '        ++selectedCount;',
        '        for (auto [nextWeight, nextVertex] : adjacencyList[currentVertex]) {',
        '            if (!used[nextVertex]) minHeap.push({nextWeight, nextVertex});',
        '        }',
        '    }',
        '    return selectedCount == vertexCount ? totalWeight : -1;',
        '}',
      ].join('\n'),
      defaultLines: [11, 12, 13, 14, 15, 18, 19],
    },
    kruskal: {
      title: 'Kruskal 最小生成树',
      intro: '按边权排序，用并查集维护连通块；跳过成环边，加入安全边。',
      preset: graphFrom(
        [['A', 150, 160], ['B', 350, 95], ['C', 590, 125], ['D', 230, 355], ['E', 510, 360], ['F', 725, 260]],
        [['A', 'B', 8], ['A', 'D', 3], ['B', 'D', 2], ['B', 'C', 4], ['B', 'E', 6], ['C', 'E', 5], ['C', 'F', 7], ['D', 'E', 1], ['E', 'F', 9]],
        false
      ),
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'struct Edge { int fromVertex, toVertex, weight; };',
        '',
        'struct DisjointSetUnion {',
        '    vector<int> parent, componentSize;',
        '    DisjointSetUnion(int n) : parent(n), componentSize(n, 1) { iota(parent.begin(), parent.end(), 0); }',
        '    int findRoot(int vertex) { return parent[vertex] == vertex ? vertex : parent[vertex] = findRoot(parent[vertex]); }',
        '    bool unite(int leftVertex, int rightVertex) {',
        '        int leftRoot = findRoot(leftVertex), rightRoot = findRoot(rightVertex);',
        '        if (leftRoot == rightRoot) return false;',
        '        if (componentSize[leftRoot] < componentSize[rightRoot]) swap(leftRoot, rightRoot);',
        '        parent[rightRoot] = leftRoot;',
        '        componentSize[leftRoot] += componentSize[rightRoot];',
        '        return true;',
        '    }',
        '};',
        '',
        'long long kruskalMinimumSpanningTree(int vertexCount, vector<Edge> edges) {',
        '    sort(edges.begin(), edges.end(), [](const Edge& a, const Edge& b) { return a.weight < b.weight; });',
        '    DisjointSetUnion dsu(vertexCount);',
        '    long long totalWeight = 0;',
        '    int selectedEdges = 0;',
        '    for (const Edge& edge : edges) {',
        '        if (!dsu.unite(edge.fromVertex, edge.toVertex)) continue;',
        '        totalWeight += edge.weight;',
        '        ++selectedEdges;',
        '    }',
        '    return selectedEdges == vertexCount - 1 ? totalWeight : -1;',
        '}',
      ].join('\n'),
      defaultLines: [20, 21, 24, 25, 26, 27],
    },
    treeDiameter: {
      title: '树的直径',
      intro: '两次 BFS/DFS：从任意点找最远点 u，再从 u 找最远点 v，u-v 就是树的直径。',
      preset: graphFrom(
        [['1', 455, 80], ['2', 300, 165], ['3', 610, 165], ['4', 205, 285], ['5', 380, 285], ['6', 545, 285], ['7', 705, 285], ['8', 145, 405], ['9', 260, 405]],
        [['1', '2', 1], ['1', '3', 1], ['2', '4', 1], ['2', '5', 1], ['3', '6', 1], ['3', '7', 1], ['4', '8', 1], ['4', '9', 1]],
        false
      ),
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        '',
        'pair<int, vector<int>> farthestVertex(int startVertex, const vector<vector<int>>& tree) {',
        '    vector<int> distance(tree.size(), -1);',
        '    queue<int> pendingVertices;',
        '    distance[startVertex] = 0;',
        '    pendingVertices.push(startVertex);',
        '    while (!pendingVertices.empty()) {',
        '        int currentVertex = pendingVertices.front();',
        '        pendingVertices.pop();',
        '        for (int nextVertex : tree[currentVertex]) if (distance[nextVertex] == -1) {',
        '            distance[nextVertex] = distance[currentVertex] + 1;',
        '            pendingVertices.push(nextVertex);',
        '        }',
        '    }',
        '    int bestVertex = max_element(distance.begin(), distance.end()) - distance.begin();',
        '    return {bestVertex, distance};',
        '}',
        '',
        'int treeDiameterLength(const vector<vector<int>>& tree) {',
        '    auto [firstEndpoint, ignored] = farthestVertex(0, tree);',
        '    auto [secondEndpoint, distanceFromFirstEndpoint] = farthestVertex(firstEndpoint, tree);',
        '    return distanceFromFirstEndpoint[secondEndpoint];',
        '}',
      ].join('\n'),
      defaultLines: [22, 23, 24],
    },
    lcaBinaryLifting: {
      title: 'LCA 倍增',
      intro: '树上最近公共祖先。预处理 up[v][k]，查询时先拉齐深度，再一起向上跳。',
      preset: graphFrom(
        [['1', 460, 70], ['2', 280, 165], ['3', 635, 165], ['4', 170, 285], ['5', 370, 285], ['6', 565, 285], ['7', 735, 285], ['8', 325, 405], ['9', 420, 405]],
        [['1', '2', 1], ['1', '3', 1], ['2', '4', 1], ['2', '5', 1], ['3', '6', 1], ['3', '7', 1], ['5', '8', 1], ['5', '9', 1]],
        false
      ),
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        'const int LOG = 20;',
        '',
        'struct BinaryLiftingLca {',
        '    vector<array<int, LOG>> ancestor;',
        '    vector<int> depth;',
        '    vector<vector<int>> tree;',
        '',
        '    BinaryLiftingLca(const vector<vector<int>>& inputTree, int rootVertex) : tree(inputTree) {',
        '        int vertexCount = (int)tree.size();',
        '        ancestor.assign(vertexCount, {});',
        '        depth.assign(vertexCount, 0);',
        '        build(rootVertex, rootVertex);',
        '    }',
        '',
        '    void build(int currentVertex, int parentVertex) {',
        '        ancestor[currentVertex][0] = parentVertex;',
        '        for (int level = 1; level < LOG; ++level) ancestor[currentVertex][level] = ancestor[ancestor[currentVertex][level - 1]][level - 1];',
        '        for (int nextVertex : tree[currentVertex]) if (nextVertex != parentVertex) {',
        '            depth[nextVertex] = depth[currentVertex] + 1;',
        '            build(nextVertex, currentVertex);',
        '        }',
        '    }',
        '',
        '    int kthAncestor(int vertex, int jumpLength) const {',
        '        for (int level = 0; level < LOG; ++level) if (jumpLength >> level & 1) vertex = ancestor[vertex][level];',
        '        return vertex;',
        '    }',
        '',
        '    int lca(int leftVertex, int rightVertex) const {',
        '        if (depth[leftVertex] < depth[rightVertex]) swap(leftVertex, rightVertex);',
        '        leftVertex = kthAncestor(leftVertex, depth[leftVertex] - depth[rightVertex]);',
        '        if (leftVertex == rightVertex) return leftVertex;',
        '        for (int level = LOG - 1; level >= 0; --level) {',
        '            if (ancestor[leftVertex][level] == ancestor[rightVertex][level]) continue;',
        '            leftVertex = ancestor[leftVertex][level];',
        '            rightVertex = ancestor[rightVertex][level];',
        '        }',
        '        return ancestor[leftVertex][0];',
        '    }',
        '};',
      ].join('\n'),
      defaultLines: [17, 18, 19, 20, 21, 22],
    },
    tarjanScc: {
      title: 'Tarjan 强连通分量',
      intro: '有向图 DFS 维护 dfn/low 和栈。low[u] == dfn[u] 时弹出一个 SCC。',
      preset: graphFrom(
        [['A', 160, 190], ['B', 350, 105], ['C', 545, 190], ['D', 350, 345], ['E', 710, 135], ['F', 720, 345]],
        [['A', 'B', 1], ['B', 'C', 1], ['C', 'A', 1], ['B', 'D', 1], ['D', 'B', 1], ['C', 'E', 1], ['E', 'F', 1], ['F', 'E', 1]],
        true
      ),
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        '',
        'struct TarjanScc {',
        '    vector<vector<int>> adjacencyList, components;',
        '    vector<int> discoveryTime, lowLink, inStack, vertexStack;',
        '    int timer = 0;',
        '',
        '    void depthFirstSearch(int currentVertex) {',
        '        discoveryTime[currentVertex] = lowLink[currentVertex] = ++timer;',
        '        vertexStack.push_back(currentVertex);',
        '        inStack[currentVertex] = 1;',
        '        for (int nextVertex : adjacencyList[currentVertex]) {',
        '            if (!discoveryTime[nextVertex]) {',
        '                depthFirstSearch(nextVertex);',
        '                lowLink[currentVertex] = min(lowLink[currentVertex], lowLink[nextVertex]);',
        '            } else if (inStack[nextVertex]) {',
        '                lowLink[currentVertex] = min(lowLink[currentVertex], discoveryTime[nextVertex]);',
        '            }',
        '        }',
        '        if (lowLink[currentVertex] == discoveryTime[currentVertex]) {',
        '            vector<int> component;',
        '            while (true) {',
        '                int vertex = vertexStack.back(); vertexStack.pop_back();',
        '                inStack[vertex] = 0;',
        '                component.push_back(vertex);',
        '                if (vertex == currentVertex) break;',
        '            }',
        '            components.push_back(component);',
        '        }',
        '    }',
        '};',
      ].join('\n'),
      defaultLines: [9, 10, 11, 12, 13, 14, 15, 16],
    },
    bridgeFinding: {
      title: '割边 / 桥',
      intro: '无向图 DFS。若 low[v] > dfn[u]，说明 v 子树不能绕回 u 或祖先，边 u-v 是桥。',
      preset: graphFrom(
        [['A', 150, 185], ['B', 325, 120], ['C', 505, 185], ['D', 325, 315], ['E', 650, 145], ['F', 750, 310]],
        [['A', 'B', 1], ['B', 'C', 1], ['C', 'D', 1], ['D', 'A', 1], ['B', 'D', 1], ['C', 'E', 1], ['E', 'F', 1]],
        false
      ),
      code: [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        '',
        'void findBridgesDfs(int currentVertex, int parentVertex, const vector<vector<int>>& adjacencyList,',
        '                    vector<int>& discoveryTime, vector<int>& lowLink, int& timer, vector<pair<int,int>>& bridges) {',
        '    discoveryTime[currentVertex] = lowLink[currentVertex] = ++timer;',
        '    for (int nextVertex : adjacencyList[currentVertex]) {',
        '        if (nextVertex == parentVertex) continue;',
        '        if (!discoveryTime[nextVertex]) {',
        '            findBridgesDfs(nextVertex, currentVertex, adjacencyList, discoveryTime, lowLink, timer, bridges);',
        '            lowLink[currentVertex] = min(lowLink[currentVertex], lowLink[nextVertex]);',
        '            if (lowLink[nextVertex] > discoveryTime[currentVertex]) bridges.push_back({currentVertex, nextVertex});',
        '        } else {',
        '            lowLink[currentVertex] = min(lowLink[currentVertex], discoveryTime[nextVertex]);',
        '        }',
        '    }',
        '}',
      ].join('\n'),
      defaultLines: [6, 7, 9, 10, 11, 12],
    },
  };

  catalog.topologicalSort = {
    title: '拓扑排序',
    intro: 'Kahn 算法不断取入度为 0 的点。可用于课程依赖、任务调度、DAG DP。',
    preset: graphFrom(
      [['A', 135, 255], ['B', 300, 125], ['C', 305, 360], ['D', 500, 140], ['E', 515, 350], ['F', 710, 245]],
      [['A', 'B', 1], ['A', 'C', 1], ['B', 'D', 1], ['C', 'D', 1], ['C', 'E', 1], ['D', 'F', 1], ['E', 'F', 1]],
      true
    ),
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      '',
      'vector<int> topologicalOrder(int vertexCount, const vector<vector<int>>& adjacencyList) {',
      '    vector<int> indegree(vertexCount, 0);',
      '    for (int vertex = 0; vertex < vertexCount; ++vertex) for (int nextVertex : adjacencyList[vertex]) ++indegree[nextVertex];',
      '    queue<int> zeroIndegreeVertices;',
      '    for (int vertex = 0; vertex < vertexCount; ++vertex) if (indegree[vertex] == 0) zeroIndegreeVertices.push(vertex);',
      '    vector<int> order;',
      '    while (!zeroIndegreeVertices.empty()) {',
      '        int currentVertex = zeroIndegreeVertices.front(); zeroIndegreeVertices.pop();',
      '        order.push_back(currentVertex);',
      '        for (int nextVertex : adjacencyList[currentVertex]) {',
      '            if (--indegree[nextVertex] == 0) zeroIndegreeVertices.push(nextVertex);',
      '        }',
      '    }',
      '    return order;',
      '}',
    ].join('\n'),
    defaultLines: [5, 6, 7, 8, 10, 11, 12, 13, 14],
  };

  catalog.zeroOneBfs = {
    title: '0-1 BFS',
    intro: '边权只有 0 或 1 时，用双端队列代替堆，0 边放队首，1 边放队尾。',
    preset: graphFrom(
      [['S', 120, 255], ['A', 300, 140], ['B', 310, 360], ['C', 520, 150], ['D', 535, 345], ['T', 735, 250]],
      [['S', 'A', 0], ['S', 'B', 1], ['A', 'C', 1], ['A', 'B', 0], ['B', 'D', 1], ['C', 'T', 0], ['D', 'T', 1]],
      true
    ),
    code: '',
    defaultLines: [9, 10, 11, 12],
  };

  catalog.spfa = {
    title: 'SPFA 队列优化最短路',
    intro: 'Bellman-Ford 的队列优化写法，能处理负边；竞赛中要警惕被卡，适合负边图与差分约束教学。',
    preset: graphFrom(
      [['S', 120, 255], ['A', 300, 120], ['B', 315, 360], ['C', 520, 135], ['D', 535, 350], ['T', 735, 255]],
      [['S', 'A', 2], ['S', 'B', 7], ['A', 'C', 4], ['B', 'C', -2], ['C', 'D', 3], ['D', 'T', -1], ['B', 'T', 8]],
      true
    ),
    code: '',
    defaultLines: [12, 13, 14, 15, 16],
  };

  catalog.dinicMaxFlow = {
    title: 'Dinic 最大流',
    intro: 'BFS 建层次图，DFS 在层次图上找阻塞流。网络流金牌训练必会。',
    preset: graphFrom(
      [['S', 110, 260], ['A', 285, 130], ['B', 285, 380], ['C', 535, 130], ['D', 535, 380], ['T', 740, 260]],
      [['S', 'A', 10], ['S', 'B', 8], ['A', 'C', 5], ['A', 'D', 4], ['B', 'C', 3], ['B', 'D', 9], ['C', 'T', 7], ['D', 'T', 10], ['C', 'D', 2]],
      true
    ),
    code: '',
    defaultLines: [28, 29, 30, 39, 40, 41],
  };

  catalog.hopcroftKarp = {
    title: 'Hopcroft-Karp 二分图匹配',
    intro: '二分图最大匹配的标准高效算法，BFS 分层 + DFS 批量找最短增广路。',
    preset: graphFrom(
      [['L1', 160, 110], ['L2', 160, 240], ['L3', 160, 370], ['R1', 610, 105], ['R2', 610, 240], ['R3', 610, 375]],
      [['L1', 'R1', 1], ['L1', 'R2', 1], ['L2', 'R1', 1], ['L2', 'R3', 1], ['L3', 'R2', 1], ['L3', 'R3', 1]],
      false
    ),
    code: '',
    defaultLines: [18, 19, 20, 31, 32, 33],
  };

  catalog.connectedComponents = {
    title: '连通分量',
    intro: '对每个未访问点启动 DFS/BFS，把无向图分成若干互不连通的块。',
    preset: graphFrom(
      [['A', 150, 150], ['B', 300, 115], ['C', 265, 285], ['D', 525, 145], ['E', 690, 145], ['F', 610, 320], ['X', 780, 370]],
      [['A', 'B', 1], ['B', 'C', 1], ['C', 'A', 1], ['D', 'E', 1], ['E', 'F', 1]],
      false
    ),
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      '',
      'void collectComponent(int currentVertex, const vector<vector<int>>& adjacencyList, vector<int>& visited, vector<int>& component) {',
      '    visited[currentVertex] = 1;',
      '    component.push_back(currentVertex);',
      '    for (int nextVertex : adjacencyList[currentVertex]) {',
      '        if (!visited[nextVertex]) collectComponent(nextVertex, adjacencyList, visited, component);',
      '    }',
      '}',
      '',
      'vector<vector<int>> connectedComponents(const vector<vector<int>>& adjacencyList) {',
      '    vector<int> visited(adjacencyList.size(), 0);',
      '    vector<vector<int>> components;',
      '    for (int vertex = 0; vertex < (int)adjacencyList.size(); ++vertex) {',
      '        if (visited[vertex]) continue;',
      '        vector<int> component;',
      '        collectComponent(vertex, adjacencyList, visited, component);',
      '        components.push_back(component);',
      '    }',
      '    return components;',
      '}',
    ].join('\n'),
    defaultLines: [15, 16, 17, 18, 19],
  };

  catalog.bipartiteCheck = {
    title: '二分图判定',
    intro: '用 BFS/DFS 二染色。若发现一条边连接同色点，则不是二分图。',
    preset: graphFrom(
      [['A', 170, 145], ['B', 170, 340], ['C', 420, 120], ['D', 420, 360], ['E', 670, 165], ['F', 670, 330]],
      [['A', 'C', 1], ['A', 'D', 1], ['B', 'C', 1], ['B', 'D', 1], ['C', 'F', 1], ['D', 'E', 1], ['E', 'F', 1]],
      false
    ),
    code: [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      '',
      'bool isBipartiteGraph(const vector<vector<int>>& adjacencyList) {',
      '    vector<int> color(adjacencyList.size(), -1);',
      '    for (int sourceVertex = 0; sourceVertex < (int)adjacencyList.size(); ++sourceVertex) {',
      '        if (color[sourceVertex] != -1) continue;',
      '        queue<int> pendingVertices;',
      '        color[sourceVertex] = 0;',
      '        pendingVertices.push(sourceVertex);',
      '        while (!pendingVertices.empty()) {',
      '            int currentVertex = pendingVertices.front(); pendingVertices.pop();',
      '            for (int nextVertex : adjacencyList[currentVertex]) {',
      '                if (color[nextVertex] == -1) {',
      '                    color[nextVertex] = color[currentVertex] ^ 1;',
      '                    pendingVertices.push(nextVertex);',
      '                } else if (color[nextVertex] == color[currentVertex]) return false;',
      '            }',
      '        }',
      '    }',
      '    return true;',
      '}',
    ].join('\n'),
    defaultLines: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
  };

  function setTemplate(name, lines, activeLines) {
    catalog[name].code = tpl(lines);
    catalog[name].defaultLines = activeLines;
  }

  setTemplate('bfs', [
    ['#include <bits/stdc++.h>', '万能头文件，赛场常用'],
    ['using namespace std;', '省去 std:: 前缀'],
    ['', ''],
    ['vector<int> bfs(const vector<vector<int>>& g, int src) {', 'g 是邻接表，src 是起点'],
    ['    int n = (int)g.size();', 'n 是点数'],
    ['    vector<int> dist(n, -1);', 'dist[x] 是 src 到 x 的最短边数，-1 表示未到达'],
    ['    queue<int> que;', 'que 是 BFS 队列'],
    ['    dist[src] = 0;', '起点距离为 0'],
    ['    que.push(src);', '起点入队'],
    ['    while (!que.empty()) {', '队列不空就继续扩展'],
    ['        int u = que.front();', 'u 是当前队首节点'],
    ['        que.pop();', '弹出当前节点'],
    ['        for (int v : g[u]) {', 'v 是 u 的每个邻点'],
    ['            if (dist[v] != -1) continue;', '已经访问过就跳过'],
    ['            dist[v] = dist[u] + 1;', '第一次到达 v，得到最短距离'],
    ['            que.push(v);', 'v 入队等待继续扩展'],
    ['        }', '结束扫描 u 的邻点'],
    ['    }', 'BFS 结束'],
    ['    return dist;', '返回所有点距离'],
    ['}', '函数结束'],
  ], [10, 11, 12, 13, 14, 15, 16]);

  setTemplate('zeroOneBfs', [
    ['#include <bits/stdc++.h>', '万能头文件，赛场常用'],
    ['using namespace std;', '省去 std:: 前缀'],
    ['const int INF = 1e9;', 'INF 表示不可达距离'],
    ['', ''],
    ['vector<int> zeroOneBfs(const vector<vector<pair<int,int>>>& g, int src) {', 'g[u] 存 {v,w}，w 只能是 0 或 1'],
    ['    int n = (int)g.size();', 'n 是点数'],
    ['    vector<int> dist(n, INF);', 'dist[x] 是 src 到 x 的最短距离'],
    ['    deque<int> deq;', 'deq 是双端队列'],
    ['    dist[src] = 0;', '起点距离为 0'],
    ['    deq.push_front(src);', '起点放到队首'],
    ['    while (!deq.empty()) {', '双端队列不空就继续'],
    ['        int u = deq.front();', 'u 是当前最近的点'],
    ['        deq.pop_front();', '弹出当前点'],
    ['        for (auto [v, w] : g[u]) {', 'v 是邻点，w 是 0/1 边权'],
    ['            if (dist[u] + w >= dist[v]) continue;', '不能变短就跳过'],
    ['            dist[v] = dist[u] + w;', '更新 v 的最短距离'],
    ['            if (w == 0) deq.push_front(v);', '0 边优先，放队首'],
    ['            else deq.push_back(v);', '1 边稍后处理，放队尾'],
    ['        }', '结束扫描 u 的邻边'],
    ['    }', '算法结束'],
    ['    return dist;', '返回最短距离'],
    ['}', '函数结束'],
  ], [10, 11, 12, 13, 14, 15, 16, 17, 18]);

  setTemplate('dfs', [
    ['#include <bits/stdc++.h>', '万能头文件，赛场常用'],
    ['using namespace std;', '省去 std:: 前缀'],
    ['', ''],
    ['void dfs(int u, const vector<vector<int>>& g, vector<int>& vis) {', 'u 是当前点，g 是邻接表，vis 记录访问状态'],
    ['    vis[u] = 1;', '标记 u 已访问'],
    ['    for (int v : g[u]) {', '枚举 u 的邻点 v'],
    ['        if (vis[v]) continue;', '访问过就不再递归'],
    ['        dfs(v, g, vis);', '递归进入 v'],
    ['    }', '邻点扫描结束'],
    ['}', '函数结束'],
  ], [4, 5, 6, 7, 8]);

  setTemplate('dijkstra', [
    ['#include <bits/stdc++.h>', '万能头文件，赛场常用'],
    ['using namespace std;', '省去 std:: 前缀'],
    ['const long long INF = (1LL << 60);', 'INF 表示不可达距离'],
    ['', ''],
    ['vector<long long> dijkstra(const vector<vector<pair<int,int>>>& g, int src) {', 'g[u] 存 {v,w}，src 是起点'],
    ['    int n = (int)g.size();', 'n 是点数'],
    ['    vector<long long> dist(n, INF);', 'dist[x] 是 src 到 x 的最短路'],
    ['    priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<pair<long long,int>>> pq;', 'pq 存 {距离, 点} 的小根堆'],
    ['    dist[src] = 0;', '起点距离为 0'],
    ['    pq.push({0, src});', '起点入堆'],
    ['    while (!pq.empty()) {', '堆不空就继续取最近点'],
    ['        auto [du, u] = pq.top();', 'du 是堆中距离，u 是当前点'],
    ['        pq.pop();', '弹出堆顶'],
    ['        if (du != dist[u]) continue;', '旧状态直接丢弃'],
    ['        for (auto [v, w] : g[u]) {', '枚举 u 到 v 的边权 w'],
    ['            if (du + w >= dist[v]) continue;', '不能松弛就跳过'],
    ['            dist[v] = du + w;', '更新 v 的最短路'],
    ['            pq.push({dist[v], v});', '新状态入堆'],
    ['        }', '结束扫描 u 的出边'],
    ['    }', '算法结束'],
    ['    return dist;', '返回最短路数组'],
    ['}', '函数结束'],
  ], [10, 11, 12, 13, 14, 15, 16, 17, 18]);

  setTemplate('spfa', [
    ['#include <bits/stdc++.h>', '万能头文件，赛场常用'],
    ['using namespace std;', '省去 std:: 前缀'],
    ['const long long INF = (1LL << 60);', 'INF 表示不可达距离'],
    ['', ''],
    ['bool spfa(const vector<vector<pair<int,int>>>& g, int src, vector<long long>& dist) {', 'g[u] 存 {v,w}，dist 返回最短路'],
    ['    int n = (int)g.size();', 'n 是点数'],
    ['    vector<int> inq(n, 0), cnt(n, 0);', 'inq 表示是否在队中，cnt 记录入队次数'],
    ['    queue<int> que;', 'que 是待松弛队列'],
    ['    dist.assign(n, INF);', '初始化所有距离为 INF'],
    ['    dist[src] = 0;', '起点距离为 0'],
    ['    que.push(src); inq[src] = 1;', '起点入队并标记'],
    ['    while (!que.empty()) {', '队列不空就继续'],
    ['        int u = que.front(); que.pop();', '取出当前点 u'],
    ['        inq[u] = 0;', 'u 已离队'],
    ['        for (auto [v, w] : g[u]) {', '枚举 u 到 v 的边权 w'],
    ['            if (dist[u] + w >= dist[v]) continue;', '不能变短就跳过'],
    ['            dist[v] = dist[u] + w;', '松弛 v'],
    ['            if (!inq[v]) {', 'v 不在队中才入队'],
    ['                que.push(v); inq[v] = 1;', 'v 入队并标记'],
    ['                if (++cnt[v] >= n) return false;', '入队过多说明有负环'],
    ['            }', '入队逻辑结束'],
    ['        }', '结束扫描 u 的出边'],
    ['    }', '算法结束'],
    ['    return true;', 'true 表示没有负环'],
    ['}', '函数结束'],
  ], [12, 13, 14, 15, 16, 17, 18, 19, 20]);

  setTemplate('bellmanFord', [
    ['#include <bits/stdc++.h>', '万能头文件，赛场常用'],
    ['using namespace std;', '省去 std:: 前缀'],
    ['const long long INF = (1LL << 60);', 'INF 表示不可达距离'],
    ['struct Edge { int u, v, w; };', 'u 到 v 的边，权值为 w'],
    ['', ''],
    ['bool bellmanFord(int n, int src, const vector<Edge>& edges, vector<long long>& dist) {', 'n 是点数，src 是起点'],
    ['    dist.assign(n, INF);', '初始化距离'],
    ['    dist[src] = 0;', '起点距离为 0'],
    ['    for (int round = 1; round <= n - 1; ++round) {', '最多松弛 n-1 轮'],
    ['        bool changed = false;', '记录本轮是否有更新'],
    ['        for (auto e : edges) {', '枚举所有边 e'],
    ['            if (dist[e.u] == INF) continue;', '起点到不了 e.u 就跳过'],
    ['            if (dist[e.u] + e.w >= dist[e.v]) continue;', '不能变短就跳过'],
    ['            dist[e.v] = dist[e.u] + e.w;', '松弛 e.v'],
    ['            changed = true;', '标记本轮发生更新'],
    ['        }', '一轮松弛结束'],
    ['        if (!changed) break;', '没有更新就提前结束'],
    ['    }', 'n-1 轮结束'],
    ['    for (auto e : edges) {', '再检查一轮是否还能松弛'],
    ['        if (dist[e.u] != INF && dist[e.u] + e.w < dist[e.v]) return false;', '还能松弛说明有负环'],
    ['    }', '负环检查结束'],
    ['    return true;', 'true 表示最短路有效'],
    ['}', '函数结束'],
  ], [9, 10, 11, 12, 13, 14]);

  setTemplate('floydWarshall', [
    ['#include <bits/stdc++.h>', '万能头文件，赛场常用'],
    ['using namespace std;', '省去 std:: 前缀'],
    ['const long long INF = (1LL << 60);', 'INF 表示不可达距离'],
    ['', ''],
    ['void floyd(vector<vector<long long>>& dist) {', 'dist[i][j] 是 i 到 j 的当前最短路'],
    ['    int n = (int)dist.size();', 'n 是点数'],
    ['    for (int k = 0; k < n; ++k) {', 'k 是当前允许经过的中转点'],
    ['        for (int i = 0; i < n; ++i) {', 'i 是起点'],
    ['            if (dist[i][k] == INF) continue;', 'i 到 k 不通就跳过'],
    ['            for (int j = 0; j < n; ++j) {', 'j 是终点'],
    ['                if (dist[k][j] == INF) continue;', 'k 到 j 不通就跳过'],
    ['                dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);', '尝试用 i-k-j 更新 i-j'],
    ['            }', '终点枚举结束'],
    ['        }', '起点枚举结束'],
    ['    }', '中转点枚举结束'],
    ['}', '函数结束'],
  ], [7, 8, 10, 11, 12]);

  setTemplate('prim', [
    ['#include <bits/stdc++.h>', '万能头文件，赛场常用'],
    ['using namespace std;', '省去 std:: 前缀'],
    ['using PII = pair<int,int>;', 'PII 存 {边权, 点}'],
    ['', ''],
    ['long long prim(const vector<vector<PII>>& g) {', 'g[u] 存 {w,v}'],
    ['    int n = (int)g.size();', 'n 是点数'],
    ['    vector<int> vis(n, 0);', 'vis[x] 表示 x 是否已进生成树'],
    ['    priority_queue<PII, vector<PII>, greater<PII>> pq;', 'pq 维护跨割最小边'],
    ['    pq.push({0, 0});', '从 0 号点开始，入树代价为 0'],
    ['    long long ans = 0;', 'ans 是 MST 总权值'],
    ['    int cnt = 0;', 'cnt 是已选点数'],
    ['    while (!pq.empty() && cnt < n) {', '还有候选边且树未完成'],
    ['        auto [w, u] = pq.top(); pq.pop();', '取最小边到达的点 u'],
    ['        if (vis[u]) continue;', 'u 已在树中就跳过'],
    ['        vis[u] = 1;', '把 u 加入生成树'],
    ['        ans += w; ++cnt;', '累计边权并增加点数'],
    ['        for (auto [nw, v] : g[u]) {', '枚举从 u 连出去的边'],
    ['            if (!vis[v]) pq.push({nw, v});', 'v 未入树则成为候选边'],
    ['        }', '邻边扫描结束'],
    ['    }', '主循环结束'],
    ['    return cnt == n ? ans : -1;', '图连通返回权值，否则返回 -1'],
    ['}', '函数结束'],
  ], [12, 13, 14, 15, 16, 17, 18]);

  setTemplate('kruskal', [
    ['#include <bits/stdc++.h>', '万能头文件，赛场常用'],
    ['using namespace std;', '省去 std:: 前缀'],
    ['struct Edge { int u, v, w; };', 'u-v 是边，w 是边权'],
    ['', ''],
    ['struct DSU {', '并查集维护连通块'],
    ['    vector<int> fa, sz;', 'fa 是父亲，sz 是集合大小'],
    ['    DSU(int n) : fa(n), sz(n, 1) { iota(fa.begin(), fa.end(), 0); }', '初始化每个点单独成块'],
    ['    int find(int x) { return fa[x] == x ? x : fa[x] = find(fa[x]); }', '路径压缩找根'],
    ['    bool unite(int a, int b) {', '尝试合并 a 和 b'],
    ['        a = find(a); b = find(b);', '先找到两个根'],
    ['        if (a == b) return false;', '同块说明会成环'],
    ['        if (sz[a] < sz[b]) swap(a, b);', '小集合并到大集合'],
    ['        fa[b] = a; sz[a] += sz[b];', '执行合并'],
    ['        return true;', '合并成功'],
    ['    }', 'unite 结束'],
    ['};', '并查集结束'],
    ['', ''],
    ['long long kruskal(int n, vector<Edge> edges) {', 'n 是点数，edges 是边集'],
    ['    sort(edges.begin(), edges.end(), [](Edge a, Edge b){ return a.w < b.w; });', '按边权从小到大排序'],
    ['    DSU dsu(n);', '初始化并查集'],
    ['    long long ans = 0;', 'ans 是 MST 总权值'],
    ['    int cnt = 0;', 'cnt 是已选边数'],
    ['    for (auto e : edges) {', '从小到大扫描边'],
    ['        if (!dsu.unite(e.u, e.v)) continue;', '成环边跳过'],
    ['        ans += e.w; ++cnt;', '安全边加入 MST'],
    ['    }', '边扫描结束'],
    ['    return cnt == n - 1 ? ans : -1;', '选满 n-1 条边才有 MST'],
    ['}', '函数结束'],
  ], [19, 20, 23, 24, 25]);

  setTemplate('treeDiameter', [
    ['#include <bits/stdc++.h>', '万能头文件，赛场常用'],
    ['using namespace std;', '省去 std:: 前缀'],
    ['', ''],
    ['pair<int, vector<int>> farthest(int src, const vector<vector<int>>& tree) {', 'src 是起点，tree 是树'],
    ['    vector<int> dist(tree.size(), -1);', 'dist[x] 是 src 到 x 的边数'],
    ['    queue<int> que;', 'que 是 BFS 队列'],
    ['    dist[src] = 0;', '起点距离为 0'],
    ['    que.push(src);', '起点入队'],
    ['    while (!que.empty()) {', '队列不空就继续'],
    ['        int u = que.front(); que.pop();', '取出当前点 u'],
    ['        for (int v : tree[u]) if (dist[v] == -1) {', '访问未到达的邻点 v'],
    ['            dist[v] = dist[u] + 1;', '设置 v 的距离'],
    ['            que.push(v);', 'v 入队'],
    ['        }', '邻点扫描结束'],
    ['    }', 'BFS 结束'],
    ['    int best = max_element(dist.begin(), dist.end()) - dist.begin();', 'best 是最远点'],
    ['    return {best, dist};', '返回最远点和距离数组'],
    ['}', '函数结束'],
    ['', ''],
    ['int diameter(const vector<vector<int>>& tree) {', '求树的直径长度'],
    ['    auto [u, tmp] = farthest(0, tree);', '第一次 BFS 找直径端点 u'],
    ['    auto [v, dist] = farthest(u, tree);', '第二次 BFS 找另一端 v'],
    ['    return dist[v];', 'u 到 v 的距离就是直径'],
    ['}', '函数结束'],
  ], [21, 22, 23]);

  setTemplate('lcaBinaryLifting', [
    ['#include <bits/stdc++.h>', '万能头文件，赛场常用'],
    ['using namespace std;', '省去 std:: 前缀'],
    ['const int LOG = 20;', 'LOG 覆盖最大深度的二进制位'],
    ['vector<vector<int>> tree;', 'tree 是树的邻接表'],
    ['vector<array<int, LOG>> up;', 'up[u][k] 是 u 的 2^k 级祖先'],
    ['vector<int> dep;', 'dep[u] 是 u 的深度'],
    ['', ''],
    ['void build(int u, int p) {', 'u 是当前点，p 是父亲'],
    ['    up[u][0] = p;', '记录直接父亲'],
    ['    for (int k = 1; k < LOG; ++k) up[u][k] = up[up[u][k - 1]][k - 1];', '递推倍增祖先'],
    ['    for (int v : tree[u]) if (v != p) {', '枚举儿子 v'],
    ['        dep[v] = dep[u] + 1;', '设置儿子深度'],
    ['        build(v, u);', '递归预处理儿子'],
    ['    }', '儿子扫描结束'],
    ['}', '预处理结束'],
    ['', ''],
    ['int jump(int u, int len) {', '把 u 向上跳 len 步'],
    ['    for (int k = 0; k < LOG; ++k) if (len >> k & 1) u = up[u][k];', '按二进制位跳祖先'],
    ['    return u;', '返回跳完后的点'],
    ['}', 'jump 结束'],
    ['', ''],
    ['int lca(int a, int b) {', '查询 a 和 b 的最近公共祖先'],
    ['    if (dep[a] < dep[b]) swap(a, b);', '保证 a 更深'],
    ['    a = jump(a, dep[a] - dep[b]);', '先拉齐深度'],
    ['    if (a == b) return a;', '如果已经相遇直接返回'],
    ['    for (int k = LOG - 1; k >= 0; --k) {', '从大步到小步尝试上跳'],
    ['        if (up[a][k] == up[b][k]) continue;', '祖先相同则不能跳过 LCA'],
    ['        a = up[a][k]; b = up[b][k];', '两点一起向上跳'],
    ['    }', '跳到 LCA 的儿子'],
    ['    return up[a][0];', '父亲就是 LCA'],
    ['}', '函数结束'],
  ], [8, 9, 10, 11, 12, 23, 24, 27, 28, 29]);

  setTemplate('tarjanScc', [
    ['#include <bits/stdc++.h>', '万能头文件，赛场常用'],
    ['using namespace std;', '省去 std:: 前缀'],
    ['vector<vector<int>> g, comps;', 'g 是有向图，comps 存 SCC'],
    ['vector<int> dfn, low, stk, ins;', 'dfn 是时间戳，low 是可回溯最小 dfn，stk 是栈，ins 表示在栈中'],
    ['int timer = 0;', 'timer 是 DFS 时间戳'],
    ['', ''],
    ['void tarjan(int u) {', 'u 是当前点'],
    ['    dfn[u] = low[u] = ++timer;', '初始化 dfn 和 low'],
    ['    stk.push_back(u); ins[u] = 1;', 'u 入栈并标记'],
    ['    for (int v : g[u]) {', '枚举出边 u -> v'],
    ['        if (!dfn[v]) {', 'v 没访问过就递归'],
    ['            tarjan(v);', '递归访问 v'],
    ['            low[u] = min(low[u], low[v]);', '用子树 low 更新 u'],
    ['        } else if (ins[v]) {', 'v 在栈中说明有返祖/横叉到当前 SCC'],
    ['            low[u] = min(low[u], dfn[v]);', '用 v 的 dfn 更新 low'],
    ['        }', '分类讨论结束'],
    ['    }', '出边扫描结束'],
    ['    if (low[u] == dfn[u]) {', 'u 是一个 SCC 的根'],
    ['        vector<int> comp;', 'comp 存当前 SCC'],
    ['        while (true) {', '不断弹栈直到 u'],
    ['            int x = stk.back(); stk.pop_back();', 'x 是栈顶点'],
    ['            ins[x] = 0; comp.push_back(x);', 'x 出栈并加入 SCC'],
    ['            if (x == u) break;', '弹到 u 就停止'],
    ['        }', '当前 SCC 弹出完成'],
    ['        comps.push_back(comp);', '保存 SCC'],
    ['    }', '根判断结束'],
    ['}', '函数结束'],
  ], [7, 8, 9, 10, 11, 12, 13, 18, 19, 20]);

  setTemplate('bridgeFinding', [
    ['#include <bits/stdc++.h>', '万能头文件，赛场常用'],
    ['using namespace std;', '省去 std:: 前缀'],
    ['vector<vector<int>> g;', 'g 是无向图邻接表'],
    ['vector<int> dfn, low;', 'dfn 是访问时间，low 是能回到的最小时间'],
    ['vector<pair<int,int>> bridges;', 'bridges 存所有桥'],
    ['int timer = 0;', 'timer 是 DFS 时间戳'],
    ['', ''],
    ['void dfsBridge(int u, int parent) {', 'u 是当前点，parent 是 DFS 父亲'],
    ['    dfn[u] = low[u] = ++timer;', '初始化 dfn 和 low'],
    ['    for (int v : g[u]) {', '枚举邻点 v'],
    ['        if (v == parent) continue;', '无向边回父亲要跳过'],
    ['        if (!dfn[v]) {', '树边，v 未访问'],
    ['            dfsBridge(v, u);', '递归进入 v'],
    ['            low[u] = min(low[u], low[v]);', '用子树 low 更新 u'],
    ['            if (low[v] > dfn[u]) bridges.push_back({u, v});', 'v 子树回不到 u 以上，u-v 是桥'],
    ['        } else {', '返祖边'],
    ['            low[u] = min(low[u], dfn[v]);', '用祖先时间更新 low'],
    ['        }', '分类讨论结束'],
    ['    }', '邻点扫描结束'],
    ['}', '函数结束'],
  ], [8, 9, 10, 12, 13, 14, 15]);

  setTemplate('topologicalSort', [
    ['#include <bits/stdc++.h>', '万能头文件，赛场常用'],
    ['using namespace std;', '省去 std:: 前缀'],
    ['', ''],
    ['vector<int> topo(const vector<vector<int>>& g) {', 'g 是 DAG 的邻接表'],
    ['    int n = (int)g.size();', 'n 是点数'],
    ['    vector<int> indeg(n, 0);', 'indeg[v] 是 v 的入度'],
    ['    for (int u = 0; u < n; ++u) for (int v : g[u]) ++indeg[v];', '统计所有点入度'],
    ['    queue<int> que;', 'que 存入度为 0 的点'],
    ['    for (int u = 0; u < n; ++u) if (indeg[u] == 0) que.push(u);', '初始零入度点入队'],
    ['    vector<int> ord;', 'ord 是拓扑序'],
    ['    while (!que.empty()) {', '队列不空就继续'],
    ['        int u = que.front(); que.pop();', '取出一个零入度点'],
    ['        ord.push_back(u);', '加入拓扑序'],
    ['        for (int v : g[u]) {', '删除 u 的出边影响'],
    ['            if (--indeg[v] == 0) que.push(v);', 'v 入度归零则入队'],
    ['        }', '出边扫描结束'],
    ['    }', '主循环结束'],
    ['    return ord;', '若 ord 长度小于 n，则原图有环'],
    ['}', '函数结束'],
  ], [6, 7, 8, 9, 11, 12, 13, 14, 15]);

  setTemplate('connectedComponents', [
    ['#include <bits/stdc++.h>', '万能头文件，赛场常用'],
    ['using namespace std;', '省去 std:: 前缀'],
    ['', ''],
    ['void dfsComp(int u, const vector<vector<int>>& g, vector<int>& vis, vector<int>& comp) {', 'u 是当前点，comp 是当前连通块'],
    ['    vis[u] = 1;', '标记 u 已访问'],
    ['    comp.push_back(u);', '把 u 加入当前连通块'],
    ['    for (int v : g[u]) {', '枚举邻点 v'],
    ['        if (!vis[v]) dfsComp(v, g, vis, comp);', '未访问就继续搜索'],
    ['    }', '邻点扫描结束'],
    ['}', 'DFS 结束'],
    ['', ''],
    ['vector<vector<int>> comps(const vector<vector<int>>& g) {', '返回所有连通块'],
    ['    vector<int> vis(g.size(), 0);', 'vis 记录访问状态'],
    ['    vector<vector<int>> ans;', 'ans 存所有连通块'],
    ['    for (int u = 0; u < (int)g.size(); ++u) {', '枚举每个点'],
    ['        if (vis[u]) continue;', '访问过则已属于某个连通块'],
    ['        vector<int> comp;', '新建一个连通块'],
    ['        dfsComp(u, g, vis, comp);', '收集这个连通块'],
    ['        ans.push_back(comp);', '保存连通块'],
    ['    }', '点枚举结束'],
    ['    return ans;', '返回结果'],
    ['}', '函数结束'],
  ], [15, 16, 17, 18, 19]);

  setTemplate('bipartiteCheck', [
    ['#include <bits/stdc++.h>', '万能头文件，赛场常用'],
    ['using namespace std;', '省去 std:: 前缀'],
    ['', ''],
    ['bool isBipartite(const vector<vector<int>>& g) {', 'g 是无向图邻接表'],
    ['    int n = (int)g.size();', 'n 是点数'],
    ['    vector<int> color(n, -1);', 'color[x] 是 x 的颜色，-1 表示未染色'],
    ['    for (int src = 0; src < n; ++src) {', '可能有多个连通块'],
    ['        if (color[src] != -1) continue;', '染过色就跳过'],
    ['        queue<int> que;', 'que 是 BFS 队列'],
    ['        color[src] = 0; que.push(src);', '新连通块起点染 0'],
    ['        while (!que.empty()) {', '队列不空就继续'],
    ['            int u = que.front(); que.pop();', '取出当前点 u'],
    ['            for (int v : g[u]) {', '枚举邻点 v'],
    ['                if (color[v] == -1) {', 'v 还没染色'],
    ['                    color[v] = color[u] ^ 1;', '染成相反颜色'],
    ['                    que.push(v);', 'v 入队'],
    ['                } else if (color[v] == color[u]) return false;', '同色相邻则不是二分图'],
    ['            }', '邻点扫描结束'],
    ['        }', '当前连通块检查完'],
    ['    }', '所有连通块检查完'],
    ['    return true;', '没有冲突，是二分图'],
    ['}', '函数结束'],
  ], [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);

  setTemplate('dinicMaxFlow', [
    ['#include <bits/stdc++.h>', '万能头文件，赛场常用'],
    ['using namespace std;', '省去 std:: 前缀'],
    ['struct Edge { int to, rev; long long cap; };', 'to 是终点，rev 是反边编号，cap 是残量'],
    ['vector<vector<Edge>> g;', 'g 是残量网络'],
    ['vector<int> level, it;', 'level 是层次，it 是当前弧'],
    ['', ''],
    ['void addEdge(int u, int v, long long c) {', '加入 u->v 容量 c 的边'],
    ['    Edge a{v, (int)g[v].size(), c};', 'a 是正向边'],
    ['    Edge b{u, (int)g[u].size(), 0};', 'b 是反向边'],
    ['    g[u].push_back(a); g[v].push_back(b);', '把两条边加入残量网络'],
    ['}', '加边结束'],
    ['', ''],
    ['bool bfs(int s, int t) {', '从源点 s 给层次图分层'],
    ['    fill(level.begin(), level.end(), -1);', '初始化所有层次为 -1'],
    ['    queue<int> que; level[s] = 0; que.push(s);', '源点入队，层次为 0'],
    ['    while (!que.empty()) {', 'BFS 队列不空就继续'],
    ['        int u = que.front(); que.pop();', '取出当前点 u'],
    ['        for (auto e : g[u]) {', '枚举残量边 e'],
    ['            if (e.cap <= 0 || level[e.to] != -1) continue;', '无残量或已分层就跳过'],
    ['            level[e.to] = level[u] + 1; que.push(e.to);', '设置下一层并入队'],
    ['        }', '出边扫描结束'],
    ['    }', 'BFS 结束'],
    ['    return level[t] != -1;', '汇点可达才有增广路'],
    ['}', '分层函数结束'],
    ['', ''],
    ['long long dfs(int u, int t, long long f) {', '从 u 向 t 尝试推 f 流量'],
    ['    if (u == t) return f;', '到达汇点，返回可推流量'],
    ['    for (int& i = it[u]; i < (int)g[u].size(); ++i) {', '当前弧优化枚举边'],
    ['        Edge& e = g[u][i];', 'e 是当前残量边'],
    ['        if (e.cap <= 0 || level[e.to] != level[u] + 1) continue;', '必须沿层次图有残量边走'],
    ['        long long pushed = dfs(e.to, t, min(f, e.cap));', '递归尝试推流'],
    ['        if (!pushed) continue;', '推不动就换边'],
    ['        e.cap -= pushed; g[e.to][e.rev].cap += pushed;', '更新正反边残量'],
    ['        return pushed;', '返回本次增广量'],
    ['    }', '出边枚举结束'],
    ['    return 0;', '没有可推流量'],
    ['}', 'DFS 结束'],
    ['', ''],
    ['long long maxFlow(int s, int t) {', '求源点 s 到汇点 t 的最大流'],
    ['    long long flow = 0, pushed;', 'flow 是答案，pushed 是单次增广量'],
    ['    while (bfs(s, t)) {', '只要汇点还能被分层就继续'],
    ['        fill(it.begin(), it.end(), 0);', '重置当前弧位置'],
    ['        while ((pushed = dfs(s, t, (long long)4e18))) flow += pushed;', '持续找阻塞流并累加'],
    ['    }', '没有增广路时结束'],
    ['    return flow;', '返回最大流'],
    ['}', '最大流函数结束'],
  ], [13, 14, 15, 26, 27, 28, 30, 31, 32, 33, 40, 41, 42, 43]);

  setTemplate('hopcroftKarp', [
    ['#include <bits/stdc++.h>', '万能头文件，赛场常用'],
    ['using namespace std;', '省去 std:: 前缀'],
    ['vector<vector<int>> g;', 'g[u] 是左部点 u 能连到的右部点'],
    ['vector<int> pairU, pairV, dist;', 'pairU/pairV 是匹配对象，dist 是 BFS 层次'],
    ['int nLeft, nRight;', '左右部点数'],
    ['', ''],
    ['bool bfs() {', 'BFS 找最短增广路层次'],
    ['    queue<int> que;', 'que 存未匹配左部点'],
    ['    bool found = false;', 'found 表示是否能到达未匹配右点'],
    ['    for (int u = 0; u < nLeft; ++u) {', '枚举左部点'],
    ['        if (pairU[u] == -1) dist[u] = 0, que.push(u);', '未匹配左点作为 BFS 起点'],
    ['        else dist[u] = -1;', '已匹配左点暂不作为起点'],
    ['    }', '初始化结束'],
    ['    while (!que.empty()) {', '队列不空就继续'],
    ['        int u = que.front(); que.pop();', '取出左部点 u'],
    ['        for (int v : g[u]) {', '枚举右部点 v'],
    ['            int nxt = pairV[v];', 'nxt 是 v 当前匹配的左部点'],
    ['            if (nxt == -1) found = true;', '能到未匹配右点，存在增广路'],
    ['            else if (dist[nxt] == -1) dist[nxt] = dist[u] + 1, que.push(nxt);', '沿匹配边回到下一层左点'],
    ['        }', '邻边扫描结束'],
    ['    }', 'BFS 结束'],
    ['    return found;', '返回是否存在增广路'],
    ['}', 'BFS 函数结束'],
    ['', ''],
    ['bool dfs(int u) {', '从左部点 u 找增广路'],
    ['    for (int v : g[u]) {', '枚举可连接右部点 v'],
    ['        int nxt = pairV[v];', 'nxt 是 v 当前匹配对象'],
    ['        if (nxt != -1 && dist[nxt] != dist[u] + 1) continue;', '必须沿 BFS 层次走'],
    ['        if (nxt == -1 || dfs(nxt)) {', '右点未匹配或能递归改匹配'],
    ['            pairU[u] = v; pairV[v] = u;', '匹配 u-v'],
    ['            return true;', '增广成功'],
    ['        }', '尝试结束'],
    ['    }', '邻边扫描结束'],
    ['    dist[u] = -1;', '剪枝：本轮 u 不再有用'],
    ['    return false;', '增广失败'],
    ['}', 'DFS 函数结束'],
  ], [7, 8, 14, 15, 16, 26, 27, 29, 30, 31]);

  return {
    bfs: bfs,
    dfs: dfs,
    dijkstra: dijkstra,
    zeroOneBfs: zeroOneBfs,
    spfa: spfa,
    bellmanFord: bellmanFord,
    floydWarshall: floydWarshall,
    dinicMaxFlow: dinicMaxFlow,
    hopcroftKarp: hopcroftKarp,
    prim: prim,
    kruskal: kruskal,
    treeDiameter: treeDiameter,
    lcaBinaryLifting: lcaBinaryLifting,
    tarjanScc: tarjanScc,
    bridgeFinding: bridgeFinding,
    topologicalSort: topologicalSort,
    connectedComponents: connectedComponents,
    bipartiteCheck: bipartiteCheck,
    catalog: catalog,
  };
});

function bootGraphVisualizer(algorithms) {
  'use strict';

  var root = document.querySelector('[data-graph-widget]');
  if (!root) return;

  var svg = root.querySelector('[data-graph-canvas]');
  var status = root.querySelector('[data-graph-status]');
  var trace = root.querySelector('[data-graph-trace]');
  var startSelect = root.querySelector('[data-graph-control="start"]');
  var algorithmSelect = root.querySelector('[data-graph-control="algorithm"]');
  var weightInput = root.querySelector('[data-graph-control="weight"]');
  var directedInput = root.querySelector('[data-graph-control="directed"]');
  var lesson = root.querySelector('[data-graph-lesson]');
  var codeBlock = document.querySelector('[data-graph-code]');
  var codeTitle = document.querySelector('[data-graph-code-title]');
  var statNodes = document.querySelector('[data-graph-stat="nodes"]');
  var statEdges = document.querySelector('[data-graph-stat="edges"]');
  var statStep = document.querySelector('[data-graph-stat="step"]');
  var mode = 'move';
  var timer = 0;
  var pendingEdgeFrom = '';
  var selected = { type: '', id: '' };
  var drag = null;
  var steps = [];
  var activeStep = null;
  var stepIndex = 0;
  var nodeCounter = 0;
  var edgeCounter = 0;
  var graph = { directed: false, nodes: [], edges: [] };
  var catalog = algorithms.catalog || {};

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }

  function cloneGraph(source) {
    return {
      directed: !!source.directed,
      nodes: source.nodes.map(function (node) {
        return { id: node.id, x: node.x, y: node.y };
      }),
      edges: source.edges.map(function (edge) {
        return { id: edge.id, from: edge.from, to: edge.to, weight: edge.weight };
      }),
    };
  }

  function applyPreset(name, message) {
    var item = catalog[name] || catalog.bfs;
    graph = cloneGraph(item.preset);
    nodeCounter = graph.nodes.length;
    edgeCounter = graph.edges.length;
    if (graph.nodes[0]) startSelect.setAttribute('data-next-start', graph.nodes[0].id);
    directedInput.checked = graph.directed;
    directedInput.disabled = name === 'topologicalSort' || name === 'tarjanScc' || name === 'dinicMaxFlow';
    updateLesson();
    clearPlayback(message || ('已载入 ' + item.title + ' 经典图'));
  }

  function clearPlayback(message) {
    stopTimer();
    steps = [];
    activeStep = null;
    stepIndex = 0;
    pendingEdgeFrom = '';
    setStatus(message || '选择算法后开始运行');
    render();
  }

  function setStatus(message) {
    status.textContent = message;
  }

  function keepScroll(action) {
    var x = window.scrollX;
    var y = window.scrollY;
    action();
    window.requestAnimationFrame(function () {
      window.scrollTo(x, y);
    });
  }

  function updateLesson() {
    if (!lesson) return;
    var item = catalog[algorithmSelect.value] || catalog.bfs;
    lesson.innerHTML = '<h2>' + escapeHtml(item.title) + '</h2><p>' + escapeHtml(item.intro) + '</p>';
    if (codeTitle) codeTitle.textContent = item.title;
  }

  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = 0;
    }
  }

  function nodeById(id) {
    return graph.nodes.find(function (node) { return node.id === id; });
  }

  function edgeMatches(edge, key) {
    if (key === edge.from + '->' + edge.to) return true;
    return !graph.directed && key === edge.to + '->' + edge.from;
  }

  function pointFromEvent(event) {
    var rect = svg.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 920,
      y: ((event.clientY - rect.top) / rect.height) * 520,
    };
  }

  function addNode(point) {
    nodeCounter += 1;
    var id = String.fromCharCode(64 + ((nodeCounter - 1) % 26) + 1) + (nodeCounter > 26 ? Math.ceil(nodeCounter / 26) : '');
    while (nodeById(id)) {
      nodeCounter += 1;
      id = 'N' + nodeCounter;
    }
    graph.nodes.push({
      id: id,
      x: Math.max(42, Math.min(878, point.x)),
      y: Math.max(42, Math.min(478, point.y)),
    });
    selected = { type: 'node', id: id };
    clearPlayback('添加节点 ' + id);
  }

  function addEdge(from, to) {
    if (!from || !to || from === to) return;
    var exists = graph.edges.some(function (edge) {
      if (graph.directed) return edge.from === from && edge.to === to;
      return (edge.from === from && edge.to === to) || (edge.from === to && edge.to === from);
    });
    if (exists) {
      setStatus('这条边已经存在');
      pendingEdgeFrom = '';
      render();
      return;
    }
    edgeCounter += 1;
    graph.edges.push({
      id: 'E' + edgeCounter,
      from: from,
      to: to,
      weight: Math.max(-99, Math.min(99, Number(weightInput.value) || 1)),
    });
    pendingEdgeFrom = '';
    selected = { type: 'edge', id: 'E' + edgeCounter };
    clearPlayback('添加边 ' + from + (graph.directed ? ' -> ' : ' - ') + to);
  }

  function deleteSelected() {
    if (selected.type === 'node') {
      graph.nodes = graph.nodes.filter(function (node) { return node.id !== selected.id; });
      graph.edges = graph.edges.filter(function (edge) { return edge.from !== selected.id && edge.to !== selected.id; });
    } else if (selected.type === 'edge') {
      graph.edges = graph.edges.filter(function (edge) { return edge.id !== selected.id; });
    }
    selected = { type: '', id: '' };
    clearPlayback('已删除选中项');
  }

  function runAlgorithm() {
    if (!graph.nodes.length) {
      setStatus('先添加节点');
      return [];
    }
    var name = algorithmSelect.value;
    graph.directed = directedInput.checked || name === 'topologicalSort' || name === 'tarjanScc' || name === 'dinicMaxFlow';
    var start = startSelect.value || graph.nodes[0].id;
    var result = algorithms[name](graph, start);
    var nextSteps = result.steps || [];
    if (!nextSteps.length) nextSteps = [{ message: '算法没有产生可播放步骤', visited: [], frontier: [], edges: [] }];
    steps = nextSteps;
    stepIndex = 0;
    activeStep = steps[0];
    setStatus(activeStep.message);
    render();
    return steps;
  }

  function advance() {
    if (!steps.length) runAlgorithm();
    if (!steps.length) return false;
    activeStep = steps[Math.min(stepIndex, steps.length - 1)];
    setStatus(activeStep.message);
    render();
    stepIndex += 1;
    if (stepIndex > steps.length) {
      stopTimer();
      setStatus('演示完成: ' + activeStep.message);
      return false;
    }
    return true;
  }

  function renderStats() {
    statNodes.textContent = graph.nodes.length;
    statEdges.textContent = graph.edges.length;
    statStep.textContent = steps.length ? Math.min(stepIndex, steps.length) + '/' + steps.length : '0';
  }

  function renderStartOptions() {
    var current = startSelect.getAttribute('data-next-start') || startSelect.value;
    startSelect.removeAttribute('data-next-start');
    startSelect.innerHTML = graph.nodes.map(function (node) {
      return '<option value="' + node.id + '">' + node.id + '</option>';
    }).join('');
    if (nodeById(current)) startSelect.value = current;
    else if (graph.nodes[0]) startSelect.value = graph.nodes[0].id;
  }

  function renderTrace() {
    if (!steps.length) {
      trace.innerHTML = '<li class="is-empty"><span>0</span>等待运行</li>';
      return;
    }
    var from = Math.max(0, Math.min(stepIndex - 5, steps.length - 1));
    var items = steps.slice(from, Math.min(steps.length, from + 7));
    trace.innerHTML = items.map(function (item, index) {
      var number = from + index + 1;
      var current = item === activeStep ? ' class="is-active"' : '';
      return '<li' + current + '><span>' + number + '</span>' + item.message + '</li>';
    }).join('');
  }

  function renderCode() {
    if (!codeBlock) return;
    var item = catalog[algorithmSelect.value] || catalog.bfs;
    var lines = item.code.split('\n');
    var requestedLines = activeStep && activeStep.codeLines && activeStep.codeLines.length ? activeStep.codeLines : item.defaultLines || [];
    var validRequested = requestedLines.filter(function (line) { return line >= 1 && line <= lines.length; });
    var highlighted = new Set(validRequested.length ? validRequested : item.defaultLines || []);
    codeBlock.innerHTML = lines.map(function (line, index) {
      var lineNumber = index + 1;
      var active = highlighted.has(lineNumber) ? ' is-active' : '';
      return '<span class="code-line' + active + '" data-line="' + lineNumber + '">' + escapeHtml(line || ' ') + '</span>';
    }).join('');
  }

  function render() {
    renderStartOptions();
    renderStats();
    renderTrace();
    renderCode();

    var visited = new Set(activeStep && activeStep.visited ? activeStep.visited : []);
    var frontier = new Set(activeStep && activeStep.frontier ? activeStep.frontier : []);
    var activeEdges = activeStep && activeStep.edges ? activeStep.edges : [];
    var current = activeStep && activeStep.current ? activeStep.current : '';

    var defs = '<defs><marker id="graph-arrow" viewBox="0 0 12 12" refX="10.5" refY="6" markerWidth="9" markerHeight="9" orient="auto"><path d="M1.5 1.5 L10.5 6 L1.5 10.5 L4.1 6 Z"></path></marker></defs>';
    var edgeMarkup = graph.edges.map(function (edge) {
      var from = nodeById(edge.from);
      var to = nodeById(edge.to);
      if (!from || !to) return '';
      var dx = to.x - from.x;
      var dy = to.y - from.y;
      var length = Math.sqrt(dx * dx + dy * dy) || 1;
      var sx = from.x + (dx / length) * 26;
      var sy = from.y + (dy / length) * 26;
      var tx = to.x - (dx / length) * 26;
      var ty = to.y - (dy / length) * 26;
      var midX = (sx + tx) / 2;
      var midY = (sy + ty) / 2;
      var classes = ['graph-edge'];
      if (selected.type === 'edge' && selected.id === edge.id) classes.push('is-selected');
      if (activeEdges.some(function (key) { return edgeMatches(edge, key); })) classes.push('is-active');
      return '<g class="' + classes.join(' ') + '" data-edge-id="' + edge.id + '" tabindex="0">' +
        '<line x1="' + sx + '" y1="' + sy + '" x2="' + tx + '" y2="' + ty + '"' + (graph.directed ? ' marker-end="url(#graph-arrow)"' : '') + '></line>' +
        '<text x="' + midX + '" y="' + (midY - 8) + '">' + edge.weight + '</text>' +
        '</g>';
    }).join('');

    var nodeMarkup = graph.nodes.map(function (node) {
      var classes = ['graph-node'];
      if (visited.has(node.id)) classes.push('is-visited');
      if (frontier.has(node.id)) classes.push('is-frontier');
      if (current === node.id) classes.push('is-current');
      if (pendingEdgeFrom === node.id) classes.push('is-pending');
      if (selected.type === 'node' && selected.id === node.id) classes.push('is-selected');
      return '<g class="' + classes.join(' ') + '" data-node-id="' + node.id + '" tabindex="0" transform="translate(' + node.x + ' ' + node.y + ')">' +
        '<circle r="26"></circle>' +
        '<text y="6">' + node.id + '</text>' +
        '</g>';
    }).join('');

    svg.innerHTML = defs + '<g class="graph-edges">' + edgeMarkup + '</g><g class="graph-nodes">' + nodeMarkup + '</g>';
  }

  root.addEventListener('change', function (event) {
    if (event.target.matches('[data-graph-control="mode"]')) {
      mode = event.target.value;
      pendingEdgeFrom = '';
      render();
    }
    if (event.target === directedInput) {
      graph.directed = directedInput.checked;
      clearPlayback(graph.directed ? '已切换为有向图' : '已切换为无向图');
    }
    if (event.target === algorithmSelect) {
      var isTopo = algorithmSelect.value === 'topologicalSort';
      var isForcedDirected = isTopo || algorithmSelect.value === 'tarjanScc' || algorithmSelect.value === 'dinicMaxFlow';
      directedInput.disabled = isForcedDirected;
      keepScroll(function () {
        applyPreset(algorithmSelect.value, '已切换到 ' + algorithmSelect.options[algorithmSelect.selectedIndex].text);
      });
    }
  });

  root.addEventListener('click', function (event) {
    var action = event.target.getAttribute('data-graph-action');
    if (!action) return;

    if (action === 'run') {
      stopTimer();
      runAlgorithm();
      timer = setInterval(function () {
        if (!advance()) stopTimer();
      }, 760);
    } else if (action === 'step') {
      stopTimer();
      advance();
    } else if (action === 'pause') {
      stopTimer();
      setStatus('已暂停');
    } else if (action === 'reset') {
      graph = { directed: directedInput.checked, nodes: [], edges: [] };
      selected = { type: '', id: '' };
      nodeCounter = 0;
      edgeCounter = 0;
      clearPlayback('画布已重置');
    } else if (action === 'sample') {
      applyPreset(algorithmSelect.value);
    } else if (action === 'delete') {
      deleteSelected();
    }
  });

  svg.addEventListener('pointerdown', function (event) {
    var point = pointFromEvent(event);
    var nodeElement = event.target.closest('[data-node-id]');
    var edgeElement = event.target.closest('[data-edge-id]');

    if (nodeElement) {
      var nodeId = nodeElement.getAttribute('data-node-id');
      selected = { type: 'node', id: nodeId };
      if (mode === 'edge') {
        if (!pendingEdgeFrom) {
          pendingEdgeFrom = nodeId;
          setStatus('已选择起点 ' + nodeId);
          render();
        } else {
          addEdge(pendingEdgeFrom, nodeId);
        }
        return;
      }
      var node = nodeById(nodeId);
      drag = { node: node, dx: node.x - point.x, dy: node.y - point.y };
      svg.setPointerCapture(event.pointerId);
      render();
      return;
    }

    if (edgeElement) {
      selected = { type: 'edge', id: edgeElement.getAttribute('data-edge-id') };
      render();
      return;
    }

    if (mode === 'node') {
      addNode(point);
    } else {
      selected = { type: '', id: '' };
      render();
    }
  });

  svg.addEventListener('pointermove', function (event) {
    if (!drag) return;
    var point = pointFromEvent(event);
    drag.node.x = Math.max(42, Math.min(878, point.x + drag.dx));
    drag.node.y = Math.max(42, Math.min(478, point.y + drag.dy));
    render();
  });

  svg.addEventListener('pointerup', function (event) {
    if (!drag) return;
    drag = null;
    try { svg.releasePointerCapture(event.pointerId); } catch (e) {}
  });

  svg.addEventListener('keydown', function (event) {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      deleteSelected();
    }
  });

  applyPreset(algorithmSelect.value, '已载入 BFS 经典图');
}
