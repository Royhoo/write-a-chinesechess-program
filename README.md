# 第 5 章 — Alpha-Beta 搜索

本章目标：用 **Alpha-Beta 剪枝**和**迭代加深**替换 Minimax，大幅提升搜索效率和棋力。

## 本章变更

| 文件 | 变更说明 |
|------|----------|
| `search.js` | 实现 Alpha-Beta 搜索、迭代加深、历史启发、走法排序 |
| `search - 负极大值搜索.js` | 负极大值写法的参考实现（对比用） |
| `search - 一个简单的Alpha-Beta搜索.js` | 简化版 Alpha-Beta 的参考实现 |

## Alpha-Beta 剪枝原理

在 Minimax 的基础上维护两个值：
- **α**（Alpha）：当前搜索路径上已找到的**最大下界**（MAX 层最优值）
- **β**（Beta）：当前搜索路径上已找到的**最小上界**（MIN 层最优值）

当 `α ≥ β` 时，该分支不可能影响最终结果，直接**剪掉**，无需继续搜索。

```
理论效率：将搜索节点从 O(b^d) 降至 O(b^(d/2))
实际效果：相同时间内搜索深度提升约一倍
```

## 负极大值写法

将 MAX/MIN 两个函数合并为一个，通过**取负数**统一处理：

```javascript
Search.prototype.alphaBetaSearch = function(vlAlpha, vlBeta, depth) {
  if (depth == 0) return this.pos.evaluate();
  
  var vlBest = -MATE_VALUE;
  var sort = new MoveSort(this.pos, this.historyTable);
  var mv;
  while ((mv = sort.next()) > 0) {
    if (!this.pos.makeMove(mv)) continue;
    // 注意三个负号：取反 + Alpha/Beta 互换
    var vl = -this.alphaBetaSearch(-vlBeta, -vlAlpha, depth - 1);
    this.pos.undoMakeMove();
    
    if (vl > vlBest) {
      vlBest = vl;
      if (vl > vlAlpha) {
        vlAlpha = vl;
        if (vl >= vlBeta) break;  // Beta 截断（剪枝）
      }
    }
  }
  return vlBest;
}
```

## 迭代加深（Iterative Deepening）

从深度 1 开始，逐步加深搜索：

```javascript
for (var i = 1; i <= depth; i++) {
  var vl = this.alphaBetaSearch(-MATE_VALUE, MATE_VALUE, i);
  if (this.allMillis > millis) break;  // 时间用完就停
  if (vl > WIN_VALUE || vl < -WIN_VALUE) break;  // 胜负已分
}
```

好处：
- 配合时间控制，确保 AI 在限定时间内返回最佳结果
- 浅层搜索结果可作为深层搜索的走法排序依据（历史启发）

## 历史启发（History Heuristic）

用 `historyTable[4096]` 记录每个走法的历史得分，搜索前对走法**排序**：

```javascript
// 越好的走法排在越前面，提高 Beta 截断率
this.historyTable[pos.historyIndex(mv)] += depth * depth;
```

走法排序用**希尔排序（Shell Sort）**实现，效率优于冒泡排序。

## 运行效果
- ✅ 搜索深度提升至 4~5 层
- ✅ AI 棋力明显增强
- ✅ 支持时间控制（思考时间可配置）
- ❌ 尚未处理水平线效应（搜索边界不稳定）

---
[← 第 4 章：极大极小搜索](http://www.cnblogs.com/royhoo/p/6425658.html) ｜ [第 6 章：水平线效应与重复局面 →](http://www.cnblogs.com/royhoo/p/6425817.html)
