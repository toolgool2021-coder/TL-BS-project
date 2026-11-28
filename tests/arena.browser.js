(() => {
  const report = document.createElement('pre');
  report.id = 'arena-report';
  document.body.append(report);
  try {
    function check(value, message) {
      if (!value) throw Error(message);
    }
    const errors = [];
    console.error = (...args) => errors.push(args.join(' '));
    for (const sound of Object.values(sounds)) sound.play = () => {};
    const timers = new Map();
    let now = 0, serial = 0;
    window.setTimeout = (action, delay) => {
      timers.set(++serial, {action, at: now + delay});
      return serial;
    };
    window.clearTimeout = id => timers.delete(id);
    let raf = null;
    window.requestAnimationFrame = callback => { raf = callback; return 1; };
    window.cancelAnimationFrame = () => { raf = null; };
    const modeSelect = document.querySelector('#mode');
    function begin(fighter, mode = 'training') {
      current = fighter;
      modeSelect.value = mode;
      syncLobby();
      initGame();
      p.x = p.y = 500;
      enemy.x = 645;
      enemy.y = 500;
      tlbsMapWalls.length = 0;
      touchControls = true;
      tlbsFollowCamera(true);
    }
    function frames(count) {
      for (let i = 0; i < count; i++) {
        now += 17;
        for (const [id, timer] of timers) if (timer.at <= now) {
          timers.delete(id);
          timer.action();
        }
        check(raf, 'Animation loop stopped');
        raf(now);
        check(!errors.length, errors.join('\n'));
        check(ctx.getTransform().isIdentity, 'Frame leaked its transform');
        check(Number.isFinite(p.x + p.y), 'Invalid player coordinates');
      }
    }
    for (const fighter of Object.keys(BRAWLERS)) {
      begin(fighter);
      Object.assign(joyR, {active:true,x:40,y:60,cx:82,cy:60});
      frames(2);
      const before = ammo;
      attack(0, false, 42);
      check(ammo < before, fighter + ' attack did not consume ammo');
      joyR.active = false;
      frames(65);

      begin(fighter);
      ultCharge = 100;
      Object.assign(joyU, {active:true,x:40,y:60,cx:82,cy:60});
      pressedKeys.add(bindings.super);
      frames(2);
      check(isUltReady, fighter + ' did not become ready');
      attack(0, true, 42);
      check(ultCharge === 0 && superFx?.fighter === fighter, fighter + ' super did not activate');
      joyU.active = false;
      frames(95);
      if (fighter === 'Bonnie') {
        check(p.bonnieOnFoot && !p.isFlying && p.altitude === 0, 'Bonnie did not land in her second form');
        ultCharge = 100;
        updateUI();
        attack(0, true);
        check(!p.bonnieOnFoot, 'Bonnie did not return to her cannon');
      }
    }

    begin('Bo');
    enemy.x = 700;
    // Destructible cover sits near the mine, off the path of the throw.
    tlbsMapWalls.push({x:730,y:520,w:20,h:20});
    const boHealth = enemy.hp;
    useUltimate(0);
    frames(100);
    check(enemy.hp < boHealth && !tlbsMapWalls.length, 'Bo mines failed to hit and break cover');

    begin('Griff');
    const griffHealth = enemy.hp;
    useUltimate(0);
    frames(84);
    check(enemy.hp <= griffHealth - 1320, 'Griff notes failed to hit on both legs');
    check(!bullets.some(b => b.special === 'griffNote') && ultCharge === 0, 'Griff notes leaked or charged his super');
    const landingX = p.x + 180;
    tlbsUseGadget(0);
    frames(26);
    check(zones.some(z => z.type === 'griffPiggy' && z.x === landingX), 'Griff gadget missed its landing point');
    const preBlast = enemy.hp;
    frames(125);
    check(enemy.hp === preBlast - 1000, 'Griff gadget did not detonate once');

    begin('Crow');
    const untouched = trainingTargets[0];
    Object.assign(untouched,{x:enemy.x,y:enemy.y+100});
    attack(0,false);
    frames(13);
    check(tlbsCrowPoison.has(enemy) && !tlbsCrowPoison.has(untouched), 'Poison did not track the hit target');
    p.gadgetChoice = '1';
    tlbsUseGadget();
    check(enemy.slow === 210 && !untouched.slow, 'Crow slowed an unpoisoned target');
    check(p.gadgetUses === 2 && p.gadgetCooldown === 300, 'Gadget counters did not update');
    frames(210);
    check(!enemy.slow && !tlbsCrowPoison.has(enemy), 'Crow effects did not expire');

    for (let variant = 0; variant < 5; variant++) {
      begin('Chester');
      p.jackpot = variant;
      const health = p.hp -= 2400;
      const foeHealth = enemy.hp;
      if (variant === 3) enemy.x = p.x + 70;
      useUltimate(0);
      frames(100);
      check(variant === 4 ? p.hp > health : enemy.hp < foeHealth, 'Chester super failed: ' + variant);
    }

    for(const fighter of ['Dynamike','Chester','Griff','Crow']) {
      for(const choice of ['0','1']) {
        begin(fighter);
        p.gadgetChoice=choice;
        p.jackpot=0;
        ultCharge=100;
        tlbsUseGadget(0);
        check(p.gadgetUses===2 && p.gadgetCooldown===300, fighter + ' gadget did not activate: ' + choice);
        tlbsUseGadget(0);
        check(p.gadgetUses===2, fighter + ' gadget activated during cooldown');
      }
    }

    begin('Piper');
    const piperHealth=enemy.hp;
    tlbsUseGadget();
    check(enemy.hp===piperHealth-420 && enemy.x>645 && enemy.slow>0, 'Piper repellent failed');
    begin('Piper');
    p.gadgetChoice='1';
    p.passiveChoice='1';
    tlbsUseGadget();
    enemy.y=550;
    attack(0,false);
    check(bullets.at(-1).guide && !p.piperGuide, 'Piper guidance was not spent on the shot');
    const ammoAfterShot=ammo;
    frames(14);
    check(enemy.hp<enemy.maxHp && ammo>ammoAfterShot+.4, 'Piper guided hit did not restore ammo');

    begin('Frank');
    p.stun=90;
    tlbsUseGadget();
    check(!p.stun && p.frankGuard===120, 'Frank guard did not clear the stun');
    begin('Frank');
    p.gadgetChoice='1';
    tlbsUseGadget();
    const frankHealth=enemy.hp;
    attack(0,false);
    frames(18);
    check(enemy.x<645 && enemy.hp===frankHealth-1485 && !p.frankPull, 'Frank hammer did not pull and hit once');

    begin('Chester');
    p.passiveChoice='0';
    p.bells=3;
    attack(0,false);
    check(bullets.length===4 && bullets.every(b=>b.damage===520), 'Chester fourth burst missed its damage bonus');

    begin('Crow');
    p.passiveChoice='0';
    tlbsCrowPoison.set(enemy,{left:180,next:30});
    check(crowIncomingDamage(enemy,800)===640 && crowIncomingDamage(trainingTargets[0],800)===800, 'Crow reduced damage from an unpoisoned opponent');
    p.passiveChoice='1';
    enemy.hp=10000;
    hitEnemy(400,false,enemy);
    check(enemy.hp===9500, 'Crow low health bonus did not apply');

    begin('Bea');
    attack(0,false);
    frames(14);
    check(p.beeCharge, 'Bea failed to charge after a hit');
    ammo=1;
    attack(Math.PI,false);
    check(bullets.at(-1).charged && !p.beeCharge, 'Bea did not spend her charge when firing');
    frames(42);
    check(!p.beeCharge, 'Bea regained her charge after missing');

    begin('Fang');
    enemy.x=690;
    trainingTargets=Array.from({length:4},(_,i)=>({x:795+105*i,y:500,hp:30000,maxHp:30000}));
    useUltimate(0);
    frames(80);
    const fangTargets=[enemy,...trainingTargets];
    check(fangTargets.slice(0,4).every(t=>t.hp===28400) && fangTargets[4].hp===30000,
      'Fang did not hit exactly four different opponents once');

    const difficultySelect=document.querySelector('#bot-difficulty');
    difficultySelect.value='easy';
    begin('Colt','skirmish');
    enemy.x=600;
    spawnBullet(0,12,40,false);
    check(!botDodge(enemy,3), 'Easy bot dodged a shot');
    difficultySelect.value='hard';
    begin('Colt','skirmish');
    enemy.x=600;
    spawnBullet(0,12,40,false);
    const beforeDodge=enemy.y;
    check(botDodge(enemy,3) && enemy.y!==beforeDodge, 'Hard bot did not sidestep an incoming shot');
    bullets.length=0;
    enemy.fighter='Brock';
    botFire(enemy,p,'hostile');
    check(bullets[0].blast===55 && bullets[0].owner===enemy, 'Brock bot did not launch its rocket');
    const rocket=bullets[0];
    Object.assign(rocket,{x:p.x,y:p.y});
    const beforeRocket=p.hp;
    botRocketImpact(rocket);
    check(p.hp===beforeRocket-820, 'Bot rocket did not apply its blast damage');
    bullets.length=0;
    const mover={x:500,y:500};
    tlbsMapWalls.push({x:530,y:450,w:50,h:115});
    for(let i=0;i<120;i++)tlbsBotMove(mover,{x:650,y:500},3);
    check(mover.x>625&&!insideCover(mover.x,mover.y,16), 'Bot failed to route around cover at '+mover.x+','+mover.y);
    difficultySelect.value='normal';

    begin('Colt','skirmish');
    enemy.fighter='Shelly';
    for(let i=0;i<12;i++)botDealDamage({owner:enemy,botLife:enemy.botLife,damage:260},p,800);
    check(enemy.botCharge===100,'Bot did not earn its super through hits');
    check(botTryAbility(enemy,p,'hostile',0),'Bot did not use its charged super');
    check(bullets.length===5 && bullets.every(b=>b.isUlt),'Shelly bot super did not fire its spread');
    botDealDamage(bullets[0],p,800);
    check(enemy.botCharge===0&&p.slow===90,'Super recharged itself or failed to slow');
    enemy.hp=Math.floor(enemy.maxHp*.35);
    botTryAbility(enemy,p,'hostile',1);
    check(enemy.botShield===100&&enemy.botGadgetUses===1,'Bot did not use its defensive gadget');
    botTryAbility(enemy,p,'hostile',1);
    check(enemy.botGadgetUses===1,'Bot ignored gadget cooldown');
    const previousLife=enemy.botLife;
    hitEnemy(enemy.hp*3,false,enemy);
    check(enemy.botLife!==previousLife&&enemy.botCharge===0&&enemy.botShield===0&&enemy.botGadgetUses===1,
      'Bot respawn leaked an effect or refilled gadget charges');
    botDealDamage({owner:enemy,botLife:previousLife,damage:260},p,800);
    check(enemy.botCharge===0,'A projectile from a previous life charged the bot');
    begin('Colt','zone');
    const protectedBot=arena.actors[1];
    protectedBot.spawnShield=20;
    botDealDamage({owner:arena.actors[2],damage:560},protectedBot,550);
    check(protectedBot.hp===protectedBot.maxHp&&arena.actors[2].botCharge===0,'Blocked hit charged a bot');

    begin('Bea');
    enemy.x=p.x+80;
    tlbsUseGadget();
    frames(4);
    check(enemy.slow>0&&p.gadgetUses===2,'Bea field did not slow its target');
    begin('Bea');
    p.gadgetChoice='1';
    p.passiveChoice='0';
    tlbsUseGadget();
    attack(0,false);
    check(bullets.at(-1).charged&&bullets.at(-1).vx===20,'Bea charged shot did not accelerate');
    begin('Bea');
    p.passiveChoice='1';
    useUltimate(0);
    frames(20);
    check(enemy.slow>0,'Bea super did not slow with its star power');

    begin('Bonnie');
    p.passiveChoice='0';
    tlbsUseGadget();
    check(p.bonnieReload===180&&combatShape(true).range===375,'Bonnie cannon settings failed');
    begin('Bonnie');
    p.passiveChoice='1';
    p.gadgetChoice='1';
    tlbsUseGadget();
    check(p.gadgetUses===3,'Bonnie used the push from her cannon');
    p.bonnieOnFoot=true;
    enemy.x=p.x+50;
    tlbsUseGadget();
    check(enemy.x===p.x+105&&p.gadgetUses===2,'Bonnie push did not move the opponent');
    const bonnieHealth=p.hp-=500;
    attack(0,false);
    frames(12);
    check(p.hp>bonnieHealth,'Bonnie foot shot did not repair health');

    begin('Surge');
    p.surgeLevel=2;
    p.passiveChoice='0';
    tlbsUseGadget();
    check(surgeAttackLevel()===3&&p.surgeLevel===2,'Surge temporary level became permanent');
    tlbsMapWalls.push({x:p.x+60,y:p.y-40,w:20,h:80});
    attack(0,false);
    frames(7);
    check(bullets.some(b=>b.special==='surgeShard'),'Surge did not split at a wall');
    begin('Surge','zone');
    p.gadgetChoice='1';
    const surgeAmmo=ammo;
    tlbsUseGadget();
    const surgeHealth=p.hp;
    objectiveHit(p,1000);
    check(ammo===surgeAmmo-1&&p.hp===surgeHealth-300,'Surge shield or ammo cost failed in team play');
    p.passiveChoice='1';
    p.surgeLevel=4;
    attack(0,false);
    splitSurge(bullets.at(-1),enemy);
    check(bullets.filter(b=>b.special==='surgeShard'&&b.life===21).length===6,'Surge extended shards failed');

    const modes = [...modeSelect.options].map(o => o.value);
    for (const mode of modes) {
      begin('Shelly', mode);
      frames(65);
      check(match.mode === mode && !match.finished, mode + ' failed to start');
      const rivals = arena?.actors.filter(a => a.team !== 0);
      switch(mode) {
        case 'training':
          hitEnemy(enemy.hp, false);
          check(enemy.hp === enemy.maxHp && !match.finished, 'Training target did not reset');
          finishMatch(true);
          break;
        case 'arms':
          for(let i=0;i<2*Object.keys(BRAWLERS).length;i++)recordElimination();
          check(match.kills === 84, 'Arms race ended before all fighters');
          break;
        case 'duel':
          ultCharge = 90;
          recordElimination();
          frames(3);
          check(!match.nextRound && ultCharge === 0, 'Duel leaked charge into a new round');
          recordElimination();
          frames(3);
          recordElimination();
          break;
        case 'skirmish': case 'custom':
          for(let i=0;i<(mode==='custom'?match.limit:3);i++)recordElimination();
          break;
        case 'solo': case 'duo':
          for(const rival of rivals)objectiveDeath(rival);
          tickObjective();
          break;
        case 'knockout':
          for(const rival of rivals)objectiveDeath(rival);
          tickObjective();
          check(arena.score[0] === 1 && rivals.every(a => !a.out), 'Knockout failed to reset between rounds');
          for(const rival of rivals)objectiveDeath(rival);
          tickObjective();
          break;
        case 'ball':
          for(let i=0;i<2;i++){
            Object.assign(arena.ball,{x:tlbsWorld.width/2,y:20,vx:0,vy:0});
            arena.carrier=null;
            tickObjective();
          }
          break;
        case 'zone':
          objectiveDeath(enemy);
          enemy.respawn=1;
          tickObjective();
          check(!enemy.out && enemy.hp===enemy.maxHp, 'Zone opponent did not respawn');
          Object.assign(p,{x:tlbsWorld.width/2,y:tlbsWorld.height/2});
          arena.score[0]=1799;
          tickObjective();
          break;
        case 'gems':
          Object.assign(arena,{leader:0,hold:899});
          p.gems=10;
          tickObjective();
          break;
        case 'heist':
          hitEnemy(arena.safes[1].hp,false,arena.safes[1]);
          break;
        default: throw Error('Missing mode scenario: ' + mode);
      }
      check(!gameActive && match.finished, mode + ' failed to end');
      check(document.querySelector('#result-text').textContent.startsWith('Победа'), mode + ' awarded the wrong winner');
      document.querySelector('#result').close();
      begin('Shelly', mode);
      frames(5);
      check(gameActive && !match.finished, mode + ' failed to restart');
    }
    report.textContent = 'PASS ' + Object.keys(BRAWLERS).length + ' attack and super activation scenarios, ' +
      modes.length + ' mode lifecycle scenarios, Canvas, 18 gadget activations and Bea, Bonnie and Surge star power scenarios, five Chester variants, Bo, Griff, Bonnie, Crow, Bea, Fang, Piper and Frank regressions, bot difficulty, dodge, blast, pathfinding, super charge, gadget cooldown and respawn';
  } catch (error) {
    report.textContent = 'FAIL ' + error.stack;
  }
})();
