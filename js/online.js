import {connect} from './firebase.js';
let session=null;
export async function leaveRoom(){
 const old=session;session=null;
 if(!old)return;
 old.unsubscribe?.();
 await old.sdk.remove(old.member);
 await old.disconnect.cancel();
}
export async function joinRoom(code,name,onPlayers){
 code=code.trim().toUpperCase();
 if(!/^[A-Z0-9]{6}$/.test(code))throw Error('Код должен содержать 6 букв или цифр');
 await leaveRoom();
 const {uid,db,sdk}=await connect();
 const members=sdk.ref(db,'rooms/'+code+'/members');
 const member=sdk.child(members,uid);
 const disconnect=sdk.onDisconnect(member);
 await disconnect.remove();
 try{await sdk.set(member,{nickname:name.slice(0,24)||'Player',ready:false,x:0,y:0,updatedAt:sdk.serverTimestamp()});}
 catch(e){await disconnect.cancel();throw e}
 session={uid,sdk,member,disconnect,code,last:0};
 session.unsubscribe=sdk.onValue(members,s=>onPlayers(s.val()||{}));
 return {code,uid};
}
export async function createRoom(name,onPlayers){
 const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
 const code=Array.from(crypto.getRandomValues(new Uint8Array(6)),n=>chars[n%chars.length]).join('');
 return joinRoom(code,name,onPlayers);
}
export async function setReady(ready){
 if(session)await session.sdk.update(session.member,{ready:!!ready,updatedAt:session.sdk.serverTimestamp()});
}
export function publishPosition(x,y){
 if(!session||!Number.isFinite(x)||!Number.isFinite(y))return;
 const now=performance.now();if(now-session.last<100)return;session.last=now;
 session.sdk.update(session.member,{x:Math.max(0,Math.min(1,x)),y:Math.max(0,Math.min(1,y)),updatedAt:session.sdk.serverTimestamp()}).catch(()=>{});
}
export async function publishRaceScore(kills){
 if(session) await session.sdk.update(session.member,{raceKills:kills,updatedAt:session.sdk.serverTimestamp()});
}

export async function writeMatchField(key,value){
 if(!session)throw Error('Сначала войди в комнату');
 await session.sdk.update(session.member,{[key]:value===null?null:JSON.stringify(value)});
}
