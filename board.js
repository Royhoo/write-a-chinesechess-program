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
var PIECE_NAME_CHN = [
  "棋盘", null, null, null, null, null, null, null,
  "红帥", "红仕", "红相", "红馬", "红車", "红砲", "红兵", null,
  "黑将", "黑士", "黑象", "黑馬", "黑車", "黑炮", "黑卒", null,
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
  this.images = images;			// 图片路径
  this.imgSquares = [];			// img数组，对应棋盘上的90个位置区域
  this.pos = new Position();
  this.pos.fromFen("rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1");	// 根据FEN串初始化棋局

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

// 点击棋盘的响应函数。点击棋盘（棋子或者空位置），就会调用该函数。sq_是点击的位置
Board.prototype.clickSquare = function(sq_) {
  alert("您点击了【"+PIECE_NAME_CHN[this.pos.squares[sq_]]+"】");
}

// 显示sq位置的棋子图片。如果该位置没棋子，则显示一张透明的图片
Board.prototype.drawSquare = function(sq) {
  var img = this.imgSquares[sq];
  img.src = this.images + PIECE_NAME[this.pos.squares[sq]] + ".gif";
}

// 重新显示棋盘上的棋子
Board.prototype.flushBoard = function() {
  for (var sq = 0; sq < 256; sq ++) {
    if (IN_BOARD(sq)) {
      this.drawSquare(sq);
    }
  }
}
