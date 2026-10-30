(function(root){
  const minerals={
    rock:['堆積岩','rock'],shale:['頁岩','rock'],granite:['花崗岩','rock'],basalt:['玄武岩','rock'],crystalRock:['結晶岩','rock'],magmaRock:['溶岩石','rock'],voidRock:['虚空石','rock'],errorRock:['侵食岩','rock'],
    iron:['鉄鉱石','ore'],copper:['銅鉱石','ore'],silver:['銀鉱石','ore'],gold:['金鉱石','ore'],amethyst:['アメジスト','ore'],infernite:['インフェルナイト','ore'],voidCrystal:['虚空結晶','ore'],errorShard:['エラーの欠片','ore']
  };
  const clean=n=>Number.isSafeInteger(n)&&n>=0?n:0;
  const total=(s,kind)=>Object.entries(minerals).reduce((n,[id,m])=>n+(!kind||m[1]===kind?s.counts[id]:0),0);
  const discovered=s=>Object.values(s.counts).filter(n=>n>0).length;
  const rule=(id,title,description,target,get)=>({id,title,description,target,get});
  const stat=(id,title,description,key,target)=>rule(id,title,description,target,s=>s.stats[key]);
  const achievements=[
    rule('first','最初の一掘り','石か鉱石を1個発掘',1,s=>total(s)),
    rule('ore25','鉱石ハンター','鉱石を累計25個発掘',25,s=>total(s,'ore')),
    rule('ore100','鉱脈の支配者','鉱石を累計100個発掘',100,s=>total(s,'ore')),
    rule('rock50','岩盤クラッシャー','石を累計50個発掘',50,s=>total(s,'rock')),
    rule('species8','地下の博物学者','8種類を発掘',8,discovered),
    rule('species16','図鑑コンプリート','全16種類を発掘',16,discovered),
    rule('gold','黄金との遭遇','金鉱石を発掘',1,s=>s.counts.gold),
    rule('void','虚空の輝き','虚空結晶を発掘',1,s=>s.counts.voidCrystal),
    stat('depth500','地底への一歩','500mに到達','depth',500),
    stat('depth5000','深層探検家','5,000mに到達','depth',5000),
    stat('score1000','稼ぎ頭','1プレイで1,000pt獲得','score',1000),
    stat('combo8','連鎖の名手','鉱石8コンボを達成','combo',8),
    stat('rush1','時間との勝負','RUSHを1回クリア','rush',1),
    stat('fever1','熱狂の始まり','FEVERを1回発動','fever',1),
    stat('clean500','精密操縦','開始からノーダメージで500m到達','cleanDepth',500),
    stat('items20','補給の達人','アイテムを累計20個回収','items',20),
    stat('blocks5','備えあれば','シールドで累計5回衝突を防ぐ','blocks',5),
    stat('runs10','不屈の採掘者','10回ゲームオーバーまで掘る','runs',10)
  ];
  function fresh(raw={}){const s={counts:{},unlocked:{},stats:{}};for(const id of Object.keys(minerals))s.counts[id]=clean(raw?.counts?.[id]);for(const id of ['depth','score','combo','rush','fever','runs','cleanDepth','items','blocks'])s.stats[id]=clean(raw?.stats?.[id]);for(const a of achievements)if(clean(raw?.unlocked?.[a.id]))s.unlocked[a.id]=raw.unlocked[a.id];return s;}
  function record(s,event,value=1){if(Object.hasOwn(minerals,event))s.counts[event]++;else if(['depth','score','combo','cleanDepth'].includes(event))s.stats[event]=Math.max(s.stats[event],clean(Math.floor(value)));else if(Object.hasOwn(s.stats,event))s.stats[event]+=clean(value);}
  function unlock(s,now=Date.now()){const earned=achievements.filter(a=>!s.unlocked[a.id]&&a.get(s)>=a.target);for(const a of earned)s.unlocked[a.id]=now;return earned;}
  root.CODUG_JOURNAL={minerals,achievements,fresh,total,discovered,record,unlock};
})(globalThis);
