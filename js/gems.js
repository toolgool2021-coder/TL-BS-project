const gemPanel=document.getElementById('gem-panel');
const gemValues=['gem-us','gem-them','gem-clock','gem-life'].map(id=>document.getElementById(id));
function gemHUD(){
 const active=match.mode==='gems' && !!arena;
 gemPanel.hidden=!active;
 if(!active)return;
 const [ours,theirs]=arena.score;
 const holding=arena.leader>=0 && arena.hold>0;
 const clock=holding?(arena.leader===0?'Наша победа':'Победа соперников')+' через '+Math.ceil((900-arena.hold)/60)+' с':'Цель: 10 кристаллов';
 const life=p.out?'Возрождение через '+Math.ceil(p.respawn/60)+' с':p.spawnShield?'Щит · '+Math.ceil(p.spawnShield/60)+' с':'';
 const values=[String(ours),String(theirs),clock,life];
 values.forEach((v,i)=>{if(gemValues[i].textContent!==v)gemValues[i].textContent=v;});
}
function diamond(x,y,r){
 ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+r*.7,y-r*.25);ctx.lineTo(x+r*.55,y+r*.45);
 ctx.lineTo(x,y+r);ctx.lineTo(x-r*.65,y+r*.15);ctx.lineTo(x-r*.5,y-r*.5);ctx.closePath();
 ctx.fillStyle='#c880ff';ctx.fill();ctx.strokeStyle='#ffe2ff';ctx.lineWidth=2;ctx.stroke();
 ctx.beginPath();ctx.moveTo(x-r*.35,y-r*.28);ctx.lineTo(x,y-r*.62);ctx.lineTo(x+r*.22,y-r*.24);ctx.stroke();
}
function drawGemMine(){
 const x=tlbsWorld.width/2,y=tlbsWorld.height/2;
 ctx.save();ctx.fillStyle='#39233e';ctx.strokeStyle='#d49aec';ctx.lineWidth=3;
 ctx.beginPath();ctx.ellipse(x,y,42,22,0,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.textAlign='center';ctx.font='bold 12px system-ui';ctx.fillStyle='#fff';ctx.fillText('ШАХТА',x,y+5);
 ctx.strokeStyle='#f1b9ff';ctx.beginPath();ctx.arc(x,y,48,-Math.PI/2,-Math.PI/2+(arena.age%120)/120*Math.PI*2);ctx.stroke();
 for(const [i,g] of arena.drops.entries())if(inViewport(g.x,g.y,30))diamond(g.x,g.y-5+2*Math.sin(arena.age*.055+i),11);
 ctx.restore();
}
function drawGemActors(){
 if(realm)return;
 const placed=[];
 ctx.save();ctx.textAlign='center';ctx.font='bold 12px system-ui';
 for(const a of arena.actors){
   const color=a.team?'#ffaaa4':'#8ae5ff';
   if(a.out){
     if(!a.respawn)continue;
     ctx.strokeStyle=color;ctx.lineWidth=2;ctx.setLineDash([5,5]);
     ctx.beginPath();ctx.arc(a.homeX,a.homeY,25,0,7);ctx.stroke();ctx.setLineDash([]);
     ctx.fillStyle='white';ctx.fillText((a===p?'Ты':fighterNames[a.fighter])+' · '+Math.ceil(a.respawn/60)+' с',a.homeX,a.homeY-33);continue;
   }
   if(a.spawnShield){
     ctx.beginPath();ctx.arc(a.x,a.y,28+2*Math.sin(arena.age*.1),0,7);ctx.fillStyle='#b5edff33';ctx.fill();
     ctx.strokeStyle='#d0f7ff';ctx.lineWidth=2;ctx.stroke();
   }
   const title=(a===p?'Ты · ':'')+fighterNames[a.fighter], stats=Math.ceil(a.hp)+' HP   ◆ '+a.gems;
   const w=Math.max(ctx.measureText(title).width,ctx.measureText(stats).width)+14;
   const x=Math.max(w/2+2,Math.min(tlbsWorld.width-w/2-2,a.x));
   const above=a.y-58,below=a.y+26;
   const candidates=[above,below,above-34,below+34,above-68,below+68].filter(y=>y>=0 && y+33<=tlbsWorld.height);
   const y=candidates.find(top=>placed.every(rect=>Math.abs(rect.x-x)>=(rect.w+w)/2+2 || Math.abs(top-rect.y)>=34)) ?? candidates[0] ?? 0;
   placed.push({x,y,w});
   if(y!==above && y!==below){
      ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(x,y<a.y?y+32:y);ctx.stroke();
   }
   ctx.fillStyle='#101724ed';ctx.fillRect(x-w/2,y,w,31);
   ctx.fillStyle=color;ctx.fillText(title,x,y+12);ctx.fillStyle='#fff';ctx.fillText(stats,x,y+25);
   ctx.fillStyle='#42485c';ctx.fillRect(x-w/2,y+29,w,3);ctx.fillStyle=color;ctx.fillRect(x-w/2,y+29,w*Math.max(0,a.hp/a.maxHp),3);
 }
 ctx.restore();
}
function gemBotGoal(a,target,center){
 const teammates=arena.actors.filter(b=>!b.out && b.team===a.team);
 const carrier=teammates.reduce((best,b)=>b.gems>best.gems?b:best,a);
 if(a.gems>=3 && (a.hp<a.maxHp*.48 || arena.score[a.team]>=10))
   return {x:a.homeX,y:a.homeY};
 if(carrier!==a && carrier.gems>=4 && a.slot%3===0)
   return {x:(carrier.x+target.x)/2,y:(carrier.y+target.y)/2};
 if(arena.drops.length)return arena.drops.reduce((best,g)=>dist(a,g)<dist(a,best)?g:best);
 return {x:center.x+(a.slot%3-1)*44,y:center.y+(a.team?-25:25)};
}
