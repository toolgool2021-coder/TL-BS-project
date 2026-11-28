import {writeMatchField} from './online.js';
const spectator=document.querySelector('#guest-game'), surface=document.querySelector('#guest-canvas');
let host=null, guest=null, latest=null, lastSent=0, pointer=null, sequence=0, command=null;
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
 host={id,opponent,mode};sequence=0;command=null;lastSent=0;
 document.querySelector('#mode').value=mode;
 document.querySelector('#room-dialog').close();changeScreen('game');
}
export function updateSharedGame(players,uid){
 if(!uid)return;
 if(host){
   if(!players[host.opponent]){host=null;send('matchState',null);exitToMenu();document.querySelector('#room-dialog').showModal();return;}
   const next=decode(players[host.opponent]?.matchInput);
   if(next?.id===host.id && Number.isFinite(next.x) && Number.isFinite(next.y))command=next;
 }
 const source=Object.values(players).map(v=>decode(v.matchState)).find(s=>s?.opponent===uid && validFrame(s));
 if(!source){if(guest){spectator.close();guest=null;latest=null;document.querySelector('#room-dialog').showModal();}return;}
 if(!guest){
   document.querySelector('#room-dialog').close();spectator.showModal();sequence=0;
 }
 guest=source.id;latest=source;paintGuest();
}
window.roomControlledBot=a=>Boolean(host && a.slot===1);
window.stepRoomBot=a=>{
 if(!command || command.id!==host?.id)return;
 const x=Math.max(0,Math.min(1,command.x))*tlbsWorld.width,y=Math.max(0,Math.min(1,command.y))*tlbsWorld.height;
 const dx=x-a.x,dy=y-a.y,d=Math.hypot(dx,dy),step=Math.min(d,BRAWLERS[a.fighter].speed);
 if(d>2)moveOnPitch(a,dx/d*step,dy/d*step);
 if(command.seq>sequence && Number.isFinite(command.angle)){
   sequence=command.seq;
   if(!kickBall(a,command.angle) && arena.age>=(a.nextShot||0)){
     a.nextShot=arena.age+32;
     for(const off of [-.2,0,.2]){
       spawnBullet(command.angle+off,12,35,false,5,'teamShot',a);bullets.at(-1).owner=a;
     }
   }
 }
};
window.shareMatch=(result=null)=>{
 if(!host || !arena || (!result && performance.now()-lastSent<120))return;
 lastSent=performance.now();
 const point=a=>({x:a.x/tlbsWorld.width,y:a.y/tlbsWorld.height});
 const actors=arena.actors.map(a=>({...point(a),hp:a.hp,maxHp:a.maxHp,out:a.out || (a===p && !visibleTo(arena.actors[1],p) && p.hiddenTicks>0),fighter:a.fighter,team:a.team}));
 send('matchState',{...host,actors,score:arena.score,ball:point(arena.ball),carrier:arena.carrier?.slot??-1,
   walls:arena.walls.map(w=>({...point(w),w:w.w/tlbsWorld.width,h:w.h/tlbsWorld.height})),
   units:zones.filter(z=>Object.hasOwn(summonStats,z.type)).map(z=>({...point(z),type:z.type,hp:z.hp,age:z.age,angle:z.angle||0,r:z.r/tlbsWorld.width})),
   shots:bullets.slice(-30).map(point),aspect:tlbsWorld.width/tlbsWorld.height,result});
};
window.closeSharedHost=()=>{if(host){host=null;command=null;send('matchState',null);}};
function paintGuest(){
 const s=latest;if(!s)return;
 surface.width=800;surface.height=Math.round(800/Math.max(.35,Math.min(3,s.aspect)));
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
 s.actors.forEach((a,i)=>{if(a.out)return;g.fillStyle=a.team?'#62cef5':'#fc8d85';g.beginPath();g.arc(a.x*w,a.y*h,15,0,7);g.fill();
 g.fillStyle='white';g.fillText((i===1?'Ты · ':'')+fighterNames[a.fighter],a.x*w,a.y*h-20);});
 g.fillStyle='#fee8a1';for(const b of s.shots){g.beginPath();g.arc(b.x*w,b.y*h,4,0,7);g.fill();}
 if(s.mode==='ball'){const a=s.actors[s.carrier]||s.ball;g.fillStyle='white';g.beginPath();g.arc(a.x*w+8,a.y*h,8,0,7);g.fill();}
 document.querySelector('#guest-score').textContent=s.result || objectives[s.mode][0]+' · '+s.score[1]+' : '+s.score[0];
}
surface.onpointerdown=e=>{pointer={x:e.clientX,y:e.clientY,id:e.pointerId};surface.setPointerCapture(e.pointerId);};
surface.onpointercancel=()=>pointer=null;
surface.onpointerup=e=>{
 if(!guest || !pointer || pointer.id!==e.pointerId || latest.result)return;
 const box=surface.getBoundingClientRect(),dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer=null;
 const shot=Math.hypot(dx,dy)>10,me=latest.actors[1];
 send('matchInput',{id:guest,x:shot?me.x:(e.clientX-box.left)/box.width,y:shot?me.y:(e.clientY-box.top)/box.height,
 seq:shot?++sequence:sequence,angle:shot?Math.atan2(dy/box.height*surface.height,dx/box.width*surface.width):0});
};
document.querySelector('#guest-leave').onclick=()=>{spectator.close();guest=null;latest=null;document.querySelector('#room-leave').click();};
spectator.oncancel=e=>{e.preventDefault();document.querySelector('#guest-leave').click();};
