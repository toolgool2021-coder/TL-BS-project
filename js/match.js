const match = {mode:'training', kills:0, deaths:0, damage:0, cooldown:0, finished:false};
const practiceHp = {Shelly:7400,Colt:5600,El_Primo:12000,Barley:4800,Brock:4800,Dynamike:5600,
    Tick:4400,Jessie:6000,Mortis:7600,Bo:7200,Bull:10000,Frank:14000,Rosa:10000,
    Darryl:10600,Bibi:9600,Crow:4800,Gene:7200,Tara:6600,Stu:6400,Nani:4800,Max:6600,Rico:5600};
let selectedFighter;
function setupMatch() {
    selectedFighter=current;
    Object.assign(match,{mode:window.roomPreview?'training':document.querySelector('#mode').value,kills:0,deaths:0,damage:0,cooldown:60,finished:false});
    p.maxHp=BRAWLERS[current].hp || practiceHp[current] || 7000;
    p.hp=p.maxHp; p.hiddenTicks=0;
    enemy.maxHp=match.mode==='training'?30000:7000;
    enemy.hp=enemy.maxHp;
    if(match.mode!=='training') trainingTargets=[];
}
function combatTick() {
    if(match.mode==='training' || match.finished) return;
    if(!p.hiddenTicks && --match.cooldown<=0 && Math.hypot(enemy.x-p.x,enemy.y-p.y)<440) {
        match.cooldown=65;
        spawnBullet(Math.atan2(p.y-enemy.y,p.x-enemy.x),6,74,false,7,'hostile',enemy);
    }
}
function receiveHit() {
    p.hp=Math.max(0,p.hp-(p.shield>0?240:800));
    if(p.hp) return;
    match.deaths++;
    p.hp=p.maxHp;
    p.x=canvas.width/2; p.y=canvas.height-65;
    if(match.deaths===3) finishMatch(false);
}
function recordElimination() {
    if(match.mode==='training' || match.finished) return;
    match.kills++;
    if(match.kills===(match.mode==='arms'?6:3)) { finishMatch(true); return; }
    if(match.mode==='arms' && match.kills%2===0) {
        const roster=Object.keys(BRAWLERS);
        current=roster[(roster.indexOf(current)+1)%roster.length];
        p.hp=p.maxHp=BRAWLERS[current].hp || practiceHp[current] || 7000;
        ammo=BRAWLERS[current].maxAmmo;
        ultCharge=0;
    }
}
function finishMatch(won) {
    match.finished=true;
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
