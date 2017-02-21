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

// 走法排序阶段
var PHASE_HASH = 0;
var PHASE_KILLER_1 = 1;
var PHASE_KILLER_2 = 2;
var PHASE_GEN_MOVES = 3;
var PHASE_REST = 4;

// 对走法排序
function MoveSort(mvHash, pos, killerTable, historyTable) {
  this.mvs = [];										// 走法数组
  this.vls = [];										// 走法分值
  this.mvHash = this.mvKiller1 = this.mvKiller2 = 0;	// 置换表走法和两个杀手走法
  this.pos = pos;
  this.historyTable = historyTable;
  this.phase = PHASE_HASH;								// 当前阶段
  this.index = 0;										// 当前是第几个走法
  this.singleReply = false;								// 局面是否只有一种着法

  if (pos.inCheck()) {
    // 处于被将军的状态，直接生产所有走法，只使用置换表和历史表启发
	
	this.phase = PHASE_REST;
    var mvsAll = pos.generateMoves(null);
    for (var i = 0; i < mvsAll.length; i ++) {
      var mv = mvsAll[i]
      if (!pos.makeMove(mv)) {
        continue;
      }
      pos.undoMakeMove();
      this.mvs.push(mv);
      // 这行代码是要使用置换表启发，把置换表中的走法排在最前面
	  this.vls.push(mv == mvHash ? 0x7fffffff :
          historyTable[pos.historyIndex(mv)]);
    }
    shellSort(this.mvs, this.vls);
    this.singleReply = this.mvs.length == 1;			//　是否只有一着回棋
  } else {
    // 没有处于被将军的状态，才考虑杀手启发
	this.mvHash = mvHash;
    this.mvKiller1 = killerTable[pos.distance][0];
    this.mvKiller2 = killerTable[pos.distance][1];
  }
}

// 获得一步排序后的走法。如果走法已经全部获取，则返回0
MoveSort.prototype.next = function() {
  switch (this.phase) {
  // "phase"表示着法启发的若干阶段，依次为：
  
  // 1. 置换表着法启发，完成后立即进入下一阶段；
  case PHASE_HASH:
    this.phase = PHASE_KILLER_1;
    if (this.mvHash > 0) {
      return this.mvHash;
    }
	// 技巧：这里没有"break"，表示"switch"的上一个"case"执行完后紧接着做下一个"case"，下同

  // 2. 杀手着法启发(第一个杀手着法)，完成后立即进入下一阶段；
  case PHASE_KILLER_1:
    this.phase = PHASE_KILLER_2;
    if (this.mvKiller1 != this.mvHash && this.mvKiller1 > 0 &&
        this.pos.legalMove(this.mvKiller1)) {
      return this.mvKiller1;
    }

  // 3. 杀手着法启发(第二个杀手着法)，完成后立即进入下一阶段；
  case PHASE_KILLER_2:
    this.phase = PHASE_GEN_MOVES;
    if (this.mvKiller2 != this.mvHash && this.mvKiller2 > 0 &&
        this.pos.legalMove(this.mvKiller2)) {
      return this.mvKiller2;
    }

  // 4. 生成所有着法，完成后立即进入下一阶段；
  case PHASE_GEN_MOVES:
    this.phase = PHASE_REST;
    this.mvs = this.pos.generateMoves(null);
    this.vls = [];
    for (var i = 0; i < this.mvs.length; i ++) {
      this.vls.push(this.historyTable[this.pos.historyIndex(this.mvs[i])]);
    }
    shellSort(this.mvs, this.vls);
    this.index = 0;

  // 5. 对剩余着法做历史表启发；
  default:
    while (this.index < this.mvs.length) {
      var mv = this.mvs[this.index];
      this.index ++;
      if (mv != this.mvHash && mv != this.mvKiller1 && mv != this.mvKiller2) {
	  //console.log("index="+this.index);
        return mv;
      }
    }
  }
  
  // 6. 没有着法了，返回0
  return 0;
}

var LIMIT_DEPTH = 64;	// 最大搜索深度
var NULL_DEPTH = 2;		// 空步搜索多减去的搜索值
var RANDOMNESS = 8;

// 节点类型
var HASH_ALPHA = 1;
var HASH_BETA = 2;
var HASH_PV = 3;

