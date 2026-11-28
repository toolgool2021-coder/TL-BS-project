// Lengths are measured in arena units. Projectile range ends on its last collision tick.
const chesterSpread=count=>.11*(count-1);
function naniRange(){const j=joyR;const power=Number.isFinite(window.tlbsAttackPower)?window.tlbsAttackPower:j.active?Math.hypot(j.cx-j.x,j.cy-j.y)*window.tlbsSensitivity:aimPoint?Math.hypot(aimPoint.x,aimPoint.y)*window.tlbsSensitivity:60;return Math.max(24,320*Math.min(1,power/42));}
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
 Brock:landing(240,80,[-.26,0,.26]),Crow:jump(300,80),Stu:jump(200,22),Bull:jump(312,50),
 Darryl:jump(312,50),El_Primo:jump(250,120),Barley:landing(250,55,[-.6,-.3,0,.3,.6]),
 Dynamike:landing(250,140),Poco:fan(360,.55),Nita:landing(205,38),Piper:jump(285,24),Pam:landing(235,95),
 Leon:ring(25),Spike:landing(220,100),Sandy:landing(160,140),Edgar:jump(260,100),Colette:jump(220,48),
 Emz:ring(125),Bea:ray(11,45,6,.33),Gale:fan(350,.5),Surge:jump(90,90),Fang:jump(190,65),
 Buzz:ray(14,23,8),Chester:landing(220,80),Cordelius:ray(14,40,10),Kit:kitJump
};
function combatShape(superMove){
 if(arena?.carrier===p)return ray(8,50,8);
 if((!superMove && ['Poco','Nita','Sandy'].includes(current)) || (superMove && current==='Gale')){
   const w=fronts[current];return w.spread?fan(w.range,w.spread):{kind:'ray',range:w.range,width:superMove&&current==='Gale'?galeWindWidth():w.width,spread:0};
 }
 if(!superMove && current==='Nani')return {kind:'nani',range:naniRange(),radius:12};
 if(!superMove && current==='Surge')return ray(13,surgeLife(),7);
 if(['Dynamike','Barley'].includes(current) || (!superMove && current==='Tick') || (superMove && current==='Kit')){
   const j=superMove?joyU:joyR;
   const stick=Number.isFinite(window.tlbsAttackPower)?window.tlbsAttackPower:j.active?Math.hypot(j.cx-j.x,j.cy-j.y)*window.tlbsSensitivity:aimPoint?Math.hypot(aimPoint.x,aimPoint.y)*window.tlbsSensitivity:60;
   const shape=current==='Kit'?kitJump:superMove?superAimData[current]:basicAim[current];
   const offsets=current==='Tick'&&p.tickSpread?[-.38,-.19,0,.19,.38]:shape.offsets;
   return {...shape,offsets,range:shape.range*Math.min(1,stick/42)};
 }
 if(superMove && current==='Chester')return [landing(220,80),fan(235,.45),ray(12,35,8),ring(120),ring(24)][p.jackpot||0];
 if(superMove&&current==='Griff')return fan(420,.52);
 if(!superMove&&current==='Mortis'&&p.mortisReach)return {...basicAim.Mortis,range:175};
 if(superMove&&current==='Stu'&&p.passiveChoice==='0')return {...superAimData.Stu,range:255};
 if(!superMove&&current==='Shelly'&&p.shellyFocus)return ray(12,46,5,.1);
 if(!superMove&&current==='Colt')return {...ray(15,p.passiveChoice==='1'?52:45),count:p.coltExtra?7:5};
 if(!superMove&&current==='Brock'&&p.passiveChoice==='0')return ray(17.5,48);
 if(superMove&&current==='Brock'&&p.passiveChoice==='1')return {...superAimData.Brock,radius:104};
 if(superMove&&current==='El_Primo'&&p.passiveChoice==='0')return {...superAimData.El_Primo,radius:145};
 if(superMove&&current==='Sandy'&&p.passiveChoice==='1')return {...superAimData.Sandy,radius:175};
 if(superMove&&current==='Pam'&&p.passiveChoice==='0')return {...superAimData.Pam,radius:122};
 if(superMove&&current==='Bo'&&p.passiveChoice==='1')return {...superAimData.Bo,radius:75};
 if(superMove&&current==='Bonnie')return p.bonnieOnFoot?ring(24):jump(p.passiveChoice==='0'?375:300,75);
 if(!superMove&&current==='Bonnie'&&p.bonnieOnFoot)return ray(14,15,6,.18);
 if(superMove)return superAimData[current]||ray(12,35,8);
 if(current==='Kit' && p.attachment?.ally)return kitYarn;
 if(current==='Bea'&&p.beeCharge&&p.passiveChoice==='0')return ray(20,32,6);
 if(current==='Chester'){const shot=BRAWLERS[current].shot,count=1+(p.bells||0);return {...ray(shot.speed,shot.life,6,chesterSpread(count)),count};}
 if(current==='Griff')return {...ray(14,35,6,.22),count:3};
 if(basicAim[current])return basicAim[current];
 const shot=BRAWLERS[current].shot;
 return ray(shot.speed,shot.life,6,shot.spread);
}
function destination(angle,range){
 return {x:Math.max(22,Math.min(tlbsWorld.width-22,p.x+Math.cos(angle)*range)),
         y:Math.max(22,Math.min(tlbsWorld.height-22,p.y+Math.sin(angle)*range))};
}
function inFan(target,angle,shape){
 const dx=target.x-p.x,dy=target.y-p.y;
 return Math.hypot(dx,dy)<=shape.range && Math.cos(Math.atan2(dy,dx)-angle)>=Math.cos(shape.spread);
}
function drawAim(angle,superMove){
 const s=combatShape(superMove);
 ctx.save();ctx.lineWidth=3;ctx.strokeStyle=superMove?'#ffe482':'#fff';
 ctx.fillStyle=superMove?'rgba(255,212,88,.27)':'rgba(255,255,255,.23)';
 if(current==='Fang' && !superMove && arena?.carrier!==p){
   ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.arc(p.x,p.y,85,angle-.58,angle+.58);ctx.closePath();ctx.fill();ctx.stroke();
 }
 if(s.kind==='nani'){const end=destination(angle,s.range);const a=Math.atan2(end.y-p.y,end.x-p.x);for(const curve of [0,45,-45]){ctx.beginPath();for(let i=0;i<=24;i++){const u=i/24,off=Math.sin(u*Math.PI)*curve,x=p.x+(end.x-p.x)*u-Math.sin(a)*off,y=p.y+(end.y-p.y)*u+Math.cos(a)*off;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();}ctx.beginPath();ctx.arc(end.x,end.y,s.radius,0,7);ctx.fill();ctx.stroke();}
 else if(s.kind==='dash'){
   const end=destination(angle,s.range);ctx.lineCap='round';ctx.lineWidth=s.radius*2;
   ctx.strokeStyle=ctx.fillStyle;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(end.x,end.y);ctx.stroke();
   ctx.lineWidth=2;ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(end.x,end.y,s.radius,0,Math.PI*2);ctx.stroke();
 }else if(s.kind==='jump'||s.kind==='landing'){
   for(const offset of s.offsets){
     const a=angle+offset, end=destination(a,s.range);
     if(s.range){
       ctx.beginPath();ctx.setLineDash([5,6]);ctx.moveTo(p.x,p.y);
       ctx.quadraticCurveTo((p.x+end.x)/2,(p.y+end.y)/2-(s.kind==='jump'?36:16),end.x,end.y);
       ctx.stroke();ctx.setLineDash([]);
     }
     ctx.beginPath();ctx.arc(end.x,end.y,s.radius,0,Math.PI*2);ctx.fill();ctx.stroke();
     ctx.fillStyle=superMove?'#ffe482':'#fff';ctx.font='bold 15px system-ui';ctx.textAlign='center';ctx.fillText(String(s.offsets.indexOf(offset)+1),end.x,end.y+5);ctx.fillStyle=superMove?'rgba(255,212,88,.27)':'rgba(255,255,255,.23)';
   }
 }else{
   ctx.translate(p.x,p.y);ctx.rotate(angle);ctx.beginPath();
   if(s.spread){ctx.moveTo(0,0);ctx.arc(0,0,s.range,-s.spread,s.spread);ctx.closePath();}
   else ctx.rect(0,-s.width,s.range,2*s.width);
   ctx.fill();ctx.stroke();
   const count=s.count??(superMove?({Shelly:9,Colt:12,Rico:9}[current]||1):({Shelly:3,Bull:5,Darryl:5,Colt:5,El_Primo:3,Rosa:3,Bo:3,Crow:3,Tara:3,Max:4,Stu:2}[current]||BRAWLERS[current].shot?.count||1));
   if(current==='Chester'&&!superMove&&arena?.carrier!==p){ctx.save();ctx.fillStyle='#fff';ctx.font='bold 18px system-ui';ctx.textAlign='center';ctx.fillText('×'+count,Math.min(s.range*.65,140),-Math.max(18,Math.sin(s.spread||0)*Math.min(s.range*.65,140)+12));ctx.restore();}
   if(s.kind==='ray'&&count>1){ctx.strokeStyle=superMove?'#ffe482':'#fff';ctx.lineWidth=1.5;for(let i=0;i<count;i++){const a=count===1?0:(i/(count-1)*2-1)*(s.spread||0);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*s.range,Math.sin(a)*s.range);ctx.stroke();}ctx.fillStyle=ctx.strokeStyle;ctx.font='bold 16px system-ui';if(current!=='Chester'||superMove)ctx.fillText('×'+count,Math.min(s.range,100),-12);}
 }
 ctx.restore();
}
