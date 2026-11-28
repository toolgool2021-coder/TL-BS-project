const summonStats={
 station:{name:'Аптечка Пэм',hp:4800,r:95},turret:{name:'Турель Джесси',hp:4200,r:25},
 bear:{name:'Медведь Ниты',hp:6000,r:38},head:{name:'Голова Тика',hp:2400,r:65}
};
function summon(type,point){
 const stats=summonStats[type];
 zones=zones.filter(z=>z.type!==type);
 const unit={type,...point,r:stats.r,hp:stats.hp,maxHp:stats.hp,age:0,team:0,hitFlash:0,life:Infinity};
 if(type==='turret'&&current==='Jessie'&&p.passiveChoice==='1')unit.hp=unit.maxHp=stats.hp+1000;
 if(type==='bear'&&current==='Nita')Object.assign(unit,{fastClaws:p.passiveChoice==='0',sharedHeal:p.passiveChoice==='1'});
 if(type==='station'&&current==='Pam'){
  if(p.passiveChoice==='0')unit.r=122;
  if(p.passiveChoice==='1')unit.healPower=780;
 }
 zones.push(unit);
}
function summonPulse(unit,normal,accelerated){
 const interval=unit.overclock>0?accelerated:normal;
 if(unit.overclock>0)unit.overclock--;
 unit.pulseAge=(unit.pulseAge||0)+1;
 if(unit.pulseAge<interval)return false;
 unit.pulseAge=0;
 return true;
}
function healAtStation(station,amount){
 for(const ally of arena?.actors||[p]){
  if(!ally.out&&(ally===p||ally.team===p.team)&&inPlane(ally)&&dist(ally,station)<=station.r){
   ally.hp=Math.min(ally.maxHp,ally.hp+amount);
  }
 }
}
function hostileSummons(actor){
 return !realm && actor!==p && (!arena || actor.team!==0)?zones.filter(z=>summonStats[z.type] && z.hp>0):[];
}
function strikeSummon(z,damage){
 z.hp=Math.max(0,z.hp-Math.round(damage*(z.guard>0?.5:1)));z.hitFlash=9;
 if(!z.hp){z.type='debris';z.life=12;z.r=18;}
}
function drawSummon(z,brush=ctx){
 const stats=summonStats[z.type];if(!stats)return false;
 const pulse=Math.sin(z.age*.14);
 brush.save();brush.translate(z.x,z.y);
 if(z.type==='station'){
   brush.fillStyle='#67e8ad16';brush.strokeStyle='#a9f8c177';brush.lineWidth=2;
   brush.beginPath();brush.arc(0,0,z.r,0,7);brush.fill();brush.stroke();
   brush.strokeStyle='#9affb95c';brush.beginPath();brush.arc(0,0,z.r*((z.age%45+1)/46),0,7);brush.stroke();
 }
 brush.fillStyle='#15233366';brush.beginPath();brush.ellipse(0,11,20,7,0,0,7);brush.fill();
 if(z.type==='bear'){
   brush.fillStyle=z.hitFlash?'#fff1db':'#a85436';
   for(const [x,y,r] of [[-11,-12,7],[11,-12,7],[0,0,17],[-10,13+pulse*2,6],[10,13-pulse*2,6]]){
     brush.beginPath();brush.arc(x,y,r,0,7);brush.fill();
   }
   brush.fillStyle='#f3bc86';brush.beginPath();brush.ellipse(0,6,8,5,0,0,7);brush.fill();
   brush.fillStyle='#262231';brush.fillRect(-8,-3,4,4);brush.fillRect(4,-3,4,4);
 }else if(z.type==='head'){
   brush.rotate(pulse*.1);brush.fillStyle=z.hitFlash?'white':'#739bad';brush.beginPath();brush.arc(0,0,16,0,7);brush.fill();
   brush.fillStyle='#17273c';brush.fillRect(-11,-5,22,9);brush.fillStyle='#ffcd62';brush.fillRect(-8,-3,5,4);brush.fillRect(3,-3,5,4);
   brush.strokeStyle='#ffbc62';brush.beginPath();brush.moveTo(0,-15);brush.lineTo(4,-22);brush.stroke();
 }else{
   brush.fillStyle='#28384a';brush.fillRect(-18,7,36,9);
   brush.fillStyle=z.hitFlash?'white':z.type==='station'?'#379f83':'#d47345';brush.fillRect(-15,-12,30,24);
   if(z.type==='station'){brush.fillStyle='white';brush.fillRect(-3,-9,6,18);brush.fillRect(-9,-3,18,6);}
   else {brush.save();brush.rotate(z.angle||0);brush.fillStyle='#3c5064';brush.fillRect(0,-5,23,10);brush.restore();}
 }
 brush.textAlign='center';brush.font='bold 11px system-ui';brush.lineWidth=3;brush.strokeStyle='#142034';brush.fillStyle='white';
 const label=stats.name+' · '+Math.ceil(z.hp);brush.strokeText(label,0,-33);brush.fillText(label,0,-33);
 brush.fillStyle='#243345';brush.fillRect(-23,-28,46,4);brush.fillStyle='#8ce5bd';brush.fillRect(-23,-28,46*z.hp/z.maxHp,4);brush.restore();return true;
}
function drawCombatProjectile(b){
 ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.vy||0,b.vx||1));
 if(b.special==='shoe'){
   ctx.fillStyle='#ec9959';ctx.fillRect(-8,-5,8,8);ctx.fillRect(-2,-1,11,5);ctx.fillStyle='#fff1db';ctx.fillRect(-8,4,18,3);
 }else if(b.special==='Bea'){
   ctx.fillStyle=b.charged?'#ffe055':'#eab879';ctx.beginPath();ctx.ellipse(0,0,b.charged?12:7,b.charged?7:4,0,0,7);ctx.fill();
   ctx.fillStyle='#3b304a';ctx.fillRect(-2,-4,3,8);
 }else if(b.special==='Spike'){
   ctx.fillStyle='#82d05e';ctx.strokeStyle='#286745';ctx.lineWidth=2;ctx.beginPath();
   for(let i=0;i<16;i++){const r=i%2?7:11,a=i*Math.PI/8;ctx.lineTo(r*Math.cos(a),r*Math.sin(a));}ctx.closePath();ctx.fill();ctx.stroke();
 }else if(b.special==='thorn'){
   ctx.fillStyle='#b8ee70';ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(-5,-3);ctx.lineTo(-5,3);ctx.closePath();ctx.fill();
 }else{
   ctx.strokeStyle=b.special==='hostile'||b.owner?.team?'#ff9c85':b.isUlt?'#ffe184':b.special==='Piper'?'#ffc2e8':'#b9e6ff';
   ctx.lineWidth=b.special==='Piper'?4:2;ctx.beginPath();ctx.moveTo(-Math.min(22,Math.hypot(b.vx||0,b.vy||0)),0);ctx.lineTo(0,0);ctx.stroke();
   ctx.fillStyle=b.special==='poison'?'#82e588':ctx.strokeStyle;ctx.beginPath();ctx.arc(0,0,b.size||5,0,7);ctx.fill();
 }
 ctx.restore();
}
