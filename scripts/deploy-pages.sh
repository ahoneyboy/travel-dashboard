#!/usr/bin/env bash
# 一键发布：构建并推送 dist/ 到 gh-pages 分支（GitHub Pages 项目页）
# 用法：npm run deploy
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> 构建（base=/travel-dashboard/）"
npm run build

OUT=$(mktemp -d)
cp -R dist/. "$OUT/"
find "$OUT" -name .DS_Store -delete

echo "==> 推送到 gh-pages 分支"
git checkout --orphan gh-pages-tmp
git rm -rf --cached . -q
git --work-tree="$OUT" add -A -f
git commit -q -m "deploy: $(date '+%Y-%m-%d %H:%M')"
git branch -M gh-pages
git push -f origin gh-pages
# -f：gh-pages 上的原 src 等文件在工作区处于未跟踪状态，需强制复位
git checkout -qf main
rm -rf "$OUT"

echo "✅ 已推送 gh-pages。GitHub Pages 构建约需 1 分钟："
echo "   https://ahoneyboy.github.io/travel-dashboard/"
