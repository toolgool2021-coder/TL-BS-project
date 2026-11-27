    let superFx=null, attackFx=[];
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
            if(id === 'menu') syncLobby();
        }
    }

    function exitToMenu() {
        window.closeSharedHost?.();
        current=selectedFighter || current;
        gameActive = false; clearCombatTimers(); resetControls(); cancelAnimationFrame(frameId); pip.active = false;
        changeScreen('menu'); window.endRoomPreview?.(); 
    }

    function renderList() {
        const list = document.getElementById('list'); list.innerHTML = '';
        const query=document.querySelector('#fighter-search').value.trim().toLowerCase();
        const keys=Object.keys(BRAWLERS).filter(key=>(key+' '+fighterNames[key]).toLowerCase().includes(query));
        document.querySelector('#search-empty').hidden=keys.length>0;
        keys.forEach(key => {
            const b = BRAWLERS[key];
            const div = document.createElement('button');
            div.type = 'button';
            div.setAttribute('aria-pressed', String(current === key));
            div.className = 'card';
            div.style.setProperty('--accent',b.color);
            div.innerHTML = '<span class="glyph">'+fighterNames[key].slice(0,2).toUpperCase()+'</span><strong>'+fighterNames[key]+'</strong><small>'+(b.hp || practiceHp[key])+' HP</small>';
            div.onclick = () => { 
                current = key;
                for (const card of list.children) card.setAttribute('aria-pressed', String(card === div));
                try { localStorage.setItem('tlbs.fighter',key); } catch {}
                document.getElementById('active-name').innerText = key.replace('_',' '); 
                syncLobby();
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
        canvas.width = canvas.clientWidth || window.innerWidth; canvas.height = canvas.clientHeight || window.innerHeight;
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
        superFx=null;
        p.motion=null;
        setupMatch();
        ammo = BRAWLERS[current].maxAmmo;
        renderAmmo();
        gameActive = true; frameId = requestAnimationFrame(update);
    }

    function renderAmmo() {
        const ammoCont = document.getElementById('ammo-container');
        ammoCont.innerHTML = '';
        for(let i=0; i<BRAWLERS[current].maxAmmo; i++) ammoCont.innerHTML += `<div class="ammo-cell"><div id="ammo-${i}" class="ammo-fill"></div></div>`;
    }

    function updateUI() {
        gemHUD();
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
        if(!match.finished)window.shareMatch?.();
        window.sendRoomPosition?.(p.x/canvas.width,p.y/canvas.height);
        updateUI(); draw(); frameId = requestAnimationFrame(update);
    }
    function tick() {
        if(match.finished) return;
        if(match.nextRound) duelTurn();
        if(p.hiddenTicks>0) p.hiddenTicks--;
        if(superFx && ++superFx.age>=45) superFx=null;
        attackFx=attackFx.filter(f=>++f.age<18);
        if(realm && --realm.left<=0) realm=null;
        advanceAttachment();
        tickObjective();
        if(match.finished) return;
        tickHammer();tickWaves();advanceSuperMotion();
        combatTick();
        advanceThrows();
        const startX=p.x,startY=p.y;
        keyboardMovement();
        if(!p.out && !realm && (current==='Edgar'||(current==='Kit' && !p.attachment)))
            ultCharge=Math.min(100,ultCharge+100/(current==='Edgar'?1800:1200));
        if (ammo < BRAWLERS[current].maxAmmo) ammo += 1 / (BRAWLERS[current].reload / 16.6);
        if(p.boostTimer > 0) { p.boostTimer--; if(p.boostTimer <= 0) p.speedMult = 1; }
        if(p.shield > 0) p.shield--;
        [activePin, enemyPin].forEach(p => { if(p.timer > 0) { p.timer--; p.scale += (p.timer > 300 ? 1.2 : 1.0 - p.scale) * 0.2; } else p.scale = 0; });
        if(!arena && !enemy.stun && (!p.hiddenTicks || dist(p,enemy)<65) && inPlane(enemy) && (enemyAI || match.mode!=='training')) {
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
        } else if(joyL.active && !p.attachment && !p.isFlying && !p.out) {
            let dx=joyL.cx-joyL.x, dy=joyL.cy-joyL.y, dist=Math.hypot(dx,dy); 
            if(dist>5){ p.x+=(dx/dist)*BRAWLERS[current].speed*p.speedMult; p.y+=(dy/dist)*BRAWLERS[current].speed*p.speedMult; } 
        }
        if(arena?.walls.length && !p.isFlying){const dx=p.x-startX,dy=p.y-startY;p.x=startX;p.y=startY;moveOnPitch(p,dx,dy);}
        for(let i=bullets.length-1;i>=0;i--){ const b=bullets[i]; 
            if(b.type === 'nani') {
                b.progress += 0.035;
                let ang = Math.atan2(b.ty - b.y, b.tx - b.x);
                let offX = Math.cos(ang + 1.57) * Math.sin(b.progress * Math.PI) * b.curve;
                let offY = Math.sin(ang + 1.57) * Math.sin(b.progress * Math.PI) * b.curve;
                b.x = b.originX + (b.tx - b.originX) * b.progress + offX; b.y = b.originY + (b.ty - b.originY) * b.progress + offY;
                if(b.progress >= 1) { bullets.splice(i, 1); continue; }
            } else {
                b.x+=b.vx; b.y+=b.vy; if(--b.life<=0) {
                    if(b.special==='Spike')burstSpike(b);
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
            if(insideCover(b.x,b.y)){if(b.special==='Spike'){b.x-=b.vx;b.y-=b.vy;burstSpike(b);}bullets.splice(i,1);continue;}
            if(b.special==='hostile' || b.special==='teamShot'){
                const unit=hostileSummons(b.owner||enemy).find(z=>dist(z,b)<20);
                if(unit){strikeSummon(unit,b.special==='hostile'?800:550);bullets.splice(i,1);continue;}
            }
            if(b.special==='teamShot'){
                const t=[...arena.actors,...arena.safes].find(t=>!t.out && t.team!==b.owner.team && inPlane(t)===inPlane(b.owner) && dist(t,b)<23);
                if(t){objectiveHit(t,550);bullets.splice(i,1);}continue;
            }
            if(b.special==='hostile') {
                if(Math.hypot(b.x-p.x,b.y-p.y)<27) { bullets.splice(i,1); receiveHit(); }
                continue;
            }
            const targets = combatTargets();
            const target = targets.find(t => !b.visited?.includes(t) && Math.hypot(b.x-t.x,b.y-t.y)<30);
            if (!target) continue;
            if(b.special==='realm' && !target.safe){startRealm(target);break;}
            if(b.special==='anchor'){
                if(!target.safe) beginTravel(angleTo(target),Math.min(dist(p,target),308),18,'Buzz',65,target);
                bullets.splice(i,1);continue;
            }
            if(b.special==='bats') {
                (b.visited ||= []).push(target);
                const damage=Math.min(1200,target.hp);hitEnemy(damage,false,target);
                p.hp=Math.min(p.maxHp,p.hp+damage);continue;
            }
            if(b.special==='jawbreaker' && !target.safe)target.stun=75;
            if(b.special==='Nita'){
                (b.visited ||= []).push(target);hitEnemy(950,true,target);continue;
            }
            if(b.special==='Piper' || b.special==='Leon' || b.special==='Bea'){
                const distance=Math.hypot(b.x-b.originX,b.y-b.originY);
                const damage=b.special==='Bea'?(b.charged?1800:600):b.special==='Piper'?Math.round(440+Math.min(1250,distance*1.6)):Math.round(500-Math.min(290,distance*.55));
                if(b.special==='Bea' && !b.charged && current==='Bea' && !p.out && !target.safe && !target.spawnShield)p.beeCharge=true;
                if(b.special==='Piper' && !target.spawnShield)damageNotes.push({x:target.x,y:target.y,age:0,damage});
                hitEnemy(damage,true,target);bullets.splice(i,1);continue;
            }
            if(b.special==='shoe'||b.special==='Surge'||b.special==='surgeShard'){
                if(b.special==='Surge')splitSurge(b,target);
                hitEnemy(b.special==='shoe'?360:b.special==='Surge'?850:340,true,target);
                bullets.splice(i,1);continue;
            }
            if (b.special==='Edgar') p.hp=Math.min(p.maxHp,p.hp+160);
            if (b.special==='silence' || b.special==='swarm') match.cooldown=Math.max(match.cooldown,100);
            if (b.special==='Spike')burstSpike(b);
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
            if(summonStats[z.type]){z.age++;if(z.hitFlash)z.hitFlash--;}
            if(z.type === 'gravity') { enemy.x += (z.x - enemy.x) * 0.1; enemy.y += (z.y - enemy.y) * 0.1; if(z.life === 1) hitEnemy(2000, false); }
            if(z.type === 'stun' && Math.hypot(enemy.x-z.x, enemy.y-z.y)<z.r) hitEnemy(10, false);
            const nearby = combatTargets().filter(t=>Math.hypot(t.x-z.x,t.y-z.y)<z.r);
            if(z.type==='head') {
                const target=combatTargets().filter(t=>!t.safe).sort((a,b)=>dist(z,a)-dist(z,b))[0];
                if(target){
                    const d=dist(z,target);
                    if(d<26){for(const t of nearby)hitEnemy(2400,false,t);z.type='blast';z.life=14;}
                    else {z.x+=(target.x-z.x)/d*4;z.y+=(target.y-z.y)/d*4;}
                }
            }
            if(z.type==='bear') {
                const angle=Math.atan2(enemy.y-z.y,enemy.x-z.x);
                if(!nearby.length) {z.x+=1.7*Math.cos(angle);z.y+=1.7*Math.sin(angle);}
                if(z.age%40===0) for(const t of nearby) hitEnemy(700,false,t);
            }
            if(z.type==='aura') {z.x=p.x;z.y=p.y;if(z.life%30===0) for(const t of nearby) hitEnemy(500,false,t);}
            if(z.type==='poprocks' && z.life%20===0)for(const t of nearby)hitEnemy(240,false,t);
            if(z.type==='station' && z.age%45===0){
                for(const a of arena?.actors||[p])if(!a.out && (a===p||a.team===p.team) && dist(a,z)<=z.r)a.hp=Math.min(a.maxHp,a.hp+600);
            }
            if(z.type==='sandstorm' && Math.hypot(p.x-z.x,p.y-z.y)<z.r) p.hiddenTicks=2;
            if(z.type==='boMine') {
                if(z.arm>0) z.arm--;
                else if(z.fuse>0) {
                    if(--z.fuse===0) {
                        for(const target of nearby) hitEnemy(2000,false,target);
                        z.type='blast'; z.life=16;
                    }
                } else if(nearby.length) z.fuse=24;
            }
            if (z.type==='mine' && nearby.length) {
                for(const target of nearby) hitEnemy(640,true,target);
                z.type='blast'; z.life=12;
            }
            if (z.type==='turret' && z.age%30===0) {
                const target=combatTargets().sort((a,b)=>Math.hypot(a.x-z.x,a.y-z.y)-Math.hypot(b.x-z.x,b.y-z.y))[0];
                if(target && Math.hypot(target.x-z.x,target.y-z.y)<390)
                    spawnBullet(z.angle=Math.atan2(target.y-z.y,target.x-z.x),10,40,true,5,'turret',z);
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
        ctx.fillStyle = realm ? "#342649" : "#2e7d32"; ctx.fillRect(0,0,canvas.width,canvas.height);
        if(!realm && match.mode!=='ball'){
            ctx.save();ctx.strokeStyle='rgba(255,255,255,.045)';ctx.lineWidth=1;
            for(let x=0;x<canvas.width;x+=64){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,canvas.height);ctx.stroke();}
            for(let y=0;y<canvas.height;y+=64){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(canvas.width,y);ctx.stroke();}
            ctx.strokeStyle='#184d25';ctx.lineWidth=8;ctx.strokeRect(4,4,canvas.width-8,canvas.height-8);ctx.restore();
        }
        if(match.mode==='ball')paintPitch();
        drawObjective();
        if(realm){ctx.save();ctx.fillStyle='#ebd9ff';ctx.font='bold 16px sans-serif';ctx.textAlign='center';ctx.fillText('Царство теней · '+Math.ceil(realm.left/60)+' с',canvas.width/2,100);ctx.restore();}
        if((joyR.active || joyU.active || aimPoint) && !pip.active) {
            let j = joyU.active ? joyU : joyR;
            const angle = j.active ? Math.atan2(j.cy - j.y, j.cx - j.x) : Math.atan2(aimPoint.y, aimPoint.x);
            drawAim(angle,joyU.active || Boolean(aimPoint && pressedKeys.has(bindings.super)));
        }
        if(p.altitude>0){ctx.save();ctx.fillStyle='#14152366';ctx.beginPath();ctx.ellipse(p.x,p.y,23,9,0,0,7);ctx.fill();ctx.restore();}
        for(const t of combatTargets()) if(t.stun>0){ctx.save();ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillStyle='#ffe77b';ctx.fillText('Оглушение',t.x,t.y-63);ctx.restore();}
        if(match.mode!=='gems' && !enemy.out && inPlane(enemy)){
        const botName=match.mode==='duel'?botTrio[Math.min(match.kills,2)]:enemy.fighter;
        ctx.fillStyle=BRAWLERS[botName]?.color||'#d65a65'; ctx.beginPath(); ctx.arc(enemy.x, enemy.y, 30, 0, 7); ctx.fill();
        ctx.fillStyle="lime"; ctx.fillRect(enemy.x-40, enemy.y-50, (enemy.hp/enemy.maxHp)*80, 8);
        if(match.mode!=='duel'){ctx.save();ctx.textAlign='center';ctx.font='bold 13px sans-serif';ctx.fillStyle='white';ctx.fillText(botName?fighterNames[botName]||botName:match.mode==='training'?'Тренировочный бот':'Бот',enemy.x,enemy.y-58);ctx.restore();}
        }
        for(const t of trainingTargets.filter(t=>match.mode!=='gems' && !t.out && !t.safe && inPlane(t))) {
            ctx.fillStyle='#b04a55'; ctx.beginPath(); ctx.arc(t.x,t.y,24,0,7); ctx.fill();
            ctx.fillStyle='#1a2030'; ctx.fillRect(t.x-25,t.y-36,50,5);
            ctx.fillStyle='#a4ffa5'; ctx.fillRect(t.x-25,t.y-36,50*t.hp/t.maxHp,5);
        }
        for(const t of throws) {
            const u=t.age/30, x=t.x+(t.tx-t.x)*u, y=t.y+(t.ty-t.y)*u;
            ctx.fillStyle='#17213488';ctx.beginPath();ctx.ellipse(x,y,9,4,0,0,7);ctx.fill();
            ctx.fillStyle=t.type==='mine'?'#81dbff':'#ffbd5e';ctx.beginPath();ctx.arc(x,y-70*Math.sin(Math.PI*u),8,0,7);ctx.fill();
        }
        if(match.mode==='duel') {
            ctx.save();ctx.textAlign='center';ctx.fillStyle='white';ctx.font='bold 14px sans-serif';
            ctx.fillText(fighterNames[botTrio[Math.min(match.kills,2)]],enemy.x,enemy.y-57);ctx.restore();
        }
        if(pip.active) { ctx.fillStyle = "yellow"; ctx.beginPath(); ctx.arc(pip.x, pip.y, 15, 0, 7); ctx.fill(); }
        ctx.save(); if(p.out)ctx.globalAlpha=.18; if(p.hiddenTicks)ctx.globalAlpha=.4;ctx.translate(p.x,p.y-(p.altitude||0)); ctx.scale(p.scale, p.scale);
        if(p.shield > 0) { ctx.strokeStyle = "#4caf50"; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0,0,30,0,7); ctx.stroke(); }
        if(p.boostTimer > 0) { ctx.shadowBlur = 15; ctx.shadowColor = "yellow"; ctx.strokeStyle = "yellow"; ctx.strokeRect(-22,-22,44,44); }
        ctx.fillStyle=BRAWLERS[current].color; ctx.beginPath(); ctx.arc(0,0,22,0,7); ctx.fill(); ctx.strokeStyle="#fff"; ctx.lineWidth=3; ctx.stroke();
        ctx.restore();
        ctx.save(); ctx.font="bold 14px Arial"; ctx.textAlign="center"; ctx.lineWidth=3; ctx.strokeStyle="#17202a"; ctx.fillStyle="white";
        const label=window.playerNickname || "Player"; if(match.mode!=='gems'){ctx.strokeText(label,p.x,p.y-35); ctx.fillText(label,p.x,p.y-35);} ctx.restore();
        if(window.roomPreview && !realm){for(const remote of Object.values(window.remotePlayers||{})){const x=remote.x*canvas.width,y=remote.y*canvas.height;ctx.save();ctx.fillStyle="#62cfff";ctx.beginPath();ctx.arc(x,y,22,0,7);ctx.fill();ctx.fillStyle="white";ctx.font="14px Arial";ctx.textAlign="center";ctx.fillText(remote.nickname,x,y-35);ctx.restore()}}
        if(match.mode!=='training' && match.mode!=='gems') {
            ctx.save();ctx.fillStyle='#192338';ctx.fillRect(p.x-32,p.y+30,64,7);
            ctx.fillStyle='#67efac';ctx.fillRect(p.x-32,p.y+30,64*p.hp/p.maxHp,7);
            ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 13px sans-serif';
            ctx.fillText(current+' · '+p.hp+' HP',p.x,p.y+53);
            const score=match.mode==='arms'?'Боец '+Math.min(match.order.length,1+Math.floor(match.kills/2))+'/'+match.order.length+' · '+match.kills+'/'+(2*match.order.length):match.kills+' : '+match.deaths;
            ctx.fillText(score,canvas.width/2,75);ctx.restore();
        }
        paintTeamHUD();
        if(p.hiddenTicks){ctx.save();ctx.fillStyle='white';ctx.textAlign='center';ctx.fillText('Скрыт · '+Math.ceil(p.hiddenTicks/60)+' с',p.x,p.y+65);ctx.restore();}
        if(match.mode==='gems')drawGemActors();
        drawPin(p.x, p.y, activePin);
        drawPin(enemy.x, enemy.y, enemyPin);
        bullets.forEach(drawCombatProjectile);
        paintHammer();paintWaves();
        for(const f of attackFx){
            const u=f.age/18,s=f.shape;
            ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.angle);
            ctx.globalAlpha=(1-u)*.65;ctx.strokeStyle=f.color;ctx.fillStyle=f.color;ctx.lineWidth=3;
            if(s.kind==='fan'){ctx.beginPath();ctx.arc(0,0,s.range*(.25+.75*u),-s.spread,s.spread);ctx.stroke();}
            else if(s.kind==='landing'||s.kind==='jump'){ctx.beginPath();ctx.arc(0,0,22+u*18,0,Math.PI*2);ctx.stroke();}
            else {const reach=Math.min(s.range,75);ctx.beginPath();ctx.moveTo(18,0);ctx.lineTo(reach*(.5+.5*u),-9*(1-u));ctx.lineTo(reach*(.5+.5*u),9*(1-u));ctx.closePath();ctx.fill();}
            ctx.restore();
        }
        zones.forEach(z => {
            if(drawSummon(z))return;
            if(z.type==='boMine') {
                ctx.save();ctx.strokeStyle=z.fuse?'#ff995e':'#bbcdd580';
                ctx.lineWidth=z.fuse?3:1;ctx.beginPath();ctx.arc(z.x,z.y,z.fuse?8+(24-z.fuse)*1.5:7,0,7);ctx.stroke();ctx.restore();return;
            }
            if(z.type==='gravity') ctx.fillStyle="rgba(0,0,0,0.6)";
            else if(z.type==='mine') ctx.fillStyle="rgba(255,0,0,0.5)";
            else if(z.type==='turret') ctx.fillStyle="rgba(255,87,34,0.6)";
            else ctx.fillStyle="rgba(255,255,0,0.4)";
            ctx.beginPath(); ctx.arc(z.x,z.y,z.r,0,7); ctx.fill(); 
        });
        if(superFx) {
            const u=superFx.age/45;
            ctx.save();ctx.globalAlpha=Math.sin(Math.PI*(0.12+0.88*u));
            ctx.strokeStyle='#ffdb72';ctx.lineWidth=3;ctx.beginPath();
            ctx.arc(superFx.x,superFx.y,25+48*u,0,Math.PI*2);ctx.stroke();
            ctx.strokeStyle=BRAWLERS[superFx.fighter]?.color||'#ffdb72';
            ctx.lineWidth=5*(1-u)+1;
            ctx.beginPath();ctx.arc(superFx.x,superFx.y,18+85*u,0,Math.PI*2);ctx.stroke();
            for(let i=0;i<12;i++){
                const a=i*Math.PI/6+u*.8, radius=25+95*u;
                ctx.beginPath();ctx.moveTo(superFx.x+Math.cos(a)*radius,superFx.y+Math.sin(a)*radius);
                ctx.lineTo(superFx.x+Math.cos(a)*(radius+18*(1-u)),superFx.y+Math.sin(a)*(radius+18*(1-u)));ctx.stroke();
            }
            ctx.font='bold 15px sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff4bd';
            ctx.fillText('Супер · '+fighterNames[superFx.fighter],superFx.x,superFx.y-42-14*u);
            ctx.restore();
        }
        if(drag) {
            ctx.save();ctx.fillStyle='#ffffff30';ctx.strokeStyle='#fff';ctx.lineWidth=2;
            ctx.beginPath();ctx.arc(drag.x,drag.y,16,0,7);ctx.fill();ctx.stroke();
            if(aimPoint) {ctx.beginPath();ctx.moveTo(drag.x,drag.y);ctx.lineTo(drag.x+aimPoint.x,drag.y+aimPoint.y);ctx.stroke();}
            ctx.restore();
        }
        if(!touchControls) return;
        ctx.save();
        for(const j of [joyL,joyR,joyU]){
            if(!j.active)continue;
            const r=42,dx=j.cx-j.x,dy=j.cy-j.y,d=Math.hypot(dx,dy),k=d>r?r/d:1;
            ctx.fillStyle='#10182766';ctx.strokeStyle=j===joyU?'#ffdb72':j===joyR?'#ff7777':'#a6dfff';ctx.lineWidth=2;
            ctx.beginPath();ctx.arc(j.x,j.y,r,0,Math.PI*2);ctx.fill();ctx.stroke();
            ctx.fillStyle=ctx.strokeStyle;ctx.beginPath();ctx.arc(j.x+dx*k,j.y+dy*k,17,0,Math.PI*2);ctx.fill();
        }
        if(isUltReady&&!joyU.active){const h=superHome();ctx.fillStyle='#ffcf55aa';ctx.beginPath();ctx.arc(h.x,h.y,30,0,Math.PI*2);ctx.fill();ctx.fillStyle='#352100';ctx.font='bold 22px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('★',h.x,h.y);}
        ctx.restore();
        ctx.globalAlpha = 1;
    }

try {
    const saved=localStorage.getItem('tlbs.fighter');
    if(Object.hasOwn(BRAWLERS,saved)) {
        current=saved;
        document.getElementById('active-name').textContent=current.replace('_',' ');

    }
} catch {}
