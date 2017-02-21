"use strict";

var MATE_VALUE = 10000;	// 最高分值

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

var ADD_PIECE = false;	// 添加棋子
var DEL_PIECE = true;	// 删除棋子

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

// 辅助数组，用于判断是否在九宫
var IN_FORT_ = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

// 辅助数组，用于校验将（帅）、士（仕）、象（相）的走法是否合法
var LEGAL_SPAN = [
                       0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 2, 1, 2, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 2, 1, 2, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0,
];

// 辅助数组，用于校验马的走法是否合理。如果合理，返回对应马脚的方向；否则，返回0
var KNIGHT_PIN_ = [
                              0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,-16,  0,-16,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0, -1,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0, -1,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0, 16,  0, 16,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  0,  0,  0,  0,  0,  0,  0,
];

var KING_DELTA = [-16, -1, 1, 16];
var ADVISOR_DELTA = [-17, -15, 15, 17];
var KNIGHT_DELTA = [[-33, -31], [-18, 14], [-14, 18], [31, 33]];
var KNIGHT_CHECK_DELTA = [[-33, -18], [-31, -14], [14, 31], [18, 33]];

// 棋子位置价值数组
var PIECE_VALUE = [
  [	// 帅（与兵合并）
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  9,  9,  9, 11, 13, 11,  9,  9,  9,  0,  0,  0,  0,
    0,  0,  0, 19, 24, 34, 42, 44, 42, 34, 24, 19,  0,  0,  0,  0,
    0,  0,  0, 19, 24, 32, 37, 37, 37, 32, 24, 19,  0,  0,  0,  0,
    0,  0,  0, 19, 23, 27, 29, 30, 29, 27, 23, 19,  0,  0,  0,  0,
    0,  0,  0, 14, 18, 20, 27, 29, 27, 20, 18, 14,  0,  0,  0,  0,
    0,  0,  0,  7,  0, 13,  0, 16,  0, 13,  0,  7,  0,  0,  0,  0,
    0,  0,  0,  7,  0,  7,  0, 15,  0,  7,  0,  7,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  2,  2,  2,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0, 11, 15, 11,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  ], [	// 仕
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0, 20,  0,  0,  0, 20,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0, 18,  0,  0, 20, 23, 20,  0,  0, 18,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0, 23,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0, 20, 20,  0, 20, 20,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  ], [	// 相
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0, 20,  0,  0,  0, 20,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0, 18,  0,  0, 20, 23, 20,  0,  0, 18,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0, 23,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0, 20, 20,  0, 20, 20,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  ], [	// 马
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0, 90, 90, 90, 96, 90, 96, 90, 90, 90,  0,  0,  0,  0,
    0,  0,  0, 90, 96,103, 97, 94, 97,103, 96, 90,  0,  0,  0,  0,
    0,  0,  0, 92, 98, 99,103, 99,103, 99, 98, 92,  0,  0,  0,  0,
    0,  0,  0, 93,108,100,107,100,107,100,108, 93,  0,  0,  0,  0,
    0,  0,  0, 90,100, 99,103,104,103, 99,100, 90,  0,  0,  0,  0,
    0,  0,  0, 90, 98,101,102,103,102,101, 98, 90,  0,  0,  0,  0,
    0,  0,  0, 92, 94, 98, 95, 98, 95, 98, 94, 92,  0,  0,  0,  0,
    0,  0,  0, 93, 92, 94, 95, 92, 95, 94, 92, 93,  0,  0,  0,  0,
    0,  0,  0, 85, 90, 92, 93, 78, 93, 92, 90, 85,  0,  0,  0,  0,
    0,  0,  0, 88, 85, 90, 88, 90, 88, 90, 85, 88,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  ], [	// 车
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,206,208,207,213,214,213,207,208,206,  0,  0,  0,  0,
    0,  0,  0,206,212,209,216,233,216,209,212,206,  0,  0,  0,  0,
    0,  0,  0,206,208,207,214,216,214,207,208,206,  0,  0,  0,  0,
    0,  0,  0,206,213,213,216,216,216,213,213,206,  0,  0,  0,  0,
    0,  0,  0,208,211,211,214,215,214,211,211,208,  0,  0,  0,  0,
    0,  0,  0,208,212,212,214,215,214,212,212,208,  0,  0,  0,  0,
    0,  0,  0,204,209,204,212,214,212,204,209,204,  0,  0,  0,  0,
    0,  0,  0,198,208,204,212,212,212,204,208,198,  0,  0,  0,  0,
    0,  0,  0,200,208,206,212,200,212,206,208,200,  0,  0,  0,  0,
    0,  0,  0,194,206,204,212,200,212,204,206,194,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  ], [	// 炮
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,100,100, 96, 91, 90, 91, 96,100,100,  0,  0,  0,  0,
    0,  0,  0, 98, 98, 96, 92, 89, 92, 96, 98, 98,  0,  0,  0,  0,
    0,  0,  0, 97, 97, 96, 91, 92, 91, 96, 97, 97,  0,  0,  0,  0,
    0,  0,  0, 96, 99, 99, 98,100, 98, 99, 99, 96,  0,  0,  0,  0,
    0,  0,  0, 96, 96, 96, 96,100, 96, 96, 96, 96,  0,  0,  0,  0,
    0,  0,  0, 95, 96, 99, 96,100, 96, 99, 96, 95,  0,  0,  0,  0,
    0,  0,  0, 96, 96, 96, 96, 96, 96, 96, 96, 96,  0,  0,  0,  0,
    0,  0,  0, 97, 96,100, 99,101, 99,100, 96, 97,  0,  0,  0,  0,
    0,  0,  0, 96, 97, 98, 98, 98, 98, 98, 97, 96,  0,  0,  0,  0,
    0,  0,  0, 96, 96, 97, 99, 99, 99, 97, 96, 96,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  ], [	// 兵（与帅合并）
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  9,  9,  9, 11, 13, 11,  9,  9,  9,  0,  0,  0,  0,
    0,  0,  0, 19, 24, 34, 42, 44, 42, 34, 24, 19,  0,  0,  0,  0,
    0,  0,  0, 19, 24, 32, 37, 37, 37, 32, 24, 19,  0,  0,  0,  0,
    0,  0,  0, 19, 23, 27, 29, 30, 29, 27, 23, 19,  0,  0,  0,  0,
    0,  0,  0, 14, 18, 20, 27, 29, 27, 20, 18, 14,  0,  0,  0,  0,
    0,  0,  0,  7,  0, 13,  0, 16,  0, 13,  0,  7,  0,  0,  0,  0,
    0,  0,  0,  7,  0,  7,  0, 15,  0,  7,  0,  7,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  2,  2,  2,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0, 11, 15, 11,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  ],
];

