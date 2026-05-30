// Main game logic and control system

// --- SOUND SYSTEM ---
const sounds = {
    menuMusic: new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3'),
    battleMusic: new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
    click: new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_c8c8a73484.mp3'),
    shoot: new Audio('https://cdn.pixabay.com/audio/2022/02/11/audio_f687989389.mp3'),
    ult: new Audio('https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c7443c.mp3'),
    hit: new Audio('https://cdn.pixabay.com/audio/2021/08/09/audio_8849646b14.mp3')
};

sounds.menuMusic.loop = true;
sounds.battleMusic.loop = true;
sounds.menuMusic.volume = 0.4;
sounds.battleMusic.volume = 0.3;

// Game state variables
let enemyAI = false;
let activePin = { type: '', timer: 0, scale: 0 };
let enemyPin = { type: '', timer: 0, scale: 0 };
let current = 'Shelly';
let ultCharge = 0;
let isUltReady = false;
let gameActive = false;
let ammo = 3;

let p = {
    x: 0,
    y: 0,
    scale: 1,
    isFlying: false,
    speedMult: 1,
    boostTimer: 0,
    shield: 0
};

let pip = {
    active: false,
    x: 0,
    y: 0,
    angle: 0,
    life: 0
};

let enemy = {
    x: 200,
    y: 150,
    hp: 30000,
    maxHp: 30000
};

let bullets = [];
let zones = [];

let joyL = { active: false, x: 100, y: 0, cx: 100, cy: 0, id: null };
let joyR = { active: false, x: 0, y: 0, cx: 0, cy: 0, id: null };
let joyU = { active: false, x: 0, y: 0, cx: 0, cy: 0, id: null };

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Toggle Functions
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
    activePin.type = emoji;
    activePin.timer = 150;
    activePin.scale = 0;
    togglePinMenu();
    sounds.click.play();
}

// Screen Management
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
    gameActive = false;
    pip.active = false;
    changeScreen('menu');
}

// Game Initialization
function initGame() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    p.x = canvas.width / 2;
    p.y = canvas.height - 150;
    p.isFlying = false;
    p.speedMult = 1;
    p.boostTimer = 0;
    p.shield = 0;
    
    pip.active = false;
    
    enemy.x = canvas.width / 2;
    enemy.y = 150;
    enemy.hp = 30000;
    
    joyL.y = canvas.height - 120;
    joyR.x = canvas.width - 100;
    joyR.y = canvas.height - 130;
    joyU.x = canvas.width - 120;
    joyU.y = canvas.height / 2;
    
    ultCharge = 0;
    bullets = [];
    zones = [];
    ammo = BRAWLERS[current].maxAmmo;
    
    const ammoCont = document.getElementById('ammo-container');
    ammoCont.innerHTML = '';
    for(let i = 0; i < BRAWLERS[current].maxAmmo; i++) {
        ammoCont.innerHTML += `<div class="ammo-cell"><div id="ammo-${i}" class="ammo-fill"></div></div>`;
    }
    
    gameActive = true;
    requestAnimationFrame(update);
}

// UI Update
function updateUI() {
    isUltReady = (ultCharge >= 100);
    document.getElementById('ult-bar').style.width = Math.min(ultCharge, 100) + '%';
    document.getElementById('ult-bar').style.background = isUltReady ? '#ff00ff' : '#ffff00';
    
    for(let i = 0; i < BRAWLERS[current].maxAmmo; i++) {
        let fill = document.getElementById('ammo-' + i);
        if(fill) fill.style.width = (ammo > i) ? (Math.min(1, ammo - i) * 100) + "%" : "0%";
    }
}

// Pin Drawing
function drawPin(x, y, pin) {
    if (pin.timer <= 0) return;
    ctx.save();
    ctx.translate(x, y - 75 + Math.sin(pin.timer * 0.1) * 5);
    ctx.scale(pin.scale, pin.scale);
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, 7);
    ctx.fill();
    ctx.stroke();
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(pin.type, 0, 2);
    ctx.restore();
}

// Touch Input Handling
window.addEventListener('touchstart', e => {
    for(let t of e.changedTouches) {
        let tx = t.clientX;
        let ty = t.clientY;
        
        if(tx > canvas.width - 100 && ty < canvas.height * 0.6) return;
        
        if(tx < canvas.width / 2) {
            joyL.id = t.identifier;
            joyL.active = true;
            joyL.cx = tx;
            joyL.cy = ty;
        } else if(isUltReady && Math.hypot(tx - joyU.x, ty - joyU.y) < 60) {
            joyU.id = t.identifier;
            joyU.active = true;
            joyU.cx = tx;
            joyU.cy = ty;
        } else {
            joyR.id = t.identifier;
            joyR.active = true;
            joyR.cx = tx;
            joyR.cy = ty;
        }
    }
});

