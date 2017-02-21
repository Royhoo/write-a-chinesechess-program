"use strict";

var MINMAXDEPTH = 3;	// 极大极小搜索的深度

function Search(pos) {
  this.pos = pos;
}

Search.prototype.searchMain = function() {
  this.mvResult = 0; 	// 搜索出的走法
  this.maxMinSearch();	// 调用极大极小搜索算法

  return this.mvResult;	// 返回搜索结果
}

// 极大极小搜索
Search.prototype.maxMinSearch = function() {
  if (this.pos.sdPlayer == 0) {
    // 红方走棋，调用极大点搜索（因为红方节点是极大点）
	this.maxSearch(MINMAXDEPTH);
  } else {
    // 黑方走棋，调用极小点搜索（因为黑方节点是极小点）
    this.minSearch(MINMAXDEPTH);
  }
}

// 极大点搜索
Search.prototype.maxSearch = function(depth) {
  // 深度为0，调用评估函数并返回分值
  if (depth == 0) {
    return this.pos.evaluate();
  }
  
  var vlBest = -MATE_VALUE;				// 初始最优值为负无穷
  var mvs = this.pos.generateMoves();	// 生成当前局面的所有走法
  var mv = 0;
  var value = 0;
  for (var i = 0; i < mvs.length; i ++) {
    mv = mvs[i];
	// 执行mv走法
	if (!this.pos.makeMove(mv)) {
      // 这招棋走完后，老将处于被攻击的状态，这是在送死。应该跳过这招棋，继续后面的搜索。
	  continue;
    }
	
	// 调用极小点搜索算法，搜索深度为depth - 1
	value = this.minSearch(depth - 1);
	
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

// 极小点搜索
Search.prototype.minSearch = function(depth) {
  if (depth == 0) {
    return this.pos.evaluate();
  }
  
  var vlBest = MATE_VALUE;				// 初始最优值为正无穷，这里与极大点搜索不同
  var mvs = this.pos.generateMoves();
  var mv = 0;
  var value = 0;
  for (var i = 0; i < mvs.length; i ++) {
    mv = mvs[i];
	if (!this.pos.makeMove(mv)) {
      continue;
    }
	value = this.maxSearch(depth - 1);	// 这里与极大点搜索不同
	this.pos.undoMakeMove();
	
	if (value < vlBest) {				// 这里与极大点搜索不同
	  vlBest = value;
	  if (depth == MINMAXDEPTH) {
	    this.mvResult = mv;
	  }
	}
  }
  
  return vlBest;	// 返回当前节点的最优值
}