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
    combatTimers.clear();waves=[];swipes=[];hammer=null;damageNotes=[];attackFx=[];
}

    function attack(angle, isUltAction) {
        if (hammer && hammer.age<hammer.windup) return;
        if (!gameActive || p.out || p.isFlying || pip.active || (realm && isUltAction)) return;
        if(p.attachment && !p.attachment.ally)return;
        if(p.attachment?.ally && isUltAction){clearAttachment();return;}
        if(kickBall(p,angle)) return;
        if (isUltAction && isUltReady) {
            ultCharge = 0;
            sounds.ult.currentTime = 0;
            sounds.ult.play();
            useUltimate(angle);
        } else if (!isUltAction && ammo >= 1) {
            ammo -= 1;
            if(current!=='Frank') attackFx.push({x:p.x,y:p.y,angle,shape:combatShape(false),color:BRAWLERS[current].color,age:0});
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
                case 'Barley': spawnBarleyBottle(angle, combatShape(false).range, 'fire'); break;
                case 'Brock': spawnBullet(angle, 14, 60); break;
                case 'Dynamike': spawnBarleyBottle(angle, combatShape(false).range, 'boom'); break;
                case 'Tick': for(let i=-1; i<=1; i++) spawnBarleyBottle(angle+i*0.2, combatShape(false).range, 'mine'); break;
                case 'Bo': for(let i=-1; i<=1; i++) scheduleCombatAction(()=>spawnBullet(angle+i*0.1, 13, 45), i*100+100); break;
                case 'Jessie': spawnBullet(angle, 12, 55, false, 8, 'energy'); break;
                case 'Rico': spawnBullet(angle, 14, 60, false, 5, 'bounce'); break;
                case 'Frank': startHammer(angle,false);break;
                case 'Nani': spawnNaniProjectiles(angle); break;
                case 'Max': for(let i=0; i<4; i++) scheduleCombatAction(()=>spawnBullet(angle, 18, 35), i*50); break;
                case 'Crow': for(let i=-1; i<=1; i++) spawnBullet(angle+i*0.3, 14, 40, false, 4, 'poison'); break;
                case 'Tara': for(let i=-1; i<=1; i++) spawnBullet(angle+i*0.15, 13, 40); break;
                case 'Gene': spawnBullet(angle, 11, 25, false, 10, 'gene_main'); break; 
                case 'Bibi': for(const t of combatTargets()) if(inFan(t,angle,basicAim.Bibi)){
                    hitEnemy(1300,true,t);if(!t.safe){t.x+=Math.cos(angle)*60;t.y+=Math.sin(angle)*60;}
                }break;
                case 'Mortis': beginTravel(angle,basicAim.Mortis.range,12,'Mortis',basicAim.Mortis.radius);break;
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
            case 'Jessie': summon('turret',destination(angle,superAimData.Jessie.range)); break;
            case 'Bo':
                zones=zones.filter(z=>z.type!=='boMine');
                throws=throws.filter(t=>t.type!=='boMine');
                for(const spread of [-0.28,0,0.28]) spawnBarleyBottle(angle+spread,200,'boMine',true);
                break;
            case 'Frank': startHammer(angle,true);break;
            case 'Nani': pip.active = true; pip.x = p.x; pip.y = p.y; pip.angle = angle; pip.life = 600; break;
            case 'Tick': summon('head',{x:p.x,y:p.y});break;
            case 'Tara': zones.push({ x: p.x+Math.cos(angle)*250, y: p.y+Math.sin(angle)*250, r: 100, life: 60, type: 'gravity' }); break;
            case 'Gene': spawnBullet(angle, 18, 40, true, 12, 'pull'); break;
            case 'Bibi': bullets.push({ x:p.x, y:p.y, vx:Math.cos(angle)*10, vy:Math.sin(angle)*10, life:300, special:'bubble', isUlt:true, type:'normal', size:15 }); break;
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
            case 'Barley': for(let i=0; i<5; i++) spawnBarleyBottle(angle+(i-2)*0.3, combatShape(true).range, 'fire', true); break;
            case 'Dynamike': spawnBarleyBottle(angle,combatShape(true).range,'bigBoom',true);break;
        }
    }

    function spawnBullet(angle, speed, life, isUlt, size=5, special='', origin=p) {
        bullets.push({ x: origin.x, y: origin.y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, life, isUlt, size, originX:origin.x,originY:origin.y,type: 'normal', special, angle: angle });
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
            zones.push({x:t.tx,y:t.ty,type:t.type==='bigBoom'||t.type==='yarn'?'boom':t.type,isBig:t.type==='bigBoom',isUlt:t.isUlt,r:t.type==='yarn'?kitYarn.radius:t.type==='bigBoom'?140:t.type==='fire'?55:80,
                life:t.type==='mine'?150:t.type==='fire'?120:14});
            throws.splice(i,1);
        }
    }

    function dashEnd(angle) {
        return {x:Math.max(22,Math.min(tlbsWorld.width-22,p.x+Math.cos(angle)*mortisRange)),
            y:Math.max(22,Math.min(tlbsWorld.height-22,p.y+Math.sin(angle)*mortisRange))};
    }

    function hitEnemy(dmg, canCharge, target=enemy) {
        if(!inPlane(target) || target.spawnShield>0 || target.out || match.finished || match.nextRound) return;
        match.damage+=Math.min(target.hp,dmg);
        target.hp -= dmg;
        sounds.hit.currentTime = 0;
        sounds.hit.play();
        if(target.hp <= 0) {
            if(arena){if(!target.safe)match.kills++;objectiveDeath(target);return;}
            if(p.attachment?.target===target)clearAttachment();
            if(realm?.target===target) realm=null;
            recordElimination();
            target.hp = target.maxHp;
            if(target===enemy) enemy.x = tlbsWorld.width / 2;
            if(target===enemy) enemy.y = 150;
        }
        if(!realm && canCharge && ultCharge < 100) { ultCharge += BRAWLERS[current].ultChargeRate; }
    }

    function spawnNaniProjectiles(angle) {
        const dist = 320;
        const tx = p.x + Math.cos(angle) * dist;
        const ty = p.y + Math.sin(angle) * dist;
        [0, 45, -45].forEach(c => bullets.push({ x:p.x,y:p.y,originX:p.x,originY:p.y,tx,ty,progress: 0, curve: c, type: 'nani' }));
    }


