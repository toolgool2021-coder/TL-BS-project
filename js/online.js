import {connect} from './firebase.js';
let session=null;
const roomJoinTimeout=12000;
export async function leaveRoom(){
 const old=session;session=null;
 if(!old)return;
 old.unsubscribe?.();
 old.watchConnection?.();
 old.rejectJoin?.(Error('Подключение отменено'));
 const removal=old.sdk.remove(old.member);
 if(!old.online||!old.readyToWrite){removal.catch(()=>{});return;}
 await removal;
 await old.disconnect.cancel();
}

async function restoreMembership(room,epoch){
 const {sdk,member,disconnect}=room;
 await disconnect.remove();
 if(session!==room||!room.online||room.epoch!==epoch)return;
 room.pending={};
 await sdk.set(member,{...room.state,updatedAt:sdk.serverTimestamp()});
 if(session!==room||!room.online||room.epoch!==epoch)return;
 const pending=room.pending;
 room.readyToWrite=true;
 if(room.members)room.onPlayers(room.members);
 if(Object.keys(pending).length)await sdk.update(member,pending);
 if(session===room&&room.online&&room.epoch===epoch){
  room.resolveJoin?.();
  room.resolveJoin=null;room.rejectJoin=null;
 }
}

export async function joinRoom(code,name,onPlayers,onConnection=()=>{}){
 code=code.trim().toUpperCase();
 if(!/^[A-Z0-9]{6}$/.test(code))throw Error('Код должен содержать 6 букв или цифр');
 await leaveRoom();
 const {uid,db,sdk}=await connect();
 const members=sdk.ref(db,'rooms/'+code+'/members');
 const member=sdk.child(members,uid);
 const state={nickname:name.slice(0,24)||'Player',ready:false,x:0,y:0};
 const room={uid,sdk,member,disconnect:sdk.onDisconnect(member),code,last:0,x:0,y:0,
  state,onPlayers,online:false,readyToWrite:false,pending:{},epoch:0};
 session=room;
 const joined=new Promise((resolve,reject)=>{room.resolveJoin=resolve;room.rejectJoin=reject;});
 room.watchConnection=sdk.onValue(sdk.ref(db,'.info/connected'),snapshot=>{
  if(session!==room)return;
  const online=snapshot.val()===true;
  if(online===room.online)return;
  const epoch=++room.epoch;
  room.online=online;room.readyToWrite=false;
  if(!online){delete room.state.matchInput;onConnection(false);return;}
  restoreMembership(room,epoch).then(()=>{
   if(session===room&&room.epoch===epoch&&room.readyToWrite)onConnection(true);
  }).catch(error=>{
   if(session===room&&room.epoch===epoch){room.rejectJoin?.(error);onConnection(false);}
  });
 });
 const deadline=setTimeout(()=>room.rejectJoin?.(Error('Сервер комнаты не ответил. Попробуй подключиться снова.')),roomJoinTimeout);
 try{await joined;}
 catch(error){if(session===room)await leaveRoom().catch(()=>{});throw error;}
 finally{clearTimeout(deadline);}
 room.unsubscribe=sdk.onValue(members,s=>{
  if(session!==room)return;
  room.members=s.val()||{};
  if(room.readyToWrite)onPlayers(room.members);
 });
 return {code,uid};
}

async function writeRoomPatch(room,patch){
 if(room.state){
  for(const [key,value] of Object.entries(patch)){
   if(value===null)delete room.state[key];
   else room.state[key]=value;
  }
 }
 if(room.readyToWrite===false){Object.assign(room.pending,patch);return;}
 await room.sdk.update(room.member,patch);
}

export async function createRoom(name,onPlayers,onConnection){
 const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
 const code=Array.from(crypto.getRandomValues(new Uint8Array(6)),n=>chars[n%chars.length]).join('');
 return joinRoom(code,name,onPlayers,onConnection);
}
export async function setReady(ready){
 if(session)await writeRoomPatch(session,{ready:!!ready,updatedAt:session.sdk.serverTimestamp()});
}
export function publishPosition(x,y){
 if(!session||!Number.isFinite(x)||!Number.isFinite(y))return;
 const now=performance.now(),elapsed=now-session.last;
 x=Math.max(0,Math.min(1,x));y=Math.max(0,Math.min(1,y));
 if(elapsed<100||(elapsed<3000&&Math.hypot(x-session.x,y-session.y)<.001))return;
 Object.assign(session,{last:now,x,y});
 writeRoomPatch(session,{x,y,updatedAt:session.sdk.serverTimestamp()}).catch(()=>{});
}
export async function publishRaceScore(kills){
 if(session) await writeRoomPatch(session,{raceKills:kills,updatedAt:session.sdk.serverTimestamp()});
}

export async function writeMatchField(key,value){
 if(!session)throw Error('Сначала войди в комнату');
 if(key==='matchInput'&&value!==null&&session.readyToWrite===false)return;
 await writeRoomPatch(session,{[key]:value===null?null:JSON.stringify(value)});
}
