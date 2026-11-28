import {writeMatchField} from './online.js?v=20261128-release20';
const spectator=document.querySelector('#guest-game'), surface=document.querySelector('#guest-canvas');
let host=null, guest=null, latest=null, lastSent=0, pointer=null, command=null;
let guestSequence=0, hostSequence=0, frameSequence=0;
let previous=null, receivedAt=0, paintFrame=0;
const snapshotInterval=120;
const reconnectGrace=12000;
let missingOpponent=0,missingHost=0;
function clearReconnectTimers(){
 clearTimeout(missingOpponent);clearTimeout(missingHost);
 missingOpponent=0;missingHost=0;
}
function stopGuestPaint(){
 cancelAnimationFrame(paintFrame);paintFrame=0;previous=null;
}
function decode(raw){try{return JSON.parse(raw)}catch{return null}}
function validFrame(s){
 const point=a=>a && Number.isFinite(a.x) && Number.isFinite(a.y);
 return s && ['ball','knockout'].includes(s.mode) && typeof s.id==='string' && Number.isFinite(s.aspect)
   && Array.isArray(s.actors) && s.actors.length===6 && s.actors.every(a=>point(a) && Object.hasOwn(BRAWLERS,a.fighter))
   && Array.isArray(s.shots) && s.shots.length<=30 && s.shots.every(point)
   && Array.isArray(s.walls) && s.walls.length<=12 && s.walls.every(r=>point(r) && Number.isFinite(r.w) && Number.isFinite(r.h))
   && Array.isArray(s.score) && s.score.length===2 && s.score.every(Number.isFinite) && point(s.ball);
}
function send(key,data){return writeMatchField(key,data).catch(e=>{document.querySelector('#room-status').textContent=e.message;});}
export async function hostGame(mode,uid,players){
 const opponent=Object.keys(players).find(id=>id!==uid && players[id].ready);
 if(!opponent)throw Error('Второй игрок должен войти и нажать «Готов»');
 const id=crypto.randomUUID();
 await writeMatchField('matchState',{id,opponent,mode,waiting:true});
 host={id,opponent,mode};hostSequence=0;frameSequence=0;command=null;lastSent=0;
 document.querySelector('#mode').value=mode;
 document.querySelector('#room-dialog').close();changeScreen('game');
}
export function updateSharedGame(players,uid){
 if(!uid)return;
 if(host){
   if(!players[host.opponent]){
     command=null;
     if(!missingOpponent)missingOpponent=setTimeout(()=>{
       missingOpponent=0;host=null;send('matchState',null);
       exitToMenu();document.querySelector('#room-dialog').showModal();
     },reconnectGrace);
     return;
   }
   clearTimeout(missingOpponent);missingOpponent=0;
   const next=decode(players[host.opponent]?.matchInput);
   if(next?.id===host.id&&Number.isFinite(next.x)&&Number.isFinite(next.y)){
     if(next.angle!==null&&Number.isSafeInteger(next.seq)&&next.seq>hostSequence&&Number.isFinite(next.angle)){
       command=next;
     }else if(next.angle===null&&(!command||command.seq<=hostSequence)){
       command=next;
     }
   }
 }
 const source=Object.values(players).map(v=>decode(v.matchState)).find(s=>s?.opponent===uid && validFrame(s));
 if(!source){
   if(guest&&!missingHost)missingHost=setTimeout(()=>{
     missingHost=0;spectator.close();guest=null;latest=null;stopGuestPaint();
     document.querySelector('#room-dialog').showModal();
   },reconnectGrace);
   return;
 }
 clearTimeout(missingHost);missingHost=0;
 if(guest!==source.id){
   document.querySelector('#room-dialog').close();
   if(!spectator.open)spectator.showModal();
   guestSequence=0;latest=null;stopGuestPaint();
 }
 if(latest&&Number.isFinite(source.frame)&&source.frame<=latest.frame)return;
 guest=source.id;
 previous=latest;latest=source;receivedAt=performance.now();
 if(!paintFrame)paintFrame=requestAnimationFrame(animateGuest);
}
window.roomControlledBot=a=>Boolean(host && a.slot===1);
window.stepRoomBot=a=>{
 if(!command || command.id!==host?.id)return;
 const x=Math.max(0,Math.min(1,command.x))*tlbsWorld.width,y=Math.max(0,Math.min(1,command.y))*tlbsWorld.height;
 const dx=x-a.x,dy=y-a.y,d=Math.hypot(dx,dy),step=Math.min(d,BRAWLERS[a.fighter].speed);
 if(d>2)moveOnPitch(a,dx/d*step,dy/d*step);
 if(command.seq>hostSequence && Number.isFinite(command.angle)){
   hostSequence=command.seq;
   if(!kickBall(a,command.angle) && arena.age>=(a.nextShot||0)){
     a.nextShot=arena.age+32;
     for(const off of [-.2,0,.2]){
       spawnBullet(command.angle+off,12,35,false,5,'teamShot',a);bullets.at(-1).owner=a;
     }
   }
 }
};
window.shareMatch=(result=null)=>{
 if(!host || !arena || (!result && performance.now()-lastSent<snapshotInterval))return;
 lastSent=performance.now();
 const point=a=>({x:a.x/tlbsWorld.width,y:a.y/tlbsWorld.height});
 const actors=arena.actors.map(a=>({...point(a),hp:a.hp,maxHp:a.maxHp,slow:a.slow>0,stun:a.stun>0,out:a.out || (a===p && !visibleTo(arena.actors[1],p) && p.hiddenTicks>0),fighter:a.fighter,team:a.team,skin:a===p?selectedFighterSkin(current):0}));
 send('matchState',{...host,frame:++frameSequence,actors,score:arena.score,ball:point(arena.ball),carrier:arena.carrier?.slot??-1,
   walls:arena.walls.map(w=>({...point(w),w:w.w/tlbsWorld.width,h:w.h/tlbsWorld.height})),
   units:zones.filter(z=>Object.hasOwn(summonStats,z.type)).map(z=>({...point(z),type:z.type,hp:z.hp,age:z.age,angle:z.angle||0,r:z.r/tlbsWorld.width})),
   shots:bullets.slice(-30).map(point),aspect:tlbsWorld.width/tlbsWorld.height,result});
};
window.closeSharedHost=()=>{clearReconnectTimers();if(host){host=null;command=null;send('matchState',null);}};
function animateGuest(now){
 paintFrame=0;
 if(!latest||!spectator.open)return;
 const progress=previous?Math.min(1,Math.max(0,(now-receivedAt)/snapshotInterval)):1;
 paintGuest(progress);
 if(progress<1)paintFrame=requestAnimationFrame(animateGuest);
}
function paintGuest(progress){
 const s=latest;if(!s)return;
 const height=Math.round(800/Math.max(.35,Math.min(3,s.aspect)));
 if(surface.width!==800)surface.width=800;
 if(surface.height!==height)surface.height=height;
 const g=surface.getContext('2d'),w=surface.width,h=surface.height;
 g.fillStyle='#2b7545';g.fillRect(0,0,w,h);
 if(s.mode==='ball'){g.fillStyle='#f0bc73';g.fillRect(w*.41,0,w*.18,9);g.fillRect(w*.41,h-9,w*.18,9);}
 for(const r of s.walls){g.fillStyle='#aa9477';g.fillRect(r.x*w,r.y*h,r.w*w,r.h*h);}
 if(Array.isArray(s.units))for(const u of s.units.slice(0,4)){
   if(Object.hasOwn(summonStats,u.type) && [u.x,u.y,u.hp,u.age,u.angle,u.r].every(Number.isFinite)){
     drawSummon({...u,x:u.x*w,y:u.y*h,r:Math.max(0,Math.min(w,u.r*w)),maxHp:summonStats[u.type].hp},g);
   }
 }
 g.textAlign='center';g.font='16px sans-serif';
 s.actors.forEach((a,i)=>{
   if(a.out)return;
   const old=previous?.actors[i];
   const interpolate=old&&!old.out&&Math.hypot(a.x-old.x,a.y-old.y)<.16;
   const x=(interpolate?old.x+(a.x-old.x)*progress:a.x)*w;
   const y=(interpolate?old.y+(a.y-old.y)*progress:a.y)*h;
   if(a.skin>0)drawFighterBody(g,x,y,15,a.fighter,a.skin);
   else {g.fillStyle=a.team?'#62cef5':'#fc8d85';g.beginPath();g.arc(x,y,15,0,7);g.fill();}
   g.fillStyle='white';g.fillText((i===1?'Ты · ':'')+fighterNames[a.fighter],x,y-22);
   if(Number.isFinite(a.hp)&&a.maxHp>0){
     g.fillStyle='#263840';g.fillRect(x-19,y-19,38,4);
     g.fillStyle='#8be49b';g.fillRect(x-19,y-19,38*Math.max(0,Math.min(1,a.hp/a.maxHp)),4);
   }
   if(a.stun||a.slow){g.fillStyle='#ffe38b';g.fillText(a.stun?'Оглушён':'Замедлен',x,y+30);}
 });
 g.fillStyle='#fee8a1';for(const b of s.shots){g.beginPath();g.arc(b.x*w,b.y*h,4,0,7);g.fill();}
 if(s.mode==='ball'){const a=s.actors[s.carrier]||s.ball;g.fillStyle='white';g.beginPath();g.arc(a.x*w+8,a.y*h,8,0,7);g.fill();}
 document.querySelector('#guest-score').textContent=s.result || objectives[s.mode][0]+' · '+s.score[1]+' : '+s.score[0];
}
surface.onpointerdown=e=>{pointer={x:e.clientX,y:e.clientY,id:e.pointerId};surface.setPointerCapture(e.pointerId);};
surface.onpointercancel=()=>pointer=null;
surface.onpointerup=e=>{
 if(!guest || missingHost || !pointer || pointer.id!==e.pointerId || latest.result)return;
 const box=surface.getBoundingClientRect(),dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer=null;
 const shot=Math.hypot(dx,dy)>10,me=latest.actors[1];
 send('matchInput',{id:guest,x:shot?me.x:(e.clientX-box.left)/box.width,y:shot?me.y:(e.clientY-box.top)/box.height,
 seq:shot?++guestSequence:guestSequence,angle:shot?Math.atan2(dy/box.height*surface.height,dx/box.width*surface.width):null});
};
document.querySelector('#guest-leave').onclick=()=>{clearReconnectTimers();spectator.close();guest=null;latest=null;stopGuestPaint();document.querySelector('#room-leave').click();};
spectator.oncancel=e=>{e.preventDefault();document.querySelector('#guest-leave').click();};
