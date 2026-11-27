// Lengths are measured in arena units. Projectile range ends on its last collision tick.
const ray=(speed,life,width=5,spread=0)=>({kind:'ray',range:speed*(life-1),width,spread});
const landing=(range,radius,offsets=[0])=>({kind:'landing',range,radius,offsets});
const ring=radius=>landing(0,radius);
const jump=(range,radius)=>({...landing(range,radius),kind:'jump'});
const fan=(range,spread)=>({kind:'fan',range,spread});
const kitClaw=fan(86,.80),kitJump=jump(210,52),kitYarn=landing(250,72);
const basicAim={
 Shelly:ray(12,35,5,.2),Bull:ray(13,25,5,.30),Darryl:ray(13,25,5,.30),Colt:ray(15,45),
 El_Primo:ray(10,8),Rosa:ray(10,8),Barley:landing(200,55),Brock:ray(14,60),Dynamike:landing(250,80),
 Tick:landing(220,80,[-.2,0,.2]),Bo:ray(13,45,5,.1),Jessie:ray(12,55,8),Rico:ray(14,60),
 Frank:fan(190,.42),Nani:landing(320,12),Max:ray(18,35),Crow:ray(14,40,4,.3),Tara:ray(13,40,5,.15),
 Gene:ray(11,25,10),Bibi:fan(130,.6),Mortis:{kind:'dash',range:130,radius:60},Stu:ray(16,30),Kit:kitClaw
};
const superAimData={
 Shelly:ray(16,40,5,.6),Colt:ray(20,60),Max:ring(90),Rosa:ring(28),Jessie:landing(215,22),
 Bo:landing(200,58,[-.28,0,.28]),Frank:fan(330,.48),Nani:ring(22),Tick:ring(26),Tara:landing(250,100),
 Gene:ray(18,40,12),Bibi:ray(10,300,15),Mortis:ray(12,48,14),Rico:ray(15,60),
 Brock:landing(240,80,[-.26,0,.26]),Crow:jump(225,80),Stu:jump(200,22),Bull:jump(312,50),
 Darryl:jump(312,50),El_Primo:jump(250,120),Barley:landing(250,55,[-.6,-.3,0,.3,.6]),
 Dynamike:landing(250,140),Poco:fan(360,.55),Nita:landing(205,38),Piper:jump(200,24),Pam:landing(235,95),
 Leon:ring(25),Spike:landing(220,100),Sandy:landing(160,140),Edgar:jump(260,100),Colette:jump(220,48),
 Emz:ring(125),Bea:ray(11,45,6,.33),Gale:fan(350,.5),Surge:jump(90,90),Fang:jump(190,65),
 Buzz:ray(14,23,8),Chester:landing(220,80),Cordelius:ray(14,40,10),Kit:kitJump
};
function combatShape(superMove){
 if(arena?.carrier===p)return ray(8,50,8);
 if(current==='Dynamike' || (superMove && current==='Kit')){
   const j=superMove?joyU:joyR;
   const stick=j.active?Math.hypot(j.cx-j.x,j.cy-j.y):aimPoint?Math.hypot(aimPoint.x,aimPoint.y):60;
   const shape=current==='Kit'?kitJump:superMove?superAimData.Dynamike:basicAim.Dynamike;
   return {...shape,range:shape.range*Math.min(1,stick/60)};
 }
 if(superMove && current==='Chester')return [landing(220,80),fan(235,.45),ray(12,35,8),ring(120),ring(24)][p.jackpot||0];
 if(superMove)return superAimData[current];
 if(current==='Kit' && p.attachment?.ally)return kitYarn;
 if(basicAim[current])return basicAim[current];
 const shot=BRAWLERS[current].shot;
 return ray(shot.speed,shot.life,6,shot.spread);
}
function destination(angle,range){
 return {x:Math.max(22,Math.min(canvas.width-22,p.x+Math.cos(angle)*range)),
         y:Math.max(22,Math.min(canvas.height-22,p.y+Math.sin(angle)*range))};
}
function inFan(target,angle,shape){
 const dx=target.x-p.x,dy=target.y-p.y;
 return Math.hypot(dx,dy)<=shape.range && Math.cos(Math.atan2(dy,dx)-angle)>=Math.cos(shape.spread);
}
function drawAim(angle,superMove){
 const s=combatShape(superMove);
 ctx.save();ctx.lineWidth=2;ctx.strokeStyle=superMove?'#ffe482':'#fff';
 ctx.fillStyle=superMove?'rgba(255,212,88,.18)':'rgba(255,255,255,.17)';
 if(s.kind==='dash'){
   const end=destination(angle,s.range);ctx.lineCap='round';ctx.lineWidth=s.radius*2;
   ctx.strokeStyle=ctx.fillStyle;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(end.x,end.y);ctx.stroke();
   ctx.lineWidth=2;ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(end.x,end.y,s.radius,0,Math.PI*2);ctx.stroke();
 }else if(s.kind==='jump'||s.kind==='landing'){
   for(const offset of s.offsets){
     const a=angle+offset, end=s.kind==='jump'||(superMove && ['Pam','Jessie','Nita'].includes(current))?destination(a,s.range):{x:p.x+Math.cos(a)*s.range,y:p.y+Math.sin(a)*s.range};
     if(s.range){
       ctx.beginPath();ctx.setLineDash([5,6]);ctx.moveTo(p.x,p.y);
       ctx.quadraticCurveTo((p.x+end.x)/2,(p.y+end.y)/2-(s.kind==='jump'?36:16),end.x,end.y);
       ctx.stroke();ctx.setLineDash([]);
     }
     ctx.beginPath();ctx.arc(end.x,end.y,s.radius,0,Math.PI*2);ctx.fill();ctx.stroke();
   }
 }else{
   ctx.translate(p.x,p.y);ctx.rotate(angle);ctx.beginPath();
   if(s.spread){ctx.moveTo(0,0);ctx.arc(0,0,s.range,-s.spread,s.spread);ctx.closePath();}
   else ctx.rect(0,-s.width,s.range,2*s.width);
   ctx.fill();ctx.stroke();
 }
 ctx.restore();
}
