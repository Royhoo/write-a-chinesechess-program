"use strict";

// 对局结果
var RESULT_UNKNOWN = 0;	// 未知
var RESULT_WIN = 1;		// 赢
var RESULT_DRAW = 2;	// 和棋
var RESULT_LOSS = 3;	// 输

var BOARD_WIDTH = 521;
var BOARD_HEIGHT = 577;
var SQUARE_SIZE = 57;
var SQUARE_LEFT = (BOARD_WIDTH - SQUARE_SIZE * 9) >> 1;
var SQUARE_TOP = (BOARD_HEIGHT - SQUARE_SIZE * 10) >> 1;
var THINKING_SIZE = 32;
var THINKING_LEFT = (BOARD_WIDTH - THINKING_SIZE) >> 1;
var THINKING_TOP = (BOARD_HEIGHT - THINKING_SIZE) >> 1;
var PIECE_NAME = [
  "oo", null, null, null, null, null, null, null,
  "rk", "ra", "rb", "rn", "rr", "rc", "rp", null,
  "bk", "ba", "bb", "bn", "br", "bc", "bp", null,
];

// 棋子距离棋盘左边框的距离
function SQ_X(sq) {
  return SQUARE_LEFT + (FILE_X(sq) - 3) * SQUARE_SIZE;
}

// 棋子距离棋盘上边框的距离
function SQ_Y(sq) {
  return SQUARE_TOP + (RANK_Y(sq) - 3) * SQUARE_SIZE;
}

function alertDelay(message) {
  setTimeout(function() {
    alert(message);
  }, 250);
}

function Board(container, images) {
  this.images = images;			// 图片路径
  this.imgSquares = [];			// img数组，对应棋盘上的90个位置区域
  this.pos = new Position();
  this.pos.fromFen("rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1");	// 根据FEN串初始化棋局
  this.sqSelected = 0;			// 当前选中棋子的位置（如果为0，表示当前没有棋子被选中）
  this.mvLast = 0;				// 上一步走法
  this.search = null;			// Search对象的实例
  this.computer = -1;			// this.computer = 0，表示电脑执黑；this.computer = 1，表示电脑执红
  this.result = RESULT_UNKNOWN;	// 对局结果
  this.busy = false;			// false-空闲状态；true-繁忙状态，不再响应用户点击。

  var style = container.style;
  style.position = "relative";
  style.width = BOARD_WIDTH + "px";
  style.height = BOARD_HEIGHT + "px";
  style.background = "url(" + images + "board.jpg)";
  var this_ = this;
  for (var sq = 0; sq < 256; sq ++) {
    // 遍历虚拟棋盘的256个点
	
	// 1.判断该点是否位于真实棋盘
	if (!IN_BOARD(sq)) {
      this.imgSquares.push(null);
      continue;
    }
	
	// 2.棋盘上的90个区域，每个区域都会定义一个对应的img标签
    var img = document.createElement("img");
    var style = img.style;
    style.position = "absolute";
    style.left = SQ_X(sq);
    style.top = SQ_Y(sq);
    style.width = SQUARE_SIZE;
    style.height = SQUARE_SIZE;
    style.zIndex = 0;
	
	// 3.每个棋盘区域都会绑定点击事件，参数sq_表示了具体点击的区域。（这里用到了“闭包”的知识吧）
    img.onmousedown = function(sq_) {
      return function() {
        this_.clickSquare(sq_);
      }
    } (sq);

	// 4.将定义好的img标签追加到html中
    container.appendChild(img);
	
	// 5.将img标签存储到imgSquares数组中，方便后续对该区域进行操作（比如，显示不同的棋子图片）
	this.imgSquares.push(img);
  }
  
  // 电脑思考中的图片（也就是thinking.gif）
  this.thinking = document.createElement("img");
  this.thinking.src = images + "thinking.gif";
  style = this.thinking.style;
  style.visibility = "hidden";
  style.position = "absolute";
  style.left = THINKING_LEFT + "px";
  style.top = THINKING_TOP + "px";
  container.appendChild(this.thinking);

  // 显示棋子图片
  this.flushBoard();
}

// 设置搜索算法
Board.prototype.setSearch = function(hashLevel) {
  this.search = hashLevel == 0 ? null : new Search(this.pos, hashLevel);
}

// 翻转棋盘位置（电脑执红，也就是电脑先走的时候，会把红棋显示在棋盘上面，黑棋显示在下面）
Board.prototype.flipped = function(sq) {
  return this.computer == 0 ? SQUARE_FLIP(sq) : sq;
}

// 如果该电脑走棋，返回true；否则，返回false
Board.prototype.computerMove = function() {
  return this.pos.sdPlayer == this.computer;
}

