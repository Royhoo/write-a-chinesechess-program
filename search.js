"use strict";

// 希尔排序
var SHELL_STEP = [0, 1, 4, 13, 40, 121, 364, 1093];
function shellSort(mvs, vls) {
  var stepLevel = 1;
  while (SHELL_STEP[stepLevel] < mvs.length) {
    stepLevel ++;
  }
  stepLevel --;
  while (stepLevel > 0) {
    var step = SHELL_STEP[stepLevel];
    for (var i = step; i < mvs.length; i ++) {
      var mvBest = mvs[i];
      var vlBest = vls[i];
      var j = i - step;
      while (j >= 0 && vlBest > vls[j]) {
        mvs[j + step] = mvs[j];
        vls[j + step] = vls[j];
        j -= step;
      }
      mvs[j + step] = mvBest;
      vls[j + step] = vlBest;
    }
    stepLevel --;
  }
}

// 对走法排序
function MoveSort(pos, historyTable) {
  this.mvs = [];										// 走法数组，存储当前局面所有走法
  this.vls = [];										// 在历史表中，每个走法对应的分值
  this.pos = pos;
  this.historyTable = historyTable;
  this.index = 0;

  var mvsAll = pos.generateMoves();						// 生成全部走法
  for (var i = 0; i < mvsAll.length; i ++) {
    var mv = mvsAll[i]
    if (!pos.makeMove(mv)) {
      continue;
    }
    pos.undoMakeMove();
    this.mvs.push(mv);

    this.vls.push(historyTable[pos.historyIndex(mv)]);	// 获取历史表中，该走法的值
  }
    shellSort(this.mvs, this.vls);						// 根据历史表的分值，对走法进行排序
}

// 获得一步排序后的走法。如果走法已经全部获取，则返回0
MoveSort.prototype.next = function() {
  while (this.index < this.mvs.length) {
   var mv = this.mvs[this.index];
   this.index ++;
   return mv;
 }
  return 0;
}

var MINMAXDEPTH = 4;	// 极大极小搜索的深度
var LIMIT_DEPTH = 64;	// 最大搜索深度

function Search(pos) {
  this.pos = pos;
}

// 更新历史表
Search.prototype.setBestMove = function(mv, depth) {
  this.historyTable[this.pos.historyIndex(mv)] += depth * depth;
}

// 迭代加深搜索
Search.prototype.searchMain = function(depth, millis) {
  this.historyTable = [];
  for (var i = 0; i < 4096; i ++) {
    this.historyTable.push(0);
  }
  
  this.mvResult = 0; 			// 搜索出的走法
  this.pos.distance = 0;		// 初始化搜索深度
  var t = new Date().getTime();	// 当前时间 距离1970-01-01的毫秒数

 // 迭代加深搜索
 for (var i = 1; i <= depth; i ++) {
   var vl = this.alphaBetaSearch(-MATE_VALUE, MATE_VALUE, i);
    this.allMillis = new Date().getTime() - t;	// 已经花费的时间
    if (this.allMillis > millis) {				// 时间用完了，不再搜索
      break;
    }
    if (vl > WIN_VALUE || vl < -WIN_VALUE) {	// 胜负已分，不用继续搜索
      break;
    }
 }

  return this.mvResult;
}

// 超出边界的Alpha-Beta搜索
Search.prototype.alphaBetaSearch = function(vlAlpha_, vlBeta, depth) {
  var vlAlpha = vlAlpha_;	// 初始最优值，不再是负无穷
  
  // 搜索分为以下几个阶段
  
  // 1. 到达水平线，则返回局面评价值
  if (depth == 0) {
    return this.pos.evaluate();
  }
  
  // 2. 初始化最佳值和最佳走法
  var vlBest = -MATE_VALUE;	// 这样可以知道，是否一个走法都没走过(杀棋)
  var mvBest = 0;			// 这样可以知道，是否搜索到了Beta截断或PV走法，以便保存到历史表

  // 3. 生成全部走法，并根据历史表排序
  var sort = new MoveSort(this.pos, this.historyTable);
  
  // 4. 逐一走这些走法，并进行递归
  var mv = 0;
  var vl = 0;
  while ((mv = sort.next()) > 0) {
	if (!this.pos.makeMove(mv)) {
	  continue;
    }
	vl = -this.alphaBetaSearch(-vlBeta, -vlAlpha, depth - 1);	// 递归调用，注意有三个负号，并且Alpha和Beta调换位置
	this.pos.undoMakeMove();
	
	// 5. 进行Alpha-Beta大小判断和截断
    if (vl > vlBest) {		// 找到最佳值
      vlBest = vl;			// "vlBest"就是目前要返回的最佳值，可能超出Alpha-Beta边界
      if (vl >= vlBeta) {	// 找到一个Beta走法
        mvBest = mv;		// Beta走法要保存到历史表
        break;				// Beta截断
      }
      if (vl > vlAlpha) {	// 找到一个PV走法
        vlAlpha = vl;		// 缩小Alpha-Beta边界
        mvBest = mv;		// PV走法要保存到历史表
		if (this.pos.distance == 0) {	// 回到了根节点，记录根节点的最佳走法
	      this.mvResult = mv;
	    }
      }
    }	
  }
  
  // 6. 所有走法都搜索完了，把最佳走法保存到历史表，返回最佳值
  if (vlBest == -MATE_VALUE) {
    // 根据杀棋步数给出评价
    return this.pos.mateValue();
  }
  if (mvBest > 0) {
    // 找到了好的走法，更新历史表
    this.setBestMove(mvBest, depth);
  }

  return vlBest;
}
