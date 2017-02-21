"use strict";

var MINMAXDEPTH = 4;	// 搜索深度

function Search(pos) {
  this.pos = pos;
}

Search.prototype.searchMain = function() {
  this.mvResult = 0; 											// 搜索出的走法
  this.alphaBetaSearch(-MATE_VALUE, MATE_VALUE, MINMAXDEPTH);	// 调用Alpha-Beta搜索算法

  return this.mvResult;											// 返回搜索结果
}

// 不超出边界的Alpha-Beta搜索
Search.prototype.alphaBetaSearch = function(vlAlpha_, vlBeta, depth) {
  // 深度为0，调用评估函数并返回分值
  if (depth == 0) {
    return this.pos.evaluate();
  }
  
  var vlAlpha = vlAlpha_;				// 初始最优值（不再是负无穷）
  var mvs = this.pos.generateMoves();	// 生成当前局面的所有走法
  var mv = 0;
  var vl = 0;
  for (var i = 0; i < mvs.length; i ++) {
    mv = mvs[i];
	// 执行mv走法
	if (!this.pos.makeMove(mv)) {
      // 这招棋走完后，老将处于被攻击的状态，这是在送死。应该跳过这招棋，继续后面的搜索。
	  continue;
    }
	
	// 递归调用，注意有个负号
	vl = -this.alphaBetaSearch(-vlBeta, -vlAlpha, depth - 1);	// 递归调用，注意有三个负号
	
	// 撤销mv走法
	this.pos.undoMakeMove();
	
	// 得到一个大于或等于bate的值，就终止对当前节点的搜索，并返回vlBeta
	if(vl >= vlBeta) {
	  return vlBeta;
	}
	
	// 寻找最大估值
	if (vl > vlAlpha) {
	  // 找到了当前的最佳走法
	  vlAlpha = vl;
	  
	  // 如果回到了根节点，需要记录根节点的最佳走法
	  if (depth == MINMAXDEPTH) {
	    this.mvResult = mv;
	  }
	}	
  }
  
  return vlAlpha;	// 返回当前节点的最优值
}
