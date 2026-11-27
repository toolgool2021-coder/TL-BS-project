    window.addEventListener('touchstart', e => {
        if (!gameActive || e.target !== canvas) return;
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
            if(t.identifier===joyL.id) joyL.active=false;
            if(t.identifier===joyR.id) { let dx=joyR.cx-joyR.x, dy=joyR.cy-joyR.y; if(Math.hypot(dx,dy)>10) attack(Math.atan2(dy,dx), false); joyR.active=false; }
            if(t.identifier===joyU.id) { let dx=joyU.cx-joyU.x, dy=joyU.cy-joyU.y; attack(Math.atan2(dy,dx), true); joyU.active=false; }
        }
    });


const pressedKeys = new Set();
let aimPoint = null;
let bindings = {up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD',super:'Space'};
try { Object.assign(bindings, JSON.parse(localStorage.getItem('tlbs.keys') || '{}')); } catch {}
function resetControls() {
    pressedKeys.clear(); aimPoint = null;
    for(const j of [joyL,joyR,joyU]) { j.active=false; j.id=null; }
}
window.addEventListener('blur', resetControls);
window.addEventListener('touchcancel', resetControls);
window.addEventListener('keydown', e => {
    if(!gameActive || !Object.values(bindings).includes(e.code)) return;
    e.preventDefault(); pressedKeys.add(e.code);
    if(e.code===bindings.super && !e.repeat && aimPoint) attack(Math.atan2(aimPoint.y-p.y,aimPoint.x-p.x),true);
});
window.addEventListener('keyup', e => pressedKeys.delete(e.code));
canvas.addEventListener('mousemove', e => {
    const rect=canvas.getBoundingClientRect();
    aimPoint={x:(e.clientX-rect.left)*canvas.width/rect.width,y:(e.clientY-rect.top)*canvas.height/rect.height};
});
canvas.addEventListener('mousedown', e => {
    if(!gameActive || e.button!==0) return;
    const rect=canvas.getBoundingClientRect();
    const x=(e.clientX-rect.left)*canvas.width/rect.width,y=(e.clientY-rect.top)*canvas.height/rect.height;
    attack(Math.atan2(y-p.y,x-p.x),false);
});
function keyboardMovement(){
    const x=Number(pressedKeys.has(bindings.right))-Number(pressedKeys.has(bindings.left));
    const y=Number(pressedKeys.has(bindings.down))-Number(pressedKeys.has(bindings.up));
    const d=Math.hypot(x,y);
    if(!d || joyL.active) return;
    if(pip.active) pip.angle=Math.atan2(y,x);
    else if(!p.isFlying){p.x+=x/d*BRAWLERS[current].speed*p.speedMult;p.y+=y/d*BRAWLERS[current].speed*p.speedMult;}
}
