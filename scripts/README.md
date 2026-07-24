# Maintenance Scripts

这些脚本用于本地维护和验证，不参与 GitHub Pages 的 Hugo 构建。

## 封面工具

- `fetch-covers.py`：从图库下载可选的文章轮播封面，写入
  `static/images/covers/`，并重写 `data/covers.yml`。运行：
  `python scripts/fetch-covers.py`
- `generate-category-covers.py`：确定性生成分类封面。运行：
  `python scripts/generate-category-covers.py`

## 验证工具

- `verify-category-covers.ps1`：检查分类封面映射和文件。运行：
  `powershell -File scripts/verify-category-covers.ps1`
- `verify-live2d.ps1`：检查当前关闭 Live2D 的配置。运行：
  `powershell -File scripts/verify-live2d.ps1`
- `verify-suffix-array-article.ps1`：检查后缀数组文章约定。运行：
  `powershell -File scripts/verify-suffix-array-article.ps1`
