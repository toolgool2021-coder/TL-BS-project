const combatTimers = new Set();

function scheduleCombatAction(action, delay) {
    const timer = setTimeout(() => {
        combatTimers.delete(timer);
        if (gameActive) action();
    }, delay);
    combatTimers.add(timer);
}

function clearCombatTimers() {
    for (const timer of combatTimers) clearTimeout(timer);
    combatTimers.clear();
}

    function attack(angle, isUltAction) {
        if (p.isFlying || pip.active) return;
        if (isUltAction && isUltReady) {
            ultCharge = 0;
            sounds.ult.currentTime = 0;
            sounds.ult.play();
            useUltimate(angle);
        } else if (!isUltAction && ammo >= 1) {
            ammo -= 1;
            sounds.shoot.currentTime = 0;
            sounds.shoot.play();
            const b = BRAWLERS[current];
            switch(current) {
                default: if(BRAWLERS[current].shot) rosterAttack(angle); break;
                case 'Shelly': for(let i=-1; i<=1; i++) spawnBullet(angle+i*0.2, 12, 35); break;
                case 'Bull': for(let i=-2; i<=2; i++) spawnBullet(angle+i*0.15, 13, 25); break;
                case 'Colt': for(let i=0; i<5; i++) scheduleCombatAction(()=>spawnBullet(angle, 15, 45), i*80); break;
                case 'El_Primo': 
                case 'Rosa': for(let i=0; i<3; i++) scheduleCombatAction(()=>spawnBullet(angle, 10, 8), i*80); break;
                case 'Barley': spawnBarleyBottle(angle, 200, 'fire'); break;
                case 'Brock': spawnBullet(angle, 14, 60); break;
                case 'Dynamike': spawnBarleyBottle(angle, 250, 'boom'); break;
                case 'Tick': for(let i=-1; i<=1; i++) spawnBarleyBottle(angle+i*0.2, 220, 'mine'); break;
                case 'Bo': for(let i=-1; i<=1; i++) scheduleCombatAction(()=>spawnBullet(angle+i*0.1, 13, 45), i*100+100); break;
                case 'Jessie': spawnBullet(angle, 12, 55, false, 8, 'energy'); break;
                case 'Rico': spawnBullet(angle, 14, 60, false, 5, 'bounce'); break;
                case 'Frank': spawnBullet(angle, 10, 20, false, 15, 'heavy'); break;
                case 'Nani': spawnNaniProjectiles(angle); break;
                case 'Max': for(let i=0; i<4; i++) scheduleCombatAction(()=>spawnBullet(angle, 18, 35), i*50); break;
                case 'Crow': for(let i=-1; i<=1; i++) spawnBullet(angle+i*0.3, 14, 40, false, 4, 'poison'); break;
                case 'Tara': for(let i=-1; i<=1; i++) spawnBullet(angle+i*0.15, 13, 40); break;
                case 'Gene': spawnBullet(angle, 11, 25, false, 10, 'gene_main'); break; 
                case 'Bibi': if(Math.hypot(p.x-enemy.x, p.y-enemy.y)<130) { 
                    let diff = Math.atan2(enemy.y-p.y, enemy.x-p.x) - angle;
                    while(diff > Math.PI) diff -= Math.PI*2; while(diff < -Math.PI) diff += Math.PI*2;
                    if(Math.abs(diff) < 0.6) { hitEnemy(1300, true); enemy.x += Math.cos(angle)*80; enemy.y += Math.sin(angle)*80; }
                } break;
                case 'Mortis': {
                    Object.assign(p,dashEnd(angle));
                    for(const t of [enemy,...trainingTargets]) if(Math.hypot(p.x-t.x,p.y-t.y)<60) hitEnemy(900,true,t);
                    break;
                }
                case 'Stu': spawnBullet(angle, 16, 30); scheduleCombatAction(()=>spawnBullet(angle, 16, 30), 100); break;
                case 'Darryl': for(let i=-2; i<=2; i++) spawnBullet(angle+i*0.15, 13, 25); break;
            }
        }
        updateUI();
    }

    function useUltimate(angle) {
        if(BRAWLERS[current].shot) { rosterSuper(angle); return; }
        switch(current) {
            case 'Shelly': for(let i=-4; i<=4; i++) spawnBullet(angle+i*0.15, 16, 40, true); break;
            case 'Colt': for(let i=0; i<12; i++) scheduleCombatAction(()=>spawnBullet(angle, 20, 60, true), i*50); break;
            case 'Max': p.speedMult = 1.6; p.boostTimer = 240; break;
            case 'Rosa': p.shield = 180; break; 
            case 'Jessie': zones.push({x: p.x+Math.cos(angle)*150, y: p.y+Math.sin(angle)*150, r:60, life:300, type:'turret'}); break;
            case 'Bo': for(let i=-1; i<=1; i++) { let tx=p.x+Math.cos(angle+i*0.4)*200, ty=p.y+Math.sin(angle+i*0.4)*200; zones.push({x:tx, y:ty, r:50, life:500, type:'mine'}); } break;
            case 'Frank': zones.push({x: p.x+Math.cos(angle)*180, y: p.y+Math.sin(angle)*180, r:150, life:30, type:'stun'}); break;
            case 'Nani': pip.active = true; pip.x = p.x; pip.y = p.y; pip.angle = angle; pip.life = 600; break;
            case 'Tick': pip.active = true; pip.x = p.x; pip.y = p.y; pip.angle = angle; pip.life = 400; break;
            case 'Tara': zones.push({ x: p.x+Math.cos(angle)*250, y: p.y+Math.sin(angle)*250, r: 100, life: 60, type: 'gravity' }); break;
            case 'Gene': spawnBullet(angle, 18, 40, true, 12, 'pull'); break;
            case 'Bibi': bullets.push({ x:p.x, y:p.y, vx:Math.cos(angle)*10, vy:Math.sin(angle)*10, life:300, type:'bubble', size:15 }); break;
            case 'Stu': p.x += Math.cos(angle)*200; p.y += Math.sin(angle)*200; break;
            case 'Bull':
            case 'Darryl': p.isFlying=true; let step=0; let f=setInterval(()=>{p.x += Math.cos(angle)*12; p.y += Math.sin(angle)*12; if(Math.hypot(p.x-enemy.x,p.y-enemy.y)<50) hitEnemy(1000,false); if(++step>25){clearInterval(f); p.isFlying=false;}}, 20); break;
            case 'El_Primo': p.isFlying=true; p.scale=2.2; 
                let jx=p.x+Math.cos(angle)*250, jy=p.y+Math.sin(angle)*250;
                let c=0; let fly=setInterval(()=>{p.x+=(jx-p.x)/5; p.y+=(jy-p.y)/5; if(++c>=20){clearInterval(fly); p.isFlying=false; p.scale=1; if(Math.hypot(p.x-enemy.x, p.y-enemy.y)<120) hitEnemy(1800, false);}}, 25); break;
            case 'Barley': for(let i=0; i<5; i++) spawnBarleyBottle(angle+(i-2)*0.3, 250, 'fire', true); break;
            case 'Dynamike': zones.push({x: p.x+Math.cos(angle)*250, y: p.y+Math.sin(angle)*250, r:140, life:60, type:'boom', isBig:true, isUlt:true}); break;
        }
    }

    function spawnBullet(angle, speed, life, isUlt, size=5, special='', origin=p) {
        bullets.push({ x: origin.x, y: origin.y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, life, isUlt, size, type: 'normal', special, angle: angle });
    }

    function spawnBarleyBottle(angle, dist, type, isUlt) { 
        let tx=p.x+Math.cos(angle)*dist, ty=p.y+Math.sin(angle)*dist; 
        throws.push({x:p.x,y:p.y,tx,ty,type,isUlt,age:0});
    }

    function advanceThrows() {
        for(let i=throws.length-1;i>=0;i--) {
            const t=throws[i];
            if(++t.age<30) continue;
            zones.push({x:t.tx,y:t.ty,type:t.type,isUlt:t.isUlt,r:t.type==='fire'?55:80,
                life:t.type==='mine'?150:t.type==='fire'?120:14});
            throws.splice(i,1);
        }
    }

    function dashEnd(angle) {
        return {x:Math.max(22,Math.min(canvas.width-22,p.x+Math.cos(angle)*mortisRange)),
            y:Math.max(22,Math.min(canvas.height-22,p.y+Math.sin(angle)*mortisRange))};
    }

    function hitEnemy(dmg, canCharge, target=enemy) {
        if(match.finished) return;
        match.damage+=Math.min(target.hp,dmg);
        target.hp -= dmg;
        sounds.hit.currentTime = 0;
        sounds.hit.play();
        if(target.hp <= 0) {
            recordElimination();
            target.hp = target.maxHp;
            if(target===enemy) enemy.x = canvas.width / 2;
            if(target===enemy) enemy.y = 150;
        }
        if(canCharge && ultCharge < 100) { ultCharge += BRAWLERS[current].ultChargeRate; }
    }

    function spawnNaniProjectiles(angle) {
        const dist = 320;
        const tx = p.x + Math.cos(angle) * dist;
        const ty = p.y + Math.sin(angle) * dist;
        [0, 45, -45].forEach(c => bullets.push({ x: p.x, y: p.y, tx, ty, progress: 0, curve: c, type: 'nani' }));
    }

