let hammer=null, damageNotes=[];
function startHammer(angle,superMove){
 const pull=!superMove&&p.frankPull;
 if(pull)p.frankPull=false;
 hammer={pull,angle,superMove,age:0,windup:superMove?22:14,shape:superMove?superAimData.Frank:basicAim.Frank};
}
function tickHammer(){
 damageNotes=damageNotes.filter(n=>++n.age<40);
 if(!hammer)return;
 const h=hammer;
 if(current!=='Frank'||p.out){hammer=null;return;}
 if(++h.age===h.windup){
   h.x=p.x;h.y=p.y;
   for(const t of combatTargets())if(inFan(t,h.angle,h.shape)){
     if(t.spawnShield||t.altitude)continue;
     if(h.superMove&&!t.safe)t.stun=90;
     if(h.pull&&!t.safe){
       const angle=angleTo(t);
       const distance=Math.min(85,Math.max(0,dist(p,t)-30));
       moveOnPitch(t,-Math.cos(angle)*distance,-Math.sin(angle)*distance);
     }
     hitEnemy(h.superMove?2000:h.pull?1485:1100,!h.superMove,t);
   }
 }
 if(h.age>=h.windup+20)hammer=null;
}
function paintHammer(){
 if(hammer){
   const h=hammer,impact=h.age>=h.windup,u=impact?(h.age-h.windup)/20:h.age/h.windup;
   ctx.save();ctx.translate(impact?h.x:p.x,impact?h.y:p.y);ctx.rotate(h.angle);
   if(impact){
     ctx.globalAlpha=1-u;ctx.strokeStyle=h.superMove?'#ffd05c':'#c5bcff';ctx.lineWidth=h.superMove?6:4;
     ctx.beginPath();ctx.arc(0,0,h.shape.range*(.18+.82*u),-h.shape.spread,h.shape.spread);ctx.stroke();
     for(const a of [-.3,0,.3]){ctx.save();ctx.rotate(a);ctx.beginPath();ctx.moveTo(20,0);
       for(let i=1;i<=6;i++)ctx.lineTo(20+i*(h.shape.range-20)*u/6,i%2?5:-5);ctx.stroke();ctx.restore();}
   }else{
     ctx.rotate(-.3-u*1.7);ctx.fillStyle='#ad8661';ctx.fillRect(8,-3,34,7);
     ctx.fillStyle=h.superMove?'#efbc56':'#9c94be';ctx.fillRect(32,-16,18,32);
     ctx.fillStyle='#ede9fc';ctx.fillRect(32,-16,18,4);
   }ctx.restore();
 }
 ctx.save();ctx.textAlign='center';ctx.font='bold 15px system-ui';
 for(const n of damageNotes){ctx.globalAlpha=1-n.age/40;ctx.fillStyle='#ffe2ef';ctx.fillText('−'+n.damage,n.x,n.y-28-n.age*.5);}
 ctx.restore();
}
function burstSpike(b){
 const count=b.extraThorns?8:6;
 for(let k=0;k<count;k++)spawnBullet(k*Math.PI*2/count,9,14,b.isUlt,4,'thorn',b);
}
function bounceCombatShot(b){
 let flipX=b.x<0||b.x>tlbsWorld.width;
 let flipY=b.y<0||b.y>tlbsWorld.height;
 if(insideCover(b.x,b.y)){
   const oldX=b.x-b.vx,oldY=b.y-b.vy;
   if(insideCover(oldX,oldY))return;
   const hitX=insideCover(b.x,oldY),hitY=insideCover(oldX,b.y);
   flipX=hitX||!hitY;flipY=hitY||!hitX;
   b.x=oldX;b.y=oldY;
 }
 if(!flipX&&!flipY)return;
 b.x=Math.max(0,Math.min(tlbsWorld.width,b.x));
 b.y=Math.max(0,Math.min(tlbsWorld.height,b.y));
 if(flipX)b.vx*=-1;
 if(flipY)b.vy*=-1;
 if(b.ricoBoost)b.damage=560;
 if(b.ricoRepair){
   b.ricoRepair=false;
   if(current==='Rico'&&!p.out)p.hp=Math.min(p.maxHp,p.hp+600);
 }
}
