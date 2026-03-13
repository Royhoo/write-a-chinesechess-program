# 第 1 章 — 界面设计

本章目标：用 HTML + JavaScript 搭建中国象棋的基本界面，在浏览器中渲染棋盘和棋子。

## 本章新增文件

| 文件 | 说明 |
|------|------|
| `index.html` | 入口页面，引入脚本并初始化棋盘 |
| `board.js` | `Board` 对象，负责棋盘渲染与交互 |
| `position.js` | `Position` 对象，负责棋局状态管理 |
| `images/` | 棋盘与棋子图片资源 |

## 核心数据结构

### 棋盘坐标系
程序使用 **16×16 的虚拟棋盘**（共 256 个点），真实棋盘是其中的 **9×10 = 90 个点**。

```
虚拟棋盘：16 × 16 = 256 个点（用 0~255 编号）
真实棋盘：行 3~12，列 3~11（共 90 个点）
```

这样设计的好处是：可以用一次加减法判断棋子是否越界，避免繁琐的边界判断。

### 棋子编号
```javascript
var PIECE_KING     = 0;  // 将 / 帅
var PIECE_ADVISOR  = 1;  // 士 / 仕
var PIECE_BISHOP   = 2;  // 象 / 相
var PIECE_KNIGHT   = 3;  // 马 / 馬
var PIECE_ROOK     = 4;  // 车 / 車
var PIECE_CANNON   = 5;  // 炮 / 砲
var PIECE_PAWN     = 6;  // 卒 / 兵
```

### FEN 串
棋局初始状态用 **FEN（Forsyth-Edwards Notation）** 串表示：

```
rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1
```

大写字母代表红方，小写字母代表黑方：`r=车 n=马 b=象 a=士 k=将 c=炮 p=兵`

## 关键实现

### Board 对象初始化
```javascript
var board = new Board(container, "images/");
```
- 读取 FEN 串，初始化棋局
- 为棋盘上 90 个位置各创建一个 `<img>` 标签
- 绑定点击事件，处理选子和落子

### 棋盘渲染
```javascript
// 棋子像素位置计算
function SQ_X(sq) { return SQUARE_LEFT + (FILE_X(sq) - 3) * SQUARE_SIZE; }
function SQ_Y(sq) { return SQUARE_TOP  + (RANK_Y(sq) - 3) * SQUARE_SIZE; }
```

## 运行效果
- ✅ 棋盘和棋子正确显示
- ✅ 点击棋子可以选中（高亮）
- ❌ 尚未实现走法校验（任意位置都能移动）

---
[← 第 0 章：前言](http://www.cnblogs.com/royhoo/p/6426394.html) ｜ [第 2 章：校验棋子走法 →](http://www.cnblogs.com/royhoo/p/6424840.html)
