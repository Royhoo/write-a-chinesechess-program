# 第 7 章 — 置换表（Transposition Table）

本章目标：引入 **Zobrist 哈希 + 置换表**，缓存已搜索过的局面，避免重复计算，大幅提升搜索效率。

## 本章变更

| 文件 | 变更说明 |
|------|----------|
| `search.js` | 新增置换表查询（`probeHash`）、置换表存储（`recordHash`），走法排序加入置换表启发和杀手启发 |
| `position.js` | 新增 Zobrist 哈希计算（`zobristKey` / `zobristLock`），每步走棋时增量更新 |

## Zobrist 哈希

为每种棋子在每个位置生成一个随机数，棋局的哈希值 = 所有棋子哈希值的**异或（XOR）**：

```javascript
// 每次走棋时增量更新，无需重新计算整盘局面
this.zobristKey ^= ZOBRIST_TABLE[piece][sq];
this.zobristLock ^= ZOBRIST_LOCK_TABLE[piece][sq];
```

使用**双哈希**（`zobristKey` + `zobristLock`）减少哈希碰撞：
- `zobristKey`：用于索引置换表槽位
- `zobristLock`：用于验证槽位中的局面是否真的匹配

## 置换表结构

```javascript
// 每个表项存储：
{
  zobristLock: ...,  // 局面校验码
  depth: ...,        // 搜索深度
  flag: ...,         // 节点类型（精确值 / Alpha / Beta）
  vl: ...,           // 局面评估值
  mv: ...,           // 最佳走法
}
```

**节点类型（flag）：**
| 类型 | 说明 |
|------|------|
| `HASH_EXACT` | 精确值节点，直接返回 |
| `HASH_ALPHA` | Alpha 节点，值是上界 |
| `HASH_BETA` | Beta 节点，值是下界（发生截断） |

## 走法排序的四个阶段

本章走法排序加入了**置换表启发**和**杀手启发**，优先搜索历史上表现好的走法，提高剪枝效率：

```
阶段 1：置换表走法（上次搜索的最佳走法）  ← 优先级最高
阶段 2：杀手走法 1（在同深度引起 Beta 截断的走法）
阶段 3：杀手走法 2
阶段 4：历史表排序的其余走法              ← 优先级最低
```

## 置换表查询流程

```javascript
Search.prototype.probeHash = function(vlAlpha, vlBeta, depth, mv) {
  var hash = this.getHashItem();
  // 1. 校验 zobristLock，防止哈希碰撞
  if (hash.zobristLock != this.pos.zobristLock) return -MATE_VALUE; // 未命中
  // 2. 若置换表深度 >= 当前搜索深度，可以使用
  mv[0] = hash.mv;
  // 3. 根据节点类型返回精确值或截断
  if (hash.flag == HASH_BETA && hash.vl >= vlBeta) return hash.vl;
  if (hash.flag == HASH_ALPHA && hash.vl <= vlAlpha) return hash.vl;
  if (hash.flag == HASH_EXACT) return hash.vl;
  return -MATE_VALUE; // 查询失败
}
```

## 性能提升

置换表的核心价值在于：搜索树中大量不同路径会到达**相同局面**（"换序"），置换表可以直接复用之前的结果。

实际效果：**搜索速度提升 2~4 倍**，等效搜索深度增加约 1~2 层。

## 运行效果
- ✅ 相同局面不再重复搜索
- ✅ AI 棋力进一步提升
- ✅ 杀手启发 + 置换表启发，剪枝效率大幅提高
- ❌ 尚未接入开局库

---
[← 第 6 章：水平线效应与重复局面](http://www.cnblogs.com/royhoo/p/6425817.html) ｜ [第 8 章：进一步优化 →](http://www.cnblogs.com/royhoo/p/6425912.html)