function advanceSuperMotion(){
    const m=p.motion;
    if(!m) return;
    const progress=Math.min(1,++m.age/m.total);
    const eased=progress*progress*(3-2*progress);
    p.x=Math.max(22,Math.min(tlbsWorld.width-22,m.x+m.dx*eased));
    p.y=Math.max(22,Math.min(tlbsWorld.height-22,m.y+m.dy*eased));
    if(m.fighter==='El_Primo' || m.fighter==='Crow') p.scale=1+0.65*Math.sin(progress*Math.PI);
    if(['Kit','Edgar','Surge','Piper','Crow','El_Primo'].includes(m.fighter))p.altitude=58*Math.sin(progress*Math.PI);
    for(const target of combatTargets()) {
        if((m.fighter==='Colette' || m.fighter==='Mortis') && !m.hits.has(target) && dist(p,target)<=m.radius){
            m.hits.add(target);hitEnemy(m.fighter==='Mortis'?900:Math.round(target.maxHp*.16),m.fighter==='Mortis',target);
        }
        const slam=m.fighter==='El_Primo' && progress===1;
        if(!slam && m.fighter!=='Bull' && m.fighter!=='Darryl') continue;
        if(!m.hits.has(target) && Math.hypot(target.x-p.x,target.y-p.y)<(slam?120:50)){
            m.hits.add(target);hitEnemy(slam?1800:1000,false,target);
        }
    }
    if(progress===1){
        if(m.fighter==='Crow') for(let n=0;n<12;n++) spawnBullet(n*Math.PI/6,10,22,true,4,'poison');
        p.motion=null;p.isFlying=false;p.scale=1;p.altitude=0;landRosterMove(m);
    }
}

function angleTo(target){return Math.atan2(target.y-p.y,target.x-p.x);}
function beginTravel(angle,range,total,fighter,radius,target=null){
    const end=destination(angle,range);
    p.motion={fighter,x:p.x,y:p.y,dx:end.x-p.x,dy:end.y-p.y,total,age:0,hits:new Set(),radius,target};
    p.isFlying=true;
}
function clearAttachment(){
    if(p.attachment && !p.attachment.ally)p.attachment.target.stun=0;
    p.attachment=null;p.altitude=0;
}
function advanceAttachment(){
    for(const t of [enemy,...trainingTargets]) if(t.stun>0)t.stun--;
    const grip=p.attachment;
    if(!grip)return;
    const target=grip.target;
    if(current!=='Kit'||p.out||target.out||--grip.left<=0){clearAttachment();return;}
    p.x=target.x;p.y=target.y;
    if(grip.left%30===0){
        if(grip.ally)target.hp=Math.min(target.maxHp,target.hp+380);
        else hitEnemy(240,false,target);
    }
}
function landRosterMove(m){
    const targets=combatTargets();
    if(m.fighter==='Kit'){
        const allies=arena?.actors.filter(t=>t!==p && t.team===p.team && !t.out && inPlane(t)) || [];
        const target=[...targets.filter(t=>!t.safe),...allies].filter(t=>dist(t,p)<=m.radius).sort((a,b)=>dist(a,p)-dist(b,p))[0];
        if(!target)return;
        const ally=allies.includes(target);
        p.attachment={target,ally,left:ally?480:120};
        if(!ally){target.stun=120;hitEnemy(950,false,target);}
    }else if(m.fighter==='Colette' && !m.returning){
        const distance=Math.hypot(m.dx,m.dy);
        beginTravel(Math.atan2(-m.dy,-m.dx),distance,16,'Colette',m.radius);
        p.motion.returning=true;
    }else if(['Edgar','Surge','Fang','Buzz'].includes(m.fighter)){
        for(const t of targets) if(dist(t,p)<=m.radius){
            if(m.fighter==='Buzz' && !t.safe)t.stun=70;
            hitEnemy(1600,false,t);
        }
        if(m.fighter==='Fang'){
            const chained=m.chain || new Set();
            for(const t of targets)if(dist(t,p)<=m.radius)chained.add(t);
            const next=targets.filter(t=>!t.safe && !chained.has(t) && dist(p,t)<=160).sort((a,b)=>dist(p,a)-dist(p,b))[0];
            if(next && chained.size>0 && chained.size<4){
                chained.add(next);beginTravel(angleTo(next),dist(p,next),14,'Fang',m.radius);p.motion.chain=chained;
            }
        }
        if(m.fighter==='Surge'){
            p.surgeLevel=Math.min(4,(p.surgeLevel||1)+1);p.speedMult=1.25;p.boostTimer=0;
        }
    }
}
