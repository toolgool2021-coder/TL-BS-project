function insideCover(x,y,pad=0){
 return arena?.walls?.some(w=>x>w.x-pad && x<w.x+w.w+pad && y>w.y-pad && y<w.y+w.h+pad);
}
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
 const w=canvas.width,h=canvas.height,c=w/2;
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
   ctx.fillStyle='white';ctx.fillText(fighterNames[a.fighter],a.x,a.y+34);
 }
 if(match.mode==='knockout'){
   for(const team of [0,1]){
     const members=arena.actors.filter(a=>a.team===team);
     ctx.fillStyle=team?'#ffd0c7':'#b9f2ff';ctx.fillText((team?'Соперники':'Союзники')+' '+members.filter(a=>!a.out).length+'/3 · '+members.map(a=>(a.out?'× ':'')+fighterNames[a.fighter]).join(' / '),canvas.width/2,115+team*18);
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
