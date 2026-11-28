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

    const modes = [...modeSelect.options].map(o => o.value);
    for (const mode of modes) {
      begin('Shelly', mode);
      frames(65);
      check(match.mode === mode && !match.finished, mode + ' failed to start');
      finishMatch(true);
      check(!gameActive && match.finished, mode + ' failed to end');
      document.querySelector('#result').close();
      begin('Shelly', mode);
      frames(5);
      check(gameActive && !match.finished, mode + ' failed to restart');
    }
    report.textContent = 'PASS ' + Object.keys(BRAWLERS).length + ' attack and super activation scenarios, ' +
      modes.length + ' mode lifecycle scenarios, Canvas, five Chester variants, Bo, Griff, Bonnie and Crow regressions';
  } catch (error) {
    report.textContent = 'FAIL ' + error.stack;
  }
})();
