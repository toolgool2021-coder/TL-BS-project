    window.addEventListener('touchstart', e => {
        for(let t of e.changedTouches) {
            let tx = t.clientX, ty = t.clientY;
            if(tx > canvas.width - 100 && ty < canvas.height * 0.6) return;
            if(tx < canvas.width/2) { joyL.id=t.identifier; joyL.active=true; joyL.cx=tx; joyL.cy=ty; }
            else if(isUltReady && Math.hypot(tx - joyU.x, ty - joyU.y) < 60) { joyU.id=t.identifier; joyU.active=true; joyU.cx=tx; joyU.cy=ty; }
            else { joyR.id=t.identifier; joyR.active=true; joyR.cx=tx; joyR.cy=ty; }
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

