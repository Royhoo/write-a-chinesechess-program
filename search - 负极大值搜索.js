"use strict";

var MINMAXDEPTH = 3;	// 搜索深度

function Search(pos) {
  this.pos = pos;
}

Search.prototype.searchMain = function() {
  this.mvResult = 0; 				// 搜索出的走法
  this.negaMaxSearch(MINMAXDEPTH);	// 调用负极大值搜索算法

  return this.mvResult;				// 返回搜索结果
}

// 负极大值搜索
Search.prototype.negaMaxSearch = function(depth) {
  // 深度为0，调用评估函数并返回分值
  if (depth == 0) {
    return this.pos.evaluate();
  }
  
  var vlBest = -MATE_VALUE;					// 初始最优值为负无穷
  var mvs = this.pos.generateMoves();		// 生成当前局面的所有走法
  var mv = 0;
  var value = 0;
  for (var i = 0; i < mvs.length; i ++) {
    mv = mvs[i];	
	// 执行mv走法
	if (!this.pos.makeMove(mv)) {
      // 这招棋走完后，老将处于被攻击的状态，这是在送死。应该跳过这招棋，继续后面的搜索。
	  continue;
    }
	
	// 递归调用，注意有个负号
	value = -this.negaMaxSearch(depth - 1);
	
	// 撤销mv走法
	this.pos.undoMakeMove();
	
	// 寻找最大估值
	if (value > vlBest) {
	  // 找到了当前的最佳值	  
	  vlBest = value;
	  
	  // 如果回到了根节点，需要记录根节点的最佳走法
	  if (depth == MINMAXDEPTH) {
	    this.mvResult = mv;
	  }
	}	
  }
  
  return vlBest;	// 返回当前节点的最优值
}
