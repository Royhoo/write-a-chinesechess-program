# 第 8 章 — 进一步优化（最终版）

本章目标：接入**开局库**，加入**渴望搜索（Aspiration Window）**等高级优化，完成完整的中国象棋 AI 程序。

## 本章变更

| 文件 | 变更说明 |
|------|----------|
| `book.js` | 开局库数据（约 300KB，来自 xqbase.com，GPL 协议） |
| `search.js` | 接入开局库、渴望搜索窗口优化 |
| `position.js` | 新增 `bookMove()` 方法查询开局库 |
| `index.html` | 界面完善，支持难度选择 |

## 开局库（Opening Book）

象棋开局变化繁多，AI 在开局阶段计算量极大且容易出错。开局库收录了大量经过验证的标准开局走法，AI 优先从库中查找走法：

```javascript
// search.js 中优先查询开局库
this.mvResult = this.pos.bookMove();
if (this.mvResult > 0) {
  // 验证开局库走法不会导致长将或和棋
  if (!checkRepeatOrMate()) return this.mvResult;
}
// 开局库未命中，回退到 Alpha-Beta 搜索
```

开局库数据来自 [xqbase.com](http://www.xqbase.com)，包含数千个标准开局变化，覆盖顺炮、当头炮、飞相等主流开局。

## 渴望搜索（Aspiration Window）

在迭代加深中，利用上一层搜索的结果缩小 Alpha-Beta 的搜索窗口：

```javascript
// 用上次结果 ±ASPIRATION_WINDOW 作为初始窗口
var vlAlpha = vl - ASPIRATION_WINDOW;
var vlBeta  = vl + ASPIRATION_WINDOW;
vl = this.searchFull(vlAlpha, vlBeta, i);

// 若搜索失败（窗口太窄），用全窗口重搜
if (vl <= vlAlpha || vl >= vlBeta) {
  vl = this.searchFull(-MATE_VALUE, MATE_VALUE, i);
}
```

窗口缩小后，大部分情况下可以产生更多 Beta 截断，节省约 10~15% 的搜索时间。

## 完整 AI 流程总结

```
searchMain()
  ├── 1. 查询开局库 → bookMove()
  │       ↓ 命中则直接返回
  ├── 2. 迭代加深（渴望窗口）
  │     for depth = 1 → maxDepth:
  │       searchFull(vlAlpha, vlBeta, depth)
  │         ├── probeHash()        ← 查置换表
  │         ├── Null Move Pruning  ← 空步裁剪
  │         ├── MoveSort()         ← 走法排序（置换表→杀手→历史）
  │         ├── makeMove() / undoMakeMove()
  │         ├── searchQuiesc()     ← 水平线 → 静态搜索
  │         └── recordHash()       ← 存置换表
  └── 3. 返回最佳走法
```

## 最终版技术栈一览

| 技术 | 章节 | 作用 |
|------|------|------|
| 虚拟棋盘 + 位操作 | 1 | 快速棋盘表示 |
| 走法校验 + 生成 | 2 | 合法走法枚举 |
| Minimax | 4 | 博弈树搜索基础 |
| Alpha-Beta 剪枝 | 5 | 搜索效率翻倍 |
| 迭代加深 | 5 | 时间控制 |
| 历史启发 | 5 | 走法排序优化 |
| 静态搜索 | 6 | 消除水平线效应 |
| 重复局面检测 | 6 | 防止长将循环 |
| 空步裁剪 | 6 | 减少搜索节点 |
| Zobrist 哈希 | 7 | 局面唯一标识 |
| 置换表 | 7 | 缓存搜索结果 |
| 杀手走法启发 | 7 | 提升剪枝率 |
| 开局库 | 8 | 开局阶段直接查表 |
| 渴望搜索窗口 | 8 | 迭代加深优化 |

## 运行效果
- ✅ 完整可用的象棋 AI 程序
- ✅ 开局阶段使用标准开局库
- ✅ 搜索深度达 6~8 层（视硬件而定）
- ✅ 具备一定水平，可与普通棋手对弈

## 在线体验
🎮 [点击这里试玩](https://royhoo.github.io/write-a-chinesechess-program/)

---
[← 第 7 章：置换表](http://www.cnblogs.com/royhoo/p/6425858.html)
