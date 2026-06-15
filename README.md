# ACM-Lycoris's Blog

> 振桴彼岸，绽蕊忘川。一个记录算法竞赛、技术实践与个人表达的 Hugo 博客。

<p align="center">
  <a href="https://acm-lycoris.cn/"><strong>访问博客</strong></a>
  ·
  <a href="https://acm-lycoris.cn/algorithm-visualizer/"><strong>算法可视化教学站</strong></a>
  ·
  <a href="https://github.com/ACM-Lycoris/ACM-Lycoris.github.io"><strong>GitHub 仓库</strong></a>
</p>

<p align="center">
  <img alt="Hugo" src="https://img.shields.io/badge/Hugo-0.162+-ff4088?style=flat-square&logo=hugo&logoColor=white">
  <img alt="Static Site" src="https://img.shields.io/badge/Static%20Site-GitHub%20Pages-181717?style=flat-square&logo=github&logoColor=white">
  <img alt="Focus" src="https://img.shields.io/badge/Focus-ACM%20%2F%20ICPC-00bcd4?style=flat-square">
  <img alt="License" src="https://img.shields.io/badge/Content-Personal%20Blog-ff003c?style=flat-square">
</p>

---

## 这是什么

这里是 ACM-Lycoris 的个人技术博客，主要写算法竞赛学习记录、题解、图论算法、建站过程和一些 Web / Hack 方向的实践笔记。

博客不是只堆文章，也在尝试做更适合学习的交互式内容。其中最核心的模块是 **算法可视化教学站**：可以拖拽节点、添加边、单步运行图论算法，并同步高亮竞赛常用 C++ 板子。

## 内容方向

- **算法竞赛**：滑动窗口、字符串哈希、位运算、递推递归、题解复盘。
- **图论专题**：Dijkstra、Floyd、最小生成树、二分图匹配、网络流等。
- **交互教学**：用可视化图和代码高亮把抽象算法拆成可观察步骤。
- **建站记录**：Hugo 静态博客、评论系统、主题改造、SEO 与部署维护。
- **技术实践**：Python Web 控制、网络环境配置、自动化与工具链。

## 亮点

### 算法可视化教学站

已支持的图论算法包括：

`BFS` · `0-1 BFS` · `DFS` · `Dijkstra` · `SPFA` · `Bellman-Ford` · `Floyd-Warshall` · `Prim` · `Kruskal` · `树的直径` · `LCA 倍增` · `Tarjan SCC` · `割边 / 桥` · `拓扑排序` · `连通分量` · `二分图判定` · `Dinic 最大流` · `Hopcroft-Karp`

每个算法都配有：

- 经典示例图
- 可拖拽节点和可编辑边权
- 单步运行过程追踪
- 对应 ICPC 常用 C++ 模板
- 代码行级同步高亮

## 技术栈

- **静态站点**：Hugo
- **主题基础**：hugo-theme-reimu
- **部署目标**：GitHub Pages / 自定义域名
- **交互模块**：原生 JavaScript + SVG
- **样式定制**：CSS，自定义赛博风视觉层
- **评论系统**：Waline

## 本地运行

```powershell
git clone https://github.com/ACM-Lycoris/ACM-Lycoris.github.io.git
cd ACM-Lycoris.github.io
..\Hugo\hugo.exe server -D
```

构建静态文件：

```powershell
..\Hugo\hugo.exe --minify=false
```

算法可视化模块测试：

```powershell
node --test static/js/graph-visualizer.test.mjs
```

## 项目结构

```text
content/                  博客文章与独立页面
layouts/                  自定义 Hugo 模板
layouts/partials/         Head、算法可视化等局部模板
static/css/               自定义样式
static/js/                交互脚本与算法可视化测试
config/_default/          站点参数、菜单、注入配置
themes/                   Hugo 主题
```

## SEO 与分享

站点已维护基础搜索与分享信息：

- Canonical URL
- Meta description / keywords
- Open Graph
- Twitter Card
- BlogPosting / WebSite JSON-LD
- robots.txt
- sitemap.xml

这些配置帮助搜索引擎更准确理解文章主题，也让文章分享到社交平台时有更完整的标题、摘要和封面。

## 关于作者

我是 **ACM-Lycoris**，一名算法竞赛学习者。  
这个博客记录我正在走过的路：刷题、补算法、搭博客、写工具，也把一些本来很抽象的东西做成可以看见、可以交互的页面。

欢迎访问：<https://acm-lycoris.cn/>
