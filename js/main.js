import {hostGame,updateSharedGame} from './room-match.js?v=20261128-release3';
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

import {createRoom,joinRoom,leaveRoom,setReady,publishPosition,publishRaceScore} from './online.js?v=20261128-release3';
const room=document.querySelector('#room-dialog'), code=document.querySelector('#room-code'), roomStatus=document.querySelector('#room-status'), members=document.querySelector('#room-members');
let roomSession=null, ready=false, players={};
window.remotePlayers={};
const leaders=document.querySelector('#race-leaders');
function drawLeaders(data) {
 leaders.hidden=!window.roomRace;
 leaders.replaceChildren();
 if(leaders.hidden) return;
 for(const player of Object.values(data).filter(p=>Number.isInteger(p.raceKills)).sort((a,b)=>b.raceKills-a.raceKills || a.nickname.localeCompare(b.nickname)).slice(0,3)) {
    const row=document.createElement('li');
    row.textContent=player.nickname+' · '+Math.min(40,1+Math.floor(player.raceKills/2))+'/40 · '+player.raceKills+'/80';
    leaders.append(row);
 }
}
window.publishRaceScore=kills=>publishRaceScore(kills).catch(()=>{roomStatus.textContent='Не удалось обновить топ комнаты'});
document.querySelector('#room-race').onclick=async()=>{
 if(!roomSession) {roomStatus.textContent='Сначала создай комнату или войди по коду';return;}
 try { await publishRaceScore(0); } catch {roomStatus.textContent='Запись результата недоступна. Проверь правила Firebase для raceKills.';return;}
 window.roomRace=true;window.roomPreview=true;room.close();drawLeaders(players);changeScreen('game');
};
document.querySelector('#shared-play').onclick=async()=>{
 try{if(!roomSession)throw Error('Сначала войди в комнату');await hostGame(document.querySelector('#shared-mode').value,roomSession.uid,players);}
 catch(e){roomStatus.textContent=e.message;}
};
function showMembers(data){updateSharedGame(data,roomSession?.uid);drawLeaders(data);players=data;members.replaceChildren();for(const [uid,p] of Object.entries(data)){const line=document.createElement('p');line.textContent=p.nickname+(p.ready?' ✓':' · ожидание');members.append(line)}window.remotePlayers=Object.fromEntries(Object.entries(data).filter(([uid])=>uid!==roomSession?.uid))}
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
window.endRoomPreview=()=>{if(window.roomPreview){window.roomPreview=false;window.roomRace=false;leaders.hidden=true;
 publishRaceScore(null).catch(()=>{});room.showModal()}};

const settingsDialog=document.getElementById('settings-dialog');
document.getElementById('settings-open').onclick=()=>settingsDialog.showModal();
document.getElementById('settings-close').onclick=()=>settingsDialog.close();
for(const [id,key,cb] of [
 ['graphics-quality','tlbs.graphics.quality',v=>window.tlbsGraphicsQuality=v],
 ['control-opacity','tlbs.controls.opacity',v=>window.tlbsControlOpacity=v/100],
 ['control-scale','tlbs.controls.scale',v=>window.tlbsControlScale=v],
 ['control-sensitivity','tlbs.controls.sensitivity',v=>window.tlbsSensitivity=v],
 ['music-volume','tlbs.audio.music',v=>{sounds.menuMusic.volume=v/100;sounds.battleMusic.volume=v/100}],
 ['effects-volume','tlbs.audio.effects',v=>{for(const k of ['click','shoot','ult','hit'])sounds[k].volume=v/100}]
]){const el=document.getElementById(id);try{const saved=localStorage.getItem(key);if(saved!==null)el.value=saved}catch{}cb(Number(el.value));el.oninput=()=>{cb(Number(el.value));try{localStorage.setItem(key,el.value)}catch{}};}

const showFps=document.getElementById('show-fps');
try{showFps.checked=localStorage.getItem('tlbs.graphics.fps')==='1';}catch{}
function applyFps(){
 document.getElementById('battle-fps').hidden=!showFps.checked;
 try{localStorage.setItem('tlbs.graphics.fps',showFps.checked?'1':'0');}catch{}
}
showFps.onchange=applyFps;
applyFps();

const botDifficultyControl=document.getElementById('bot-difficulty');
try{
 const saved=localStorage.getItem('tlbs.bots.difficulty');
 if(Object.hasOwn(botDifficulties,saved))botDifficultyControl.value=saved;
}catch{}
botDifficultyControl.onchange=()=>{
 try{localStorage.setItem('tlbs.bots.difficulty',botDifficultyControl.value);}catch{}
};
