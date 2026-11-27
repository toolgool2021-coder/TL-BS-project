let touchControls=window.matchMedia('(pointer: coarse)').matches;
    window.addEventListener('touchstart', e => {
        if (!gameActive || e.target !== canvas) return;
        touchControls=true;
        for(let t of e.changedTouches) {
            let tx = t.clientX, ty = t.clientY;
            
            if(tx < canvas.width/2 && !joyL.active) { joyL.id=t.identifier; joyL.active=true; joyL.cx=tx; joyL.cy=ty; }
            else if(isUltReady && Math.hypot(tx - joyU.x, ty - joyU.y) < 60) { joyU.id=t.identifier; joyU.active=true; joyU.cx=tx; joyU.cy=ty; }
            else if(tx >= canvas.width/2 && !joyR.active) { joyR.id=t.identifier; joyR.active=true; joyR.cx=tx; joyR.cy=ty; }
        }
    });

    window.addEventListener('touchmove', e => {
        for(let t of e.touches) {
            if(t.identifier===joyL.id){ joyL.cx=t.clientX; joyL.cy=t.clientY; }
            if(t.identifier===joyR.id){ joyR.cx=t.clientX; joyR.cy=t.clientY; }
            if(t.identifier===joyU.id){ joyU.cx=t.clientX; joyU.cy=t.clientY; }
        }
    });

    window.addEventListener('touchend', e => {
        for(let t of e.changedTouches) {
            if(t.identifier===joyL.id) { joyL.active=false; joyL.id=null; }
            if(t.identifier===joyR.id) { let dx=joyR.cx-joyR.x, dy=joyR.cy-joyR.y; if(Math.hypot(dx,dy)>10) attack(Math.atan2(dy,dx), false); joyR.active=false; joyR.id=null; }
            if(t.identifier===joyU.id) { let dx=joyU.cx-joyU.x, dy=joyU.cy-joyU.y; attack(Math.atan2(dy,dx), true); joyU.active=false; joyU.id=null; }
        }
    });


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
    if(p.out || !d || joyL.active) return;
    if(pip.active) pip.angle=Math.atan2(y,x);
    else if(!p.isFlying){p.x+=x/d*BRAWLERS[current].speed*p.speedMult;p.y+=y/d*BRAWLERS[current].speed*p.speedMult;}
}