function Search(pos, hashLevel) {
  this.hashMask = (1 << hashLevel) - 1;	// 置换表的大小减去1
  this.pos = pos;
}

// 获取当前局面的置换表表项
Search.prototype.getHashItem = function() {
  return this.hashTable[this.pos.zobristKey & this.hashMask];
}

// 查询置换表。如果查询失败，返回-MATE_VALUE
Search.prototype.probeHash = function(vlAlpha, vlBeta, depth, mv) {
  // 查询置换表分为以下几步：
  
  // 1.获取当前局面的置换表表项
  var hash = this.getHashItem();
  
  // 2.判断置换表中的zobristLock校验码与当前局面是否一致
  if (hash.zobristLock != this.pos.zobristLock) {
    // 置换表查询失败
	mv[0] = 0;
    return -MATE_VALUE;
  }
  
  mv[0] = hash.mv;		// 置换表中的最佳着法
  var mate = false;		// 是否为杀棋
  
  // 3.如果是杀棋，返回与深度相关的杀棋分数。如果是长将或者和棋，返回-MATE_VALUE。
  if (hash.vl > WIN_VALUE) {
    if (hash.vl <= BAN_VALUE) {
      return -MATE_VALUE;
    }
    hash.vl -= this.pos.distance;
    mate = true;
  } else if (hash.vl < -WIN_VALUE) {
    if (hash.vl >= -BAN_VALUE) {
      return -MATE_VALUE;
    }
    hash.vl += this.pos.distance;
    mate = true;
  } else if (hash.vl == this.pos.drawValue()) {
    return -MATE_VALUE;
  }

  // 4.如果置换表中节点的搜索深度小于当前节点，查询失败
  if (hash.depth < depth && !mate) {
    return -MATE_VALUE;
  }
  
  // 5.遇到一个beta节点，只能说明当前节点的值不小于hash.vl。
  // 如果正好hash.vl >= vlBeta，说明当前节点会产生beta阶段。否则，置换表查询失败，需要重新对该局面进行搜索。
  if (hash.flag == HASH_BETA) {
    return (hash.vl >= vlBeta ? hash.vl : -MATE_VALUE);
  }
  
  // 6.遇到一个alpha节点，只能说明当前节点的值不大于hash.vl。
  // 如果正好hash.vl <= vlAlpha，说明当前节点又是一个alpha节点，并且值不大于hash.vl。否则，置换表查询失败，需要重新对该局面进行搜索。
  if (hash.flag == HASH_ALPHA) {
    return (hash.vl <= vlAlpha ? hash.vl : -MATE_VALUE);
  }
  
  // 如果置换表中是pv节点，由于pv节点的值反映了节点的真实情况，对置换表的查询一定是成功的。
  
  // 7.返回查到的分值
  return hash.vl;
}

// 记录置换表
Search.prototype.recordHash = function(flag, vl, depth, mv) {
  // 获取当前局面的置换表表项
  var hash = this.getHashItem();
  
  // 深度优先覆盖原则
  if (hash.depth > depth) {
    return;
  }
  
  hash.flag = flag;		// 节点类型
  hash.depth = depth;	// 搜索深度
  
  // 如果是杀棋，需要将分值转换为与深度无关的分值。如果是长将或者和棋，有没有最佳走法，就不记入置换表。
  if (vl > WIN_VALUE) {
    if (mv == 0 && vl <= BAN_VALUE) {
      return;
    }
    hash.vl = vl + this.pos.distance;
  } else if (vl < -WIN_VALUE) {
    if (mv == 0 && vl >= -BAN_VALUE) {
      return;
    }
    hash.vl = vl - this.pos.distance;
  } else if (vl == this.pos.drawValue() && mv == 0) {
    return;
  } else {
    hash.vl = vl;
  }
  hash.mv = mv;
  hash.zobristLock = this.pos.zobristLock;
}