// 判断这步棋是否合法，如果合法，就执行这步棋
Board.prototype.addMove = function(mv, computerMove) {
  // 判断这步棋是否合法
  if (!this.pos.legalMove(mv)) {
    return;
  }
  
  // 执行这步棋
  if (!this.pos.makeMove(mv)) {
    return;
  }
  
  this.postAddMove(mv, computerMove);
}

Board.prototype.postAddMove = function(mv, computerMove) {
  // 清除上一步的选中方框
  if (this.mvLast > 0) {
    this.drawSquare(SRC(this.mvLast), false);
    this.drawSquare(DST(this.mvLast), false);
  }

  // 显示这一步走棋的选中方框
  this.drawSquare(SRC(mv), true);
  this.drawSquare(DST(mv), true);
  
  this.sqSelected = 0;
  this.mvLast = mv;
  
  // 判断游戏是否结束
  if (this.pos.isMate()) {	// 无棋可走，实际上就是被将死了
    this.result = computerMove ? RESULT_LOSS : RESULT_WIN;
	this.postMate(computerMove);
  }
  
  // 判断是否出现长将
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
  
  // 电脑回一步棋
  this.response();
}

Board.prototype.postMate = function(computerMove) {
  alertDelay(computerMove ? "请再接再厉！" : "祝贺你取得胜利！");
  this.busy = false;
}

// 电脑回一步棋
Board.prototype.response = function() {
  if (this.search == null || !this.computerMove()) {	// 搜索对象为null或者不该电脑走棋
    this.busy = false;
    return;
  }
  this.thinking.style.visibility = "visible";			// 显示电脑思考中的图片
  var this_ = this;
  var mvResult = 0;
  this.busy = true;
  setTimeout(function() {
    this_.addMove(board.search.searchMain(LIMIT_DEPTH, 1000), true);
    this_.thinking.style.visibility = "hidden";
  }, 250);
}

// 点击棋盘的响应函数。点击棋盘（棋子或者空位置），就会调用该函数。sq_是点击的位置
Board.prototype.clickSquare = function(sq_) {
  if (this.busy || this.result != RESULT_UNKNOWN) {
    return;
  }
  var sq = this.flipped(sq_);		// 点击的位置（如果是电脑执红，位置是被翻转的。再执行一遍flipped，位置就被翻转回来了。）
  var pc = this.pos.squares[sq];	// 点击的棋子
  if ((pc & SIDE_TAG(this.pos.sdPlayer)) != 0) {
    // 点击了己方棋子，直接选中该子
	
	if (this.mvLast != 0) {
      this.drawSquare(SRC(this.mvLast), false);
      this.drawSquare(DST(this.mvLast), false);
    }
    if (this.sqSelected) {
      this.drawSquare(this.sqSelected, false);
    }
    this.drawSquare(sq, true);
    this.sqSelected = sq;
  } else if (this.sqSelected > 0) {
    // 点击的不是己方棋子（对方棋子或者无子的位置），但有子选中了(一定是自己的子)，那么执行这个走法
	this.addMove(MOVE(this.sqSelected, sq), false);
  }
}

// 显示sq位置的棋子图片。如果该位置没棋子，则显示一张透明的图片。如果selected为true，则要显示棋子选中时的边框。
Board.prototype.drawSquare = function(sq, selected) {
  var img = this.imgSquares[this.flipped(sq)];
  img.src = this.images + PIECE_NAME[this.pos.squares[sq]] + ".gif";
  img.style.backgroundImage = selected ? "url(" + this.images + "oos.gif)" : "";
}

// 重新显示棋盘上的棋子
Board.prototype.flushBoard = function() {
  for (var sq = 0; sq < 256; sq ++) {
    if (IN_BOARD(sq)) {
      this.drawSquare(sq);
    }
  }
}

// 棋局重新开始
Board.prototype.restart = function(fen) {
  if (this.busy) {				// 电脑正在思考中，不响应任何点击事件
    return;
  }

  this.result = RESULT_UNKNOWN;	// 重置对局结果为“未知”
  this.pos.fromFen(fen);		// 根据用户选择的局面重新开始
  this.flushBoard();			// 重新显示棋盘
  this.response();				// 如果电脑执红先走，会自动走步棋。
}

// 悔棋
Board.prototype.retract = function() {
  if (this.busy) {
    return;
  }

  // 重置对局结果为“未知”
  this.result = RESULT_UNKNOWN;
  
  // 如果走法数组不为空，那么就撤销一步棋
  if (this.pos.mvList.length > 1) {
    this.pos.undoMakeMove();
  }
  
  // 如果走法数组不为空，并且该电脑走棋，那么需要再撤销一步棋
  if (this.pos.mvList.length > 1 && this.computerMove()) {
    this.pos.undoMakeMove();
  }

  this.flushBoard();
  this.response();
}
