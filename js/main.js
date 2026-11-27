import {nickname,saveNickname,loadProfile} from './profile.js';
const input=document.querySelector('#nickname'), status=document.querySelector('#profile-status'), dialog=document.querySelector('#profile-dialog');
window.playerNickname=nickname();
document.querySelector('#profile-open').onclick=()=>{input.value=window.playerNickname;dialog.showModal()};
document.querySelector('#profile-close').onclick=()=>dialog.close();
document.querySelector('#profile-save').onclick=async()=>{
 const name=input.value.trim().slice(0,24);
 if(!name){status.textContent='Введите ник';return}
 window.playerNickname=name;
 try{localStorage.setItem('tlbs.nickname',name)}catch{}
 status.textContent='Локально сохранено. Синхронизация...';
 try{const uid=await saveNickname(name);status.textContent='Сохранено • UID: '+uid}catch(e){status.textContent='Ник сохранён локально. Firebase недоступен.'}
};
document.querySelector('#profile-sync').onclick=async()=>{
 status.textContent='Подключение...';
 try{const p=await loadProfile();if(p.nickname){window.playerNickname=p.nickname;input.value=p.nickname;localStorage.setItem('tlbs.nickname',p.nickname)}status.textContent='UID: '+p.uid}catch(e){status.textContent='Не удалось подключиться к Firebase'}
};

import {createRoom,joinRoom,leaveRoom,setReady,publishPosition} from './online.js';
const room=document.querySelector('#room-dialog'), code=document.querySelector('#room-code'), roomStatus=document.querySelector('#room-status'), members=document.querySelector('#room-members');
let roomSession=null, ready=false, players={};
window.remotePlayers={};
function showMembers(data){players=data;members.replaceChildren();for(const [uid,p] of Object.entries(data)){const line=document.createElement('p');line.textContent=p.nickname+(p.ready?' ✓':' · ожидание');members.append(line)}window.remotePlayers=Object.fromEntries(Object.entries(data).filter(([uid])=>uid!==roomSession?.uid))}
async function enter(create){roomStatus.textContent='Подключение...';try{roomSession=await (create?createRoom(window.playerNickname,showMembers):joinRoom(code.value,window.playerNickname,showMembers));code.value=roomSession.code;ready=false;showMembers(players);roomStatus.textContent='Комната: '+roomSession.code}catch(e){roomStatus.textContent=e.message}}
document.querySelector('#room-open').onclick=()=>room.showModal();
document.querySelector('#room-create').onclick=()=>enter(true);
document.querySelector('#room-join').onclick=()=>enter(false);
document.querySelector('#room-ready').onclick=async()=>{if(!roomSession)return;try{await setReady(!ready);ready=!ready}catch(e){roomStatus.textContent=e.message}};
document.querySelector('#room-preview').onclick=()=>{if(!roomSession)return;room.close();window.roomPreview=true;changeScreen('game')};
async function closeRoom(){window.roomPreview=false;window.remotePlayers={};roomSession=null;try{await leaveRoom()}catch(e){roomStatus.textContent=e.message}}
document.querySelector('#room-leave').onclick=()=>{closeRoom();room.close()};
room.addEventListener('cancel',()=>closeRoom());
window.sendRoomPosition=(x,y)=>{if(window.roomPreview)publishPosition(x,y)};
window.endRoomPreview=()=>{if(window.roomPreview){window.roomPreview=false;room.showModal()}};
