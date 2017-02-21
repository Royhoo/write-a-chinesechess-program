"use strict";

var BOARD_WIDTH = 521;
var BOARD_HEIGHT = 577;
var SQUARE_SIZE = 57;
var SQUARE_LEFT = (BOARD_WIDTH - SQUARE_SIZE * 9) >> 1;
var SQUARE_TOP = (BOARD_HEIGHT - SQUARE_SIZE * 10) >> 1;
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

// Board对象的初始化代码，位于index.html中
function Board(container, images) {
  this.images = images;		// 图片路径
  this.imgSquares = [];		// img数组，对应棋盘上的90个位置区域
  this.pos = new Position();
  this.pos.fromFen("rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1");	// 根据FEN串初始化棋局
  this.sqSelected = 0;		// 当前选中棋子的位置（如果为0，表示当前没有棋子被选中）
  this.mvLast = 0;			// 上一步走法

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

  // 显示棋子图片
  this.flushBoard();
}

// 判断这步棋是否合法，如果合法，则执行这步棋
Board.prototype.addMove = function(mv) {
  // 判断这步棋是否合法
  if (!this.pos.legalMove(mv)) {
    return;
  }
  
  // 执行这步棋
  if (!this.pos.makeMove(mv)) {
    return;
  }
  
  this.postAddMove(mv);
}

Board.prototype.postAddMove = function(mv) {
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
}

// 点击棋盘的响应函数。无论是点击棋子还是空位置，都会调用该函数。sq_是点击的位置
Board.prototype.clickSquare = function(sq_) {
  var sq = sq_;						// 点击的位置
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
    this.addMove(MOVE(this.sqSelected, sq));
  }
}

// 显示sq位置的棋子图片。如果该位置没棋子，则显示一张透明的图片。如果selected为true，则要显示棋子选中时的边框。
Board.prototype.drawSquare = function(sq, selected) {
  var img = this.imgSquares[sq];
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