// 判断某位置是否在棋盘
function IN_BOARD(sq) {
  return IN_BOARD_[sq] != 0;
}

// 判断某位置是否在九宫格
function IN_FORT(sq) {
  return IN_FORT_[sq] != 0;
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

function SQUARE_FLIP(sq) {
  return 254 - sq;
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

// 获得红黑标记(红子是8，黑子是16)
function SIDE_TAG(sd) {
  return 8 + (sd << 3);
}

// 获得对方红黑标记
function OPP_SIDE_TAG(sd) {
  return 16 - (sd << 3);
}

// 获取走法的起点
function SRC(mv) {
  return mv & 255;
}

// 获取走法的终点
function DST(mv) {
  return mv >> 8;
}

// 将一个走法的起点和终点，转化为一个整型数字
function MOVE(sqSrc, sqDst) {
  return sqSrc + (sqDst << 8);
}

// sp是棋子位置，sd是走棋方（红方0，黑方1）。返回兵（卒）向前走一步的位置。
function SQUARE_FORWARD(sq, sd) {
  return sq - 16 + (sd << 5);
}

// 校验将（帅）的走法
function KING_SPAN(sqSrc, sqDst) {
  return LEGAL_SPAN[sqDst - sqSrc + 256] == 1;
}

// 检验士（仕）的走法
function ADVISOR_SPAN(sqSrc, sqDst) {
  return LEGAL_SPAN[sqDst - sqSrc + 256] == 2;
}

// 校验象（相）的走法
function BISHOP_SPAN(sqSrc, sqDst) {
  return LEGAL_SPAN[sqDst - sqSrc + 256] == 3;
}

// 象眼的位置
function BISHOP_PIN(sqSrc, sqDst) {
  return (sqSrc + sqDst) >> 1;
}

// 如果马的走法合法，则返回相应马脚的位置。否则返回sqSrc。
function KNIGHT_PIN(sqSrc, sqDst) {
  return sqSrc + KNIGHT_PIN_[sqDst - sqSrc + 256];
}

// sp是棋子位置，sd是走棋方（红方0，黑方1）。如果该位置未过河，则返回true；否则返回false。
function HOME_HALF(sq, sd) {
  return (sq & 0x80) != (sd << 7);
}

// sp是棋子位置，sd是走棋方（红方0，黑方1）。如果该位置已过河，则返回true；否则返回false。
function AWAY_HALF(sq, sd) {
  return (sq & 0x80) == (sd << 7);
}

// 如果从起点sqSrc到终点sqDst没有过河，则返回true；否则返回false
function SAME_HALF(sqSrc, sqDst) {
  return ((sqSrc ^ sqDst) & 0x80) == 0;
}

// 如果sqSrc和sqDst在同一行则返回true，否则返回false
function SAME_RANK(sqSrc, sqDst) {
  return ((sqSrc ^ sqDst) & 0xf0) == 0;
}

// 如果sqSrc和sqDst在同一列则返回true，否则返回false
function SAME_FILE(sqSrc, sqDst) {
  return ((sqSrc ^ sqDst) & 0x0f) == 0;
}

function Position() {
  
}

// 初始化棋局数组
Position.prototype.clearBoard = function() {
  this.sdPlayer = 0;	// 该谁走棋。0-红方；1-黑方
  this.squares = [];	// 这个就是一维棋局数组
  for (var sq = 0; sq < 256; sq ++) {
    this.squares.push(0);
  }
  this.vlWhite = this.vlBlack = 0;
}

Position.prototype.setIrrev = function() {
  this.mvList = [0];	// 存放每步走法的数组
  this.pcList = [0];	// 存放每步被吃的棋子。如果没有棋子被吃，存放的是0
  this.distance = 0;	// 步数
}

// 将FEN串转为一维数组，初始化棋局
Position.prototype.fromFen = function(fen) {
  this.clearBoard();
  var y = RANK_TOP;
  var x = FILE_LEFT;
  var index = 0;
  if (index == fen.length) {
    this.setIrrev();
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
      this.setIrrev();
	  return;
    }
    c = fen.charAt(index);
  }
  index ++;
  if (index == fen.length) {
    this.setIrrev();
	return;
  }

  this.setIrrev();
}

// 生成棋局的所有走法
Position.prototype.generateMoves = function() {
  var mvs = [];									// 用于存储所有合法的走法
  var pcSelfSide = SIDE_TAG(this.sdPlayer);		// 本方红黑标记(红子是8，黑子是16)
  var pcOppSide = OPP_SIDE_TAG(this.sdPlayer);	// 对方红黑标记(红子是16，黑子是8)
  for (var sqSrc = 0; sqSrc < 256; sqSrc ++) {
    // 遍历虚拟棋盘的256个点
  
    var pcSrc = this.squares[sqSrc];		// 某个位置上的棋子
    if ((pcSrc & pcSelfSide) == 0) {		// 这是对方棋子，或者该位置根本没有棋子
	  continue;
    }
    switch (pcSrc - pcSelfSide) {
    case PIECE_KING:
      for (var i = 0; i < 4; i ++) {		// 将的4个方向
        var sqDst = sqSrc + KING_DELTA[i];	// 得到一个可能的终点位置
        if (!IN_FORT(sqDst)) {				// 该位置不位于九宫中，不合法
          continue;
        }
        var pcDst = this.squares[sqDst];	// 获得终点位置棋子
        if ((pcDst & pcSelfSide) == 0) {	// 终点位置的棋子不是本方棋子，或者终点根本没有棋子
          mvs.push(MOVE(sqSrc, sqDst));		// 步骤合法，保存到数组中
        }
      }
      break;
    case PIECE_ADVISOR:
      for (var i = 0; i < 4; i ++) {		// 仕的4个方向
        var sqDst = sqSrc + ADVISOR_DELTA[i];	// 得到一个可能的终点位置
        if (!IN_FORT(sqDst)) {				// 该位置不位于九宫中，不合法
          continue;
        }
        var pcDst = this.squares[sqDst];	// 获得终点棋子
        if ((pcDst & pcSelfSide) == 0) {	// 终点位置的棋子不是本方棋子，或者终点根本没有棋子
          mvs.push(MOVE(sqSrc, sqDst));		// 步骤合法，保存到数组中
        }
      }
      break;
    case PIECE_BISHOP:
      for (var i = 0; i < 4; i ++) {		// 象的4个方向
        var sqDst = sqSrc + ADVISOR_DELTA[i];	// 获得象眼的位置
        if (!(IN_BOARD(sqDst) && HOME_HALF(sqDst, this.sdPlayer) &&
            this.squares[sqDst] == 0)) {	//	象眼不在棋盘上，或者象眼位置已过河，或者象眼存在棋子
          continue;
        }
        sqDst += ADVISOR_DELTA[i];			// 得到一个可能的终点位置
        var pcDst = this.squares[sqDst];	// 得到终点位置的棋子
        if ((pcDst & pcSelfSide) == 0) {	// 终点位置没有本方棋子
          mvs.push(MOVE(sqSrc, sqDst));		// 步骤合法，保存到数组
        }
      }
      break;
    case PIECE_KNIGHT:
      for (var i = 0; i < 4; i ++) {		// 马腿的4个方向
        var sqDst = sqSrc + KING_DELTA[i];	// 得到一个马腿的位置
        if (this.squares[sqDst] > 0) {		// 马腿位置存在棋子
          continue;
        }
        for (var j = 0; j < 2; j ++) {		// 1个马腿对应2个马的方向
          sqDst = sqSrc + KNIGHT_DELTA[i][j];	// 得到一个可能的终点位置
          if (!IN_BOARD(sqDst)) {			// 该位置不在棋盘上
            continue;
          }
          var pcDst = this.squares[sqDst];	// 得到终点位置的棋子
          if ((pcDst & pcSelfSide) == 0) {	// 终点位置不存在本方棋子
            mvs.push(MOVE(sqSrc, sqDst));
          }
        }
      }
      break;
    case PIECE_ROOK:
      for (var i = 0; i < 4; i ++) {
        var delta = KING_DELTA[i];	// 得到一个方向
        var sqDst = sqSrc + delta;	// 从起点sqSrc开始，沿着方向delta走一步
        while (IN_BOARD(sqDst)) {	// 得到的终点位于棋盘
          var pcDst = this.squares[sqDst];
          if (pcDst == 0) {			// 终点没有棋子，走法合法
            mvs.push(MOVE(sqSrc, sqDst));
          } else {
            if ((pcDst & pcOppSide) != 0) {	// 终点有对方棋子，走法合法
              mvs.push(MOVE(sqSrc, sqDst));
            }
            break;
          }
          sqDst += delta;			// 沿着方向delta向前走一步
        }
      }
      break;
    case PIECE_CANNON:
      for (var i = 0; i < 4; i ++) {
        var delta = KING_DELTA[i];	// 得到一个方向
        var sqDst = sqSrc + delta;	// 从起点sqSrc开始，沿着方向delta走一步
        while (IN_BOARD(sqDst)) {	// 得到的终点位于棋盘
          var pcDst = this.squares[sqDst];
          if (pcDst == 0) {			// 终点没有棋子，走法合法
            mvs.push(MOVE(sqSrc, sqDst));
          } else {
            // 终点存在棋子，炮需要翻山
			break;
          }
          sqDst += delta;			// 沿着方向delta向前走一步
        }
        sqDst += delta;				// 沿着方向delta向前走一步
        while (IN_BOARD(sqDst)) {	// 如果sqDst仍位于棋盘，那么此时炮已经翻山了
          var pcDst = this.squares[sqDst];
          if (pcDst > 0) {			// 炮翻山后遇到了一个棋子
            if ((pcDst & pcOppSide) != 0) {	// 炮翻山后，遇到的是一个对方棋子
              mvs.push(MOVE(sqSrc, sqDst));
            }
            break;					// 炮翻山后，不管遇到的是对方棋子，还是己方棋子，都要结束对当前方向的搜索
          }
          sqDst += delta;
        }
      }
      break;
    case PIECE_PAWN:
      var sqDst = SQUARE_FORWARD(sqSrc, this.sdPlayer);	// 得到兵前进一步的位置
      if (IN_BOARD(sqDst)) {							// 该位置在棋盘上
        var pcDst = this.squares[sqDst];
        if ((pcDst & pcSelfSide) == 0) {				// 目标位置没有本方棋子
          mvs.push(MOVE(sqSrc, sqDst));
        }
      }
      if (AWAY_HALF(sqSrc, this.sdPlayer)) {			// 这个兵已过河
        for (var delta = -1; delta <= 1; delta += 2) {	// delta只能取-1和1两个值，这是兵的左右两个方向
          sqDst = sqSrc + delta;
          if (IN_BOARD(sqDst)) {						// 该位置在棋盘上
            var pcDst = this.squares[sqDst];
            if ((pcDst & pcSelfSide) == 0) {			// 目标位置没有本方棋子
              mvs.push(MOVE(sqSrc, sqDst));
            }
          }
        }
      }
      break;
    }
  }
  return mvs;
}

// 判断步骤是否合法。是则返回true，否则返回false
Position.prototype.legalMove = function(mv) {
  var sqSrc = SRC(mv);						// 获取走法的起点位置
  var pcSrc = this.squares[sqSrc];			// 获取起点位置的棋子
  var pcSelfSide = SIDE_TAG(this.sdPlayer);	// 红黑标记(红子是8，黑子是16) 
  
  if ((pcSrc & pcSelfSide) == 0) {
    // 起点位置的棋子，不是本方棋子。（是对方棋子，或者根本没有棋子）
	return false;
  }

  var sqDst = DST(mv);				// 获取走法的终点位置
  var pcDst = this.squares[sqDst];	// 获取终点位置的棋子
  
  if ((pcDst & pcSelfSide) != 0) {
    // 终点位置有棋子，而且是本方棋子
	return false;
  }

  switch (pcSrc - pcSelfSide) {
  case PIECE_KING:		// 起点棋子是将（帅），校验走法
    return IN_FORT(sqDst) && KING_SPAN(sqSrc, sqDst);
  case PIECE_ADVISOR:	// 起点棋子是仕（仕），校验走法
    return IN_FORT(sqDst) && ADVISOR_SPAN(sqSrc, sqDst);
  case PIECE_BISHOP:	// 起点棋子是象（相），校验走法
    return SAME_HALF(sqSrc, sqDst) && BISHOP_SPAN(sqSrc, sqDst) &&
        this.squares[BISHOP_PIN(sqSrc, sqDst)] == 0;
  case PIECE_KNIGHT:	// 起点棋子是马，校验走法
    var sqPin = KNIGHT_PIN(sqSrc, sqDst);
    return sqPin != sqSrc && this.squares[sqPin] == 0;
  case PIECE_ROOK:		// 起点棋子是车，校验走法
  case PIECE_CANNON:	// 起点棋子是炮，校验走法
    var delta;			// 标识沿哪个方向走棋
    if (SAME_RANK(sqSrc, sqDst)) {
	  // 起点和终点位于同一行。再根据起点和终点的大小关系，判断具体是沿哪个方向走棋。
      delta = (sqDst < sqSrc ? -1 : 1);
    } else if (SAME_FILE(sqSrc, sqDst)) {
	  // 起点和终点位于同一列。再根据起点和终点的大小关系，判断具体是沿哪个方向走棋。
      delta = (sqDst < sqSrc ? -16 : 16);
    } else {
	  // 起点和终点不在同一行，也不在同一列。走法是非法的。
      return false;
    }
    var sqPin = sqSrc + delta;	// 沿着方向delta走一步棋
    while (sqPin != sqDst && this.squares[sqPin] == 0) {
      // 沿方向delta一步步向前走，直到遇到棋子，或者sqPin走到了终点的位置上
	  sqPin += delta;
    }
    if (sqPin == sqDst) {
	  // 如果终点没有棋子，不管是车还是炮，这步棋都是合法的。如果是车，不管终点有没有棋子（对方棋子），这步棋都合法。
      return pcDst == 0 || pcSrc - pcSelfSide == PIECE_ROOK;
    }
	// 此时已经翻山，终点必须有棋子，并且行棋的是炮，否则这步棋不合法
    if (pcDst == 0 || pcSrc - pcSelfSide != PIECE_CANNON) {
      return false;
    }
    sqPin += delta;
    while (sqPin != sqDst && this.squares[sqPin] == 0) {
      sqPin += delta;
    }
    return sqPin == sqDst;
  case PIECE_PAWN:
    // 兵已过河，并且是左右两个方向走的
    if (AWAY_HALF(sqDst, this.sdPlayer) && (sqDst == sqSrc - 1 || sqDst == sqSrc + 1)) {
      return true;
    }
	// 判断兵是不是在向前走
    return sqDst == SQUARE_FORWARD(sqSrc, this.sdPlayer);
  default:
    return false;
  }
}

/**
* 判断将（帅）是否被对方攻击。
* @return boolean true-被攻击 false-没有被攻击
*/
Position.prototype.checked = function() {
  var pcSelfSide = SIDE_TAG(this.sdPlayer);		// 己方红黑标记
  var pcOppSide = OPP_SIDE_TAG(this.sdPlayer);	// 对方红黑标记
  for (var sqSrc = 0; sqSrc < 256; sqSrc ++) {
    // 遍历棋局数组，直到遇见己方的将（帅）
	if (this.squares[sqSrc] != pcSelfSide + PIECE_KING) {
      continue;
    }
    
	// 判断对方进兵，是否会攻击到己方老将
	if (this.squares[SQUARE_FORWARD(sqSrc, this.sdPlayer)] == pcOppSide + PIECE_PAWN) {
      return true;
    }
	// 判断对方平兵（前提是并已过河），是否会攻击到己方老将
    for (var delta = -1; delta <= 1; delta += 2) {
      if (this.squares[sqSrc + delta] == pcOppSide + PIECE_PAWN) {
        return true;
      }
    }
	
	// 判断对方马是否攻击到己方老将
    for (var i = 0; i < 4; i ++) {
      if (this.squares[sqSrc + ADVISOR_DELTA[i]] != 0) {	// 马蹄有子，不用害怕哦
        continue;
      }
      for (var j = 0; j < 2; j ++) {
        var pcDst = this.squares[sqSrc + KNIGHT_CHECK_DELTA[i][j]];
        if (pcDst == pcOppSide + PIECE_KNIGHT) {
          return true;
        }
      }
    }
	
	// 判断对方的车、炮是攻击到了己方老将，以及将帅是否对脸
    for (var i = 0; i < 4; i ++) {
      var delta = KING_DELTA[i];
      var sqDst = sqSrc + delta;
      while (IN_BOARD(sqDst)) {
        var pcDst = this.squares[sqDst];
        if (pcDst > 0) {
          if (pcDst == pcOppSide + PIECE_ROOK || pcDst == pcOppSide + PIECE_KING) {	// 对方车能攻击己方老将，或者将帅对脸。
            return true;
          }
          break;
        }
        sqDst += delta;
      }
      sqDst += delta;
      while (IN_BOARD(sqDst)) {
        var pcDst = this.squares[sqDst];
        if (pcDst > 0) {
          if (pcDst == pcOppSide + PIECE_CANNON) {
            return true;
          }
          break;
        }
        sqDst += delta;
      }
    }
    return false;
  }
  return false;
}

// 无棋可走的话，返回true，否则返回false
Position.prototype.isMate = function() {
  var mvs = this.generateMoves(null);
  for (var i = 0; i < mvs.length; i ++) {
    if (this.makeMove(mvs[i])) {
      this.undoMakeMove();
      return false;
    }
  }
  return true;
}

// 切换走棋方
Position.prototype.changeSide = function() {
  this.sdPlayer = 1 - this.sdPlayer;
}

// 走一步棋
Position.prototype.makeMove = function(mv) {
  this.movePiece(mv);		// 移动棋子
  
  // 检查走棋是否被将军。如果是，说明这是在送死，撤销走棋并返回false。
  if (this.checked()) {	
    this.undoMovePiece(mv);	// 撤销棋子移动
    return false;
  }

  this.changeSide();		// 切换走棋方
  this.distance ++;			// 棋局深度+1
  return true;
}

// 取消上一步的走棋
Position.prototype.undoMakeMove = function() {
  this.distance --;	// 棋局深度减1
  this.changeSide();	// 切换走棋方
  this.undoMovePiece();	// 取消上一步的走棋
}

// 根据走法移动棋子，删除终点位置的棋子，将起点位置的棋子放置在终点的位置。
Position.prototype.movePiece = function(mv) {
  var sqSrc = SRC(mv);			// 起点位置
  var sqDst = DST(mv);			// 终点位置
  var pc = this.squares[sqDst];	// 终点位置的棋子
  this.pcList.push(pc);			// 将终点位置的棋子，存入吃子列表
  if (pc > 0) {
    // 终点有棋子，则要删除该棋子
    this.addPiece(sqDst, pc, DEL_PIECE);
  }
  pc = this.squares[sqSrc];
  this.addPiece(sqSrc, pc, DEL_PIECE);	// 删除起点棋子
  this.addPiece(sqDst, pc, ADD_PIECE);	// 将原来起点的棋子添加到终点
  this.mvList.push(mv);					// 将走法存入走法列表
}

// 取消上一步对棋子的移动
Position.prototype.undoMovePiece = function() {
  var mv = this.mvList.pop();
  var sqSrc = SRC(mv);
  var sqDst = DST(mv);
  var pc = this.squares[sqDst];
  this.addPiece(sqDst, pc, DEL_PIECE);	// 删除终点棋子
  this.addPiece(sqSrc, pc, ADD_PIECE);	// 将终点位置的棋子添加到起点
  pc = this.pcList.pop();
  if (pc > 0) {
    // 这步棋发生了吃子，需要把吃掉的棋子放回终点位置
    this.addPiece(sqDst, pc, ADD_PIECE);
  }
}

// 如果bDel为false，则将棋子pc添加进棋局中的sp位置；如果bDel为true，则删除sp位置的棋子。
Position.prototype.addPiece = function(sq, pc, bDel) {
  var pcAdjust;
  this.squares[sq] = bDel ? 0 : pc;
  if (pc < 16) {
    pcAdjust = pc - 8;
    this.vlWhite += bDel ? -PIECE_VALUE[pcAdjust][sq] :
        PIECE_VALUE[pcAdjust][sq];
  } else {
    pcAdjust = pc - 16;
    this.vlBlack += bDel ? -PIECE_VALUE[pcAdjust][SQUARE_FLIP(sq)] :
        PIECE_VALUE[pcAdjust][SQUARE_FLIP(sq)];
  }
}

// 局面评估函数，返回红方优势
Position.prototype.evaluate = function() {
  var vl = this.vlWhite - this.vlBlack;
  return vl;
}