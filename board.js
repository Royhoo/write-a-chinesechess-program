"use strict";

// 对局结果
var RESULT_UNKNOWN = 0;
var RESULT_WIN = 1;
var RESULT_DRAW = 2;
var RESULT_LOSS = 3;

// 棋盘尺寸（Canvas）
var CELL = 60;           // 格子大小
var PAD  = 48;           // 棋盘内边距（线到canvas边缘）
var BOARD_W = CELL * 8 + PAD * 2;   // 528
var BOARD_H = CELL * 9 + PAD * 2;   // 636
var PIECE_R = 26;        // 棋子半径

// 颜色主题
var CLR_BOARD_BG   = "#f0c060";   // 棋盘背景
var CLR_BOARD_LINE = "#8b4513";   // 棋盘线
var CLR_RED_FILL   = "#c0392b";   // 红方棋子底色
var CLR_RED_BORDER = "#7b241c";   // 红方棋子边框
var CLR_BLK_FILL   = "#1a1a2e";   // 黑方棋子底色
var CLR_BLK_BORDER = "#0d0d1a";   // 黑方棋子边框
var CLR_TEXT_RED   = "#fff8f0";   // 红方文字
var CLR_TEXT_BLK   = "#e0d5c5";   // 黑方文字
var CLR_SELECT     = "rgba(255,220,0,0.85)";   // 选中光晕
var CLR_LAST_MOVE  = "rgba(80,200,120,0.5)";   // 上一步标记

// 棋子汉字映射（piece index → 汉字）
var PIECE_CHN = [
  null, null, null, null, null, null, null, null,
  "帅", "仕", "相", "马", "车", "炮", "兵", null,
  "将", "士", "象", "马", "车", "炮", "卒", null,
];

function SQ_X(sq) { return PAD + (FILE_X(sq) - 3) * CELL; }
function SQ_Y(sq) { return PAD + (RANK_Y(sq) - 3) * CELL; }

function alertDelay(msg) {
  setTimeout(function() { alert(msg); }, 300);
}

// ─── Board 构造函数 ────────────────────────────────────────────────
function Board(container, images) {
  this.images = images;
  this.pos = new Position();
  this.pos.fromFen("rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1");

  this.sqSelected = 0;
  this.mvLast     = 0;
  this.search     = null;
  this.computer   = -1;
  this.result     = RESULT_UNKNOWN;
  this.busy       = false;

  // 创建 Canvas
  this.canvas = document.createElement("canvas");
  this.canvas.width  = BOARD_W;
  this.canvas.height = BOARD_H;
  this.canvas.style.borderRadius = "12px";
  this.canvas.style.boxShadow = "0 8px 32px rgba(0,0,0,0.45)";
  this.canvas.style.cursor = "pointer";
  container.appendChild(this.canvas);

  this.ctx = this.canvas.getContext("2d");

  // 思考指示器（Canvas 覆盖层）
  this.thinkingEl = document.createElement("div");
  this.thinkingEl.id = "thinkingOverlay";
  this.thinkingEl.style.cssText = "display:none;position:absolute;left:0;top:0;width:100%;height:100%;display:none;align-items:center;justify-content:center;pointer-events:none;";
  container.style.position = "relative";
  container.appendChild(this.thinkingEl);

  var this_ = this;
  this.canvas.addEventListener("mousedown", function(e) {
    var rect = this_.canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    this_.handleClick(x, y);
  });

  // 触摸支持
  this.canvas.addEventListener("touchend", function(e) {
    e.preventDefault();
    var rect = this_.canvas.getBoundingClientRect();
    var t = e.changedTouches[0];
    var x = t.clientX - rect.left;
    var y = t.clientY - rect.top;
    this_.handleClick(x, y);
  });

  this.flushBoard();
}

// ─── 设置搜索算法 ───────────────────────────────────────────────
Board.prototype.setSearch = function(hashLevel) {
  this.search = hashLevel == 0 ? null : new Search(this.pos, hashLevel);
};

// ─── 翻转 ────────────────────────────────────────────────────────
Board.prototype.flipped = function(sq) {
  return this.computer == 0 ? SQUARE_FLIP(sq) : sq;
};

