let hammer=null, damageNotes=[];
function startHammer(angle,superMove){
 hammer={angle,superMove,age:0,windup:superMove?22:14,shape:superMove?superAimData.Frank:basicAim.Frank};
}
function tickHammer(){
 damageNotes=damageNotes.filter(n=>++n.age<40);
 if(!hammer)return;
 const h=hammer;
 if(current!=='Frank'||p.out){hammer=null;return;}
 if(++h.age===h.windup){
   h.x=p.x;h.y=p.y;
   for(const t of combatTargets())if(inFan(t,h.angle,h.shape)){
     if(h.superMove && !t.safe && !t.spawnShield)t.stun=90;
     hitEnemy(h.superMove?2000:1100,!h.superMove,t);
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
 for(let k=0;k<6;k++)spawnBullet(k*Math.PI/3,9,14,false,4,'thorn',b);
}
