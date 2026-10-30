(function(root) {
  const ranks = [[0,'見習い','#a9bdca'],[1000,'銅の採掘士','#e7a16e'],[5000,'銀の探鉱士','#c9e4ef'],[15000,'黄金の掘削士','#ffd166'],[40000,'結晶の開拓者','#71e4df'],[100000,'深淵の達人','#b89aff'],[250000,'地核の伝説','#ff7fa6']];
  function rank(points) {
    points = Number.isFinite(points) ? Math.max(0, points) : 0;
    let tier = 0;
    while (tier + 1 < ranks.length && points >= ranks[tier + 1][0]) tier++;
    const [floor,name,color] = ranks[tier], next = ranks[tier + 1]?.[0] ?? null;
    return {tier,name,color,next,progress:next === null ? 1 : (points-floor)/(next-floor)};
  }
  function fresh(){ return {clock:0,next:12,remaining:0,progress:0,target:5,wins:0,fever:0,chain:0}; }
  function tick(s,dt){ s.clock+=dt; s.fever=Math.max(0,s.fever-dt); if(s.remaining>0){s.remaining=Math.max(0,s.remaining-dt);if(!s.remaining){s.next=s.clock+16;return'expired';}} else if(s.clock>=s.next){s.remaining=20;s.progress=0;return'start';} return null; }
  function pickup(s){ if(s.remaining<=0)return 0; if(++s.progress<s.target)return 0; s.remaining=0;s.next=s.clock+20;return 300+100*Math.min(10,s.wins++); }
  function hit(s){const failed=s.remaining>0;s.remaining=0;s.next=s.clock+16;s.chain=0;s.fever=0;return failed;}
  function ore(s,continued){if(s.fever>0)return false;s.chain=continued?s.chain+1:1;if(s.chain<4)return false;s.fever=8;s.chain=0;return true;}
  root.CODUG_EXPEDITION={rank,fresh,tick,pickup,hit,ore};
})(globalThis);
