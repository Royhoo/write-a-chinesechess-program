"use strict";

// 棋子编号
var PIECE_KING = 0;		// 将
var PIECE_ADVISOR = 1;	// 士
var PIECE_BISHOP = 2;	// 象
var PIECE_KNIGHT = 3;	// 马
var PIECE_ROOK = 4;		// 车
var PIECE_CANNON = 5;	// 炮
var PIECE_PAWN = 6;		// 卒

// 棋盘范围
var RANK_TOP = 3;
var RANK_BOTTOM = 12;
var FILE_LEFT = 3;
var FILE_RIGHT = 11;

// 辅助数组，用于判断棋子是否在棋盘上
var IN_BOARD_ = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

// 判断某位置是否在棋盘
function IN_BOARD(sq) {
  return IN_BOARD_[sq] != 0;
}

// 根据一维矩阵，获取二维矩阵行数
function RANK_Y(sq) {
  return sq >> 4;
}

// 根据一维矩阵，获取二维矩阵列数
function FILE_X(sq) {
  return sq & 15;
}

// 将二维矩阵转换为一维矩阵
function COORD_XY(x, y) {
  return x + (y << 4);
}

function CHR(n) {
  return String.fromCharCode(n);
}

function ASC(c) {
  return c.charCodeAt(0);
}

function CHAR_TO_PIECE(c) {
  switch (c) {
  case "K":
    return PIECE_KING;
  case "A":
    return PIECE_ADVISOR;
  case "B":
    return PIECE_BISHOP;
  case "N":
    return PIECE_KNIGHT;
  case "R":
    return PIECE_ROOK;
  case "C":
    return PIECE_CANNON;
  case "P":
    return PIECE_PAWN;
  default:
    return -1;
  }
}

function Position() {
  
}

// 初始化棋局数组
Position.prototype.clearBoard = function() {
  this.squares = [];	// 这个就是一维棋局数组
  for (var sq = 0; sq < 256; sq ++) {
    this.squares.push(0);
  }
}

// 将棋子pc添加进棋局中的sp位置
Position.prototype.addPiece = function(sq, pc) {
  this.squares[sq] = pc;
}

// 通过FEN串初始化棋局
Position.prototype.fromFen = function(fen) {
  this.clearBoard();
  var y = RANK_TOP;
  var x = FILE_LEFT;
  var index = 0;
  if (index == fen.length) {
    return;
  }
  var c = fen.charAt(index);
  while (c != " ") {
    if (c == "/") {
      x = FILE_LEFT;
      y ++;
      if (y > RANK_BOTTOM) {
        break;
      }
    } else if (c >= "1" && c <= "9") {
      x += (ASC(c) - ASC("0"));
    } else if (c >= "A" && c <= "Z") {
      if (x <= FILE_RIGHT) {
        var pt = CHAR_TO_PIECE(c);
        if (pt >= 0) {
          this.addPiece(COORD_XY(x, y), pt + 8);
        }
        x ++;
      }
    } else if (c >= "a" && c <= "z") {
      if (x <= FILE_RIGHT) {
        var pt = CHAR_TO_PIECE(CHR(ASC(c) + ASC("A") - ASC("a")));
        if (pt >= 0) {
          this.addPiece(COORD_XY(x, y), pt + 16);
        }
        x ++;
      }
    }
    index ++;
    if (index == fen.length) {
      return;
    }
    c = fen.charAt(index);
  }
  index ++;
  if (index == fen.length) {
    return;
  }

}