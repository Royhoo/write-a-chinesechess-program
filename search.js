"use strict";

function Search(pos) {
  this.pos = pos;
}

Search.prototype.searchMain = function() {
  // 生成当前局面所有走法
  var mvs = this.pos.generateMoves();
  
  // 随机选择一个走法，并返回
  var randNum = parseInt(Math.random()*mvs.length);
  return mvs[randNum];
}