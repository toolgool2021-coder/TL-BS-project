    let enemyAI = false;
    let activePin = { type: '', timer: 0, scale: 0 };
    let enemyPin = { type: '', timer: 0, scale: 0 };
    let current = 'Shelly', ultCharge = 0, isUltReady = false, gameActive = false;
    let ammo = 3, p = { x: 0, y: 0, scale: 1, isFlying: false, speedMult: 1, boostTimer: 0, shield: 0 }; 
    let pip = { active: false, x: 0, y: 0, angle: 0, life: 0 };
    let enemy = { x: 200, y: 150, hp: 30000, maxHp: 30000 };
    let bullets = [], zones = [], throws = [], trainingTargets = [];
    const mortisRange = 130;
    let joyL = { active: false, x: 100, y: 0, cx: 100, cy: 0, id: null };
    let joyR = { active: false, x: 0, y: 0, cx: 0, cy: 0, id: null };
    let joyU = { active: false, x: 0, y: 0, cx: 0, cy: 0, id: null }; 

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    function toggleAI() {
        enemyAI = !enemyAI;
        const btn = document.getElementById('ai-toggle');
        if(btn) {
            btn.innerText = enemyAI ? "БОТ: ВКЛ" : "БОТ: ВЫКЛ";
            btn.style.background = enemyAI ? "#00ff00" : "#ff4444";
        }
        sounds.click.play();
    }

    function togglePinMenu() { 
        const m = document.getElementById('pin-menu');
        if(m) m.style.display = (m.style.display === 'flex') ? 'none' : 'flex'; 
    }

    function sendPin(emoji) { 
        activePin.type = emoji; activePin.timer = 150; activePin.scale = 0; 
        togglePinMenu();
        sounds.click.play();
    }

    function drawPin(x, y, pin) {
        if (pin.timer <= 0) return;
        ctx.save(); 
        ctx.translate(x, y - 75 + Math.sin(pin.timer * 0.1) * 5); 
        ctx.scale(pin.scale, pin.scale);
        ctx.fillStyle = "white"; ctx.strokeStyle = "black"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, 26, 0, 7); ctx.fill(); ctx.stroke();
        ctx.font = "28px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(pin.type, 0, 2); ctx.restore();
    }

    function changeScreen(id) {
        sounds.click.play();
        document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
        if(id === 'game') {
            canvas.style.display = 'block';
            document.getElementById('hud').style.display = 'flex';
            sounds.menuMusic.pause();
            sounds.battleMusic.play();
            initGame();
        } else {
            canvas.style.display = 'none';
            document.getElementById('hud').style.display = 'none';
            document.getElementById(id === 'menu' ? 'menu' : 'brawlers-screen').style.display = 'flex';
            sounds.battleMusic.pause();
            sounds.menuMusic.play();
            if(id === 'brawlers') renderList();
        }
    }

    function exitToMenu() { 
        current=selectedFighter || current;
        gameActive = false; clearCombatTimers(); resetControls(); cancelAnimationFrame(frameId); pip.active = false;
        changeScreen('menu'); window.endRoomPreview?.(); 
    }

    function renderList() {
        const list = document.getElementById('list'); list.innerHTML = '';
        Object.keys(BRAWLERS).forEach(key => {
            const b = BRAWLERS[key];
            const div = document.createElement('button');
            div.type = 'button';
            div.setAttribute('aria-pressed', String(current === key));
            div.className = 'card';
            div.innerHTML = `<div style="flex:1; background:${b.color}"></div><div style="padding:5px; font-size:10px;">${key.replace('_',' ')}</div>`;
            div.onclick = () => { 
                current = key;
                for (const card of list.children) card.setAttribute('aria-pressed', String(card === div));
                try { localStorage.setItem('tlbs.fighter',key); } catch {}
                document.getElementById('active-name').innerText = key.replace('_',' '); 
                document.getElementById('char-preview').style.background = b.color; 
                sounds.click.play();
            };
            list.appendChild(div);
        });
    }

    let frameId = 0, lastFrame = 0, accumulator = 0;
    function initGame() {
        clearCombatTimers();
        resetControls();
        cancelAnimationFrame(frameId); lastFrame = 0; accumulator = 0;
        p.scale = 1; isUltReady = false;
        for (const j of [joyL, joyR, joyU]) { j.active = false; j.id = null; }
        activePin.timer = enemyPin.timer = 0;
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        p.x = canvas.width/2; p.y = canvas.height - 150; 
        p.isFlying = false; p.speedMult = 1; p.boostTimer = 0; p.shield = 0;
        pip.active = false; 
        enemy.x = canvas.width / 2; enemy.y = 150; enemy.hp = 30000;
        joyL.y = canvas.height - 120;
        joyR.x = canvas.width - 100; joyR.y = canvas.height - 130;
        joyU.x = canvas.width - 120; joyU.y = canvas.height / 2; 
        ultCharge = 0; bullets = []; zones = []; throws = [];
        trainingTargets = window.roomPreview ? [] : [-1,1].map(side => ({
            x:Math.max(30,Math.min(canvas.width-30,enemy.x+side*110)), y:enemy.y+75, hp:30000, maxHp:30000
        }));
        setupMatch();
        ammo = BRAWLERS[current].maxAmmo;
        const ammoCont = document.getElementById('ammo-container');
        ammoCont.innerHTML = '';
        for(let i=0; i<BRAWLERS[current].maxAmmo; i++) ammoCont.innerHTML += `<div class="ammo-cell"><div id="ammo-${i}" class="ammo-fill"></div></div>`;
        gameActive = true; frameId = requestAnimationFrame(update);
    }

    function updateUI() {
        isUltReady = (ultCharge >= 100);
        document.getElementById('ult-bar').style.width = Math.min(ultCharge, 100) + '%';
        document.getElementById('ult-bar').style.background = isUltReady ? '#ff00ff' : '#ffff00';
        for(let i=0; i<BRAWLERS[current].maxAmmo; i++) {
            let fill = document.getElementById('ammo-' + i);
            if(fill) fill.style.width = (ammo > i) ? (Math.min(1, ammo - i) * 100) + "%" : "0%";
        }
    }

    function update(now) {
        if (!gameActive) return;
        if (!lastFrame) lastFrame = now;
        accumulator += Math.min(100, now - lastFrame); lastFrame = now;
        while (accumulator >= 1000 / 60) { tick(); accumulator -= 1000 / 60; }
        window.sendRoomPosition?.(p.x/canvas.width,p.y/canvas.height);
        updateUI(); draw(); frameId = requestAnimationFrame(update);
    }
    function tick() {
        if(p.hiddenTicks>0) p.hiddenTicks--;
        combatTick();
        advanceThrows();
        keyboardMovement();
        if (ammo < BRAWLERS[current].maxAmmo) ammo += 1 / (BRAWLERS[current].reload / 16.6);
        if(p.boostTimer > 0) { p.boostTimer--; if(p.boostTimer <= 0) p.speedMult = 1; }
        if(p.shield > 0) p.shield--;
        [activePin, enemyPin].forEach(p => { if(p.timer > 0) { p.timer--; p.scale += (p.timer > 300 ? 1.2 : 1.0 - p.scale) * 0.2; } else p.scale = 0; });
        if(enemyAI || match.mode!=='training') {
            let d = Math.hypot(p.x - enemy.x, p.y - enemy.y);
            if(d > 160) { let a = Math.atan2(p.y-enemy.y, p.x-enemy.x); enemy.x += Math.cos(a)*1.5; enemy.y += Math.sin(a)*1.5; }
        }
        if(pip.active) {
            if(joyL.active) { let dx=joyL.cx-joyL.x, dy=joyL.cy-joyL.y; pip.angle = Math.atan2(dy, dx); }
            pip.x += Math.cos(pip.angle) * 7; pip.y += Math.sin(pip.angle) * 7; pip.life--;
            if(Math.hypot(pip.x-enemy.x, pip.y-enemy.y) < 40 || pip.life <= 0) {
                if(pip.life > 0) hitEnemy(3000, false);
                zones.push({x: pip.x, y: pip.y, r: 120, life: 20, type: 'boom'});
                pip.active = false;
            }
        } else if(joyL.active && !p.isFlying) { 
            let dx=joyL.cx-joyL.x, dy=joyL.cy-joyL.y, dist=Math.hypot(dx,dy); 
            if(dist>5){ p.x+=(dx/dist)*BRAWLERS[current].speed*p.speedMult; p.y+=(dy/dist)*BRAWLERS[current].speed*p.speedMult; } 
        }
        for(let i=bullets.length-1;i>=0;i--){ const b=bullets[i]; 
            if(b.type === 'nani') {
                b.progress += 0.035;
                let ang = Math.atan2(b.ty - b.y, b.tx - b.x);
                let offX = Math.cos(ang + 1.57) * Math.sin(b.progress * Math.PI) * b.curve;
                let offY = Math.sin(ang + 1.57) * Math.sin(b.progress * Math.PI) * b.curve;
                b.x = p.x + (b.tx - p.x) * b.progress + offX; b.y = p.y + (b.ty - p.y) * b.progress + offY;
                if(b.progress >= 1) { bullets.splice(i, 1); continue; }
            } else {
                b.x+=b.vx; b.y+=b.vy; if(--b.life<=0) {
                    if(b.special === 'gene_main') {
                        for(let j=-1; j<=1; j++) {
                            spawnBullet(b.angle + j*0.25, 12, 25, false, 5, 'gene_split');
                            bullets[bullets.length-1].x = b.x; bullets[bullets.length-1].y = b.y;
                        }
                    }
                    bullets.splice(i,1); continue;
                }
                if(b.special==='bounce') { if(b.x<0 || b.x>canvas.width) b.vx *= -1; if(b.y<0 || b.y>canvas.height) b.vy *= -1; }
                if(b.special==='bubble') { if(b.x<0 || b.x>canvas.width) b.vx *= -1; if(b.y<0 || b.y>canvas.height) b.vy *= -1; }
            }
            if(b.special==='hostile') {
                if(Math.hypot(b.x-p.x,b.y-p.y)<27) { bullets.splice(i,1); receiveHit(); }
                continue;
            }
            const targets = [enemy,...trainingTargets];
            const target = targets.find(t => !b.visited?.includes(t) && Math.hypot(b.x-t.x,b.y-t.y)<30);
            if (!target) continue;
            if (b.special==='Edgar') p.hp=Math.min(p.maxHp,p.hp+160);
            if (b.special==='silence' || b.special==='swarm') match.cooldown=Math.max(match.cooldown,100);
            if (b.special==='Spike') for(let k=0;k<6;k++) spawnBullet(k*Math.PI/3,9,14,false,4,'thorn',b);
            if (b.special === 'pull') { target.x=p.x; target.y=p.y; }
            if (b.special === 'poison') {
                for(let n=1;n<=6;n++) scheduleCombatAction(()=>hitEnemy(150,false,target),500*n);
            }
            hitEnemy(b.special==='Colette'?Math.max(300,Math.round(target.hp*.2)):b.special==='energy' ? Math.round(1200*0.75**(b.visited?.length || 0)) : b.special==='gene_split' ? 150 : 400,!b.isUlt,target);
            if (b.special==='energy') {
                (b.visited ||= []).push(target);
                const distance = t => Math.hypot(t.x-b.x,t.y-b.y);
                const next = targets.filter(t=>!b.visited.includes(t) && distance(t)<=250).sort((a,c)=>distance(a)-distance(c))[0];
                if (next && b.visited.length<3) {
                    const angle=Math.atan2(next.y-b.y,next.x-b.x);
                    b.vx=Math.cos(angle)*12; b.vy=Math.sin(angle)*12; b.life=23;
                    continue;
                }
            }
            if(b.special !== 'bubble' && b.special !== 'bounce') bullets.splice(i,1);
        }
        for(let i=zones.length-1;i>=0;i--){ const z=zones[i]; 
            if(z.type === 'gravity') { enemy.x += (z.x - enemy.x) * 0.1; enemy.y += (z.y - enemy.y) * 0.1; if(z.life === 1) hitEnemy(2000, false); }
            if(z.type === 'stun' && Math.hypot(enemy.x-z.x, enemy.y-z.y)<z.r) hitEnemy(10, false);
            const nearby = [enemy,...trainingTargets].filter(t=>Math.hypot(t.x-z.x,t.y-z.y)<z.r);
            if(z.type==='bear') {
                const angle=Math.atan2(enemy.y-z.y,enemy.x-z.x);
                if(!nearby.length) {z.x+=1.7*Math.cos(angle);z.y+=1.7*Math.sin(angle);}
                if(z.life%40===0) for(const t of nearby) hitEnemy(700,false,t);
            }
            if(z.type==='aura') {z.x=p.x;z.y=p.y;if(z.life%30===0) for(const t of nearby) hitEnemy(500,false,t);}
            if(z.type==='station' && z.life%45===0 && Math.hypot(p.x-z.x,p.y-z.y)<z.r) p.hp=Math.min(p.maxHp,p.hp+600);
            if(z.type==='sandstorm' && Math.hypot(p.x-z.x,p.y-z.y)<z.r) p.hiddenTicks=2;
            if (z.type==='mine' && nearby.length) {
                for(const target of nearby) hitEnemy(2000,true,target);
                z.type='blast'; z.life=12;
            }
            if (z.type==='turret' && z.life%30===0) {
                const target=[enemy,...trainingTargets].sort((a,b)=>Math.hypot(a.x-z.x,a.y-z.y)-Math.hypot(b.x-z.x,b.y-z.y))[0];
                if(Math.hypot(target.x-z.x,target.y-z.y)<390)
                    spawnBullet(Math.atan2(target.y-z.y,target.x-z.x),10,40,true,5,'turret',z);
            }
            if (z.type==='fire' && z.life%30===0) for(const target of nearby) hitEnemy(400,!z.isUlt,target);
            if (z.type==='boom' && !z.exploded) {
                z.exploded=true;
                for(const target of nearby) hitEnemy(z.isBig?2400:1200,!z.isUlt,target);
            }
            if(--z.life<=0) zones.splice(i,1); 
        }
        p.x = Math.max(22, Math.min(canvas.width-22,p.x));
        p.y = Math.max(22, Math.min(canvas.height-22,p.y));
    }

    function draw() {
        ctx.fillStyle = "#2e7d32"; ctx.fillRect(0,0,canvas.width,canvas.height);
        if((joyR.active || joyU.active || aimPoint) && !pip.active) {
            let j = joyU.active ? joyU : joyR;
            const angle = j.active ? Math.atan2(j.cy - j.y, j.cx - j.x) : Math.atan2(aimPoint.y - p.y, aimPoint.x - p.x);
            ctx.save();
            ctx.strokeStyle = joyU.active ? "#ffe768" : "#fff";
            ctx.lineWidth = 2;
            const superAim = joyU.active || (aimPoint && pressedKeys.has(bindings.super));
            let ind = superAim ? BRAWLERS[current].ultType : BRAWLERS[current].type;
            ctx.fillStyle = joyU.active ? "rgba(255, 255, 0, 0.3)" : "rgba(255, 255, 255, 0.2)";
            if(BRAWLERS[current].shot && !superAim) {
                const shot=BRAWLERS[current].shot, range=shot.speed*(shot.life-1);
                ctx.beginPath();ctx.moveTo(p.x,p.y);
                if(shot.spread) {ctx.arc(p.x,p.y,range,angle-shot.spread,angle+shot.spread);ctx.closePath();ctx.fill();}
                else ctx.lineTo(p.x+Math.cos(angle)*range,p.y+Math.sin(angle)*range);
                ctx.stroke();
            } else if(current==='Mortis' && !superAim) {
                const end=dashEnd(angle);
                ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(end.x,end.y); ctx.stroke();
                ctx.beginPath(); ctx.arc(end.x,end.y,60,0,2*Math.PI); ctx.fill(); ctx.stroke();
            } else if(['Tick','Barley','Dynamike'].includes(current) && !superAim) {
                const dist=current==='Tick'?220:current==='Barley'?200:250;
                for(const offset of current==='Tick'?[-0.2,0,0.2]:[0]) {
                    ctx.beginPath(); ctx.arc(p.x+Math.cos(angle+offset)*dist,p.y+Math.sin(angle+offset)*dist,current==='Barley'?55:80,0,2*Math.PI); ctx.fill(); ctx.stroke();
                }
            } else if(ind === 'nani_aim' || ind === 'pip') { ctx.beginPath(); ctx.arc(p.x + Math.cos(angle)*320, p.y + Math.sin(angle)*320, 40, 0, 7); ctx.fill(); ctx.stroke(); }
            else if(ind === 'gravity' || ind === 'throw' || ind === 'throw_triple') { ctx.beginPath(); ctx.arc(p.x + Math.cos(angle)*250, p.y + Math.sin(angle)*250, 100, 0, 7); ctx.fill(); ctx.stroke(); }
            else if(ind === 'spread' || ind === 'spread_heavy') { 
                ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.arc(p.x, p.y, 220, angle - 0.5, angle + 0.5); ctx.lineTo(p.x, p.y); ctx.fill(); ctx.stroke();
            } else { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(angle); ctx.fillRect(0, -20, 350, 40); ctx.strokeRect(0, -20, 350, 40); ctx.restore(); }
            ctx.restore();
        }
        ctx.fillStyle="red"; ctx.beginPath(); ctx.arc(enemy.x, enemy.y, 30, 0, 7); ctx.fill();
        ctx.fillStyle="lime"; ctx.fillRect(enemy.x-40, enemy.y-50, (enemy.hp/enemy.maxHp)*80, 8);
        for(const t of trainingTargets) {
            ctx.fillStyle='#b04a55'; ctx.beginPath(); ctx.arc(t.x,t.y,24,0,7); ctx.fill();
            ctx.fillStyle='#1a2030'; ctx.fillRect(t.x-25,t.y-36,50,5);
            ctx.fillStyle='#a4ffa5'; ctx.fillRect(t.x-25,t.y-36,50*t.hp/t.maxHp,5);
        }
        for(const t of throws) {
            const u=t.age/30, x=t.x+(t.tx-t.x)*u, y=t.y+(t.ty-t.y)*u;
            ctx.fillStyle='#17213488';ctx.beginPath();ctx.ellipse(x,y,9,4,0,0,7);ctx.fill();
            ctx.fillStyle=t.type==='mine'?'#81dbff':'#ffbd5e';ctx.beginPath();ctx.arc(x,y-70*Math.sin(Math.PI*u),8,0,7);ctx.fill();
        }
        if(pip.active) { ctx.fillStyle = "yellow"; ctx.beginPath(); ctx.arc(pip.x, pip.y, 15, 0, 7); ctx.fill(); }
        ctx.save(); ctx.translate(p.x,p.y); ctx.scale(p.scale, p.scale);
        if(p.shield > 0) { ctx.strokeStyle = "#4caf50"; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0,0,30,0,7); ctx.stroke(); }
        if(p.boostTimer > 0) { ctx.shadowBlur = 15; ctx.shadowColor = "yellow"; ctx.strokeStyle = "yellow"; ctx.strokeRect(-22,-22,44,44); }
        ctx.fillStyle=BRAWLERS[current].color; ctx.beginPath(); ctx.arc(0,0,22,0,7); ctx.fill(); ctx.strokeStyle="#fff"; ctx.lineWidth=3; ctx.stroke();
        ctx.restore();
        ctx.save(); ctx.font="bold 14px Arial"; ctx.textAlign="center"; ctx.lineWidth=3; ctx.strokeStyle="#17202a"; ctx.fillStyle="white";
        const label=window.playerNickname || "Player"; ctx.strokeText(label,p.x,p.y-35); ctx.fillText(label,p.x,p.y-35); ctx.restore();
        if(window.roomPreview){for(const remote of Object.values(window.remotePlayers||{})){const x=remote.x*canvas.width,y=remote.y*canvas.height;ctx.save();ctx.fillStyle="#62cfff";ctx.beginPath();ctx.arc(x,y,22,0,7);ctx.fill();ctx.fillStyle="white";ctx.font="14px Arial";ctx.textAlign="center";ctx.fillText(remote.nickname,x,y-35);ctx.restore()}}
        if(match.mode!=='training') {
            ctx.save();ctx.fillStyle='#192338';ctx.fillRect(p.x-32,p.y+30,64,7);
            ctx.fillStyle='#67efac';ctx.fillRect(p.x-32,p.y+30,64*p.hp/p.maxHp,7);
            ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 13px sans-serif';
            ctx.fillText(current+' · '+p.hp+' HP',p.x,p.y+53);
            ctx.fillText(match.kills+' : '+match.deaths,canvas.width/2,75);ctx.restore();
        }
        drawPin(p.x, p.y, activePin);
        drawPin(enemy.x, enemy.y, enemyPin);
        bullets.forEach(b => { ctx.fillStyle=b.special==='hostile'?'#ff8659':b.special==='poison'?"#2ecc71":b.isUlt?"#ff00ff":"white"; ctx.beginPath(); ctx.arc(b.x,b.y,b.size||5,0,7); ctx.fill(); });
        zones.forEach(z => { 
            if(z.type==='gravity') ctx.fillStyle="rgba(0,0,0,0.6)";
            else if(z.type==='mine') ctx.fillStyle="rgba(255,0,0,0.5)";
            else if(z.type==='turret') ctx.fillStyle="rgba(255,87,34,0.6)";
            else ctx.fillStyle="rgba(255,255,0,0.4)";
            ctx.beginPath(); ctx.arc(z.x,z.y,z.r,0,7); ctx.fill(); 
        });
        ctx.globalAlpha = 0.2; ctx.fillStyle = "white";
        ctx.beginPath(); ctx.arc(joyL.x, joyL.y, 60, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(joyR.x, joyR.y, 60, 0, 7); ctx.fill();
        if(isUltReady) { ctx.globalAlpha = 0.6; ctx.fillStyle = "yellow"; ctx.beginPath(); ctx.arc(joyU.x, joyU.y, 50, 0, 7); ctx.fill(); }
        ctx.globalAlpha = 1;
    }

try {
    const saved=localStorage.getItem('tlbs.fighter');
    if(Object.hasOwn(BRAWLERS,saved)) {
        current=saved;
        document.getElementById('active-name').textContent=current.replace('_',' ');
        document.getElementById('char-preview').style.background=BRAWLERS[current].color;
    }
} catch {}