Board.prototype.computerMove = function() {
  return this.pos.sdPlayer == this.computer;
};

// ─── 绘制棋盘背景 ────────────────────────────────────────────────
Board.prototype.drawBoardBg = function() {
  var ctx = this.ctx;
  var W = BOARD_W, H = BOARD_H;

  // 木纹渐变背景
  var grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0,   "#f5d07a");
  grad.addColorStop(0.4, "#e8b84b");
  grad.addColorStop(0.7, "#d4a030");
  grad.addColorStop(1,   "#c89020");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, 12);
  ctx.fill();

  // 细木纹纹理（随机水平线）
  ctx.save();
  ctx.globalAlpha = 0.06;
  for (var i = 0; i < H; i += 4) {
    var alpha = 0.02 + Math.random() * 0.04;
    ctx.strokeStyle = "rgba(80,40,0," + alpha + ")";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, i + Math.random() * 2);
    ctx.lineTo(W, i + Math.random() * 2);
    ctx.stroke();
  }
  ctx.restore();

  // 外框
  ctx.strokeStyle = CLR_BOARD_LINE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(8, 8, W - 16, H - 16, 8);
  ctx.stroke();
};

// ─── 绘制棋盘线 ─────────────────────────────────────────────────
Board.prototype.drawBoardLines = function() {
  var ctx = this.ctx;
  ctx.strokeStyle = CLR_BOARD_LINE;
  ctx.lineWidth = 1.5;

  // 横线（10条）
  for (var r = 0; r <= 9; r++) {
    var y = PAD + r * CELL;
    ctx.beginPath();
    ctx.moveTo(PAD, y);
    ctx.lineTo(PAD + 8 * CELL, y);
    ctx.stroke();
  }

  // 竖线（9条，河界断开）
  for (var f = 0; f <= 8; f++) {
    var x = PAD + f * CELL;
    if (f == 0 || f == 8) {
      ctx.beginPath();
      ctx.moveTo(x, PAD);
      ctx.lineTo(x, PAD + 9 * CELL);
      ctx.stroke();
    } else {
      // 上半段
      ctx.beginPath();
      ctx.moveTo(x, PAD);
      ctx.lineTo(x, PAD + 4 * CELL);
      ctx.stroke();
      // 下半段
      ctx.beginPath();
      ctx.moveTo(x, PAD + 5 * CELL);
      ctx.lineTo(x, PAD + 9 * CELL);
      ctx.stroke();
    }
  }

  // 九宫斜线（上）
  ctx.beginPath();
  ctx.moveTo(PAD + 3 * CELL, PAD);
  ctx.lineTo(PAD + 5 * CELL, PAD + 2 * CELL);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(PAD + 5 * CELL, PAD);
  ctx.lineTo(PAD + 3 * CELL, PAD + 2 * CELL);
  ctx.stroke();

  // 九宫斜线（下）
  ctx.beginPath();
  ctx.moveTo(PAD + 3 * CELL, PAD + 7 * CELL);
  ctx.lineTo(PAD + 5 * CELL, PAD + 9 * CELL);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(PAD + 5 * CELL, PAD + 7 * CELL);
  ctx.lineTo(PAD + 3 * CELL, PAD + 9 * CELL);
  ctx.stroke();

  // 河界文字
  ctx.save();
  ctx.font = "bold 18px 'Noto Serif SC', serif";
  ctx.fillStyle = "rgba(100,50,10,0.55)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  var riverY = PAD + 4.5 * CELL;
  ctx.fillText("楚  河", PAD + 2 * CELL, riverY);
  ctx.fillText("汉  界", PAD + 6 * CELL, riverY);
  ctx.restore();

  // 兵/炮定位点（小十字）
  this.drawDots();
};

