# 第 4 章 — 极大极小搜索算法（Minimax）

本章目标：用 **Minimax（极大极小）搜索算法**替换随机走棋，让 AI 具备基础棋力。

## 本章变更

| 文件 | 变更说明 |
|------|----------|
| `search.js` | 实现 `maxSearch` / `minSearch`，深度为 3 的 Minimax 搜索 |
| `position.js` | 完善局面评估函数，加入更细致的棋子位置价值表 |

## Minimax 算法原理

博弈双方轮流走棋，AI（红方）希望**最大化**局面分值，对手（黑方）希望**最小化**局面分值：

```
根节点（红方 MAX）
├── 走法A → 黑方 MIN
│   ├── 应对1 → 红方 MAX → ...
│   └── 应对2 → 红方 MAX → ...
└── 走法B → 黑方 MIN
    └── ...
```

到达搜索深度（水平线）时，调用 `evaluate()` 返回局面分值，逐层回传最优值。

## 核心代码

```javascript
var MINMAXDEPTH = 3;  // 搜索深度

// 极大点（红方节点）：选分值最大的走法
Search.prototype.maxSearch = function(depth) {
  if (depth == 0) return this.pos.evaluate();
  var vlBest = -MATE_VALUE;
  var mvs = this.pos.generateMoves();
  for (var i = 0; i < mvs.length; i++) {
    if (!this.pos.makeMove(mvs[i])) continue;
    var value = this.minSearch(depth - 1);  // 递归到极小点
    this.pos.undoMakeMove();
    if (value > vlBest) {
      vlBest = value;
      if (depth == MINMAXDEPTH) this.mvResult = mvs[i]; // 保存根节点最佳走法
    }
  }
  return vlBest;
}

// 极小点（黑方节点）：选分值最小的走法
Search.prototype.minSearch = function(depth) {
  if (depth == 0) return this.pos.evaluate();
  var vlBest = MATE_VALUE;
  // ...（逻辑与 maxSearch 对称，取最小值）
}
```

## 局面评估函数

评估函数从**红方视角**计算局面分值：

```
局面分值 = Σ(红方棋子分值 + 位置加成) − Σ(黑方棋子分值 + 位置加成)
```

| 棋子 | 基础分值 |
|------|---------|
| 车 | 600 |
| 炮 / 马 | 300 |
| 象 / 士 | 110 |
| 将 | 较大值（被吃 = 输棋） |
| 兵 / 卒 | 30~70（过河加成） |

## 性能问题

深度 3 时搜索节点数约为 `40^3 = 64,000`（每步平均约 40 种走法），AI 思考时间尚可。但深度增加到 5 时节点数达 **1 亿**，必须使用剪枝优化。

## 运行效果
- ✅ AI 具备基础棋力，不再随机走棋
- ✅ 能保护棋子、主动吃子
- ⚠️ 搜索效率低，深度受限
- ❌ 未实现 Alpha-Beta 剪枝

---
[← 第 3 章：电脑自动走棋](http://www.cnblogs.com/royhoo/p/6425387.html) ｜ [第 5 章：Alpha-Beta 搜索 →](http://www.cnblogs.com/royhoo/p/6425761.html)
