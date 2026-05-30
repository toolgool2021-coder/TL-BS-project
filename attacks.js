// Attack system for brawlers

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
            case 'Shelly': 
                for(let i=-1; i<=1; i++) spawnBullet(angle+i*0.2, 12, 35); 
                break;
            
            case 'Bull': 
                for(let i=-2; i<=2; i++) spawnBullet(angle+i*0.15, 13, 25); 
                break;
            
            case 'Colt': 
                for(let i=0; i<5; i++) setTimeout(()=>spawnBullet(angle, 15, 45), i*80); 
                break;
            
            case 'El_Primo': 
            case 'Rosa': 
                for(let i=0; i<3; i++) setTimeout(()=>spawnBullet(angle, 10, 8), i*80); 
                break;
            
            case 'Barley': 
                spawnBarleyBottle(angle, 200, 'fire'); 
                break;
            
            case 'Brock': 
                spawnBullet(angle, 14, 60); 
                break;
            
            case 'Dynamike': 
                spawnBarleyBottle(angle, 250, 'boom'); 
                break;
            
            case 'Tick': 
                for(let i=-1; i<=1; i++) spawnBarleyBottle(angle+i*0.2, 220, 'mine'); 
                break;
            
            case 'Bo': 
                for(let i=-1; i<=1; i++) setTimeout(()=>spawnBullet(angle+i*0.1, 13, 45), i*100+100); 
                break;
            
            case 'Jessie': 
                spawnBullet(angle, 12, 55, false, 8, 'energy'); 
                break;
            
            case 'Rico': 
                spawnBullet(angle, 14, 60, false, 5, 'bounce'); 
                break;
            
            case 'Frank': 
                spawnBullet(angle, 10, 20, false, 15, 'heavy'); 
                break;
            
            case 'Nani': 
                spawnNaniProjectiles(angle); 
                break;
            
            case 'Max': 
                for(let i=0; i<4; i++) setTimeout(()=>spawnBullet(angle, 18, 35), i*50); 
                break;
            
            case 'Crow': 
                for(let i=-1; i<=1; i++) spawnBullet(angle+i*0.3, 14, 40, false, 4, 'poison'); 
                break;
            
            case 'Tara': 
                for(let i=-1; i<=1; i++) spawnBullet(angle+i*0.15, 13, 40); 
                break;
            
            case 'Gene': 
                spawnBullet(angle, 11, 25, false, 10, 'gene_main'); 
                break;
            
            case 'Bibi': 
                if(Math.hypot(p.x-enemy.x, p.y-enemy.y)<130) {
                    let diff = Math.atan2(enemy.y-p.y, enemy.x-p.x) - angle;
                    while(diff > Math.PI) diff -= Math.PI*2; 
                    while(diff < -Math.PI) diff += Math.PI*2;
                    if(Math.abs(diff) < 0.6) {
                        hitEnemy(1300, true);
                        enemy.x += Math.cos(angle)*80;
                        enemy.y += Math.sin(angle)*80;
                    }
                }
                break;
            
            case 'Mortis': 
                p.x += Math.cos(angle)*130;
                p.y += Math.sin(angle)*130;
                if(Math.hypot(p.x-enemy.x, p.y-enemy.y)<60) hitEnemy(900, true);
                break;
            
            case 'Stu': 
                spawnBullet(angle, 16, 30);
                setTimeout(()=>spawnBullet(angle, 16, 30), 100);
                break;
            
            case 'Darryl': 
                for(let i=-2; i<=2; i++) spawnBullet(angle+i*0.15, 13, 25);
                break;
        }
    }
    updateUI();
}

function spawnBullet(angle, speed, life, isUlt, size=5, special='') {
    bullets.push({
        x: p.x,
        y: p.y,
        vx: Math.cos(angle)*speed,
        vy: Math.sin(angle)*speed,
        life,
        isUlt,
        size,
        type: 'normal',
        special,
        angle: angle
    });
}

function spawnBarleyBottle(angle, dist, type, isUlt) {
    let tx = p.x + Math.cos(angle)*dist;
    let ty = p.y + Math.sin(angle)*dist;
    setTimeout(() => {
        zones.push({
            x: tx,
            y: ty,
            r: type === 'fire' ? 55 : 80,
            life: type === 'fire' ? 120 : 40,
            type,
            isUlt
        });
    }, 500);
}

function spawnNaniProjectiles(angle) {
    const dist = 320;
    const tx = p.x + Math.cos(angle) * dist;
    const ty = p.y + Math.sin(angle) * dist;
    [0, 45, -45].forEach(c => {
        bullets.push({
            x: p.x,
            y: p.y,
            tx,
            ty,
            progress: 0,
            curve: c,
            type: 'nani'
        });
    });
}

function hitEnemy(dmg, canCharge) {
    enemy.hp -= dmg;
    sounds.hit.currentTime = 0;
    sounds.hit.play();
    if(enemy.hp <= 0) {
        enemy.hp = enemy.maxHp;
        enemy.x = canvas.width / 2;
        enemy.y = 150;
    }
    if(canCharge && ultCharge < 100) {
        ultCharge += BRAWLERS[current].ultChargeRate;
    }
}