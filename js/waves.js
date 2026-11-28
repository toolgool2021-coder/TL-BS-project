// Moving fronts use the same width and travel distance for hits and rendering.
const fronts={
 Poco:{range:260,spread:.42,ticks:19,damage:740,color:'#ffdf64'},
 Sandy:{range:275,spread:.26,ticks:22,damage:860,color:'#f7c89a'},
 Nita:{range:324,width:22,ticks:27,damage:950,color:'#ff9e86'},
 Gale:{range:350,width:65,ticks:26,damage:650,color:'#b4efff'}
};
let waves=[],swipes=[];
function startWave(name,angle){
 waves.push({name,angle,x:p.x,y:p.y,age:0,hits:new Set(),push:new Map(),...fronts[name]});
}
function fanWidth(w,d){return w.width || Math.max(8,d*Math.tan(w.spread));}
function tickWaves(){
 for(const w of waves){
   w.age++;
   const front=Math.min(1,w.age/w.ticks)*w.range,step=w.range/w.ticks,c=Math.cos(w.angle),s=Math.sin(w.angle);
   if(w.age<=w.ticks)for(const t of combatTargets()){
     const dx=t.x-w.x,dy=t.y-w.y,along=dx*c+dy*s,across=dy*c-dx*s;
     if(w.hits.has(t)||Math.abs(across)>fanWidth(w,along)+12 || along<front-step-14 || along>front+14)continue;
     if(!visibleTo({x:w.x,y:w.y},t))continue;
     w.hits.add(t);hitEnemy(w.damage,w.name!=='Gale',t);
     if(w.name==='Gale' && !t.safe && !t.out && !t.spawnShield)w.push.set(t,12);
   }
   for(const [t,left] of w.push){
     if(t.out){w.push.delete(t);continue;}
     const force=2+left*1.35;
     moveOnPitch(t,c*force,s*force);
     t.x=Math.max(22,Math.min(tlbsWorld.width-22,t.x));t.y=Math.max(22,Math.min(tlbsWorld.height-22,t.y));
     if(left===1)w.push.delete(t);else w.push.set(t,left-1);
   }
 }
 waves=waves.filter(w=>w.age<w.ticks || w.push.size);
 swipes=swipes.filter(f=>++f.age<15);
}
function paintWaves(){
 ctx.save();ctx.lineCap='round';
 for(const w of waves){
   if(w.age>w.ticks)continue;
   const u=w.age/w.ticks,d=u*w.range,r=fanWidth(w,d);
   ctx.save();ctx.translate(w.x,w.y);ctx.rotate(w.angle);
   for(let j=0;j<3;j++){
     const x=d-j*8;ctx.globalAlpha=(1-j*.25)*(.9-.35*u);
     ctx.strokeStyle=w.color;ctx.lineWidth=5-j;
     ctx.beginPath();ctx.moveTo(x-8,-r);ctx.quadraticCurveTo(x+12,0,x-8,r);ctx.stroke();
   }
   ctx.restore();
 }
 for(const f of swipes){
   const u=f.age/15;ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.angle);
   ctx.globalAlpha=1-u;ctx.strokeStyle=f.name==='Kit'?'#fff2bd':'#ffaa7e';ctx.lineWidth=4;
   for(let i=0;i<(f.name==='Kit'?3:1);i++){
     const radius=(f.name==='Kit'?44:60)+8*i;
     ctx.beginPath();ctx.arc(0,0,radius,-.72+u*.8,.1+u*.65);ctx.stroke();
   }ctx.restore();
 }
 if(current==='Bea'||current==='Surge'){
   const text=current==='Surge'?'Вольт · '+(p.surgeLevel||1)+'/4':p.beeCharge?'Заряжено ×3':'Обычный выстрел';
   ctx.globalAlpha=1;ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.strokeStyle='#1e2435';ctx.lineWidth=3;
   ctx.strokeText(text,p.x,p.y+73);ctx.fillStyle='#fff3b0';ctx.fillText(text,p.x,p.y+73);
 }
 ctx.restore();
}
function resetFighterStage(){
 Object.assign(p,{slow:0,piperGuide:false,frankGuard:0,frankRage:0,frankPull:false,gadgetFlash:0});
 p.surgeLevel=1;p.beeCharge=false;p.bonnieOnFoot=false;
 if(current==='Surge')p.speedMult=1;
}
function surgeLife(){return (p.surgeLevel||1)>=3?44:33;}
function splitSurge(b,target){
 const count=b.level===4?6:2;
 for(let i=0;i<count;i++){
   spawnBullet(b.angle+Math.PI/2+i*2*Math.PI/count,10,16,b.isUlt,4,'surgeShard',b);
   bullets.at(-1).visited=[target];
 }
}
