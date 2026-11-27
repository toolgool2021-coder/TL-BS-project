const match = {mode:'training', kills:0, deaths:0, damage:0, cooldown:0, finished:false};
const practiceHp = {Shelly:7400,Colt:5600,El_Primo:12000,Barley:4800,Brock:4800,Dynamike:5600,
    Tick:4400,Jessie:6000,Mortis:7600,Bo:7200,Bull:10000,Frank:14000,Rosa:10000,
    Darryl:10600,Bibi:9600,Crow:4800,Gene:7200,Tara:6600,Stu:6400,Nani:4800,Max:6600,Rico:5600};
let selectedFighter;
const botTrio=['Shelly','Colt','Brock'];
let playerTrio=[];
function duelTurn() {
    clearAttachment();enemy.stun=0;
    resetFighterStage();match.nextRound=false;
    current=playerTrio[match.deaths];
    const bot=botTrio[match.kills];
    enemy.maxHp=practiceHp[bot];
    enemy.hp=enemy.maxHp;
    p.hp=p.maxHp=BRAWLERS[current].hp || practiceHp[current];
    p.x=canvas.width/2;p.y=canvas.height-65;
    enemy.x=canvas.width/2;enemy.y=65;
    clearCombatTimers();resetControls();
    bullets.length=0;zones.length=0;throws.length=0;
    p.motion=null;superFx=null;pip.active=false;p.isFlying=false;p.scale=1;p.hiddenTicks=0;p.boostTimer=0;p.speedMult=1;p.shield=0;
    ammo=BRAWLERS[current].maxAmmo;ultCharge=0;match.cooldown=75;
    renderAmmo();
}
function setupMatch() {
    clearAttachment();enemy.stun=0;
    p.bells=0;p.jackpot=Math.floor(Math.random()*5);p.beeCharge=false;
    resetFighterStage();selectedFighter=current;
    if(window.roomRace) window.publishRaceScore?.(0);
    const roster=Object.keys(BRAWLERS), start=roster.indexOf(current);
    match.order=roster.slice(start).concat(roster.slice(0,start));
    Object.assign(match,{mode:window.roomPreview?(window.roomRace?'arms':'training'):document.querySelector('#mode').value,kills:0,deaths:0,damage:0,cooldown:60,finished:false,nextRound:false});
    p.maxHp=BRAWLERS[current].hp || practiceHp[current] || 7000;
    p.hp=p.maxHp; p.hiddenTicks=0;
    enemy.maxHp=match.mode==='training'?30000:7000;
    enemy.hp=enemy.maxHp;
    if(match.mode!=='training') trainingTargets=[];
    match.limit=Math.min(50,Math.max(1,Math.round(Number(document.querySelector('#kill-limit').value)||5)));
    initObjective();
    if(match.mode==='duel') {
        playerTrio=[current,...reserves.map(select=>select.value)];
        duelTurn();
    }
}
function combatTick() {
    if(arena || enemy.stun || !inPlane(enemy) || match.mode==='training' || match.finished) return;
    const candidates=hostileSummons(enemy);
    if(!p.hiddenTicks)candidates.push(p);
    const target=candidates.sort((a,b)=>dist(a,enemy)-dist(b,enemy))[0];
    if(target && --match.cooldown<=0 && dist(target,enemy)<440) {
        if(match.mode==='duel') {
            const bot=botTrio[match.kills],angle=Math.atan2(target.y-enemy.y,target.x-enemy.x);
            match.cooldown=Math.round(BRAWLERS[bot].reload*0.06);
            const fire=offset=>spawnBullet(angle+offset,bot==='Brock'?8:6,74,false,7,'hostile',enemy);
            if(bot==='Shelly') [-0.2,0,0.2].forEach(fire);
            else if(bot==='Colt') for(let n=0;n<4;n++) scheduleCombatAction(()=>fire(0),n*90);
            else fire(0);
            return;
        }
        match.cooldown=65;
        spawnBullet(Math.atan2(target.y-enemy.y,target.x-enemy.x),6,74,false,7,'hostile',enemy);
    }
}
function receiveHit() {
    if(match.finished || match.nextRound) return;
    p.hp=Math.max(0,p.hp-(p.shield>0?240:800));
    if(p.hp) return;
    clearAttachment();realm=null;
    resetFighterStage();match.deaths++;
    p.hp=p.maxHp;
    p.x=canvas.width/2; p.y=canvas.height-65;
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
        p.hp=p.maxHp=BRAWLERS[current].hp || practiceHp[current] || 7000;
        ammo=BRAWLERS[current].maxAmmo;
        ultCharge=0;renderAmmo();
    }
}
function finishMatch(won) {
    match.finished=true;
    window.shareMatch?.(won?'Поражение':'Победа');
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
