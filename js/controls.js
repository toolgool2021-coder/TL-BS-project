let touchControls=matchMedia('(any-pointer: coarse)').matches;
function superHome(){return {x:canvas.width-55,y:Math.max(95,canvas.height*.48)}}
function touchPoint(t){const r=canvas.getBoundingClientRect();return {x:(t.clientX-r.left)*canvas.width/r.width,y:(t.clientY-r.top)*canvas.height/r.height}}
canvas.addEventListener('touchstart',e=>{
 if(!gameActive)return;e.preventDefault();touchControls=true;
 for(const t of e.changedTouches){const {x,y}=touchPoint(t),h=superHome();
 const j=isUltReady&&!joyU.active&&Math.hypot(x-h.x,y-h.y)<42?joyU:x<canvas.width/2?joyL:joyR;
 if(j.active)continue;Object.assign(j,{active:true,id:t.identifier,x,y,cx:x,cy:y});}
},{passive:false});
canvas.addEventListener('touchmove',e=>{if(!gameActive)return;e.preventDefault();for(const t of e.changedTouches){const q=touchPoint(t);for(const j of [joyL,joyR,joyU])if(j.active&&j.id===t.identifier){j.cx=q.x;j.cy=q.y;}}},{passive:false});
canvas.addEventListener('touchend',e=>{e.preventDefault();for(const t of e.changedTouches){const q=touchPoint(t);for(const j of [joyL,joyR,joyU])if(j.active&&j.id===t.identifier){const dx=q.x-j.x,dy=q.y-j.y;j.active=false;j.id=null;if(gameActive&&j!==joyL&&Math.hypot(dx,dy)>10)attack(Math.atan2(dy,dx),j===joyU);}}},{passive:false});
const pressedKeys = new Set();
let aimPoint = null;
let drag = null;
let bindings = {up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD',super:'Space'};
try { Object.assign(bindings, JSON.parse(localStorage.getItem('tlbs.keys') || '{}')); } catch {}
function resetControls() {
    document.getElementById('pin-menu').style.display='none';
    pressedKeys.clear(); aimPoint = null; drag = null;
    for(const j of [joyL,joyR,joyU]) { j.active=false; j.id=null; }
}
window.addEventListener('blur', resetControls);
window.addEventListener('touchcancel', resetControls);
window.addEventListener('keydown', e => {
    if(!gameActive) return;
    if(e.code==='Escape') { exitToMenu();return; }
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
    aimPoint = Math.hypot(dx,dy) > 10 ? {x:dx, y:dy} : null;
}
canvas.addEventListener('pointermove', updateDrag);
canvas.addEventListener('pointerup', e => {
    if (!drag || drag.id !== e.pointerId) return;
    updateDrag(e);
    if (gameActive && aimPoint) attack(Math.atan2(aimPoint.y, aimPoint.x), pressedKeys.has(bindings.super));
    drag = null;
    aimPoint = null;
});
canvas.addEventListener('lostpointercapture', e => {
    if (drag?.id === e.pointerId) { drag = null; aimPoint = null; }
});
function keyboardMovement(){
    const x=Number(pressedKeys.has(bindings.right))-Number(pressedKeys.has(bindings.left));
    const y=Number(pressedKeys.has(bindings.down))-Number(pressedKeys.has(bindings.up));
    const d=Math.hypot(x,y);
    if(p.attachment || p.out || !d || joyL.active) return;
    if(pip.active) pip.angle=Math.atan2(y,x);
    else if(!p.isFlying){p.x+=x/d*BRAWLERS[current].speed*p.speedMult;p.y+=y/d*BRAWLERS[current].speed*p.speedMult;}
}

const fsButton=document.getElementById('fullscreen-toggle');
fsButton.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else throw Error();}catch{alert('Полноэкранный режим недоступен в этом браузере. Откройте игру в обычном браузере.');}});
document.addEventListener('fullscreenchange',()=>{fsButton.textContent=document.fullscreenElement?'⛶ Выйти':'⛶';fsButton.setAttribute('aria-pressed',String(!!document.fullscreenElement));});
function fitGame(){if(!gameActive)return;const w=canvas.clientWidth,h=canvas.clientHeight;if(w>0&&h>0&&(canvas.width!==w||canvas.height!==h)){resetControls();canvas.width=w;canvas.height=h;p.x=Math.max(22,Math.min(w-22,p.x));p.y=Math.max(22,Math.min(h-22,p.y));}}
window.addEventListener('resize',fitGame);document.addEventListener('fullscreenchange',fitGame);
