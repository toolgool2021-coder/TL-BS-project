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
        superFx={x:p.x,y:p.y,fighter:current,age:0};
        if(BRAWLERS[current].shot) { rosterSuper(angle); return; }
        switch(current) {
            case 'Shelly': for(let i=-4; i<=4; i++) spawnBullet(angle+i*0.15, 16, 40, true); break;
            case 'Colt': for(let i=0; i<12; i++) scheduleCombatAction(()=>spawnBullet(angle, 20, 60, true), i*50); break;
            case 'Max': p.speedMult = 1.6; p.boostTimer = 240; break;
            case 'Rosa': p.shield = 180; break; 
            case 'Jessie': zones.push({x: p.x+Math.cos(angle)*150, y: p.y+Math.sin(angle)*150, r:60, life:300, type:'turret'}); break;
            case 'Bo':
                zones=zones.filter(z=>z.type!=='boMine');
                throws=throws.filter(t=>t.type!=='boMine');
                for(const spread of [-0.28,0,0.28]) spawnBarleyBottle(angle+spread,200,'boMine',true);
                break;
            case 'Frank': zones.push({x: p.x+Math.cos(angle)*180, y: p.y+Math.sin(angle)*180, r:150, life:30, type:'stun'}); break;
            case 'Nani': pip.active = true; pip.x = p.x; pip.y = p.y; pip.angle = angle; pip.life = 600; break;
            case 'Tick': pip.active = true; pip.x = p.x; pip.y = p.y; pip.angle = angle; pip.life = 400; break;
            case 'Tara': zones.push({ x: p.x+Math.cos(angle)*250, y: p.y+Math.sin(angle)*250, r: 100, life: 60, type: 'gravity' }); break;
            case 'Gene': spawnBullet(angle, 18, 40, true, 12, 'pull'); break;
            case 'Bibi': bullets.push({ x:p.x, y:p.y, vx:Math.cos(angle)*10, vy:Math.sin(angle)*10, life:300, type:'bubble', size:15 }); break;
            case 'Mortis': spawnBullet(angle,12,48,true,14,'bats');break;
            case 'Rico':
                for(let n=0;n<9;n++) scheduleCombatAction(()=>spawnBullet(angle,15,60,true,5,'bounce'),n*55);
                break;
            case 'Brock':
                for(let n=0;n<7;n++) scheduleCombatAction(()=>spawnBarleyBottle(angle+Math.sin(n*2)*0.26,240+Math.cos(n)*35,'boom',true),n*90);
                break;
            case 'Crow': case 'Stu': case 'Bull': case 'Darryl': case 'El_Primo': {
                const travel={Crow:[225,26],Stu:[200,13],Bull:[312,32],Darryl:[312,28],El_Primo:[250,30]};
                const [distance,total]=travel[current];
                p.motion={fighter:current,x:p.x,y:p.y,dx:Math.cos(angle)*distance,dy:Math.sin(angle)*distance,total,age:0,hits:new Set()};
                p.isFlying=true;
                if(current==='Crow') for(let n=0;n<12;n++) spawnBullet(n*Math.PI/6,10,22,true,4,'poison');
                break;
            }
            case 'Barley': for(let i=0; i<5; i++) spawnBarleyBottle(angle+(i-2)*0.3, 250, 'fire', true); break;
            case 'Dynamike': spawnBarleyBottle(angle,250,'bigBoom',true);break;
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
            if(t.type==='boMine') {
                zones.push({x:t.tx,y:t.ty,r:58,type:'boMine',arm:30,fuse:0,life:Infinity});
                throws.splice(i,1);continue;
            }
            zones.push({x:t.tx,y:t.ty,type:t.type==='bigBoom'?'boom':t.type,isBig:t.type==='bigBoom',isUlt:t.isUlt,r:t.type==='bigBoom'?140:t.type==='fire'?55:80,
                life:t.type==='mine'?150:t.type==='fire'?120:14});
            throws.splice(i,1);
        }
    }

    function dashEnd(angle) {
        return {x:Math.max(22,Math.min(canvas.width-22,p.x+Math.cos(angle)*mortisRange)),
            y:Math.max(22,Math.min(canvas.height-22,p.y+Math.sin(angle)*mortisRange))};
    }

    function hitEnemy(dmg, canCharge, target=enemy) {
        if(match.finished || match.nextRound) return;
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


function advanceSuperMotion(){
    const m=p.motion;
    if(!m) return;
    const progress=Math.min(1,++m.age/m.total);
    const eased=progress*progress*(3-2*progress);
    p.x=Math.max(22,Math.min(canvas.width-22,m.x+m.dx*eased));
    p.y=Math.max(22,Math.min(canvas.height-22,m.y+m.dy*eased));
    if(m.fighter==='El_Primo' || m.fighter==='Crow') p.scale=1+0.65*Math.sin(progress*Math.PI);
    for(const target of [enemy,...trainingTargets]) {
        const slam=m.fighter==='El_Primo' && progress===1;
        if(!slam && m.fighter!=='Bull' && m.fighter!=='Darryl') continue;
        if(!m.hits.has(target) && Math.hypot(target.x-p.x,target.y-p.y)<(slam?120:50)){
            m.hits.add(target);hitEnemy(slam?1800:1000,false,target);
        }
    }
    if(progress===1){
        if(m.fighter==='Crow') for(let n=0;n<12;n++) spawnBullet(n*Math.PI/6,10,22,true,4,'poison');
        p.motion=null;p.isFlying=false;p.scale=1;
    }
}
