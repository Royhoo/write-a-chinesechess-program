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

  var mvsAll = pos.generateMoves(null);					// 生成全部走法
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

var LIMIT_DEPTH = 64;	// 最大搜索深度
var NULL_DEPTH = 2;		// 空步搜索多减去的搜索值

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
  var t = new Date().getTime();	// 当前距离1970-01-01的毫秒数

 // 迭代加深搜索
 for (var i = 1; i <= depth; i ++) {
   var vl = this.searchFull(-MATE_VALUE, MATE_VALUE, i);
    this.allMillis = new Date().getTime() - t;	// 已经花费的时间
    if (this.allMillis > millis) {				// 时间用完了，不用继续搜索
      break;
    }
    if (vl > WIN_VALUE || vl < -WIN_VALUE) {	// 胜负已分，不用继续搜索
      break;
    }
 }

  return this.mvResult;
}

// 静态(Quiescence)搜索
Search.prototype.searchQuiesc = function(vlAlpha_, vlBeta) {
  var vlAlpha = vlAlpha_;
  
  // 一个静态搜索分为以下几个阶段
  
  // 1. 如果vlBeta值比杀棋分值还小，直接返回杀棋分值
  var vl = this.pos.mateValue();
  if (vl >= vlBeta) {
    return vl;
  }
  
  // 2. 检查重复局面
  var vlRep = this.pos.repStatus(1);
  if (vlRep > 0) {
    return this.pos.repValue(vlRep);
  }
  
  // 3. 到达极限深度就返回局面评价
  if (this.pos.distance == LIMIT_DEPTH) {
    return this.pos.evaluate();
  }
  
  // 4. 初始化最佳值
  var vlBest = -MATE_VALUE;	// 这样可以知道，是否一个走法都没走过(杀棋)
  
  
  var mvs = [], vls = [];
  if (this.pos.inCheck()) {
    // 5. 如果被将军，则生成全部走法
    mvs = this.pos.generateMoves(null);
    for (var i = 0; i < mvs.length; i ++) {
      vls.push(this.historyTable[this.pos.historyIndex(mvs[i])]);
    }
    shellSort(mvs, vls);
  } else {
    // 6. 如果不被将军，先做局面评价
    vl = this.pos.evaluate();
    if (vl > vlBest) {
      if (vl >= vlBeta) {
        return vl;
      }
      vlBest = vl;
      vlAlpha = Math.max(vl, vlAlpha);
    }
	
	// 7. 如果局面评价没有截断，再生成吃子走法
    mvs = this.pos.generateMoves(vls);
    shellSort(mvs, vls);
    for (var i = 0; i < mvs.length; i ++) {
      if (vls[i] < 10 || (vls[i] < 20 && HOME_HALF(DST(mvs[i]), this.pos.sdPlayer))) {	// 棋子过少的话不搜索了
        mvs.length = i;
        break;
      }
    }
  }
  
  // 8. 逐一走这些走法，并进行递归
  for (var i = 0; i < mvs.length; i ++) {
    if (!this.pos.makeMove(mvs[i])) {
      continue;
    }
    vl = -this.searchQuiesc(-vlBeta, -vlAlpha);
    this.pos.undoMakeMove();
    
	// 9. 进行Alpha-Beta大小判断和截断
	if (vl > vlBest) {					// 找到最佳值
      if (vl >= vlBeta) {				// 找到一个Beta走法
        return vl;						// Beta截断
      }
      vlBest = vl;						// "vlBest"就是目前要返回的最佳值，可能超出Alpha-Beta边界
      vlAlpha = Math.max(vl, vlAlpha);	// 缩小Alpha-Beta边界
    }
  }
  
  // 10. 所有走法都搜索完了，返回最佳值
  return vlBest == -MATE_VALUE ? this.pos.mateValue() : vlBest;
}

// 超出边界的Alpha-Beta搜索
Search.prototype.searchFull = function(vlAlpha_, vlBeta, depth, noNull) {
  var vlAlpha = vlAlpha_;	// 初始最优值，不再是负无穷
  
  // 一个Alpha-Beta完全搜索分为以下几个阶段
  
  if (this.pos.distance > 0) {
    // 1. 到达水平线，则调用静态搜索(注意：由于空步裁剪，深度可能小于零)
	if (depth <= 0) {
      return this.searchQuiesc(vlAlpha, vlBeta);
    }
	
	// 1-1. 检查重复局面(注意：不要在根节点检查，否则就没有走法了)
	var vlRep = this.pos.repStatus(1);
    if (vlRep > 0) {
      return this.pos.repValue(vlRep);
    }
	
	// 1-2. 到达极限深度就返回局面评价
	if (this.pos.distance == LIMIT_DEPTH) {
      return this.pos.evaluate();
    }
	
	// 1-3. 尝试空步裁剪(根节点的Beta值是"MATE_VALUE"，所以不可能发生空步裁剪)
	if (!noNull && !this.pos.inCheck() && this.pos.nullOkay()) {
      this.pos.nullMove();
      vl = -this.searchFull(-vlBeta, 1 - vlBeta, depth - NULL_DEPTH - 1, true);
      this.pos.undoNullMove();
      if (vl >= vlBeta && (this.pos.nullSafe() ||
          this.searchFull(vlAlpha, vlBeta, depth - NULL_DEPTH, true) >= vlBeta)) {
        return vl;
      }
    }
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
	var newDepth = this.pos.inCheck() ? depth : depth - 1;		// 将军延伸（如果局面处于被将军的状态，多向下搜索一层）
	vl = -this.searchFull(-vlBeta, -vlAlpha, newDepth, false);	// 递归调用，注意有三个负号
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
  
  // 5. 所有走法都搜索完了，把最佳走法(不能是Alpha走法)保存到历史表，返回最佳值
  if (vlBest == -MATE_VALUE) {	// 杀棋
    // 根据杀棋步数给出评价
    return this.pos.mateValue();
  }
  if (mvBest > 0) {
    // 找到了好的走法，更新历史表
    this.setBestMove(mvBest, depth);
  }

  return vlBest;
}
