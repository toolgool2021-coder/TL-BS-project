let touchControls=matchMedia('(any-pointer: coarse)').matches;
function superHome(){return {x:canvas.width-55,y:Math.max(95,canvas.height*.48)}}
const savedControlScale=Number(localStorage.getItem('tlbs.controls.scale'));
window.tlbsControlScale=Number.isFinite(savedControlScale)&&savedControlScale>0?savedControlScale:1;
window.tlbsSensitivity=Number(localStorage.getItem('tlbs.controls.sensitivity'))||1;
function touchPoint(t){const r=canvas.getBoundingClientRect();return {x:(t.clientX-r.left)*canvas.width/r.width,y:(t.clientY-r.top)*canvas.height/r.height}}
canvas.addEventListener('touchstart',e=>{
 if(!gameActive)return;e.preventDefault();touchControls=true;
 for(const t of e.changedTouches){const {x,y}=touchPoint(t),h=superHome();
 const j=isUltReady&&!joyU.active&&Math.hypot(x-h.x,y-h.y)<42*window.tlbsControlScale?joyU:x<canvas.width/2?joyL:joyR;
 if(j.active)continue;Object.assign(j,{active:true,id:t.identifier,x,y,cx:x,cy:y});}
},{passive:false});
canvas.addEventListener('touchmove',e=>{if(!gameActive)return;e.preventDefault();for(const t of e.changedTouches){const q=touchPoint(t);for(const j of [joyL,joyR,joyU])if(j.active&&j.id===t.identifier){j.cx=q.x;j.cy=q.y;}}},{passive:false});
canvas.addEventListener('touchcancel',e=>{for(const t of e.changedTouches)for(const j of [joyL,joyR,joyU])if(j.id===t.identifier){j.active=false;j.id=null;}},{passive:false});
canvas.addEventListener('touchend',e=>{e.preventDefault();for(const t of e.changedTouches){const q=touchPoint(t);for(const j of [joyL,joyR,joyU])if(j.active&&j.id===t.identifier){const dx=q.x-j.x,dy=q.y-j.y;j.cx=q.x;j.cy=q.y;const variableThrow=['Dynamike','Barley'].includes(current)||(current==='Tick'&&j===joyR);try{if(gameActive&&j!==joyL&&(variableThrow||Math.hypot(dx,dy)>10))attack(Math.atan2(dy,dx),j===joyU,Math.hypot(dx,dy)*window.tlbsSensitivity);}finally{j.active=false;j.id=null;}}}},{passive:false});
const pressedKeys = new Set();
let aimPoint = null;
let drag = null;
let bindings = {up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD',super:'Space'};
try { Object.assign(bindings, JSON.parse(localStorage.getItem('tlbs.keys') || '{}')); } catch {}
function resetControls() {
    document.getElementById('pin-menu').style.display='none';
    pressedKeys.clear(); aimPoint = null; drag = null;tlbsGadgetAim=null;
    for(const j of [joyL,joyR,joyU]) { j.active=false; j.id=null; }
}
window.addEventListener('blur', resetControls);
window.addEventListener('touchcancel', resetControls);
window.addEventListener('keydown', e => {
    if(!gameActive) return;
    if(e.code==='KeyG'){e.preventDefault();if(!e.repeat)tlbsUseGadget();return;}
    if(e.code==='Escape') {
        if(drag||joyR.active||joyU.active||tlbsGadgetAim!==null)resetControls();
        else exitToMenu();
        return;
    }
    if(e.code==='KeyE') { e.preventDefault();if(!e.repeat) togglePinMenu();return; }
    const digit=/^(?:Digit|Numpad)([1-5])$/.exec(e.code);
    if(digit && document.getElementById('pin-menu').style.display==='flex') {
        e.preventDefault();
        if(!e.repeat) document.querySelectorAll('.pin-option')[Number(digit[1])-1]?.click();
        return;
    }
    if(!Object.values(bindings).includes(e.code)) return;
    e.preventDefault(); pressedKeys.add(e.code);

});
window.addEventListener('keyup', e => pressedKeys.delete(e.code));
canvas.addEventListener('pointerdown', e => {
    if (!gameActive || e.pointerType !== 'mouse' || e.button !== 0 || drag) return;
    touchControls=false;
    drag = {id:e.pointerId, x:e.clientX, y:e.clientY};
    canvas.setPointerCapture(e.pointerId);
});
function updateDrag(e) {
    if (!drag || drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    const variableThrow=['Dynamike','Barley'].includes(current)||(current==='Tick'&&!pressedKeys.has(bindings.super));
    aimPoint = variableThrow || Math.hypot(dx,dy)>10 ? {x:dx,y:dy} : null;
}
canvas.addEventListener('pointermove', updateDrag);
canvas.addEventListener('pointerup', e => {
    if (!drag || drag.id !== e.pointerId) return;
    updateDrag(e);
    if (gameActive && aimPoint) attack(Math.atan2(aimPoint.y, aimPoint.x), pressedKeys.has(bindings.super),Math.hypot(aimPoint.x,aimPoint.y)*window.tlbsSensitivity);
    else if(gameActive && ['Dynamike','Barley','Tick'].includes(current)){aimPoint={x:0,y:0};attack(0,pressedKeys.has(bindings.super),0);}
    drag = null;
    aimPoint = null;
});
canvas.addEventListener('lostpointercapture', e => {
    if (drag?.id === e.pointerId) { drag = null; aimPoint = null; }
});
function playerMoveSpeed(){
    const cloakBonus=current==='Leon'&&p.passiveChoice==='0'&&p.hiddenTicks>0?1.25:1;
    return BRAWLERS[current].speed*p.speedMult*cloakBonus*(p.slow>0?.5:1);
}
function keyboardMovement(){
    const x=Number(pressedKeys.has(bindings.right))-Number(pressedKeys.has(bindings.left));
    const y=Number(pressedKeys.has(bindings.down))-Number(pressedKeys.has(bindings.up));
    const d=Math.hypot(x,y);
    if(p.attachment || p.stun>0 || p.out || !d || joyL.active) return;
    if(pip.active) pip.angle=Math.atan2(y,x);
    else if(!p.isFlying){const speed=playerMoveSpeed();p.x+=x/d*speed;p.y+=y/d*speed;}
}

const fsButton=document.getElementById('fullscreen-toggle');
fsButton.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else throw Error();}catch{alert('Полноэкранный режим недоступен в этом браузере. Откройте игру в обычном браузере.');}});
document.addEventListener('fullscreenchange',()=>{fsButton.textContent=document.fullscreenElement?'⛶ Выйти':'⛶';fsButton.setAttribute('aria-pressed',String(!!document.fullscreenElement));});
function fitGame(){if(!gameActive)return;const w=canvas.clientWidth,h=canvas.clientHeight;if(w>0&&h>0&&(canvas.width!==w||canvas.height!==h)){resetControls();canvas.width=w;canvas.height=h;p.x=Math.max(22,Math.min(tlbsWorld.width-22,p.x));p.y=Math.max(22,Math.min(tlbsWorld.height-22,p.y));tlbsFollowCamera(true);}}
window.addEventListener('resize',fitGame);document.addEventListener('fullscreenchange',fitGame);
