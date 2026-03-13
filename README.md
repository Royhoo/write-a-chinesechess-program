# 第 3 章 — 电脑自动走棋

本章目标：引入 AI 框架，实现最基础的电脑自动走棋——**随机选择**一步合法走法。

## 本章变更

| 文件 | 变更说明 |
|------|----------|
| `search.js` | 新增 `Search` 对象，实现随机走棋 |
| `board.js` | 玩家落子后自动触发电脑走棋 |
| `index.html` | 新增操作按钮（悔棋、新游戏等） |

## Search 对象

```javascript
function Search(pos) {
  this.pos = pos;
}

Search.prototype.searchMain = function() {
  // 生成当前局面所有合法走法
  var mvs = this.pos.generateMoves();
  // 随机选择一个走法返回
  var randNum = parseInt(Math.random() * mvs.length);
  return mvs[randNum];
}
```

逻辑非常简单：从所有合法走法中随机挑一个。这是 AI 的初始形态，后续章节会逐步替换为智能搜索算法。

## 游戏流程

```
玩家点击棋子 → 选中棋子（高亮）
     ↓
玩家点击目标位置 → legalMove() 校验
     ↓
合法 → makeMove() 执行 → 轮到电脑
     ↓
searchMain() 选出走法 → 电脑落子 → 轮到玩家
```

## 局面评估函数（`evaluate`）
虽然本章 AI 还不会用到评估函数，但 `position.js` 已经引入了基础版本：
- 对每个棋子赋予固定分值（车 > 炮/马 > 象/士 > 兵）
- 根据棋子在棋盘上的**位置**附加奖励分（位置价值表）
- 红方视角：红方总分 − 黑方总分

## 运行效果
- ✅ 电脑会自动走棋
- ⚠️ 电脑完全随机，没有任何棋力
- ❌ 尚未实现智能搜索

---
[← 第 2 章：校验棋子走法](http://www.cnblogs.com/royhoo/p/6424840.html) ｜ [第 4 章：极大极小搜索算法 →](http://www.cnblogs.com/royhoo/p/6425658.html)
