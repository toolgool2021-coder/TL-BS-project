function tlbsBotMove(a,goal,speed){
 const boundX=Math.max(22,Math.min(tlbsWorld.width-22,goal.x));
 const boundY=Math.max(22,Math.min(tlbsWorld.height-22,goal.y));
 goal={x:boundX,y:boundY};
 if(dist(a,goal)<1)return;
 const clear=(x,y)=>x>=20&&y>=20&&x<=tlbsWorld.width-20&&y<=tlbsWorld.height-20&&!insideCover(x,y,22);
 const segment=(x,y,X,Y)=>{const n=Math.max(1,Math.ceil(Math.hypot(X-x,Y-y)/12));for(let i=1;i<=n;i++)if(!clear(x+(X-x)*i/n,y+(Y-y)*i/n))return false;return true;};
 if(segment(a.x,a.y,goal.x,goal.y)){a.nav=null;}else if(!a.nav||--a.nav.ttl<=0||Math.hypot(a.nav.gx-goal.x,a.nav.gy-goal.y)>80){
 const nodes=[{x:a.x,y:a.y},goal];
 for(const w of (arena?.walls||tlbsMapWalls))for(const x of [w.x-26,w.x+w.w+26])for(const y of [w.y-26,w.y+w.h+26])if(clear(x,y))nodes.push({x,y});
 const d=nodes.map(()=>Infinity),prev=[],used=new Set();d[0]=0;
 for(let k=0;k<nodes.length;k++){let i=-1;for(let j=0;j<nodes.length;j++)if(!used.has(j)&&(i<0||d[j]<d[i]))i=j;if(i<0||!Number.isFinite(d[i])||i===1)break;used.add(i);for(let j=1;j<nodes.length;j++)if(!used.has(j)&&segment(nodes[i].x,nodes[i].y,nodes[j].x,nodes[j].y)){const v=d[i]+Math.hypot(nodes[i].x-nodes[j].x,nodes[i].y-nodes[j].y);if(v<d[j]){d[j]=v;prev[j]=i;}}}
 let route=[];if(Number.isFinite(d[1]))for(let j=1;j!==0;j=prev[j])route.unshift(nodes[j]);a.nav={route,ttl:45,gx:goal.x,gy:goal.y};
 }
 const route=a.nav?.route;if(route?.length&&Math.hypot(a.x-route[0].x,a.y-route[0].y)<=3)route.shift();
 const t=route?.[0]||goal,angle=Math.atan2(t.y-a.y,t.x-a.x),step=Math.min(speed,dist(a,t));
 for(const off of [0,.6,-.6,1.2,-1.2,1.8,-1.8]){const x=Math.cos(angle+off)*step,y=Math.sin(angle+off)*step;if(clear(a.x+x,a.y+y)){moveOnPitch(a,x,y);return;}}
}
function insideCover(x,y,pad=0){
 return (arena?.walls||tlbsMapWalls)?.some(w=>x>w.x-pad && x<w.x+w.w+pad && y>w.y-pad && y<w.y+w.h+pad);
}
function nearCover(actor){return insideCover(actor.x,actor.y,44);}
function moveOnPitch(a,dx,dy){
 if(!insideCover(a.x+dx,a.y,16))a.x+=dx;
 if(!insideCover(a.x,a.y+dy,16))a.y+=dy;
}
function visibleTo(from,to){
 if(to===p && p.hiddenTicks>0 && dist(from,to)>65 && arena?.carrier!==p)return false;
 const steps=Math.ceil(dist(from,to)/10);
 for(let i=1;i<steps;i++)if(insideCover(from.x+(to.x-from.x)*i/steps,from.y+(to.y-from.y)*i/steps))return false;
 return true;
}
function paintPitch(){
 const w=tlbsWorld.width,h=tlbsWorld.height,c=w/2;
 ctx.save();
 for(let i=0;i<8;i++){ctx.fillStyle=i%2?'#287743':'#307f48';ctx.fillRect(0,i*h/8,w,h/8);}
 ctx.strokeStyle='#d1f2cf88';ctx.lineWidth=2;
 ctx.strokeRect(8,8,w-16,h-16);ctx.beginPath();ctx.moveTo(8,h/2);ctx.lineTo(w-8,h/2);ctx.stroke();
 ctx.beginPath();ctx.arc(c,h/2,42,0,7);ctx.stroke();
 for(const [y,color] of [[0,'#ff9a8e'],[h-26,'#80d6ff']]){
   ctx.fillStyle='#132737';ctx.fillRect(c-65,y,130,26);ctx.strokeStyle=color;ctx.lineWidth=3;ctx.strokeRect(c-65,y,130,26);
   ctx.lineWidth=1;for(let x=c-58;x<c+65;x+=10){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+26);ctx.stroke();}
 }
 for(const wall of arena.walls){ctx.fillStyle='#263441';ctx.fillRect(wall.x,wall.y+4,wall.w,wall.h);ctx.fillStyle='#ad9272';ctx.fillRect(wall.x,wall.y,wall.w,wall.h-3);}
 ctx.restore();
}
function paintTeamHUD(){
 if(!arena || realm)return;
 ctx.save();ctx.textAlign='center';ctx.font='bold 13px sans-serif';
 for(const a of arena.actors.filter(a=>a!==p && !a.out && inPlane(a))){
   ctx.fillStyle=BRAWLERS[a.fighter].color;ctx.strokeStyle=a.team===0?'#a0edff':'#ff9292';ctx.lineWidth=3;
   ctx.beginPath();ctx.arc(a.x,a.y,19,0,7);ctx.fill();ctx.stroke();
   if(match.mode!=='gems'){ctx.fillStyle='white';ctx.fillText(fighterNames[a.fighter],a.x,a.y+34);}
 }
 if(match.mode==='knockout'){
   for(const team of [0,1]){
     const members=arena.actors.filter(a=>a.team===team);
     ctx.fillStyle=team?'#ffd0c7':'#b9f2ff';ctx.fillText((team?'Соперники':'Союзники')+' '+members.filter(a=>!a.out).length+'/3 · '+members.map(a=>(a.out?'× ':'')+fighterNames[a.fighter]).join(' / '),tlbsCamera.x+canvas.width/2,tlbsCamera.y+115+team*18);
   }
 }
 if(match.mode==='ball'){
   const a=arena.carrier,b=arena.ball,x=a?a.x+18:b.x,y=a?a.y+10:b.y;
   ctx.fillStyle='#fff';ctx.strokeStyle='#172d37';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,10,0,7);ctx.fill();ctx.stroke();
   ctx.fillStyle='#26313d';ctx.beginPath();ctx.arc(x,y,4,0,7);ctx.fill();
   ctx.fillStyle='white';ctx.fillText(a===p?'Мяч у тебя':a?'Мяч: '+fighterNames[a.fighter]:'Свободный мяч',x,y-27);
 }
 ctx.restore();
}