window.addEventListener('touchmove', e => {
    for(let t of e.touches) {
        if(t.identifier === joyL.id) {
            joyL.cx = t.clientX;
            joyL.cy = t.clientY;
        }
        if(t.identifier === joyR.id) {
            joyR.cx = t.clientX;
            joyR.cy = t.clientY;
        }
        if(t.identifier === joyU.id) {
            joyU.cx = t.clientX;
            joyU.cy = t.clientY;
        }
    }
});

window.addEventListener('touchend', e => {
    for(let t of e.changedTouches) {
        if(t.identifier === joyL.id) joyL.active = false;
        
        if(t.identifier === joyR.id) {
            let dx = joyR.cx - joyR.x;
            let dy = joyR.cy - joyR.y;
            if(Math.hypot(dx, dy) > 10) attack(Math.atan2(dy, dx), false);
            joyR.active = false;
        }
        
        if(t.identifier === joyU.id) {
            let dx = joyU.cx - joyU.x;
            let dy = joyU.cy - joyU.y;
            attack(Math.atan2(dy, dx), true);
            joyU.active = false;
        }
    }
});

// Game Update Loop
function update() {
    if(!gameActive) return;
    
    // Ammo regeneration
    if (ammo < BRAWLERS[current].maxAmmo) {
        ammo += 1 / (BRAWLERS[current].reload / 16.6);
    }
    
    // Speed boost timer
    if(p.boostTimer > 0) {
        p.boostTimer--;
        if(p.boostTimer <= 0) p.speedMult = 1;
    }
    
    // Shield timer
    if(p.shield > 0) p.shield--;
    
    // Pin animations
    [activePin, enemyPin].forEach(pin => {
        if(pin.timer > 0) {
            pin.timer--;
            pin.scale += (pin.timer > 300 ? 1.2 : 1.0 - pin.scale) * 0.2;
        } else {
            pin.scale = 0;
        }
    });
    
    // Enemy AI
    if(enemyAI) {
        let d = Math.hypot(p.x - enemy.x, p.y - enemy.y);
        if(d > 160) {
            let a = Math.atan2(p.y - enemy.y, p.x - enemy.x);
            enemy.x += Math.cos(a) * 1.5;
            enemy.y += Math.sin(a) * 1.5;
        }
    }
    
    // Pip (projectile) logic
    if(pip.active) {
        if(joyL.active) {
            let dx = joyL.cx - joyL.x;
            let dy = joyL.cy - joyL.y;
            pip.angle = Math.atan2(dy, dx);
        }
        pip.x += Math.cos(pip.angle) * 7;
        pip.y += Math.sin(pip.angle) * 7;
        pip.life--;
        
        if(Math.hypot(pip.x - enemy.x, pip.y - enemy.y) < 40 || pip.life <= 0) {
            if(pip.life > 0) hitEnemy(3000, false);
            zones.push({
                x: pip.x,
                y: pip.y,
                r: 120,
                life: 20,
                type: 'boom'
            });
            pip.active = false;
        }
    } else if(joyL.active && !p.isFlying) {
        let dx = joyL.cx - joyL.x;
        let dy = joyL.cy - joyL.y;
        let dist = Math.hypot(dx, dy);
        if(dist > 5) {
            p.x += (dx / dist) * BRAWLERS[current].speed * p.speedMult;
            p.y += (dy / dist) * BRAWLERS[current].speed * p.speedMult;
        }
    }
    
    // Bullets update
    bullets.forEach((b, i) => {
        if(b.type === 'nani') {
            b.progress += 0.035;
            let ang = Math.atan2(b.ty - b.y, b.tx - b.x);
            let offX = Math.cos(ang + 1.57) * Math.sin(b.progress * Math.PI) * b.curve;
            let offY = Math.sin(ang + 1.57) * Math.sin(b.progress * Math.PI) * b.curve;
            b.x = p.x + (b.tx - p.x) * b.progress + offX;
            b.y = p.y + (b.ty - p.y) * b.progress + offY;
            if(b.progress >= 1) bullets.splice(i, 1);
        } else {
            b.x += b.vx;
            b.y += b.vy;
            
            if(--b.life <= 0) {
                if(b.special === 'gene_main') {
                    for(let j = -1; j <= 1; j++) {
                        spawnBullet(b.angle + j * 0.25, 12, 25, false, 5, 'gene_split');
                        bullets[bullets.length - 1].x = b.x;
                        bullets[bullets.length - 1].y = b.y;
                    }
                }
                bullets.splice(i, 1);
            }
            
            // Bounce physics
            if(b.special === 'bounce') {
                if(b.x < 0 || b.x > canvas.width) b.vx *= -1;
                if(b.y < 0 || b.y > canvas.height) b.vy *= -1;
            }
            if(b.special === 'bubble') {
                if(b.x < 0 || b.x > canvas.width) b.vx *= -1;
                if(b.y < 0 || b.y > canvas.height) b.vy *= -1;
            }
        }
        
        // Bullet-Enemy collision
        if(Math.hypot(b.x - enemy.x, b.y - enemy.y) < 30) {
            if(b.special === 'pull') {
                enemy.x = p.x;
                enemy.y = p.y;
            }
            if(b.special === 'poison') {
                let c = 0;
                let poi = setInterval(() => {
                    hitEnemy(150, false);
                    if(++c > 5) clearInterval(poi);
                }, 500);
            }
            if(b.special === 'energy') {
                hitEnemy(800, true);
            }
            hitEnemy(b.special === 'gene_split' ? 150 : 400, !b.isUlt);
            if(b.special !== 'bubble' && b.special !== 'bounce') bullets.splice(i, 1);
        }
    });
    
    // Zones (areas) update
    zones.forEach((z, i) => {
        if(z.type === 'gravity') {
            enemy.x += (z.x - enemy.x) * 0.1;
            enemy.y += (z.y - enemy.y) * 0.1;
            if(z.life === 1) hitEnemy(2000, false);
        }
        if(z.type === 'stun' && Math.hypot(enemy.x - z.x, enemy.y - z.y) < z.r) {
            hitEnemy(10, false);
        }
        if(z.type === 'mine' && Math.hypot(enemy.x - z.x, enemy.y - z.y) < z.r) {
            hitEnemy(2000, true);
            zones.splice(i, 1);
        }
        if(z.type === 'turret') {
            if(z.life % 30 === 0) {
                spawnBullet(Math.atan2(enemy.y - z.y, enemy.x - z.x), 10, 40);
            }
        }
        
        // Zone damage
        if(Math.hypot(enemy.x - z.x, enemy.y - z.y) < z.r) {
            hitEnemy(5, false);
        }
        
        if(--z.life <= 0) zones.splice(i, 1);
    });
    
    updateUI();
    draw();
    requestAnimationFrame(update);
}

