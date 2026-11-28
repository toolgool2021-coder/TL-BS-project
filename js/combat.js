function tlbsDrawWeapon(f,u){
 const c=ctx;const kind=({Piper:'umbrella',Colt:'dual',Shelly:'gun',Bull:'gun',Darryl:'dual',Brock:'rocket',Bibi:'bat',Mortis:'shovel',Dynamike:'sticks',Barley:'bottle',Crow:'daggers',Bo:'bow',Jessie:'gun',Rico:'gun',Max:'gun',Chester:'bells',Griff:'register',Bonnie:'rocket',Bea:'gun',Gale:'gun',Nani:'orb',Spike:'orb',Tick:'orb',Tara:'cards',Gene:'lamp',Poco:'guitar',Pam:'gun',Leon:'daggers',Sandy:'orb',Colette:'book',Emz:'spray',Surge:'gun',Fang:'fist',Buzz:'fist',Cordelius:'orb',Kit:'fist',Edgar:'fist',Rosa:'fist',El_Primo:'fist',Stu:'gun',Nita:'fist'})[f.fighter];if(!kind)return false;
 c.globalAlpha=Math.min(1,(1-u)*4);c.strokeStyle='#202333';c.lineWidth=2.5;c.lineJoin='round';const recoil=Math.sin(u*Math.PI*3)*4*(1-u);c.translate(18-recoil,0);
 const rect=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);c.strokeRect(x,y,w,h);};
 const oval=(x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill();c.stroke();};
 const gun=(y)=>{rect(0,y-5,29,10,'#667386');rect(20,y-4,15,8,'#303746');rect(3,y+4,8,9,f.color);};
 if(kind==='umbrella'){rect(0,-2,43,4,'#d8b778');c.fillStyle='#f3a9cf';c.beginPath();c.moveTo(10,-13);c.quadraticCurveTo(34,-9,43,0);c.quadraticCurveTo(34,9,10,13);c.closePath();c.fill();c.stroke();oval(43,0,3,3,'#f4e5bd');}
 else if(kind==='register'){rect(0,-12,27,24,'#d8ad59');rect(4,-9,17,8,'#354c50');rect(4,3,17,6,'#8c6536');oval(32,0,6,6,'#ffd66c');}
 else if(kind==='dual'){gun(-11);gun(11);}else if(kind==='gun'){gun(0);}else if(kind==='rocket'){rect(0,-9,37,18,'#54657a');oval(36,0,5,8,'#252b35');}
 else if(kind==='bat'||kind==='shovel'){c.rotate(-1.1+u*2.2);rect(0,-3,38,6,'#bd8b5b');if(kind==='bat')oval(30,0,19,7,'#dfb68a');else oval(39,0,13,10,'#8d9ba9');}
 else if(kind==='sticks'){c.rotate(-.7+u*1.4);for(const y of [-5,5]){rect(3,y-4,24,8,'#e55b51');rect(26,y-1,5,2,'#e9cb76');}}
 else if(kind==='bottle'||kind==='spray'){oval(15,0,14,8,f.color);rect(24,-4,9,8,'#dce3ea');}
 else if(kind==='daggers'){for(const y of [-9,9]){rect(0,y-3,9,6,'#805e43');c.fillStyle='#d5e2ec';c.beginPath();c.moveTo(9,y-5);c.lineTo(32,y);c.lineTo(9,y+5);c.closePath();c.fill();c.stroke();}}
 else if(kind==='bow'){c.beginPath();c.arc(0,0,23,-1.2,1.2);c.strokeStyle='#c69a59';c.lineWidth=5;c.stroke();c.strokeStyle='#eee';c.lineWidth=1.5;c.beginPath();c.moveTo(8,-21);c.lineTo(8,21);c.stroke();}
 else if(kind==='bells'){for(const y of [-9,9]){oval(16,y,9,8,'#eac05b');oval(23,y,3,3,'#78562e');}}
 else if(kind==='cards'||kind==='book'){rect(4,-10,22,20,f.color);rect(9,-6,12,12,'#f4e2b6');}
 else if(kind==='guitar'){oval(9,0,15,11,'#d7a75e');rect(15,-3,24,6,'#805e43');}
 else if(kind==='lamp'){oval(14,0,13,9,'#e9bd58');rect(23,-3,12,6,'#e9bd58');}
 else if(kind==='fist'){for(const y of [-10,10])oval(8+Math.sin(u*Math.PI)*17,y,10,9,f.color);}
 else {oval(14,0,12,12,f.color);oval(18,-4,4,4,'#f4f5ff');}
 return true;
}
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
    combatTimers.clear();waves=[];swipes=[];hammer=null;damageNotes=[];attackFx=[];tlbsHitEffects.length=0;
}

    function attack(angle, isUltAction, power=null) {
        window.tlbsAttackPower=power;
        try { return performAttack(angle,isUltAction); }
        finally {window.tlbsAttackPower=null;}
    }
    function performAttack(angle,isUltAction) {
        if(p.stun>0)return;
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
            if(current!=='Frank') attackFx.push({x:p.x,y:p.y,angle,shape:combatShape(false),color:BRAWLERS[current].color,fighter:current,age:0});
            sounds.shoot.currentTime = 0;
            sounds.shoot.play();
            const b = BRAWLERS[current];
            switch(current) {
                default: if(BRAWLERS[current].shot) rosterAttack(angle); break;
                case 'Shelly': {
                    const spread=p.shellyFocus?.10:.2,life=p.shellyFocus?46:35;
                    for(let i=-1;i<=1;i++){
                        spawnBullet(angle+i*spread,12,life);
                        bullets.at(-1).shellyClose=p.passiveChoice==='1';
                    }
                    p.shellyFocus=false;
                    break;
                }
                case 'Bull': for(let i=-2; i<=2; i++) spawnBullet(angle+i*0.15, 13, 25); break;
                case 'Colt': {
                    const count=p.coltExtra?7:5;
                    const interval=p.passiveChoice==='0'?60:80;
                    const life=p.passiveChoice==='1'?52:45;
                    p.coltExtra=false;
                    for(let i=0;i<count;i++)scheduleCombatAction(()=>spawnBullet(angle,15,life),i*interval);
                    break;
                }
                case 'El_Primo':
                case 'Rosa': {
                    const damage=current==='Rosa'&&p.shield>0&&p.passiveChoice==='1'?520:400;
                    const primoSnare=current==='El_Primo'&&p.primoSnare;
                    if(primoSnare)p.primoSnare=false;
                    for(let i=0;i<3;i++)scheduleCombatAction(()=>{
                        spawnBullet(angle,10,8);
                        Object.assign(bullets.at(-1),{damage,primoSnare});
                    },i*80);
                    break;
                }
                case 'Barley': spawnBarleyBottle(angle, combatShape(false).range, 'fire'); break;
                case 'Brock': {
                    const fast=p.passiveChoice==='0';
                    spawnBullet(angle,fast?17.5:14,fast?48:60,false,p.brockHeavy?9:5);
                    if(p.brockHeavy)bullets.at(-1).damage=760;
                    p.brockHeavy=false;
                    break;
                }
                case 'Dynamike': spawnBarleyBottle(angle, combatShape(false).range, 'boom'); break;
                case 'Tick': {
                    const shape=combatShape(false);
                    for(const offset of shape.offsets)spawnBarleyBottle(angle+offset,shape.range,'mine');
                    p.tickSpread=false;
                    break;
                }
                case 'Bo': {
                    const bind=p.boBind;
                    p.boBind=false;
                    for(let i=-1;i<=1;i++)scheduleCombatAction(()=>{
                        spawnBullet(angle+i*.1,13,45);
                        bullets.at(-1).boBind=bind;
                    },i*100+100);
                    break;
                }
                case 'Jessie':
                    spawnBullet(angle,12,55,false,8,'energy');
                    bullets.at(-1).longBounce=p.passiveChoice==='0';
                    break;
                case 'Rico':
                    spawnBullet(angle,14,60,false,5,'bounce');
                    Object.assign(bullets.at(-1),{ricoBoost:p.passiveChoice==='0',ricoRepair:p.ricoRepair});
                    p.ricoRepair=false;
                    break;
                case 'Frank': startHammer(angle,false);break;
                case 'Nani': spawnNaniProjectiles(angle); break;
                case 'Max': for(let i=0; i<4; i++) scheduleCombatAction(()=>spawnBullet(angle, 18, 35), i*50); break;
                case 'Crow': for(let i=-1; i<=1; i++) spawnBullet(angle+i*0.3, 14, 40, false, 4, 'poison'); break;
                case 'Tara':
                    for(let i=-1;i<=1;i++){
                        spawnBullet(angle+i*.15,13,40);
                        if(p.taraHeavy)bullets.at(-1).damage=550;
                    }
                    p.taraHeavy=false;
                    break;
                case 'Gene':
                    spawnBullet(angle,11,25,false,10,'gene_main');
                    bullets.at(-1).geneFragment=p.passiveChoice==='1';
                    break;
                case 'Bibi': for(const t of combatTargets()) if(inFan(t,angle,basicAim.Bibi)){
                    if(t.spawnShield||t.altitude||!visibleTo(p,t))continue;
                    if(!t.safe&&!t.out)for(let i=0;i<6;i++)moveOnPitch(t,Math.cos(angle)*10,Math.sin(angle)*10);
                    hitEnemy(1300,true,t);
                }break;
                case 'Mortis': {
                    const shape=combatShape(false);
                    beginTravel(angle,shape.range,12,'Mortis',shape.radius);
                    p.mortisReach=false;
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
            case 'Shelly':
                for(let i=-4;i<=4;i++){
                    spawnBullet(angle+i*.15,16,40,true);
                    bullets.at(-1).shellySlow=p.passiveChoice==='0';
                }
                break;
            case 'Colt': for(let i=0; i<12; i++) scheduleCombatAction(()=>spawnBullet(angle, 20, 60, true), i*50); break;
            case 'Max': p.speedMult = 1.6; p.boostTimer=p.passiveChoice==='1'?300:240; break;
            case 'Rosa': p.shield=p.passiveChoice==='0'?240:180; break;
            case 'Jessie': summon('turret',destination(angle,superAimData.Jessie.range)); break;
            case 'Bo':
                zones=zones.filter(z=>z.type!=='boMine');
                throws=throws.filter(t=>t.type!=='boMine');
                for(const spread of [-0.28,0,0.28]) spawnBarleyBottle(angle+spread,200,'boMine',true);
                break;
            case 'Frank': startHammer(angle,true);break;
            case 'Nani': pip.active = true; pip.x = p.x; pip.y = p.y; pip.angle = angle; pip.life = 600; break;
            case 'Tick':
                summon('head',{x:p.x,y:p.y});
                if(p.passiveChoice==='1'){zones.at(-1).maxHp+=800;zones.at(-1).hp+=800;}
                break;
            case 'Tara': zones.push({...destination(angle,250),r:combatShape(true).radius,life:60,type:'gravity',damage:p.passiveChoice==='1'?2600:2000}); break;
            case 'Gene': spawnBullet(angle,18,40,true,12,'pull');bullets.at(-1).geneHeal=p.passiveChoice==='0';break;
            case 'Bibi':
                spawnBullet(angle,10,300,true,15,'bubble');
                bullets.at(-1).bibiSticky=p.bibiSticky;
                p.bibiSticky=false;
                if(p.passiveChoice==='1')p.shield=Math.max(p.shield,60);
                break;
            case 'Mortis':
                spawnBullet(angle,12,48,true,14,'bats');
                bullets.at(-1).batHeal=p.passiveChoice==='1';
                break;
            case 'Rico': {
                const life=p.passiveChoice==='1'?75:60;
                for(let n=0;n<9;n++)scheduleCombatAction(()=>spawnBullet(angle,15,life,true,5,'bounce'),n*55);
                break;
            }
            case 'Brock': {
                const radius=combatShape(true).radius;
                for(let n=0;n<7;n++)scheduleCombatAction(()=>{
                    spawnBarleyBottle(angle+Math.sin(n*2)*.26,240+Math.cos(n)*35,'boom',true);
                    throws.at(-1).blastRadius=radius;
                },n*90);
                break;
            }
            case 'Crow': case 'Stu': case 'Bull': case 'Darryl': case 'El_Primo': {
                const travel={Crow:[300,32],Stu:[200,13],Bull:[312,32],Darryl:[312,28],El_Primo:[250,30]};
                const [baseDistance,total]=travel[current];
                const distance=current==='Stu'?combatShape(true).range:baseDistance;
                if((current==='Bull'&&p.passiveChoice==='1')||(current==='Darryl'&&p.passiveChoice==='0'))p.shield=Math.max(p.shield,total);
                p.motion={fighter:current,x:p.x,y:p.y,dx:Math.cos(angle)*distance,dy:Math.sin(angle)*distance,total,age:0,hits:new Set(),radius:current==='El_Primo'?combatShape(true).radius:undefined};
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
        tx=Math.max(22,Math.min(tlbsWorld.width-22,tx));ty=Math.max(22,Math.min(tlbsWorld.height-22,ty)); 
        const barleyNormal=current==='Barley'&&type==='fire'&&!isUlt;
        const sticky=barleyNormal&&p.barleySticky;
        if(sticky)p.barleySticky=false;
        throws.push({x:p.x,y:p.y,tx,ty,type,isUlt,sticky,damage:barleyNormal&&p.passiveChoice==='0'?500:undefined,
            heal:barleyNormal&&p.passiveChoice==='1',extended:current==='Tick'&&type==='mine'&&p.passiveChoice==='0',
            trapRadius:type==='boMine'?combatShape(true).radius:undefined,quickTrap:type==='boMine'&&p.passiveChoice==='0',satchel:current==='Dynamike'&&!isUlt&&p.satchel,age:0});if(current==='Dynamike'&&!isUlt)p.satchel=false;
    }

    function advanceThrows() {
        for(let i=throws.length-1;i>=0;i--) {
            const t=throws[i];
            if(++t.age<30) continue;
            if(t.type==='boMine') {
                zones.push({x:t.tx,y:t.ty,r:t.trapRadius,type:'boMine',arm:t.quickTrap?15:30,fuse:0,life:Infinity});
                throws.splice(i,1);continue;
            }
            if(current==='Dynamike'&&p.passiveChoice==='0'&&!p.out&&!p.motion&&(t.type==='boom'||t.type==='bigBoom')&&Math.hypot(p.x-t.tx,p.y-t.ty)<(t.type==='bigBoom'?140:80)){const a=Math.hypot(p.x-t.tx,p.y-t.ty)<5?0:Math.atan2(p.y-t.ty,p.x-t.tx);beginTravel(a,100,22,'Dynamike',0);}
            if(t.heal&&current==='Barley'&&!p.out)p.hp=Math.min(p.maxHp,p.hp+200);
            zones.push({x:t.tx,y:t.ty,sticky:t.sticky,damage:t.damage,type:t.type==='bigBoom'||t.type==='yarn'?'boom':t.type,isBig:t.type==='bigBoom',satchel:t.satchel,isUlt:t.isUlt,r:t.blastRadius??(t.type==='yarn'?kitYarn.radius:t.type==='bigBoom'?140:t.type==='fire'?55:80),
                life:t.type==='mine'?(t.extended?210:150):t.type==='fire'?120:14});
            throws.splice(i,1);
        }
    }

    function dashEnd(angle) {
        return {x:Math.max(22,Math.min(tlbsWorld.width-22,p.x+Math.cos(angle)*mortisRange)),
            y:Math.max(22,Math.min(tlbsWorld.height-22,p.y+Math.sin(angle)*mortisRange))};
    }

    function crowIncomingDamage(source,damage) {
        return current==='Crow'&&p.passiveChoice==='0'&&tlbsCrowPoison.has(source)?Math.round(damage*.8):damage;
    }

    function tickCrowPoison() {
        for(const [target,effect] of tlbsCrowPoison){
            if(target.out){tlbsCrowPoison.delete(target);continue;}
            if(--effect.next===0){
                effect.next=30;
                hitEnemy(150,false,target);
            }
            if(--effect.left===0)tlbsCrowPoison.delete(target);
        }
    }

    function hitEnemy(dmg, canCharge, target=enemy) {
        if((target.altitude||0)>0 || !inPlane(target) || target.spawnShield>0 || target.out || match.finished || match.nextRound) return;
        if(current==='Chester'&&p.candyDamage>0)dmg*=1.25;
        if(current==='Crow'&&p.passiveChoice==='1'&&!target.safe&&target.hp<=target.maxHp/2)dmg*=1.25;
        if(current==='Frank'&&p.frankRage>0)dmg*=1.25;
        if(!arena&&target.botShield>0)dmg=Math.round(dmg*.55);
        match.damage+=Math.min(target.hp,dmg);
        target.hp -= dmg;
        const now=performance.now(), prior=tlbsHitEffects.find(f=>f.target===target&&now-f.born<160);
        if(prior){prior.damage+=Math.round(dmg);prior.born=now;}else tlbsHitEffects.push({target,x:target.x,y:target.y,damage:Math.round(dmg),born:now});
        if(tlbsHitEffects.length>40)tlbsHitEffects.shift();
        sounds.hit.currentTime = 0;
        sounds.hit.play();
        if(target.hp <= 0) {
            if(current==='Mortis'&&p.passiveChoice==='0'&&!p.out&&!target.safe&&match.mode!=='training')p.hp=Math.min(p.maxHp,p.hp+700);
            if(current==='Frank'&&p.passiveChoice==='0'&&!target.safe&&match.mode!=='training')p.frankRage=480;
            tlbsCrowPoison.delete(target);target.slow=0;
            if(arena){if(!target.safe)match.kills++;objectiveDeath(target);return;}
            if(p.attachment?.target===target)clearAttachment();
            if(realm?.target===target) realm=null;
            recordElimination();
            target.hp = target.maxHp;
            if(target===enemy)resetBotAbility(enemy);
            if(target===enemy) enemy.x = tlbsWorld.width / 2;
            if(target===enemy) enemy.y = 150;
        }
        if(canCharge && !realm && ultCharge < 100) { ultCharge = Math.min(100,ultCharge+BRAWLERS[current].ultChargeRate); }
    }

    function spawnNaniProjectiles(angle) {
        const end=destination(angle,naniRange());
        const tx=end.x,ty=end.y;
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
    if(['Kit','Edgar','Surge','Piper','Crow','El_Primo','Dynamike','Bonnie'].includes(m.fighter))p.altitude=58*Math.sin(progress*Math.PI);
    for(const target of combatTargets()) {
        if((m.fighter==='Colette' || m.fighter==='Mortis') && !m.hits.has(target) && dist(p,target)<=m.radius){
            m.hits.add(target);hitEnemy(m.fighter==='Mortis'?900:Math.round(target.maxHp*(m.returning&&p.passiveChoice==='0'?.21:.16)),m.fighter==='Mortis',target);
        }
        const slam=m.fighter==='El_Primo' && progress===1;
        if(!slam && m.fighter!=='Bull' && m.fighter!=='Darryl') continue;
        if(!m.hits.has(target) && Math.hypot(target.x-p.x,target.y-p.y)<(slam?m.radius:50)){
            m.hits.add(target);hitEnemy(slam?1800:m.fighter==='Darryl'&&p.passiveChoice==='1'?1400:1000,false,target);
        }
    }
    if(progress===1){
        if(m.fighter==='Stu'&&p.passiveChoice==='1'&&!p.out)p.hp=Math.min(p.maxHp,p.hp+500);
        if(m.fighter==='El_Primo'&&p.passiveChoice==='1'&&!p.out)p.hp=Math.min(p.maxHp,p.hp+650);
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
        if(grip.ally)target.hp=Math.min(target.maxHp,target.hp+(p.passiveChoice==='0'?525:380));
        else hitEnemy(240,false,target);
    }
}
function landRosterMove(m){
    const targets=combatTargets();
    if(m.fighter==='Kit'){
        p.hiddenTicks=0;
        const allies=arena?.actors.filter(t=>t!==p && t.team===p.team && !t.out && inPlane(t)) || [];
        const target=[...targets.filter(t=>!t.safe&&!t.spawnShield&&!t.altitude),...allies].filter(t=>dist(t,p)<=m.radius).sort((a,b)=>dist(a,p)-dist(b,p))[0];
        if(!target)return;
        const ally=allies.includes(target);
        p.attachment={target,ally,left:ally?480:120};
        if(!ally){target.stun=120;hitEnemy(p.passiveChoice==='1'?1250:950,false,target);}
    }else if(m.fighter==='Colette'&&m.returning){
        if(p.passiveChoice==='1'&&!p.out)p.hp=Math.min(p.maxHp,p.hp+600);
    }else if(m.fighter==='Colette' && !m.returning){
        const distance=Math.hypot(m.dx,m.dy);
        beginTravel(Math.atan2(-m.dy,-m.dx),distance,16,'Colette',m.radius);
        p.motion.returning=true;
    }else if(m.fighter==='Bonnie'){
        p.bonnieOnFoot=true;
        for(const t of targets)if(dist(t,p)<=m.radius)hitEnemy(1600,false,t);
    }else if(m.fighter==='Fang'){
        const chained=m.chain||new Set();
        const landings=targets.filter(t=>!t.spawnShield&&!t.altitude&&!chained.has(t)&&dist(t,p)<=m.radius);
        for(const t of landings.slice(0,4-chained.size)){
            chained.add(t);
            hitEnemy(1600,false,t);
        }
        if(landings.length&&chained.size<4&&!match.finished&&!match.nextRound&&current==='Fang'){
            const next=targets.filter(t=>!t.safe&&!t.out&&!t.spawnShield&&!t.altitude&&!chained.has(t)&&dist(p,t)<=(p.passiveChoice==='0'?210:160))
                .sort((a,b)=>dist(p,a)-dist(p,b))[0];
            if(next){
                beginTravel(angleTo(next),dist(p,next),14,'Fang',m.radius);
                p.motion.chain=chained;
            }
        }
    }else if(['Edgar','Surge','Buzz'].includes(m.fighter)){
        for(const t of targets) if(dist(t,p)<=m.radius){
            if(m.fighter==='Buzz'&&!t.safe&&!t.spawnShield&&!t.altitude)t.stun=p.passiveChoice==='1'?90:70;
            hitEnemy(m.fighter==='Edgar'&&p.passiveChoice==='1'?2000:1600,false,t);
        }
        if(m.fighter==='Buzz'&&m.buzzRepair&&!p.out)p.hp=Math.min(p.maxHp,p.hp+650);
        if(m.fighter==='Surge'){
            p.surgeLevel=Math.min(4,(p.surgeLevel||1)+1);p.speedMult=1.25;p.boostTimer=0;
        }
    }
}