// ─── 绘制定位点（炮位、兵位） ────────────────────────────────────
Board.prototype.drawDots = function() {
  var ctx = this.ctx;
  var dotPositions = [
    // 炮位
    [1, 2], [7, 2], [1, 7], [7, 7],
    // 兵/卒位
    [0, 3], [2, 3], [4, 3], [6, 3], [8, 3],
    [0, 6], [2, 6], [4, 6], [6, 6], [8, 6],
  ];
  ctx.strokeStyle = CLR_BOARD_LINE;
  ctx.lineWidth = 1.5;
  var d = 5;
  for (var i = 0; i < dotPositions.length; i++) {
    var fx = dotPositions[i][0], ry = dotPositions[i][1];
    var cx = PAD + fx * CELL, cy = PAD + ry * CELL;
    var sides = [];
    if (fx > 0) sides.push([-1, 0]);
    if (fx < 8) sides.push([1,  0]);
    if (ry > 0) sides.push([0, -1]);
    if (ry < 9) sides.push([0,  1]);
    for (var s = 0; s < sides.length; s++) {
      var dx = sides[s][0], dy = sides[s][1];
      ctx.beginPath();
      ctx.moveTo(cx + dx * (d + 1), cy + dy * (d + 1));
      ctx.lineTo(cx + dx * (d + 4), cy + dy * (d + 1));
      ctx.moveTo(cx + dx * (d + 1), cy + dy * (d + 1));
      ctx.lineTo(cx + dx * (d + 1), cy + dy * (d + 4));
      ctx.stroke();
    }
  }
};

// ─── 绘制单个棋子 ────────────────────────────────────────────────
Board.prototype.drawPiece = function(sq, selected, lastMove) {
  var ctx = this.ctx;
  var pc  = this.pos.squares[sq];
  var sqD = this.flipped(sq);
  var cx  = SQ_X(sqD);
  var cy  = SQ_Y(sqD);
  var r   = PIECE_R;

  // 上一步走法高亮
  if (lastMove) {
    ctx.beginPath();
    ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
    ctx.fillStyle = CLR_LAST_MOVE;
    ctx.fill();
  }

  // 选中光晕
  if (selected) {
    ctx.save();
    ctx.shadowColor = "rgba(255,200,0,0.9)";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
    ctx.fillStyle = CLR_SELECT;
    ctx.fill();
    ctx.restore();
  }

  if (pc == 0) return;  // 空格

  var isRed = pc >= 8 && pc <= 15;
  var fillColor   = isRed ? CLR_RED_FILL   : CLR_BLK_FILL;
  var borderColor = isRed ? CLR_RED_BORDER : CLR_BLK_BORDER;
  var textColor   = isRed ? CLR_TEXT_RED   : CLR_TEXT_BLK;

  // 棋子外阴影
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur  = 6;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 3;

  // 棋子主体渐变
  var grd = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.3, r * 0.1, cx, cy, r);
  if (isRed) {
    grd.addColorStop(0,   "#e74c3c");
    grd.addColorStop(0.5, "#c0392b");
    grd.addColorStop(1,   "#7b241c");
  } else {
    grd.addColorStop(0,   "#2c3e50");
    grd.addColorStop(0.5, "#1a252f");
    grd.addColorStop(1,   "#0d1117");
  }
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.restore();

  // 边框
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // 内圈（装饰环）
  ctx.beginPath();
  ctx.arc(cx, cy, r - 5, 0, Math.PI * 2);
  ctx.strokeStyle = isRed ? "rgba(255,200,180,0.35)" : "rgba(180,180,220,0.25)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 高光
  ctx.save();
  var hl = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, 0, cx - r * 0.15, cy - r * 0.2, r * 0.55);
  hl.addColorStop(0, "rgba(255,255,255,0.38)");
  hl.addColorStop(1, "rgba(255,255,255,0)");
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = hl;
  ctx.fill();
  ctx.restore();

  // 棋子文字
  var chn = PIECE_CHN[pc];
  if (chn) {
    ctx.save();
    ctx.font = "bold " + Math.round(r * 1.1) + "px 'Noto Serif SC', '宋体', serif";
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 3;
    ctx.fillText(chn, cx, cy + 1);
    ctx.restore();
  }
};

