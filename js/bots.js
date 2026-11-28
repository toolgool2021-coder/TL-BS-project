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

function botFire(actor,target,special){
    const difficulty=botDifficulty(),weapon=botWeapon(actor);
    const angle=botLeadAngle(actor,target,weapon,difficulty);
    const fire=()=>{
        if(match.finished||actor.out||actor.stun>0||!visibleTo(actor,target))return;
        for(const offset of weapon.spread){
            spawnBullet(angle+offset,weapon.speed,weapon.life,false,6,special,actor);
            Object.assign(bullets.at(-1),{owner:actor,damage:weapon.damage,blast:weapon.blast});
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
    const targets=arena?.actors||[p];
    for(const target of targets){
        if(target.out||target===projectile.owner||(arena&&target.team===projectile.owner?.team))continue;
        if(inPlane(target)!==inPlane(projectile.owner)||dist(target,projectile)>projectile.blast)continue;
        if(!visibleTo(projectile,target))continue;
        if(arena)objectiveHit(target,target===p?crowIncomingDamage(projectile.owner,projectile.damage):projectile.damage);
        else receiveHit(projectile.owner,projectile.damage);
    }
}