// Drawing function
function draw() {
    ctx.fillStyle = "#2e7d32";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Attack preview
    if((joyR.active || joyU.active) && !pip.active) {
        let j = joyU.active ? joyU : joyR;
        let angle = Math.atan2(j.cy - j.y, j.cx - j.x);
        let ind = joyU.active ? BRAWLERS[current].ultType : BRAWLERS[current].type;
        ctx.fillStyle = joyU.active ? "rgba(255, 255, 0, 0.3)" : "rgba(255, 255, 255, 0.2)";
        
        if(ind === 'nani_aim' || ind === 'pip') {
            ctx.beginPath();
            ctx.arc(p.x + Math.cos(angle) * 320, p.y + Math.sin(angle) * 320, 40, 0, 7);
            ctx.fill();
        } else if(ind === 'gravity' || ind === 'throw' || ind === 'throw_triple') {
            ctx.beginPath();
            ctx.arc(p.x + Math.cos(angle) * 250, p.y + Math.sin(angle) * 250, 100, 0, 7);
            ctx.fill();
        } else if(ind === 'spread' || ind === 'spread_heavy') {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.arc(p.x, p.y, 220, angle - 0.5, angle + 0.5);
            ctx.lineTo(p.x, p.y);
            ctx.fill();
        } else {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(angle);
            ctx.fillRect(0, -20, 350, 40);
            ctx.restore();
        }
    }
    
    // Enemy
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, 30, 0, 7);
    ctx.fill();
    
    // Enemy HP bar
    ctx.fillStyle = "lime";
    ctx.fillRect(enemy.x - 40, enemy.y - 50, (enemy.hp / 30000) * 80, 8);
    
    // Pip
    if(pip.active) {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(pip.x, pip.y, 15, 0, 7);
        ctx.fill();
    }
    
    // Player
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(p.scale, p.scale);
    
    if(p.shield > 0) {
        ctx.strokeStyle = "#4caf50";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, 7);
        ctx.stroke();
    }
    
    if(p.boostTimer > 0) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = "yellow";
        ctx.strokeStyle = "yellow";
        ctx.strokeRect(-22, -22, 44, 44);
    }
    
    ctx.fillStyle = BRAWLERS[current].color;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, 7);
    ctx.fill();
    
    ctx.restore();
    
    // Pins
    drawPin(p.x, p.y, activePin);
    drawPin(enemy.x, enemy.y, enemyPin);
    
    // Bullets
    bullets.forEach(b => {
        ctx.fillStyle = b.special === 'poison' ? "#2ecc71" : b.isUlt ? "#ff00ff" : "white";
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size || 5, 0, 7);
        ctx.fill();
    });
    
    // Zones
    zones.forEach(z => {
        if(z.type === 'gravity') ctx.fillStyle = "rgba(0,0,0,0.6)";
        else if(z.type === 'mine') ctx.fillStyle = "rgba(255,0,0,0.5)";
        else if(z.type === 'turret') ctx.fillStyle = "rgba(255,87,34,0.6)";
        else ctx.fillStyle = "rgba(255,255,0,0.4)";
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.r, 0, 7);
        ctx.fill();
    });
    
    // Joysticks
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(joyL.x, joyL.y, 60, 0, 7);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(joyR.x, joyR.y, 60, 0, 7);
    ctx.fill();
    
    if(isUltReady) {
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(joyU.x, joyU.y, 50, 0, 7);
        ctx.fill();
    }
    
    ctx.globalAlpha = 1;
}