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
