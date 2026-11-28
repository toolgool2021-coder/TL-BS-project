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

const modal={open:false,showModal(){this.open=true;},close(){this.open=false;}};
const elements={'#guest-game':modal,'#guest-canvas':{},'#room-dialog':{...modal},'#guest-leave':{}};
const context={
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
console.log('PASS: position throttling, snapshot ordering, and guest shot deduplication with mocked transport');
