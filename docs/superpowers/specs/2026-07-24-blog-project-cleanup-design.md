# Blog Project Cleanup Design

## Goal

整理 Hugo 博客仓库，删除无用的 CSDN 自动化与本地生成物，明确博客、辅助脚本和 Waline 后端源码的目录边界，同时保证网站的布局、配色、字体、动画、文章呈现和静态资源 URL 不变。

## Current Problems

- `.playwright-csdn-profile/` 中有 600 多个浏览器配置、缓存和登录状态文件被提交到 Git，体积约 58 MB。
- 根目录散落 CSDN 诊断截图、JSON、日志和临时输出。
- `scripts/` 中混有不再使用的 CSDN 发布与诊断脚本。
- `.backup_20260520_135007/` 保存了 Git 历史已经能够恢复的旧配置副本。
- Waline 后端源码位于含义模糊的 `package/` 目录，容易被误认为博客的 Node.js 依赖。
- `fetch_covers.py`、`server.log`、Hugo 锁文件和生成缓存占用根目录或被错误跟踪。
- README 没有说明辅助服务、脚本和本地生成文件的边界。

## Selected Approach

采用保守结构整理：只处理与站点渲染无关的工具、缓存、日志、文档和目录命名，不重构 Hugo 布局、主题覆盖或前端资源。

### Remove

- 删除整个 `.playwright-csdn-profile/`。
- 删除所有 `scripts/csdn-*.js` 与 `scripts/publish-to-csdn.js`。
- 删除根目录所有 CSDN 诊断 PNG、JSON 和相关临时输出。
- 删除 `.backup_20260520_135007/`。
- 删除根目录 `server.log`。
- 停止跟踪 `.hugo_build.lock` 与 `resources/_gen/`；这些内容由 Hugo 在本地按需重新生成。

### Move

- 将 `package/` 原样移动到 `services/waline/`，不修改其源码、依赖或运行行为。
- 将 `fetch_covers.py` 移动到 `scripts/fetch-covers.py`，仅调整项目根目录解析，使输入输出位置保持为 `static/images/covers/` 和 `data/covers.yml`。

### Document and Prevent Recurrence

- 更新 `.gitignore`，明确忽略浏览器配置、诊断产物、日志、Hugo 锁文件、Hugo 资源缓存和常见本地依赖目录。
- 新增 `scripts/README.md`，说明剩余脚本用途、依赖与运行方式。
- 新增 `services/README.md`，说明 `services/waline/` 是独立评论后端源码，不参与 GitHub Pages 的 Hugo 构建。
- 更新根 README 的项目结构与本地命令，移除已经删除的网络教程描述，并说明 Waline 前端配置与后端源码的关系。

## Visual and Functional Invariants

以下内容必须保持不变：

- `hugo.toml`、`config/_default/params.yml` 的有效站点配置。
- `layouts/`、`assets/`、`static/css/`、`static/js/`、站点图片和主题子模块。
- 所有保留文章与独立页面的源内容。
- 首页、文章页、归档页、标签页、友链页、关于页和算法可视化页面的 DOM、CSS 与静态资源 URL。
- Waline 的 `serverURL`、评论前端配置和线上评论服务。
- GitHub Pages 的 Hugo 构建与部署流程。

允许变化的构建输出仅包括用户此前要求删除的网络教程及其下载文件，以及由本次目录整理产生的非站点工具文件变化。

## Verification

1. 在整理前记录 Hugo 构建结果、关键页面清单和站点输出文件摘要。
2. 完成整理后运行 Hugo 完整构建，并运行算法可视化测试。
3. 比较关键页面和静态资源的输出摘要；排除被明确删除文章及安装包后，其余站点输出必须一致。
4. 确认 Waline `serverURL` 和注入脚本未改变。
5. 确认 Git 中不再跟踪 CSDN、浏览器配置、备份、日志、Hugo 锁文件或生成缓存。
6. 检查工作区差异，确保没有修改布局、样式、前端脚本、图片和主题。

## Out of Scope

- 不清理 Git 历史中的旧大文件；如以后需要缩小远程仓库体积，应单独执行历史重写。
- 不升级 Hugo、主题、Waline 或 GitHub Actions。
- 不压缩、替换或去重图片，因为这可能改变资源路径或渲染结果。
- 不合并 Hugo 配置文件，不调整视觉设计或文章内容。
