const objectives={
 solo:['Одиночное столкновение','Останься последним на сужающейся арене.'],
 duo:['Парное столкновение','Выживи с напарником против двух других пар.'],
 knockout:['Нокаут 3×3','Выиграй два раунда. Выбывшие возвращаются в следующем раунде.'],
 ball:['Броулбол 3×3','Подбери мяч и атакуй в сторону ворот. Побеждает команда с двумя голами.'],
 gems:['Захват кристаллов','Собери 10 кристаллов командой и удерживай их 15 секунд.'],
 zone:['Горячая зона','Удерживай центральную зону без противника до 100%.'],
 heist:['Ограбление','Разрушь вражеский сейф и защити свой.'],
 custom:['Пользовательский бой','Выбери число устранений для победы.']
};
let arena=null, realm=null;
function inPlane(actor){return !realm || actor===p || actor===realm.target;}
function combatTargets(){return [enemy,...trainingTargets].filter(t=>!t.out && inPlane(t));}
function startRealm(target){
 if(target.safe) return;
 realm={target,left:480};
 clearCombatTimers();bullets.length=0;zones.length=0;throws.length=0;
 if(arena?.carrier===p || arena?.carrier===target) {Object.assign(arena.ball,{x:arena.carrier.x,y:arena.carrier.y});arena.carrier=null;}
}
function initObjective(){
 realm=null;arena=null;delete p.out;delete enemy.out;delete p.spawnShield;delete enemy.spawnShield;
 if(!objectives[match.mode] || match.mode==='custom') return;
 const solo=match.mode==='solo', duo=match.mode==='duo';
 const teams=solo?[0,1,2,3,4,5]:duo?[0,1,0,1,2,2]:[0,1,0,1,0,1];
 const actors=[p,enemy,...Array.from({length:4},()=>({maxHp:5500}))];
 arena={actors,score:[0,0],age:0,drops:[],hold:0,leader:-1,ball:{},carrier:null,safes:[]};
 arena.walls=match.mode==='ball'?[.29,.68].flatMap(y=>[.13,.67].map(x=>({x:x*tlbsWorld.width,y:y*tlbsWorld.height,w:.2*tlbsWorld.width,h:18}))):[];
 const lineup=[current,'Shelly','Colt','Brock','Jessie','Bull'];
 actors.forEach((a,i)=>{a.team=teams[i];a.slot=i;a.fighter=lineup[i];if(i)a.maxHp=practiceHp[a.fighter];});
 resetField();
 if(match.mode==='heist') arena.safes=[0,1].map(team=>({team,safe:true,x:tlbsWorld.width/2,y:team?40:tlbsWorld.height-40,hp:32000,maxHp:32000}));
 trainingTargets=actors.filter(a=>a!==enemy && a.team!==0).concat(arena.safes.filter(a=>a.team===1));
}
function resetField(){
 resetFighterStage();
 clearAttachment();realm=null;clearCombatTimers();bullets.length=0;zones.length=0;throws.length=0;
 p.motion=null;p.isFlying=false;p.scale=1;p.shield=0;p.hiddenTicks=0;pip.active=false;
 for(const a of arena.actors){
    a.stun=0;a.spawnShield=match.mode==='gems'?90:0;
    const slot=Math.floor(a.slot/2);
    a.homeX=tlbsWorld.width*(slot+1)/4;a.homeY=a.slot%2?65:tlbsWorld.height-65;
    Object.assign(a,{x:a.homeX,y:a.homeY,hp:a.maxHp,out:false,respawn:0,gems:0,cool:45+a.slot*7});
 }
 arena.ball={x:tlbsWorld.width/2,y:tlbsWorld.height/2,vx:0,vy:0,lock:0};arena.carrier=null;
 ammo=BRAWLERS[current].maxAmmo;ultCharge=0;
}
function objectiveDeath(a){
 if(a.out || match.finished) return;
 if(a.safe){finishMatch(a.team===1);return;}
 if(realm && inPlane(a)) realm=null;
 if(a===arena.carrier){arena.ball.x=a.x;arena.ball.y=a.y;arena.carrier=null;}
 for(let i=0;i<a.gems;i++) arena.drops.push({x:a.x+Math.sin(i)*14,y:a.y+Math.cos(i)*14});
 if(a===p){resetFighterStage();match.deaths++;}
 a.out=true;a.gems=0;a.hp=0;
 a.respawn=['ball','zone','gems','heist'].includes(match.mode)?150:0;
}
function objectiveHit(a,dmg){
 if(a.out || a.spawnShield>0 || match.finished) return;
 a.hp=Math.max(0,a.hp-dmg);if(a.hp===0)objectiveDeath(a);
}
function kickBall(a,angle){
 if(!arena || arena.carrier!==a) return false;
 arena.carrier=null;Object.assign(arena.ball,{x:a.x,y:a.y,vx:8*Math.cos(angle),vy:8*Math.sin(angle),lock:15});return true;
}
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function tickObjective(){
 if(!arena || match.finished)return;
 const A=arena,mode=match.mode,c={x:tlbsWorld.width/2,y:tlbsWorld.height/2};
 A.age++;
 for(const a of A.actors) {
   if(a.spawnShield>0)a.spawnShield--;
   if(a.out){if(a.respawn && --a.respawn===0)Object.assign(a,{out:false,spawnShield:match.mode==='gems'?90:0,hp:a.maxHp,x:a.homeX,y:a.homeY});continue;}
   if(a===p || a.stun>0)continue;
   if(window.roomControlledBot?.(a)){window.stepRoomBot(a);continue;}
   const rivals=A.actors.filter(b=>!b.out && (b!==p || !p.hiddenTicks || dist(a,p)<65 || A.carrier===p) && b.team!==a.team && inPlane(b)===inPlane(a));
   rivals.push(...hostileSummons(a));
   const safe=A.safes[1-a.team];if(safe && (!realm || !inPlane(a)))rivals.push(safe);
   const priority=b=>dist(a,b)-(mode==='gems'?Math.min(5,b.gems||0)*18:0);
   rivals.sort((b,d)=>priority(b)-priority(d));const target=rivals[0];if(!target)continue;
   let goal=target,stop=110;
   if(!realm || !inPlane(a)){
     if(mode==='zone'){goal=c;stop=30;}
     if(mode==='gems'){goal=gemBotGoal(a,target,c);stop=5;}
     if(mode==='ball'){const owner=A.carrier,side=a.slot<3?-1:1;
       goal=owner===a?{x:c.x,y:a.team?tlbsWorld.height:0}:owner?.team===a.team?{x:c.x+side*tlbsWorld.width*.21,y:owner.y+(a.team?50:-50)}:A.ball;stop=12;}
     if(mode==='heist' && safe){goal=safe;stop=95;}
     if((mode==='solo'||mode==='duo') && dist(a,c)>safeRadius()-20){goal=c;stop=5;}
   }
   const d=dist(a,goal);
   if(d>stop){
     const speed=BRAWLERS[a.fighter].speed*.65,dx=(goal.x-a.x)/d*speed,dy=(goal.y-a.y)/d*speed;
     if(insideCover(a.x+dx,a.y+dy,16))moveOnPitch(a,a.x<c.x?speed:-speed,0);
     else moveOnPitch(a,dx,dy);
   }
   if(A.carrier===a && d<110)kickBall(a,Math.atan2(goal.y-a.y,goal.x-a.x));
   if(--a.cool<=0 && dist(a,target)<(a.fighter==='Bull'?155:340) && visibleTo(a,target)){
     a.cool=Math.round(BRAWLERS[a.fighter].reload*.05);
     const angle=Math.atan2(target.y-a.y,target.x-a.x);
     for(const offset of ['Bull','Shelly'].includes(a.fighter)?[-.16,0,.16]:[0]){
       spawnBullet(angle+offset,8,45,false,5,'teamShot',a);
       bullets[bullets.length-1].owner=a;
     }
   }
 }
 if(match.finished)return;
 const live=A.actors.filter(a=>!a.out),field=live.filter(a=>!realm || !inPlane(a));
 if(mode==='knockout'||mode==='solo'||mode==='duo'){
   if(mode!=='knockout' && A.age%30===0)for(const a of live)if(dist(a,c)>safeRadius())objectiveHit(a,350);
   const teams=new Set(A.actors.filter(a=>!a.out).map(a=>a.team));
   if(mode==='knockout' && teams.size<=1){const winner=teams.has(0)?0:1;if(++A.score[winner]===2)finishMatch(winner===0);else resetField();}
   if(mode!=='knockout' && (!teams.has(0)||teams.size===1))finishMatch(teams.has(0));return;
 }
 if(mode==='zone'){
   const teams=new Set(field.filter(a=>dist(a,c)<75).map(a=>a.team));
   if(teams.size===1){const [team]=teams;if(++A.score[team]>=1800)finishMatch(team===0);}
 } else if(mode==='gems'){
   if(A.age%120===1)A.drops.push({x:c.x+35*Math.sin(A.age),y:c.y});
   A.drops=A.drops.filter(g=>{const a=field.find(a=>dist(a,g)<27);if(a)a.gems++;return !a;});
   A.score=[0,1].map(team=>live.filter(a=>a.team===team).reduce((n,a)=>n+a.gems,0));
   const leader=A.score[0]===A.score[1]?-1:Number(A.score[1]>A.score[0]);
   if(leader!==A.leader || A.score[leader]<10)A.hold=0;
   A.leader=leader;if(A.score[leader]>=10 && ++A.hold>=900)finishMatch(leader===0);
 } else if(mode==='ball'){
   const b=A.ball;
   if(A.carrier){b.x=A.carrier.x;b.y=A.carrier.y;}
   else {if(insideCover(b.x+b.vx,b.y,7))b.vx*=-.65;
      if(insideCover(b.x,b.y+b.vy,7))b.vy*=-.65;
      b.x+=b.vx;b.y+=b.vy;b.vx*=.98;b.vy*=.98;if(b.lock)b.lock--;else A.carrier=field.find(a=>dist(a,b)<22);}
   if(Math.abs(b.x-c.x)<65 && (b.y<=24 || b.y>=tlbsWorld.height-24)){
      const team=Number(b.y>c.y);if(++A.score[team]===2)finishMatch(team===0);else resetField();
   }else {b.x=Math.max(10,Math.min(tlbsWorld.width-10,b.x));b.y=Math.max(10,Math.min(tlbsWorld.height-10,b.y));}
 }
}
function safeRadius(){return Math.max(52,Math.hypot(tlbsWorld.width,tlbsWorld.height)/2-arena.age*.10);}
function drawObjective(){
 if(!arena || realm)return;
 const A=arena,cx=tlbsWorld.width/2,cy=tlbsWorld.height/2;
 ctx.save();ctx.font='bold 14px sans-serif';ctx.textAlign='center';
 for(const a of A.actors.filter(a=>a.team===0 && a!==p && !a.out)){
   ctx.fillStyle='#4fcbed';ctx.beginPath();ctx.arc(a.x,a.y,20,0,7);ctx.fill();
 }
 let score=A.score.join(' : ');
 if(match.mode==='ball'){
 }else if(match.mode==='zone'||match.mode==='solo'||match.mode==='duo'){
    ctx.strokeStyle='#f0eb94';ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,match.mode==='zone'?75:safeRadius(),0,7);ctx.stroke();
    score=match.mode==='zone'?A.score.map(n=>Math.floor(n/18)+'%').join(' : '):'В живых: '+A.actors.filter(a=>!a.out).length;
 }else if(match.mode==='gems'){
    drawGemMine();ctx.restore();return;
 }else if(match.mode==='heist'){
    for(const s of A.safes){ctx.fillStyle=s.team?'#e6757e':'#76cff1';ctx.fillRect(s.x-20,s.y-15,40,30);}
    score=A.safes.map(s=>Math.ceil(100*s.hp/s.maxHp)+'%').join(' : ');
 }
 ctx.fillStyle='white';ctx.fillText(objectives[match.mode][0]+' · '+score,cx,95);ctx.restore();
}
