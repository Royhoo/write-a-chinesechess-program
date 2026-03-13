# 第 2 章 — 校验棋子走法

本章目标：为每种棋子实现合法走法的校验逻辑，让程序能判断玩家的移动是否符合象棋规则。

## 本章变更

| 文件 | 变更说明 |
|------|----------|
| `position.js` | 新增走法校验（`legalMove`）、走法生成（`generateMoves`）、执行/撤销走法（`makeMove`/`undoMakeMove`） |
| `board.js` | 调用 `legalMove` 过滤非法移动 |

## 核心辅助数组

### IN_BOARD — 判断是否在棋盘内
16×16 的位图，真实棋盘区域标记为 `1`，用于快速越界检测：
```javascript
if (!IN_BOARD(sq)) { /* 超出棋盘 */ }
```

### IN_FORT — 判断是否在九宫内
将、士、帅、仕只能在九宫（3×3）内移动：
```javascript
if (!IN_FORT(sq)) { /* 超出九宫 */ }
```

### LEGAL_SPAN — 将/士/象走法验证表
通过目标位置与起始位置的**差值**来判断走法是否合法：
- 值为 `1`：将/帅的合法移动方向
- 值为 `2`：士/仕的合法移动方向（斜走一格）
- 值为`3`：象/相的合法移动方向（走"田"字）

### KNIGHT_LEG / BISHOP_SPAN — 蹩马腿 / 塞象眼检测
马走"日"字需检测蹩马腿，象走"田"字需检测塞象眼：
```javascript
// 蹩马腿：检测马腿位置是否有棋子
if (this.squares[sq + KNIGHT_LEG[sqDst - sq + 256]] != 0) { return false; }
```

## 各棋子走法规则实现

| 棋子 | 校验逻辑 |
|------|----------|
| 将/帅 | `IN_FORT` + `LEGAL_SPAN == 1`，且不能"将帅对脸" |
| 士/仕 | `IN_FORT` + `LEGAL_SPAN == 2` |
| 象/相 | 不能过河 + `LEGAL_SPAN == 3` + 塞象眼检测 |
| 马 | "日"字位移 + 蹩马腿检测 |
| 车 | 横竖滑动，路径中不能有障碍棋子 |
| 炮 | 移动同车；吃子时路径中恰好有一个棋子（炮架） |
| 兵/卒 | 未过河只能向前；过河后可左右移动，不能后退 |

## 关键函数

```javascript
// 校验单步走法是否合法（用于人机交互层）
Position.prototype.legalMove = function(mv) { ... }

// 生成当前局面所有合法走法（用于 AI 搜索）
Position.prototype.generateMoves = function() { ... }

// 执行一步走法（并验证走后老将是否被攻击）
Position.prototype.makeMove = function(mv) { ... }

// 撤销上一步走法（用于搜索回溯）
Position.prototype.undoMakeMove = function() { ... }
```

## 走法编码
每步走法用一个整数编码，包含起点和终点两个位置：
```javascript
var mv = (sqSrc << 8) | sqDst;  // 高8位=起点，低8位=终点
```

## 运行效果
- ✅ 棋子只能按规则移动
- ✅ 非法走法会被拦截
- ❌ 尚未实现 AI，只能人人对弈

---
[← 第 1 章：界面设计](http://www.cnblogs.com/royhoo/p/6424395.html) ｜ [第 3 章：电脑自动走棋 →](http://www.cnblogs.com/royhoo/p/6425387.html)
