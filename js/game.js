    let enemyAI = false;
    let activePin = { type: '', timer: 0, scale: 0 };
    let enemyPin = { type: '', timer: 0, scale: 0 };
    let current = 'Shelly', ultCharge = 0, isUltReady = false, gameActive = false;
    let ammo = 3, p = { x: 0, y: 0, scale: 1, isFlying: false, speedMult: 1, boostTimer: 0, shield: 0 }; 
    let pip = { active: false, x: 0, y: 0, angle: 0, life: 0 };
    let enemy = { x: 200, y: 150, hp: 30000, maxHp: 30000 };
    let bullets = [], zones = [];
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
        gameActive = false; pip.active = false; 
        changeScreen('menu'); 
    }

    function renderList() {
        const list = document.getElementById('list'); list.innerHTML = '';
        Object.keys(BRAWLERS).forEach(key => {
            const b = BRAWLERS[key];
            const div = document.createElement('div');
            div.className = 'card';
            div.innerHTML = `<div style="flex:1; background:${b.color}"></div><div style="padding:5px; font-size:10px;">${key.replace('_',' ')}</div>`;
            div.onclick = () => { 
                current = key; 
                document.getElementById('active-name').innerText = key.replace('_',' '); 
                document.getElementById('char-preview').style.background = b.color; 
                sounds.click.play();
            };
            list.appendChild(div);
        });
    }

    function initGame() {
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        p.x = canvas.width/2; p.y = canvas.height - 150; 
        p.isFlying = false; p.speedMult = 1; p.boostTimer = 0; p.shield = 0;
        pip.active = false; 
        enemy.x = canvas.width / 2; enemy.y = 150; enemy.hp = 30000;
        joyL.y = canvas.height - 120;
        joyR.x = canvas.width - 100; joyR.y = canvas.height - 130;
        joyU.x = canvas.width - 120; joyU.y = canvas.height / 2; 
        ultCharge = 0; bullets = []; zones = [];
        ammo = BRAWLERS[current].maxAmmo;
        const ammoCont = document.getElementById('ammo-container');
        ammoCont.innerHTML = '';
        for(let i=0; i<BRAWLERS[current].maxAmmo; i++) ammoCont.innerHTML += `<div class="ammo-cell"><div id="ammo-${i}" class="ammo-fill"></div></div>`;
        gameActive = true; requestAnimationFrame(update);
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

    function update() {
        if(!gameActive) return;
        if (ammo < BRAWLERS[current].maxAmmo) ammo += 1 / (BRAWLERS[current].reload / 16.6);
        if(p.boostTimer > 0) { p.boostTimer--; if(p.boostTimer <= 0) p.speedMult = 1; }
        if(p.shield > 0) p.shield--;
        [activePin, enemyPin].forEach(p => { if(p.timer > 0) { p.timer--; p.scale += (p.timer > 300 ? 1.2 : 1.0 - p.scale) * 0.2; } else p.scale = 0; });
        if(enemyAI) {
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
        bullets.forEach((b,i)=>{ 
            if(b.type === 'nani') {
                b.progress += 0.035;
                let ang = Math.atan2(b.ty - b.y, b.tx - b.x);
                let offX = Math.cos(ang + 1.57) * Math.sin(b.progress * Math.PI) * b.curve;
                let offY = Math.sin(ang + 1.57) * Math.sin(b.progress * Math.PI) * b.curve;
                b.x = p.x + (b.tx - p.x) * b.progress + offX; b.y = p.y + (b.ty - p.y) * b.progress + offY;
                if(b.progress >= 1) bullets.splice(i, 1);
            } else {
                b.x+=b.vx; b.y+=b.vy; if(--b.life<=0) {
                    if(b.special === 'gene_main') {
                        for(let j=-1; j<=1; j++) {
                            spawnBullet(b.angle + j*0.25, 12, 25, false, 5, 'gene_split');
                            bullets[bullets.length-1].x = b.x; bullets[bullets.length-1].y = b.y;
                        }
                    }
                    bullets.splice(i,1);
                }
                if(b.special==='bounce') { if(b.x<0 || b.x>canvas.width) b.vx *= -1; if(b.y<0 || b.y>canvas.height) b.vy *= -1; }
                if(b.special==='bubble') { if(b.x<0 || b.x>canvas.width) b.vx *= -1; if(b.y<0 || b.y>canvas.height) b.vy *= -1; }
            }
            if(Math.hypot(b.x-enemy.x, b.y-enemy.y)<30){ 
                if(b.special === 'pull') { enemy.x = p.x; enemy.y = p.y; }
                if(b.special === 'poison') { let c=0; let poi=setInterval(()=>{hitEnemy(150, false); if(++c>5)clearInterval(poi)}, 500); }
                if(b.special === 'energy') { hitEnemy(800, true); }
                hitEnemy(b.special === 'gene_split' ? 150 : 400, !b.isUlt); if(b.special !== 'bubble' && b.special !== 'bounce') bullets.splice(i,1); 
            } 
        });
        zones.forEach((z,i)=>{ 
            if(z.type === 'gravity') { enemy.x += (z.x - enemy.x) * 0.1; enemy.y += (z.y - enemy.y) * 0.1; if(z.life === 1) hitEnemy(2000, false); }
            if(z.type === 'stun' && Math.hypot(enemy.x-z.x, enemy.y-z.y)<z.r) hitEnemy(10, false);
            if(z.type === 'mine' && Math.hypot(enemy.x-z.x, enemy.y-z.y)<z.r) { hitEnemy(2000, true); zones.splice(i,1); }
            if(z.type === 'turret') { if(z.life % 30 === 0) spawnBullet(Math.atan2(enemy.y-z.y, enemy.x-z.x), 10, 40); }
            if(Math.hypot(enemy.x-z.x, enemy.y-z.y)<z.r) hitEnemy(5, false); 
            if(--z.life<=0) zones.splice(i,1); 
        });
        updateUI();
        draw();
        requestAnimationFrame(update);
    }

    function draw() {
        ctx.fillStyle = "#2e7d32"; ctx.fillRect(0,0,canvas.width,canvas.height);
        if((joyR.active || joyU.active) && !pip.active) {
            let j = joyU.active ? joyU : joyR;
            let angle = Math.atan2(j.cy - j.y, j.cx - j.x);
            let ind = joyU.active ? BRAWLERS[current].ultType : BRAWLERS[current].type;
            ctx.fillStyle = joyU.active ? "rgba(255, 255, 0, 0.3)" : "rgba(255, 255, 255, 0.2)";
            if(ind === 'nani_aim' || ind === 'pip') { ctx.beginPath(); ctx.arc(p.x + Math.cos(angle)*320, p.y + Math.sin(angle)*320, 40, 0, 7); ctx.fill(); }
            else if(ind === 'gravity' || ind === 'throw' || ind === 'throw_triple') { ctx.beginPath(); ctx.arc(p.x + Math.cos(angle)*250, p.y + Math.sin(angle)*250, 100, 0, 7); ctx.fill(); }
            else if(ind === 'spread' || ind === 'spread_heavy') { 
                ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.arc(p.x, p.y, 220, angle - 0.5, angle + 0.5); ctx.lineTo(p.x, p.y); ctx.fill();
            } else { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(angle); ctx.fillRect(0, -20, 350, 40); ctx.restore(); }
        }
        ctx.fillStyle="red"; ctx.beginPath(); ctx.arc(enemy.x, enemy.y, 30, 0, 7); ctx.fill();
        ctx.fillStyle="lime"; ctx.fillRect(enemy.x-40, enemy.y-50, (enemy.hp/30000)*80, 8);
        if(pip.active) { ctx.fillStyle = "yellow"; ctx.beginPath(); ctx.arc(pip.x, pip.y, 15, 0, 7); ctx.fill(); }
        ctx.save(); ctx.translate(p.x,p.y); ctx.scale(p.scale, p.scale);
        if(p.shield > 0) { ctx.strokeStyle = "#4caf50"; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0,0,30,0,7); ctx.stroke(); }
        if(p.boostTimer > 0) { ctx.shadowBlur = 15; ctx.shadowColor = "yellow"; ctx.strokeStyle = "yellow"; ctx.strokeRect(-22,-22,44,44); }
        ctx.fillStyle=BRAWLERS[current].color; ctx.beginPath(); ctx.arc(0,0,22,0,7); ctx.fill();
        ctx.restore();
        drawPin(p.x, p.y, activePin);
        drawPin(enemy.x, enemy.y, enemyPin);
        bullets.forEach(b => { ctx.fillStyle=b.special==='poison'?"#2ecc71":b.isUlt?"#ff00ff":"white"; ctx.beginPath(); ctx.arc(b.x,b.y,b.size||5,0,7); ctx.fill(); });
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
