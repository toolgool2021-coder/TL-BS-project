import {connect} from './firebase.js';
const key='tlbs.nickname';
export function nickname(){try{return localStorage.getItem(key)||'Player'}catch{return 'Player'}}
export async function saveNickname(value){
 const name=value.trim().slice(0,24);
 if(!name) throw Error('Введите ник');
 localStorage.setItem(key,name);
 const {uid,db,sdk}=await connect();
 await sdk.update(sdk.ref(db,'profiles/'+uid),{nickname:name,updatedAt:sdk.serverTimestamp()});
 return uid;
}
export async function loadProfile(){
 const {uid,db,sdk}=await connect();
 const snap=await sdk.get(sdk.ref(db,'profiles/'+uid));
 return {uid,...(snap.val()||{})};
}
