import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';

const read = file => readFileSync(new URL('../js/' + file, import.meta.url), 'utf8')
  .replace(/^import .*;$/gm, '').replace(/^export /gm, '');
const scope = {assert, window:{}, performance:{now:()=>0}};
await runInNewContext(read('online.js') + `
(async()=>{
  let time=0;
  const writes=[];
  performance.now=()=>time;
  session={last:0,x:0,y:0,member:{},sdk:{update:async(_,data)=>writes.push(data),serverTimestamp:()=>time}};
  time=110;publishPosition(.2,.3);
  time=230;publishPosition(.2,.3);
  time=250;publishPosition(.4,.5);
  time=260;publishPosition(.6,.7);
  time=3400;publishPosition(.4,.5);
  assert.equal(writes.length,3);
  assert.equal(writes[1].x,.4);
  assert.equal(writes[2].updatedAt,3400);
})();
`,scope);

const deadlines=new Map();let joinTimer=0;
await runInNewContext(read('online.js') + `
(async()=>{
 const listeners={};
 const writes=[];
 let registrations=0;
 const sdk={
  ref:(_,path)=>path,child:(path,id)=>path+'/'+id,
  onDisconnect:()=>({remove:async()=>{registrations++;},cancel:async()=>{}}),
  onValue:(ref,cb)=>{listeners[ref]=cb;return ()=>{delete listeners[ref];};},
  set:async(_,data)=>writes.push(['set',data]),
  update:async(_,data)=>writes.push(['update',data]),
  remove:async()=>{},serverTimestamp:()=>123
 };
 globalThis.connect=async()=>({sdk,uid:'player',db:{}});
 const states=[];
 const joining=joinRoom('ABC123','Player',()=>{},state=>states.push(state));
 for(let i=0;i<8;i++)await Promise.resolve();
 const connection=connected=>listeners['.info/connected']({val:()=>connected});
 connection(true);
 await joining;
 await setReady(true);
 await writeMatchField('matchState',{frame:3});
 await writeMatchField('matchInput',{seq:6});
 connection(false);
 const before=writes.length;
 await writeMatchField('matchInput',{seq:7});
 await writeMatchField('matchState',{frame:4});
 assert.equal(writes.length,before);
 connection(true);
 for(let i=0;i<12;i++)await Promise.resolve();
 const restored=writes.at(-1)[1];
 assert.equal(restored.ready,true);
 assert.equal(JSON.parse(restored.matchState).frame,4);
 assert.equal(restored.matchInput,undefined);
 assert.equal(registrations,2);
 assert.deepEqual(states,[true,false,true]);
 await leaveRoom();
 assert.equal(Object.keys(listeners).length,0);
 const stalled=joinRoom('ABC123','Player',()=>{});
 const rejection=assert.rejects(stalled,/Сервер комнаты не ответил/);
 for(let i=0;i<8;i++)await Promise.resolve();
 assert.equal(deadlines.size,1);
 for(const run of deadlines.values())run();
 await rejection;
 assert.equal(deadlines.size,0);
 assert.equal(Object.keys(listeners).length,0);
})();
`,{assert,performance:{now:()=>0},deadlines,setTimeout:fn=>{deadlines.set(++joinTimer,fn);return joinTimer;},clearTimeout:id=>deadlines.delete(id)});

const modal={open:false,showModal(){this.open=true;},close(){this.open=false;}};
const elements={'#guest-game':modal,'#guest-canvas':{},'#room-dialog':{...modal},'#guest-leave':{}};
const timers=new Map();let timerId=0;
const context={
  setTimeout:callback=>{timers.set(++timerId,callback);return timerId;},clearTimeout:id=>timers.delete(id),timers,
  assert, document:{querySelector:id=>elements[id]},
  window:{}, performance:{now:()=>100},
  requestAnimationFrame:()=>1,cancelAnimationFrame:()=>{},
  BRAWLERS:{Shelly:{speed:4}}, tlbsWorld:{width:2400,height:1800},
  arena:{age:100}, bullets:[], moveOnPitch(){}, kickBall:()=>false,
  spawnBullet(){context.bullets.push({});}, writeMatchField:async()=>{}
};
runInNewContext(read('room-match.js') + `
const snapshot=frame=>JSON.stringify({id:'m',opponent:'guest',mode:'ball',aspect:1.33,frame,
 actors:Array.from({length:6},()=>({x:.5,y:.5,fighter:'Shelly'})),shots:[],walls:[],score:[0,0],ball:{x:0,y:0}});
updateSharedGame({host:{matchState:snapshot(2)}},'guest');
updateSharedGame({host:{matchState:snapshot(1)}},'guest');
assert.equal(latest.frame,2);
updateSharedGame({host:{matchState:snapshot(3)}},'guest');
assert.equal(previous.frame,2);
assert.equal(latest.frame,3);
updateSharedGame({},'guest');
assert.equal(latest.frame,3);
updateSharedGame({host:{matchState:snapshot(4)}},'guest');
assert.equal(latest.frame,4);
assert.equal(timers.size,0);
updateSharedGame({},'guest');
for(const [id,callback] of timers){timers.delete(id);callback();}
assert.equal(latest,null);
host={id:'m',opponent:'guest'};
const bot={fighter:'Shelly',x:0,y:0};
const packet=(seq,angle)=>({guest:{matchInput:JSON.stringify({id:'m',x:.5,y:.5,seq,angle})}});
updateSharedGame(packet(1,.5),'host');
updateSharedGame(packet(1,null),'host');
window.stepRoomBot(bot);
assert.equal(bullets.length,3);
arena.age+=40;
updateSharedGame(packet(1,.5),'host');
window.stepRoomBot(bot);
assert.equal(bullets.length,3);
updateSharedGame(packet(2,.7),'host');
window.stepRoomBot(bot);
assert.equal(bullets.length,6);
`,context);
console.log('PASS: position throttling, snapshot ordering, and guest shot deduplication and room reconnection with mocked transport');
