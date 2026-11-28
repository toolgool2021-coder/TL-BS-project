const botDifficulties = {
    easy: {pace:.78, reload:1.25, lead:0, dodge:0},
    normal: {pace:1, reload:1, lead:.25, dodge:8},
    hard: {pace:1.12, reload:.85, lead:.65, dodge:14}
};

const botWeapons = {
    Shelly: {preferred:140, range:315, speed:8, life:41, damage:260, spread:[-.2,0,.2]},
    Colt: {preferred:255, range:410, speed:10, life:44, damage:270, spread:[0], burst:3},
    Brock: {preferred:300, range:450, speed:9, life:52, damage:820, spread:[0], blast:55},
    Jessie: {preferred:225, range:365, speed:9, life:43, damage:560, spread:[0]},
    Bull: {preferred:110, range:185, speed:9, life:23, damage:290, spread:[-.22,0,.22]}
};

function botDifficulty(){
    return botDifficulties[match.difficulty]||botDifficulties.normal;
}

function botWeapon(actor){
    return botWeapons[actor.fighter]||botWeapons.Colt;
}

function botLeadAngle(actor,target,weapon,difficulty){
    const distance=dist(actor,target);
    const flight=distance/weapon.speed*difficulty.lead;
    return Math.atan2(target.y+(target.botVy||0)*flight-actor.y,target.x+(target.botVx||0)*flight-actor.x);
}

function botFire(actor,target,special,weapon=botWeapon(actor),superMove=false){
    const difficulty=botDifficulty(),life=actor.botLife;
    const angle=botLeadAngle(actor,target,weapon,difficulty);
    const fire=()=>{
        if(match.finished||actor.out||actor.botLife!==life||actor.stun>0||!visibleTo(actor,target))return;
        for(const offset of weapon.spread){
            spawnBullet(angle+offset,weapon.speed,weapon.life,superMove,superMove?8:6,special,actor);
            Object.assign(bullets.at(-1),{owner:actor,damage:weapon.damage,blast:weapon.blast,slow:weapon.slow,botLife:life});
        }
    };
    fire();
    for(let i=1;i<(weapon.burst||1);i++)scheduleCombatAction(fire,i*95);
    return Math.round(BRAWLERS[actor.fighter||'Colt'].reload*.055*difficulty.reload);
}

function botDodge(actor,speed){
    const horizon=botDifficulty().dodge;
    if(!horizon)return false;
    let imminent=null, impact=horizon+1;
    for(const projectile of bullets){
        if(projectile.owner===actor||projectile.special==='hostile')continue;
        const owner=projectile.owner||p;
        if(owner===actor||(arena&&owner.team===actor.team)||inPlane(owner)!==inPlane(actor))continue;
        const vx=projectile.vx,vy=projectile.vy;
        const speedSquared=vx*vx+vy*vy;
        if(!(speedSquared>0))continue;
        const dx=actor.x-projectile.x,dy=actor.y-projectile.y;
        if(Math.abs(dx)>300||Math.abs(dy)>300)continue;
        const t=(dx*vx+dy*vy)/speedSquared;
        if(t<=0||t>=impact||t>=projectile.life)continue;
        if(Math.hypot(dx-vx*t,dy-vy*t)>28+(projectile.size||0))continue;
        if(!visibleTo(projectile,actor))continue;
        imminent=projectile;impact=t;
    }
    if(!imminent)return false;
    const heading=Math.atan2(imminent.vy,imminent.vx);
    const side=Math.sign(imminent.vx*(actor.y-imminent.y)-imminent.vy*(actor.x-imminent.x))||1;
    for(const direction of [side,-side]){
        const angle=heading+direction*Math.PI/2;
        const dx=Math.cos(angle)*speed,dy=Math.sin(angle)*speed;
        const x=actor.x+dx,y=actor.y+dy;
        if(x<22||x>tlbsWorld.width-22||y<22||y>tlbsWorld.height-22||insideCover(x,y,22))continue;
        moveOnPitch(actor,dx,dy);
        return true;
    }
    return false;
}

function botRocketImpact(projectile){
    if(!projectile.blast)return;
    zones.push({x:projectile.x,y:projectile.y,r:projectile.blast,type:'blast',life:12});
    const targets=arena?[...arena.actors,...arena.safes]:[p];
    for(const target of targets){
        if(target.out||target===projectile.owner||(arena&&target.team===projectile.owner?.team))continue;
        if(inPlane(target)!==inPlane(projectile.owner)||dist(target,projectile)>projectile.blast)continue;
        if(!visibleTo(projectile,target))continue;
        botDealDamage(projectile,target,820);
    }
}

const botSupers = {
    Shelly: {range:200, speed:12, life:21, damage:360, spread:[-.36,-.18,0,.18,.36], slow:90},
    Colt: {range:360, speed:14, life:33, damage:330, spread:[0], burst:6},
    Brock: {range:380, speed:11, life:39, damage:590, spread:[-.2,0,.2], blast:70},
    Jessie: {range:330, speed:11, life:36, damage:660, spread:[-.13,0,.13], slow:90},
    Bull: {range:140, speed:13, life:13, damage:470, spread:[-.24,-.12,0,.12,.24], slow:75}
};

function resetBotAbility(actor,newMatch=false){
    actor.botLife=(actor.botLife||0)+1;
    actor.botCharge=0;
    actor.botShield=0;
    actor.botFlash=0;
    actor.nav=null;
    if(newMatch){actor.botGadgetUses=2;actor.botGadgetCooldown=0;}
}

function tickBotAbility(actor){
    if(actor.botShield>0)actor.botShield--;
    if(actor.botFlash>0)actor.botFlash--;
    if(actor.botGadgetCooldown>0)actor.botGadgetCooldown--;
}

function botTryAbility(actor,target,special,cooldown){
    if(match.difficulty==='easy'||!target||actor.out||actor.stun>0||arena?.carrier===actor||target.spawnShield||target.altitude)return false;
    const distance=dist(actor,target);
    const weapon=botSupers[actor.fighter];
    if(actor.botCharge>=100&&weapon&&cooldown<=0&&distance<weapon.range&&visibleTo(actor,target)){
        actor.botCharge=0;
        actor.botFlash=30;
        botFire(actor,target,special,weapon,true);
        return true;
    }
    if(actor.botGadgetUses>0&&!actor.botGadgetCooldown&&actor.hp<=actor.maxHp*.38&&distance<225&&visibleTo(actor,target)){
        actor.botGadgetUses--;
        actor.botGadgetCooldown=360;
        actor.botFlash=20;
        if(actor.fighter==='Bull'||actor.fighter==='Shelly')actor.botShield=100;
        else actor.hp=Math.min(actor.maxHp,actor.hp+Math.round(actor.maxHp*.12));
    }
    return false;
}

function botDealDamage(projectile,target,fallbackDamage){
    if(target.out||target.spawnShield||target.altitude||match.finished||match.nextRound)return;
    const source=projectile.owner||enemy;
    const damage=projectile.damage||fallbackDamage;
    if(projectile.botLife===source.botLife&&!projectile.isUlt&&source.botCharge!==undefined&&!source.out){
        source.botCharge=Math.min(100,source.botCharge+Math.max(6,Math.round(damage/30)));
    }
    if(projectile.slow&&!target.safe)target.slow=Math.max(target.slow||0,projectile.slow);
    if(arena)objectiveHit(target,target===p?crowIncomingDamage(source,damage):damage);
    else receiveHit(source,damage);
}
