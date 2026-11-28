const match = {mode:'training', kills:0, deaths:0, damage:0, cooldown:0, finished:false};
const practiceHp = {Shelly:7400,Colt:5600,El_Primo:12000,Barley:4800,Brock:4800,Dynamike:5600,
    Tick:4400,Jessie:6000,Mortis:7600,Bo:7200,Bull:10000,Frank:14000,Rosa:10000,
    Darryl:10600,Bibi:9600,Crow:4800,Gene:7200,Tara:6600,Stu:6400,Nani:4800,Max:6600,Rico:5600};
let selectedFighter;
function playerMaxHp(){
    const base=BRAWLERS[current].hp||practiceHp[current]||7000;
    return current==='Frank'&&p.passiveChoice==='1'?Math.round(base*1.15):base;
}
const botTrio=['Shelly','Colt','Brock'];
let playerTrio=[];
function duelTurn() {
    clearAttachment();enemy.stun=0;enemy.slow=0;tlbsCrowPoison.clear();
    resetFighterStage();match.nextRound=false;
    current=playerTrio[match.deaths];
    const bot=botTrio[match.kills];
    enemy.fighter=bot;
    resetBotAbility(enemy,true);
    enemy.maxHp=practiceHp[bot];
    enemy.hp=enemy.maxHp;
    p.hp=p.maxHp=playerMaxHp();
    p.x=tlbsWorld.width/2;p.y=tlbsWorld.height-65;
    enemy.x=tlbsWorld.width/2;enemy.y=65;
    clearCombatTimers();resetControls();
    bullets.length=0;zones.length=0;throws.length=0;
    p.motion=null;p.altitude=0;superFx=null;pip.active=false;p.isFlying=false;p.scale=1;p.hiddenTicks=0;p.boostTimer=0;p.speedMult=1;p.shield=0;
    ammo=BRAWLERS[current].maxAmmo;match.cooldown=75;
    renderAmmo();
}
function setupMatch() {
    p.griffExtra=false;p.griffHeal=0;p.satchel=false;p.candyReload=0;p.candyDamage=0;p.gadgetUses=3;p.gadgetCooldown=0;p.gadgetChoice=document.getElementById('gadget-choice')?.value||'0';p.passiveChoice=document.getElementById('passive-choice')?.value||'0';
    clearAttachment();enemy.stun=0;enemy.slow=0;tlbsCrowPoison.clear();
    p.bells=0;p.jackpot=Math.floor(Math.random()*5);p.beeCharge=false;
    resetFighterStage();selectedFighter=current;
    if(window.roomRace) window.publishRaceScore?.(0);
    const roster=Object.keys(BRAWLERS), start=roster.indexOf(current);
    match.order=roster.slice(start).concat(roster.slice(0,start));
    Object.assign(match,{mode:window.roomPreview?(window.roomRace?'arms':'training'):document.querySelector('#mode').value,kills:0,deaths:0,damage:0,cooldown:60,finished:false,nextRound:false});
    p.maxHp=playerMaxHp();
    p.hp=p.maxHp; p.hiddenTicks=0;
    enemy.fighter=match.mode==='training'?null:['Shelly','Colt','Brock'][Math.floor(Math.random()*3)];
    enemy.maxHp=match.mode==='training'?30000:practiceHp[enemy.fighter];
    enemy.hp=enemy.maxHp;
    resetBotAbility(enemy,true);
    if(match.mode!=='training') trainingTargets=[];
    match.limit=Math.min(50,Math.max(1,Math.round(Number(document.querySelector('#kill-limit').value)||5)));
    match.difficulty=document.getElementById('bot-difficulty').value;
    initObjective();
    if(match.mode==='duel') {
        playerTrio=[current,...reserves.map(select=>select.value)];
        duelTurn();
    }
}
function combatTick() {
    if(arena || !inPlane(enemy) || match.mode==='training' || match.finished) return;
    tickBotAbility(enemy);
    if(enemy.stun)return;
    const candidates=hostileSummons(enemy);
    if(!p.hiddenTicks)candidates.push(p);
    const target=candidates.sort((a,b)=>dist(a,enemy)-dist(b,enemy))[0];
    if(target){
        const d=dist(target,enemy), a=Math.atan2(target.y-enemy.y,target.x-enemy.x);
        const {preferred}=botWeapon(enemy);
        const approach=d>preferred+35?1:d<preferred-45?-1:0;
        const strafe=Math.sin((performance.now()/650))*0.65;
        const speed=2.1*botDifficulty().pace*(enemy.slow>0?0.5:1);
        const nx=Math.max(30,Math.min(tlbsWorld.width-30,enemy.x+speed*(Math.cos(a)*approach-Math.sin(a)*strafe)));
        const ny=Math.max(30,Math.min(tlbsWorld.height-30,enemy.y+speed*(Math.sin(a)*approach+Math.cos(a)*strafe)));
        if(!botDodge(enemy,speed)){
            if(!insideCover(nx,ny,22)){enemy.x=nx;enemy.y=ny;}
            else tlbsBotMove(enemy,target,speed);
        }
    }
    match.cooldown--;
    if(botTryAbility(enemy,target,'hostile',match.cooldown)){match.cooldown=55;return;}
    if(match.cooldown<=0&&target&&dist(target,enemy)<botWeapon(enemy).range&&visibleTo(enemy,target)){
        match.cooldown=botFire(enemy,target,'hostile');
    }
}
function receiveHit(source=enemy,damage=800) {
    if((p.altitude||0)>0 || match.finished || match.nextRound) return;
    p.hp=Math.max(0,p.hp-crowIncomingDamage(source,p.shield>0?Math.round(damage*.3):damage));
    if(p.hp) return;
    clearAttachment();realm=null;
    resetFighterStage();match.deaths++;
    p.hp=p.maxHp;
    p.x=tlbsWorld.width/2; p.y=tlbsWorld.height-65;
    if(match.mode!=='arms' && match.deaths===(match.mode==='custom'?match.limit:3)) finishMatch(false);
    else if(match.mode==='duel') match.nextRound=true;
}
function recordElimination() {
    if(match.mode==='training' || match.finished) return;
    match.kills++;
    if(window.roomRace) window.publishRaceScore?.(match.kills);
    if(match.kills===(match.mode==='arms'?2*match.order.length:match.mode==='custom'?match.limit:3)) { finishMatch(true); return; }
    if(match.mode==='duel') match.nextRound=true;
    if(match.mode==='arms' && match.kills%2===0) {
        clearCombatTimers();p.motion=null;p.isFlying=false;p.scale=1;
        resetFighterStage();current=match.order[match.kills/2];
        p.hp=p.maxHp=playerMaxHp();
        ammo=BRAWLERS[current].maxAmmo;
        renderAmmo();
    }
}
function finishMatch(won) {
    match.finished=true;
    window.shareMatch?.(won?'Победа':'Поражение');
    gameActive=false;
    clearCombatTimers();
    resetControls();
    const summary=(won?'Победа':'Поражение')+' · '+match.kills+' : '+match.deaths+' · Урон '+match.damage;
    document.querySelector('#result-text').textContent=summary;
    try {
        const stats=JSON.parse(localStorage.getItem('tlbs.stats') || '{}');
        stats.matches=(stats.matches||0)+1; stats.wins=(stats.wins||0)+Number(won);
        localStorage.setItem('tlbs.stats',JSON.stringify(stats));
        document.querySelector('#result-total').textContent='Победы: '+stats.wins+' / '+stats.matches;
    } catch {}
    document.querySelector('#result').showModal();
}