// 更新历史表以及杀手走法表
Search.prototype.setBestMove = function(mv, depth) {
  this.historyTable[this.pos.historyIndex(mv)] += depth * depth;
  var mvsKiller = this.killerTable[this.pos.distance];
  if (mvsKiller[0] != mv) {
	// 保存了两个杀手走法
    mvsKiller[1] = mvsKiller[0];
    mvsKiller[0] = mv;
  }
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
	if (vl > vlBest) {					// 找到最佳值(但不能确定是Alpha、PV还是Beta走法)
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

  // 1. 到达水平线，则调用静态搜索(注意：由于空步裁剪，深度可能小于零)
  if (depth <= 0) {
    return this.searchQuiesc(vlAlpha, vlBeta);
  }
  
  // 1-1. 检查重复局面(注意：不要在根节点检查，否则就没有走法了)
  var vlRep = this.pos.repStatus(1);
  if (vlRep > 0) {
    return this.pos.repValue(vlRep);
  }
  
  // 1-2. 尝试置换表裁剪，并得到置换表走法
  var mvHash = [0];
  vl = this.probeHash(vlAlpha, vlBeta, depth, mvHash);	// 处理hash表查出来的结果（alpha、beta、pv节点的不同处理）
  if (vl > -MATE_VALUE) {
    return vl;
  }
  
  // 1-3. 到达极限深度就返回局面评价
  if (this.pos.distance == LIMIT_DEPTH) {
    return this.pos.evaluate();
  }
  
  // 1-4. 尝试空步裁剪(根节点的Beta值是"MATE_VALUE"，所以不可能发生空步裁剪)
  if (!noNull && !this.pos.inCheck() && this.pos.nullOkay()) {
    this.pos.nullMove();
    vl = -this.searchFull(-vlBeta, 1 - vlBeta, depth - NULL_DEPTH - 1, true);
    this.pos.undoNullMove();
    if (vl >= vlBeta && (this.pos.nullSafe() ||
        this.searchFull(vlAlpha, vlBeta, depth - NULL_DEPTH, true) >= vlBeta)) {
      return vl;
    }
  }

  // 2. 初始化最佳值和最佳走法
  var hashFlag = HASH_ALPHA;	// 节点类型
  var vlBest = -MATE_VALUE;		// 这样可以知道，是否一个走法都没走过(杀棋)
  var mvBest = 0;				// 这样可以知道，是否搜索到了Beta截断或PV走法，以便保存到历史表

  // 3. 生成全部走法
  var sort = new MoveSort(mvHash[0], this.pos, this.killerTable, this.historyTable);
  
  // 4. 逐一走这些走法，并进行递归
  var mv = 0;
  var vl = 0;
  while ((mv = sort.next()) > 0) {
	if (!this.pos.makeMove(mv)) {
	  continue;
    }
	// 将军延伸（如果局面处于被将军的状态，或者只有一种回棋，多向下搜索一层）
	var newDepth = this.pos.inCheck() || sort.singleReply ? depth : depth - 1;	// 将军延伸或者只有一种走法也要延伸
	// PVS主要变例搜索
	if (vlBest == -MATE_VALUE) {
      vl = -this.searchFull(-vlBeta, -vlAlpha, newDepth, false);
    } else {
      vl = -this.searchFull(-vlAlpha - 1, -vlAlpha, newDepth, false);
      if (vl > vlAlpha && vl < vlBeta) {
        vl = -this.searchFull(-vlBeta, -vlAlpha, newDepth, false);
      }
    }
	this.pos.undoMakeMove();
	
	// 5. 进行Alpha-Beta大小判断和截断
    if (vl > vlBest) {			// 找到最佳值(但不能确定是Alpha、PV还是Beta走法)
      vlBest = vl;				// "vlBest"就是目前要返回的最佳值，可能超出Alpha-Beta边界
      if (vl >= vlBeta) {		// 找到一个Beta走法
        hashFlag = HASH_BETA;	// 节点类型
		mvBest = mv;			// Beta走法要保存到历史表
        break;					// Beta截断
      }
      if (vl > vlAlpha) {		// 找到一个PV走法
        vlAlpha = vl;			// 缩小Alpha-Beta边界
        hashFlag = HASH_PV;		// 节点类型
		mvBest = mv;			// PV走法要保存到历史表
      }
    }	
  }
  
  // 5. 所有走法都搜索完了，把最佳走法(不能是Alpha走法)保存到历史表，返回最佳值
  if (vlBest == -MATE_VALUE) {	// 杀棋
    // 根据杀棋步数给出评价
    return this.pos.mateValue();
  }
  // 记录到置换表
  this.recordHash(hashFlag, vlBest, depth, mvBest);
  if (mvBest > 0) {
    // 不是Alpha节点，将最佳走法保存到历史表
    this.setBestMove(mvBest, depth);
  }

  return vlBest;
}

// 对根节点的搜索
Search.prototype.searchRoot = function(depth) {
  var vlBest = -MATE_VALUE;
  var sort = new MoveSort(this.mvResult, this.pos, this.killerTable, this.historyTable);
  var mv;
  while ((mv = sort.next()) > 0) {
    if (!this.pos.makeMove(mv)) {
      continue;
    }

    var newDepth = this.pos.inCheck() ? depth : depth - 1;	// 如果老将被攻击，就多搜索一层
    var vl;
	// 主要变例搜索
    if (vlBest == -MATE_VALUE) {
      vl = -this.searchFull(-MATE_VALUE, MATE_VALUE, newDepth, true);
    } else {
      vl = -this.searchFull(-vlBest - 1, -vlBest, newDepth, false);
      if (vl > vlBest) {
        vl = -this.searchFull(-MATE_VALUE, -vlBest, newDepth, true);
      }
    }
    this.pos.undoMakeMove();
    if (vl > vlBest) {
      vlBest = vl;
      this.mvResult = mv;
      if (vlBest > -WIN_VALUE && vlBest < WIN_VALUE) {
		// 增加电脑走棋的随机性
        vlBest += Math.floor(Math.random() * RANDOMNESS) -
            Math.floor(Math.random() * RANDOMNESS);
        vlBest = (vlBest == this.pos.drawValue() ? vlBest - 1 : vlBest);
      }
    }
  }
  this.setBestMove(this.mvResult, depth);
  return vlBest;
}

// 判断是不是死棋（也就是快输了）
Search.prototype.searchUnique = function(vlBeta, depth) {
  var sort = new MoveSort(this.mvResult, this.pos, this.killerTable, this.historyTable);
  sort.next();
  var mv;
  while ((mv = sort.next()) > 0) {
    if (!this.pos.makeMove(mv)) {
      continue;
    }
    var vl = -this.searchFull(-vlBeta, 1 - vlBeta,
        this.pos.inCheck() ? depth : depth - 1, false);
    this.pos.undoMakeMove();
    if (vl >= vlBeta) {
      return false;
    }
  }
  return true;
}

// 迭代加深搜索
Search.prototype.searchMain = function(depth, millis) {
  // 搜索开局库
  this.mvResult = this.pos.bookMove();
  if (this.mvResult > 0) {
    this.pos.makeMove(this.mvResult);
    // 判断开局库中搜到的走法，是否会造成长将以及和棋
	if (this.pos.repStatus(3) == 0) {
      this.pos.undoMakeMove();
      return this.mvResult;
    }
    this.pos.undoMakeMove();
  }
  
  this.hashTable = [];		// 置换表
  for (var i = 0; i <= this.hashMask; i ++) {
    this.hashTable.push({depth: 0, flag: 0, vl: 0, mv: 0, zobristLock: 0});
  }
  
  this.killerTable = [];	// 杀手走法表
  for (var i = 0; i < LIMIT_DEPTH; i ++) {
    this.killerTable.push([0, 0]);
  }
  
  this.historyTable = [];	// 历史表
  for (var i = 0; i < 4096; i ++) {
    this.historyTable.push(0);
  }
  
  this.mvResult = 0; 			// 搜索出的走法
  this.pos.distance = 0;		// 初始化搜索深度
  var t = new Date().getTime();	// 当前时间距离1970-01-01的毫秒数

 // 迭代加深搜索
 for (var i = 1; i <= depth; i ++) {
   var vl = this.searchRoot(i);
    this.allMillis = new Date().getTime() - t;	// 已经花费的时间
    if (this.allMillis > millis) {				// 时间用完了
      break;
    }
    if (vl > WIN_VALUE || vl < -WIN_VALUE) {	// 胜负已分，不用继续搜索
      break;
    }
	
	/*
	下面三行代码意图很明显，就是判断一下，如果是死棋的话，就不用继续搜索了。
	不好理解的是，这里为什么要判断是否为死棋。
	我想，可能是因为在根节点搜索中，为增加走棋的随机性，对vlBest做了小范围的浮动（也就是对vlBest加一或者减一），有可能把死棋，刚好浮动为不是死棋。
	*/
    if (this.searchUnique(1 - WIN_VALUE, i)) {
      break;
    }
 }

  return this.mvResult;
}