// ─── 刷新整个棋盘 ────────────────────────────────────────────────
Board.prototype.flushBoard = function() {
  var ctx = this.ctx;
  ctx.clearRect(0, 0, BOARD_W, BOARD_H);
  this.drawBoardBg();
  this.drawBoardLines();

  var srcLast = this.mvLast > 0 ? SRC(this.mvLast) : -1;
  var dstLast = this.mvLast > 0 ? DST(this.mvLast) : -1;

  for (var sq = 0; sq < 256; sq++) {
    if (!IN_BOARD(sq)) continue;
    var sel  = (sq == this.sqSelected);
    var last = (sq == srcLast || sq == dstLast);
    this.drawPiece(sq, sel, last);
  }
};

// ─── 点击处理 ────────────────────────────────────────────────────
Board.prototype.handleClick = function(x, y) {
  if (this.busy || this.result != RESULT_UNKNOWN) return;

  // 找到最近的格子
  var bestSq = -1, bestDist = PIECE_R + 8;
  for (var sq = 0; sq < 256; sq++) {
    if (!IN_BOARD(sq)) continue;
    var sqD = this.flipped(sq);
    var cx = SQ_X(sqD), cy = SQ_Y(sqD);
    var dist = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
    if (dist < bestDist) { bestDist = dist; bestSq = sq; }
  }
  if (bestSq < 0) return;
  this.clickSquare(bestSq);
};

Board.prototype.clickSquare = function(sq) {
  var pc = this.pos.squares[sq];
  if ((pc & SIDE_TAG(this.pos.sdPlayer)) != 0) {
    this.sqSelected = sq;
    this.flushBoard();
  } else if (this.sqSelected > 0) {
    this.addMove(MOVE(this.sqSelected, sq), false);
  }
};

// ─── 走棋逻辑 ────────────────────────────────────────────────────
Board.prototype.addMove = function(mv, computerMove) {
  if (!this.pos.legalMove(mv)) return;
  if (!this.pos.makeMove(mv)) return;
  this.postAddMove(mv, computerMove);
};

Board.prototype.postAddMove = function(mv, computerMove) {
  this.sqSelected = 0;
  this.mvLast = mv;
  this.flushBoard();

  if (this.pos.isMate()) {
    this.result = computerMove ? RESULT_LOSS : RESULT_WIN;
    this.postMate(computerMove);
    return;
  }

  var vlRep = this.pos.repStatus(3);
  if (vlRep > 0) {
    vlRep = this.pos.repValue(vlRep);
    if (vlRep > -WIN_VALUE && vlRep < WIN_VALUE) {
      this.result = RESULT_DRAW;
      alertDelay("双方不变作和，辛苦了！");
    } else if (computerMove == (vlRep < 0)) {
      this.result = RESULT_LOSS;
      alertDelay("长将作负，请不要气馁！");
    } else {
      this.result = RESULT_WIN;
      alertDelay("长将作负，祝贺你取得胜利！");
    }
    this.busy = false;
    return;
  }
  this.response();
};

Board.prototype.postMate = function(computerMove) {
  alertDelay(computerMove ? "请再接再厉！" : "祝贺你取得胜利！");
  this.busy = false;
};

Board.prototype.response = function() {
  if (this.search == null || !this.computerMove()) {
    this.busy = false;
    return;
  }
  this.busy = true;
  var this_ = this;
  // 显示思考动画
  document.getElementById("thinkingOverlay").style.display = "flex";
  setTimeout(function() {
    this_.addMove(board.search.searchMain(LIMIT_DEPTH, 1000), true);
    document.getElementById("thinkingOverlay").style.display = "none";
    this_.busy = false;
  }, 50);
};

Board.prototype.restart = function(fen) {
  if (this.busy) return;
  this.result = RESULT_UNKNOWN;
  this.mvLast = 0;
  this.sqSelected = 0;
  this.pos.fromFen(fen);
  this.flushBoard();
  this.response();
};

Board.prototype.retract = function() {
  if (this.busy) return;
  this.result = RESULT_UNKNOWN;
  if (this.pos.mvList.length > 1) this.pos.undoMakeMove();
  if (this.pos.mvList.length > 1 && this.computerMove()) this.pos.undoMakeMove();
  this.mvLast = this.pos.mvList.length > 0 ? this.pos.mvList[this.pos.mvList.length - 1] : 0;
  this.sqSelected = 0;
  this.flushBoard();
  this.response();
};
