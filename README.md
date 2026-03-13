# 第 6 章 — 克服水平线效应、检查重复局面

本章目标：引入**静态搜索**解决水平线效应，并实现**重复局面检测**防止 AI 循环走棋。

## 本章变更

| 文件 | 变更说明 |
|------|----------|
| `search.js` | 新增 `searchQuiesc`（静态搜索）、重复局面检测、空步裁剪 |
| `position.js` | 新增 `inCheck()`（判断是否被将军）、重复局面历史记录 |

## 水平线效应（Horizon Effect）

Minimax / Alpha-Beta 搜索到达固定深度（"水平线"）时，直接用评估函数打分，但此时局面可能正处于"吃子"状态，导致评估不准确。

**例子：** 搜索深度恰好停在"炮打车"那步之前，AI 认为局面平稳，实际上下一步就要被吃掉车。

## 静态搜索（Quiescence Search）

到达水平线后，继续搜索**所有吃子走法**，直到局面"安静"为止：

```javascript
Search.prototype.searchQuiesc = function(vlAlpha, vlBeta) {
  // 1. 检查重复局面
  // 2. 如果被将军，生成全部走法继续搜索
  // 3. 如果未被将军，先做局面评价
  //    如果评价已经够好（>= vlBeta），直接截断
  // 4. 只生成"吃子走法"继续搜索
  // 5. 返回最终稳定局面的评价值
}
```

## 重复局面检测

通过记录历史走法序列，检测当前局面是否已经出现过：

- **长将**（连续将军且循环）：判负
- **一般重复**（无将军的循环）：判和

```javascript
// position.js 中记录每步走法
this.movesList.push(mv);

// 检测重复：与历史局面逐一比对
Position.prototype.checkRepeat = function() { ... }
```

## 空步裁剪（Null Move Pruning）

假设当前玩家"不走"（空步），如果对手搜索后仍然无法获得好局面，说明当前局面已经很有利，可以提前截断：

```javascript
// 尝试空步
if (!noNull && !this.pos.inCheck()) {
  this.pos.nullMove();
  var vl = -this.searchFull(-vlBeta, 1 - vlBeta, depth - NULL_DEPTH - 1, true);
  this.pos.undoNullMove();
  if (vl >= vlBeta) return vl;  // 空步截断
}
```

空步裁剪可减少约 20~30% 的搜索节点。

## 搜索函数层级

```
searchMain()          ← 入口，迭代加深
  └── searchFull()    ← 完整 Alpha-Beta 搜索
        └── searchQuiesc()  ← 静态搜索（到达水平线时调用）
```

## 运行效果
- ✅ 消除水平线效应，局面评估更准确
- ✅ 不再出现长将循环
- ✅ 空步裁剪进一步提升搜索速度
- ❌ 相同局面可能被重复搜索（未引入置换表）

---
[← 第 5 章：Alpha-Beta 搜索](http://www.cnblogs.com/royhoo/p/6425761.html) ｜ [第 7 章：置换表 →](http://www.cnblogs.com/royhoo/p/6425858.html)
