const tlbsAbilityDescriptions={"Griff":[["Бросает копилку на 180 единиц: после приземления через 2 секунды наносит 1000 урона в радиусе 90. Разрушает статические препятствия в радиусе взрыва.","Следующая атака выпускает дополнительную очередь монет."],["Уменьшает интервал между очередями до 75 мс.","Восстанавливает 15% недостающего здоровья каждые 2 секунды."]],"Dynamike":[["Ускоряет бойца и разбрасывает динамит вокруг.","Следующая атака предназначена для оглушения; механика требует проверки."],["Позволяет прыгать от собственного взрыва.","Усиливает урон ульты; требует игровой проверки."]],"Chester":[["Меняет готовую ульту на другую случайную.","Случайное усиление скорости, перезарядки или урона."],["Четвёртая очередь из четырёх колокольчиков наносит на 30% больше урона.","Раскрывает тип ульты заранее."]],"Crow":[["Активирует временный щит.","На 3,5 секунды замедляет только противников, которых отравил Ворон."],["Отравленные цели наносят на 20% меньше урона.","Ворон наносит на 25% больше урона ослабленным целям."]]};
Object.assign(tlbsAbilityDescriptions,{
 Jessie:[['Ремонтирует турель на 1100.','Турель стреляет чаще в течение 3 секунд.'],['Энергетический шар отскакивает к более далёким целям.','Турель получает 1000 дополнительного здоровья.']],
 Nita:[['Медведь оглушает ближайших противников.','Медведь получает щит на 2 секунды.'],['Медведь атакует чаще.','Когда медведь наносит урон, Нита восстанавливает 160 здоровья.']],
 Pam:[['Станция мгновенно лечит союзников в зоне на 720.','На 3 секунды ускоряет импульсы станции.'],['Увеличивает радиус станции до 122.','Импульсы станции лечат на 780 вместо 600.']],
 Bo:[['Запускает короткий отсчёт у уже установленных ловушек.','Следующий залп замедляет цели на секунду.'],['Ловушки активируются через четверть секунды после установки.','Увеличивает радиус ловушек ульты до 75.']],
 Tick:[['Даёт щит на 1,5 секунды.','Следующая атака разбрасывает пять зарядов.'],['Обычные заряды остаются на поле на секунду дольше.','У призыва ульты на 800 больше здоровья.']],
 Barley:[['Создаёт лечебное поле для себя и союзников.','Следующая обычная лужа замедляет противников.'],['Обычная лужа наносит на 100 больше урона за импульс.','После приземления обычного броска восстанавливает 200 здоровья.']],
 Fang:[['Следующий удар или бросок кроссовка оглушает на секунду.','Даёт короткий щит перед сближением.'],['Следующее звено ульты ищет цель в радиусе 210.','Ближний удар восстанавливает 180 здоровья при попадании.']],
 Kit:[['Маскируется на две секунды вне сцепки. Атака раскрывает позицию.','В сцепке с союзником лечит его на 900.'],['Лечение союзника в сцепке усиливается до 525 за импульс.','Первый удар при приземлении на врага наносит 1250.']],
 Gale:[['Выпускает короткий порыв, который отталкивает ближайших врагов.','Следующий залп замедляет цели на 1,5 секунды.'],['Враги, которых ульта прижала к стене, оглушаются на секунду.','Ульта действует на более широкой полосе.']],
 Bea:[['Ставит на 3 секунды поле, которое замедляет врагов рядом.','Готовит усиленный выстрел, если заряд ещё не накоплен.'],['Усиленный выстрел летит на 25% быстрее.','Ульта замедляет задетых противников на 2 секунды.']],
 Bonnie:[['Ускоряет перезарядку пушки на 3 секунды.','В пешей форме отталкивает ближайших противников.'],['Прыжок из пушки летит на 25% дальше.','Попадание пешей атакой восстанавливает 90 здоровья.']],
 Surge:[['На 5 секунд повышает уровень атак на одну ступень.','Расходует один заряд атаки и на 2 секунды включает щит.'],['Снаряд распадается на осколки при попадании в стену.','На максимальном уровне осколки летят на 30% дальше.']],
 Piper:[['Стреляет по ближайшему видимому врагу, замедляет и отталкивает его.','Следующая пуля доворачивает к цели.'],['Выстрел из укрытия наносит на 25% больше урона.','Попадание возвращает 0,4 заряда атаки.']],
 Frank:[['Снимает оглушение и даёт иммунитет на 2 секунды.','Следующий удар молотом притягивает цель и наносит на 35% больше урона.'],['Устранение усиливает удары на 25% на 8 секунд.','Увеличивает запас здоровья на 15%.']]
});
const tlbsLoadouts={Jessie:[['Ремонт на месте','Перегрузка'],['Дальний отскок','Укреплённая турель']],Nita:[['Топот','Защита медведя'],['Быстрые лапы','Взаимная поддержка']],Pam:[['Первая помощь','Частый импульс'],['Расширенная зона','Усиленное лечение']],Bo:[['Общий сигнал','Связующий залп'],['Быстрая готовность','Широкий охват']],Tick:[['Защитный корпус','Широкий разброс'],['Долгий дозор','Усиленный корпус']],Barley:[['Скорая помощь','Липкая смесь'],['Крепкая смесь','Медицинская порция']],Fang:[['Сбить ритм','Защитная стойка'],['Дальний перехват','Второе дыхание']],Kit:[['Тихие лапы','Перевязка'],['Заботливый спутник','Точное приземление']],Gale:[['Обратная тяга','Морозный залп'],['Прижать к стене','Широкий фронт']],Bea:[['Пчелиное поле','Запасной заряд'],['Быстрое жало','Вязкий рой']],Bonnie:[['Быстрая подача','Расчистка'],['Дальний прыжок','Полевой ремонт']],Surge:[['Форсаж','Обмен энергии'],['Рикошетный разлом','Дальний каскад']],Griff:[['Piggy Bank','Coin Shower'],['Keep the Change','Business Resilience']],Dynamike:[['Fidget Spinner','Satchel Charge'],['Dyna-Jump','Demolition']],Chester:[['Spicy Dice','Candy Beans'],["Single Bell O Mania","Sneak Peek"]],Piper:[['Auto Aimer','Homemade Recipe'],['Ambush','Snappy Sniping']],Crow:[['Defense Booster','Slowing Toxin'],['Extra Toxic','Carrion Crow']],Frank:[['Active Noise Canceling','Irresistible Attraction'],['Power Grab','Sponge']]};
function tlbsLoadoutMenu(){const kit=tlbsLoadouts[current];for(const [i,id] of ['gadget-choice','passive-choice'].entries()){const el=document.getElementById(id);if(!el)continue;el.replaceChildren();for(const [n,name] of (kit?.[i]||['Не реализовано']).entries()){const opt=document.createElement('option');opt.value=String(n);opt.textContent=name;el.append(opt);}try{el.value=localStorage.getItem('tlbs.loadout.'+current+'.'+id)||'0';}catch{}let info=document.getElementById(id+'-description');if(!info){info=document.createElement('small');info.id=id+'-description';info.style.cssText='display:block;color:#b9c8df;font-size:12px;line-height:1.5;margin:6px 0 12px';el.insertAdjacentElement('afterend',info);}const describe=()=>{info.textContent=tlbsAbilityDescriptions[current]?.[i]?.[Number(el.value)]||'Способность пока не реализована.';};describe();el.onchange=()=>{try{localStorage.setItem('tlbs.loadout.'+current+'.'+id,el.value);}catch{}describe();};}}
const tlbsGadgetIcons=Object.fromEntries(Object.entries({
 repair:'M4 20 14 10m0 0 1-6 5-1 1 5-5 3m-5-1L4 17v3',
 rapid:'M8 3h8l-4 7h6l-9 11 2-9H5z',
 stomp:'M5 15h14M3 19h18M7 12l3-8 6 2 1 6',
 bearShield:'M12 3 20 6v7l-8 8-8-8V6zM8 11h8m-4-4v8',
 aid:'M5 7h14v13H5zM9 7V4h6v3m-6 7h6m-3-3v6',
 pulse:'M2 12h5l3-7 4 14 3-7h5',
 signal:'M4 17h16M8 13l4-9 4 9zM12 7v3',
 tether:'M4 20 20 4M8 5h11v11M3 11l4-4m6 14 4-4',
 shell:'M4 8 12 4l8 4v7l-8 5-8-5zM8 10h8',
 spread:'M12 20V4m0 16L4 8m8 12 8-12',
 remedy:'M8 3h8v5l3 4v8H5v-8l3-4zM9 14h6m-3-3v6',
 sticky:'M12 3c-3 5-7 8-7 12a7 7 0 0 0 14 0c0-4-4-7-7-12zM8 15l3 2',
 kickStun:'m3 15 6-2 3-8 4 2-2 7 7 2v3H3z',
 stance:'M4 17h16M6 14l3-8 3 6 3-6 3 8',
 paw:'M4 13a2 2 0 1 0 0-4m5 1a2 2 0 1 0 0-4m6 4a2 2 0 1 0 0-4m5 7a2 2 0 1 0 0-4M7 19c0-7 10-7 10 0z',
 bandage:'M4 14 14 4l6 6-10 10zM10 11l3 3m0-6 3 3',
 gust:'M3 9h12c5 0 5-5 1-5M3 13h17M3 17h10c4 0 4 4 1 4',
 frost:'M12 3v18M4 7l16 10M4 17 20 7',
 hive:'M12 2 21 7v10l-9 5-9-5V7zM8 10h8m-8 4h8',
 beeCharge:'M13 2 5 13h6l-1 9 9-12h-7z',
 reload:'M4 10a8 8 0 1 1 1 8m-1-8V4m0 6h6M12 8v4l3 2',
 push:'M12 12H3m3-3-3 3 3 3m6-3h9m-3-3 3 3-3 3M12 5v14',
 overdrive:'M4 18l5-6 4 3 7-9m-5 0h5v5',
 capacitor:'M7 4v16m10-16v16M3 12h4m10 0h4M10 8h4m-4 8h4',
 repel:'M4 12h15m-5-5 5 5-5 5M4 5v14',
 guide:'M3 19c10 0 6-14 16-14m-5-2h7v7',
 guard:'m12 3 7 3v6c0 4-4 7-7 9-3-2-7-5-7-9V6zM9 12h6',
 pull:'M3 8l5 4-5 4m18-8-5 4 5 4M8 12h8'
}).map(([name,d])=>[name,'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="'+d+'"/></svg>']));
let tlbsGadgetAim=null;
function tlbsUseGadget(angleOverride){if(!gameActive||p.out||match.finished||!(p.gadgetUses>0)||p.gadgetCooldown>0)return;const second=p.gadgetChoice==='1';if(current==='Dynamike'){if(second)p.satchel=true;else{p.speedMult=1.2;p.boostTimer=120;for(let i=0;i<12;i++)spawnBarleyBottle(i*Math.PI/6,70+i%3*45,'boom',false);}}else if(current==='Chester'){if(!second){if(ultCharge<100)return;p.jackpot=((p.jackpot||0)+1+Math.floor(Math.random()*4))%5;}else{const r=Math.floor(Math.random()*3);if(r===0){p.speedMult=1.25;p.boostTimer=300;}else if(r===1)p.candyReload=300;else p.candyDamage=300;}}else if(current==='Griff'){if(second)p.griffExtra=true;else {const a=Number.isFinite(angleOverride)?angleOverride:aimPoint?Math.atan2(aimPoint.y,aimPoint.x):joyR.active?Math.atan2(joyR.cy-joyR.y,joyR.cx-joyR.x):Math.atan2(enemy.y-p.y,enemy.x-p.x);zones.push({x:p.x,y:p.y,sx:p.x,sy:p.y,tx:Math.max(22,Math.min(tlbsWorld.width-22,p.x+Math.cos(a)*180)),ty:Math.max(22,Math.min(tlbsWorld.height-22,p.y+Math.sin(a)*180)),type:'griffPiggy',r:90,life:144});};}else if(current==='Crow'){if(second){for(const t of combatTargets()){if(!tlbsCrowPoison.has(t)||t.safe||t.spawnShield)continue;t.slow=Math.max(t.slow||0,210);}}else p.shield=180;}
    else if(current==='Piper'){
        if(second)p.piperGuide=true;
        else {
            const target=combatTargets().filter(t=>!t.safe&&!t.spawnShield&&!t.altitude&&dist(p,t)<=230&&visibleTo(p,t))
                .sort((a,b)=>dist(p,a)-dist(p,b))[0];
            if(!target)return;
            const angle=angleTo(target);
            const survived=target.hp>420;
            hitEnemy(420,false,target);
            if(survived&&!target.out){target.slow=90;moveOnPitch(target,Math.cos(angle)*45,Math.sin(angle)*45);}
        }
    }else if(current==='Frank'){
        if(second)p.frankPull=true;
        else {p.stun=0;p.frankGuard=120;}
    }else if(current==='Bea'){
        if(second){if(p.beeCharge)return;p.beeCharge=true;}
        else zones.push({x:p.x,y:p.y,r:110,type:'beeField',life:180});
    }else if(current==='Bonnie'){
        if(second){
            if(!p.bonnieOnFoot)return;
            for(const target of combatTargets()){
                if(target.safe||target.spawnShield||target.altitude||dist(p,target)>120||!visibleTo(p,target))continue;
                const angle=angleTo(target);
                moveOnPitch(target,Math.cos(angle)*55,Math.sin(angle)*55);
            }
        }else{
            if(p.bonnieOnFoot)return;
            p.bonnieReload=180;
        }
    }else if(current==='Surge'){
        if(second){if(ammo<1)return;ammo--;p.shield=Math.max(p.shield,120);}
        else {if(surgeAttackLevel()>=4)return;p.surgeOverdrive=300;}
    }else if(current==='Fang'){
        if(second)p.shield=Math.max(p.shield,75);
        else {if(p.fangStun)return;p.fangStun=true;}
    }else if(current==='Kit'){
        if(second){
            const ally=p.attachment?.ally&&p.attachment.target;
            if(!ally||ally.out||ally.hp>=ally.maxHp)return;
            ally.hp=Math.min(ally.maxHp,ally.hp+900);
        }else{
            if(p.attachment||p.hiddenTicks>0)return;
            p.hiddenTicks=120;
        }
    }else if(current==='Gale'){
        if(second){if(p.galeFrost)return;p.galeFrost=true;}
        else for(const t of combatTargets()){
            if(t.safe||t.spawnShield||t.altitude||dist(p,t)>120||!visibleTo(p,t))continue;
            const a=angleTo(t);
            for(let i=0;i<7;i++)moveOnPitch(t,Math.cos(a)*8,Math.sin(a)*8);
            t.x=Math.max(22,Math.min(tlbsWorld.width-22,t.x));
            t.y=Math.max(22,Math.min(tlbsWorld.height-22,t.y));
        }
    }else if(current==='Bo'){
        if(second){if(p.boBind)return;p.boBind=true;}
        else {
            const traps=zones.filter(z=>z.type==='boMine');
            if(!traps.length)return;
            for(const trap of traps){trap.arm=0;trap.fuse=Math.min(trap.fuse||6,6);}
        }
    }else if(current==='Tick'){
        if(second){if(p.tickSpread)return;p.tickSpread=true;}
        else p.shield=Math.max(p.shield,90);
    }else if(current==='Barley'){
        if(second){if(p.barleySticky)return;p.barleySticky=true;}
        else zones.push({x:p.x,y:p.y,r:105,type:'barleyAid',life:180});
    }else if(current==='Jessie'){
        const turret=zones.find(z=>z.type==='turret'&&z.hp>0);
        if(!turret)return;
        if(second)turret.overclock=180;
        else {if(turret.hp>=turret.maxHp)return;turret.hp=Math.min(turret.maxHp,turret.hp+1100);}
    }else if(current==='Nita'){
        const bear=zones.find(z=>z.type==='bear'&&z.hp>0);
        if(!bear)return;
        if(second)bear.guard=120;
        else {
            const targets=combatTargets().filter(t=>!t.safe&&!t.spawnShield&&!t.altitude&&dist(t,bear)<=95&&visibleTo(bear,t));
            if(!targets.length)return;
            for(const target of targets)target.stun=Math.max(target.stun||0,60);
        }
    }else if(current==='Pam'){
        const station=zones.find(z=>z.type==='station'&&z.hp>0);
        if(!station)return;
        if(second)station.overclock=180;
        else healAtStation(station,720);
    }else return;
    p.gadgetFlash=24;
    p.gadgetUses--;p.gadgetCooldown=300;updateUI();}
// Chester's five existing super variants, in rosterSuper order.
const chesterSuperIcons=[['💣','Взрыв'],['☠','Ядовитое облако'],['✦','Оглушение'],['✹','Леденцовая зона'],['✚','Лечение']];
function tlbsSuperIcon(){return current==='Chester'&&ultCharge>=100?chesterSuperIcons[p.jackpot||0][0]:'★';}
const tlbsHitEffects=[];
function tlbsActorHUD(a,local=false){
 if(!a||a.out||!Number.isFinite(a.hp)||!a.maxHp)return;
 const x=a.x,y=a.y-(a.altitude||0)-53,w=72;
 ctx.save();ctx.fillStyle='#142033';ctx.fillRect(x-w/2,y,w,9);ctx.fillStyle=local?'#79ef9d':'#ff797d';ctx.fillRect(x-w/2+1,y+1,(w-2)*Math.max(0,Math.min(1,a.hp/a.maxHp)),7);
 ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.strokeStyle='#142033';ctx.lineWidth=3;ctx.fillStyle='#fff';ctx.strokeText(Math.ceil(Math.max(0,a.hp)),x,y-4);ctx.fillText(Math.ceil(Math.max(0,a.hp)),x,y-4);
 if(local){const max=BRAWLERS[current].maxAmmo||3,step=w/max;for(let i=0;i<max;i++){ctx.fillStyle='#182333';ctx.fillRect(x-w/2+i*step,y+12,step-2,7);ctx.fillStyle='#ffb75b';ctx.fillRect(x-w/2+i*step,y+12,(step-2)*Math.max(0,Math.min(1,ammo-i)),7);}if(ultCharge>0){ctx.fillStyle='#172033';ctx.fillRect(x-w/2,y+22,w,4);ctx.fillStyle=ultCharge>=100?'#ffe45e':'#71c9ff';ctx.fillRect(x-w/2,y+22,w*Math.min(1,ultCharge/100),4);if(ultCharge>=100){ctx.fillStyle='#ffe45e';ctx.fillText(tlbsSuperIcon(),x+w/2+12,y+25);}}}
 if(!local&&a.botCharge>0){ctx.fillStyle='#172033';ctx.fillRect(x-w/2,y+12,w,4);ctx.fillStyle=a.botCharge>=100?'#ffc861':'#f38c72';ctx.fillRect(x-w/2,y+12,w*a.botCharge/100,4);}
 if(!local&&(a.botFlash>0||a.botShield>0)){
  ctx.strokeStyle=a.botShield>0?'#8cdbc7':'#ffc861';ctx.lineWidth=2;
  ctx.beginPath();ctx.ellipse(a.x,a.y+14,23+(a.botFlash||0)*.3,11,0,0,Math.PI*2);ctx.stroke();
 }
 ctx.restore();
}
function tlbsPaintHits(){const now=performance.now();for(let i=tlbsHitEffects.length-1;i>=0;i--){const f=tlbsHitEffects[i],u=(now-f.born)/650;if(u>=1){tlbsHitEffects.splice(i,1);continue;}ctx.save();ctx.globalAlpha=1-u;ctx.strokeStyle='#fff3c4';ctx.lineWidth=3;for(let j=0;j<6;j++){const a=j*Math.PI/3,r=12+u*38;ctx.beginPath();ctx.moveTo(f.x+Math.cos(a)*r,f.y+Math.sin(a)*r);ctx.lineTo(f.x+Math.cos(a)*(r+10),f.y+Math.sin(a)*(r+10));ctx.stroke();}ctx.font='bold 19px system-ui';ctx.textAlign='center';ctx.strokeStyle='#172033';ctx.lineWidth=4;ctx.fillStyle='#fff2a5';ctx.strokeText('-'+f.damage,f.x,f.y-24-u*40);ctx.fillText('-'+f.damage,f.x,f.y-24-u*40);ctx.restore();}}
// Gameplay camera utility: preserve the arena while resizing the viewport.
const TLBS_MAP_SIZES={duel:[1200,1200],standard:[2400,1800],large:[3200,2400]};
let tlbsWorld={width:2400,height:1800},tlbsCamera={x:0,y:0},tlbsMapWalls=[];
function tlbsConfigureMap(mode){
 const size=mode==='duel'?TLBS_MAP_SIZES.duel:['solo','duo'].includes(mode)?TLBS_MAP_SIZES.large:TLBS_MAP_SIZES.standard;
 tlbsWorld={width:size[0],height:size[1]};
}
function tlbsDestroyCover(x,y,r){
 if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(r)||r<0)return 0;
 let destroyed=0;
 // Keep the arena's collision wall reference synchronized with the rendered map.
 for(let i=tlbsMapWalls.length-1;i>=0;i--){
  const w=tlbsMapWalls[i];
  const nearX=Math.max(w.x,Math.min(x,w.x+w.w));
  const nearY=Math.max(w.y,Math.min(y,w.y+w.h));
  if((nearX-x)**2+(nearY-y)**2<=r*r){tlbsMapWalls.splice(i,1);destroyed++;}
 }
 return destroyed;
}
function tlbsBuildMap(mode){
 const blocks=mode==='duel'?[[.24,.33,.16,25],[.61,.66,.16,25]]:mode==='ball'?[[.12,.28,.2,25],[.68,.28,.2,25],[.12,.70,.2,25],[.68,.70,.2,25]]:[[.15,.28,.18,26],[.67,.28,.18,26],[.15,.72,.18,26],[.67,.72,.18,26]];
 const extra={knockout:[[.35,.42,.12,35],[.53,.58,.12,35]],gems:[[.25,.47,.12,38],[.63,.47,.12,38]],solo:[[.32,.36,.1,40],[.58,.64,.1,40],[.45,.48,.1,30]],duo:[[.28,.45,.12,35],[.60,.55,.12,35]],heist:[[.38,.22,.24,30],[.38,.78,.24,30]],zone:[[.26,.5,.12,35],[.62,.5,.12,35]]};
 blocks.push(...(extra[mode]||[]));
 tlbsMapWalls=blocks.map(([x,y,w,h])=>({x:x*tlbsWorld.width,y:y*tlbsWorld.height,w:w*tlbsWorld.width,h}));
}
function tlbsFollowCamera(snap=false){
 const x=Math.max(0,Math.min(Math.max(0,tlbsWorld.width-canvas.width),p.x-canvas.width/2));
 const y=Math.max(0,Math.min(Math.max(0,tlbsWorld.height-canvas.height),p.y-canvas.height/2));
 const t=snap?1:.15;
 tlbsCamera.x+=(x-tlbsCamera.x)*t;tlbsCamera.y+=(y-tlbsCamera.y)*t;
}
function tlbsMiniMap(){
 const c=document.getElementById('minimap');if(!c)return;
 const g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);
 g.fillStyle='#172b3d';g.fillRect(0,0,c.width,c.height);
 for(const r of tlbsMapWalls){g.fillStyle='#8095a0';g.fillRect(r.x/tlbsWorld.width*c.width,r.y/tlbsWorld.height*c.height,r.w/tlbsWorld.width*c.width,Math.max(2,r.h/tlbsWorld.height*c.height));}
 const actors=arena?.actors||[p,enemy];
 for(const a of actors){
  if(a.out)continue;
  g.fillStyle=a===p?'#ffed9c':a.team===0?'#74d1fa':'#ff8692';
  g.beginPath();g.arc(a.x/tlbsWorld.width*c.width,a.y/tlbsWorld.height*c.height,a===p?4:3,0,7);g.fill();
 }
 if(arena?.ball&&Number.isFinite(arena.ball.x)){g.fillStyle='#fff';g.fillRect(arena.ball.x/tlbsWorld.width*c.width-2,arena.ball.y/tlbsWorld.height*c.height-2,4,4)}
 g.strokeStyle='#ffffffa0';g.strokeRect(tlbsCamera.x/tlbsWorld.width*c.width,tlbsCamera.y/tlbsWorld.height*c.height,canvas.width/tlbsWorld.width*c.width,canvas.height/tlbsWorld.height*c.height);
}
    let superFx=null, attackFx=[];
    let enemyAI = false;
    let activePin = { type: '', timer: 0, scale: 0 };
    let enemyPin = { type: '', timer: 0, scale: 0 };
    let current = 'Shelly', ultCharge = 0, isUltReady = false, gameActive = false;
    let ammo = 3, p = { x: 0, y: 0, scale: 1, isFlying: false, speedMult: 1, boostTimer: 0, shield: 0 }; 
    let pip = { active: false, x: 0, y: 0, angle: 0, life: 0 };
    let enemy = { x: 200, y: 150, hp: 30000, maxHp: 30000 };
    let bullets = [], zones = [], throws = [], trainingTargets = [];
    const mortisRange = 130;
    let joyL = { active: false, x: 100, y: 0, cx: 100, cy: 0, id: null };
    let joyR = { active: false, x: 0, y: 0, cx: 0, cy: 0, id: null };
    let joyU = { active: false, x: 0, y: 0, cx: 0, cy: 0, id: null }; 

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const tlbsCrowPoison = new Map();
    const canvasState = trackCanvasState(ctx);

    function drawFrame() {
        try {
            draw();
        } finally {
            canvasState.finishFrame();
        }
    }

    function toggleAI() {
        enemyAI = !enemyAI;
        const btn = document.getElementById('ai-toggle');
        if(btn) {
            btn.innerText = enemyAI ? "БОТ: ВКЛ" : "БОТ: ВЫКЛ";
            btn.style.background = enemyAI ? "#00ff00" : "#ff4444";
        }
        sounds.click.play();
    }

    function togglePinMenu() { 
        const m = document.getElementById('pin-menu');
        if(m) m.style.display = (m.style.display === 'flex') ? 'none' : 'flex'; 
    }

    function sendPin(emoji) { 
        activePin.type = emoji; activePin.timer = 150; activePin.scale = 0; 
        togglePinMenu();
        sounds.click.play();
    }

    function drawPin(x, y, pin) {
        if (pin.timer <= 0) return;
        ctx.save(); 
        ctx.translate(x, y - 75 + Math.sin(pin.timer * 0.1) * 5); 
        ctx.scale(pin.scale, pin.scale);
        ctx.fillStyle = "white"; ctx.strokeStyle = "black"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, 26, 0, 7); ctx.fill(); ctx.stroke();
        ctx.font = "28px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(pin.type, 0, 2); ctx.restore();
    }

    function changeScreen(id) {
        sounds.click.play();
        document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
        if(id === 'game') {
            canvas.style.display = 'block';
            document.getElementById('hud').style.display = 'flex';
            sounds.menuMusic.pause();
            sounds.battleMusic.play();
            initGame();
        } else {
            canvas.style.display = 'none';
            document.getElementById('hud').style.display = 'none';
            document.getElementById(id === 'menu' ? 'menu' : 'brawlers-screen').style.display = 'flex';
            sounds.battleMusic.pause();
            sounds.menuMusic.play();
            if(id === 'brawlers') renderList();
            if(id === 'menu') syncLobby();
        }
    }

    function exitToMenu() {
        window.closeSharedHost?.();
        current=selectedFighter || current;
        gameActive = false; clearCombatTimers(); resetControls(); cancelAnimationFrame(frameId); pip.active = false;
        changeScreen('menu'); window.endRoomPreview?.(); 
    }

    function renderList() {
        const list = document.getElementById('list'); list.innerHTML = '';
        const query=document.querySelector('#fighter-search').value.trim().toLowerCase();
        const keys=Object.keys(BRAWLERS).filter(key=>(key+' '+fighterNames[key]).toLowerCase().includes(query));
        document.querySelector('#search-empty').hidden=keys.length>0;
        keys.forEach(key => {
            const b = BRAWLERS[key];
            const div = document.createElement('button');
            div.type = 'button';
            div.setAttribute('aria-pressed', String(current === key));
            div.className = 'card';
            div.style.setProperty('--accent',b.color);
            div.innerHTML = '<span class="glyph">'+fighterNames[key].slice(0,2).toUpperCase()+'</span><strong>'+fighterNames[key]+'</strong><small>'+(b.hp || practiceHp[key])+' HP</small>';
            div.onclick = () => { 
                current = key;
                for (const card of list.children) card.setAttribute('aria-pressed', String(card === div));
                try { localStorage.setItem('tlbs.fighter',key); } catch {}
                document.getElementById('active-name').innerText = key.replace('_',' '); 
                syncLobby();
                sounds.click.play();
            };
            list.appendChild(div);
        });
    }

    let frameId = 0, lastFrame = 0, accumulator = 0;
    let fpsFrames = 0, fpsSince = 0, minimapAt = 0;
    function graphicsQuality(){return window.tlbsGraphicsQuality??1;}
    function updateFrameStats(now){
        if(!fpsSince)fpsSince=now;
        fpsFrames++;
        if(now-fpsSince>=500){
            const output=document.getElementById('battle-fps');
            if(output&&!output.hidden)output.textContent=Math.round(fpsFrames*1000/(now-fpsSince))+' FPS';
            fpsSince=now;fpsFrames=0;
        }
        if(now>=minimapAt){
            tlbsMiniMap();
            minimapAt=now+[160,80,40][graphicsQuality()];
        }
    }
    function initGame() {
        clearCombatTimers();
        resetControls();
        cancelAnimationFrame(frameId); lastFrame = 0; accumulator = 0;fpsFrames=0;fpsSince=0;minimapAt=0;
        p.scale = 1; isUltReady = false;
        for (const j of [joyL, joyR, joyU]) { j.active = false; j.id = null; }
        activePin.timer = enemyPin.timer = 0;
        canvas.width = canvas.clientWidth || window.innerWidth; canvas.height = canvas.clientHeight || window.innerHeight;
        tlbsConfigureMap(window.roomPreview?'training':document.querySelector('#mode').value);
        tlbsBuildMap(document.querySelector('#mode').value);
        p.x = tlbsWorld.width/2; p.y = tlbsWorld.height - 150; 
        p.isFlying = false; p.speedMult = 1; p.boostTimer = 0; p.shield = 0;
        pip.active = false; 
        enemy.x = tlbsWorld.width / 2; enemy.y = 150; enemy.hp = 30000;
        joyL.y = canvas.height - 120;tlbsFollowCamera(true);
        joyR.x = canvas.width - 100; joyR.y = canvas.height - 130;
        joyU.x = canvas.width - 120; joyU.y = canvas.height / 2; 
        ultCharge = 0; bullets = []; zones = []; throws = [];
        trainingTargets = window.roomPreview ? [] : [-1,1].map(side => ({
            x:Math.max(30,Math.min(tlbsWorld.width-30,enemy.x+side*110)), y:enemy.y+75, hp:30000, maxHp:30000
        }));
        superFx=null;
        p.motion=null;
        setupMatch();
        tlbsFollowCamera(true);
        ammo = BRAWLERS[current].maxAmmo;
        renderAmmo();
        gameActive = true; frameId = requestAnimationFrame(update);
    }

    function renderAmmo() {
        const ammoCont = document.getElementById('ammo-container');
        ammoCont.innerHTML = '';
        for(let i=0; i<BRAWLERS[current].maxAmmo; i++) ammoCont.innerHTML += `<div class="ammo-cell"><div id="ammo-${i}" class="ammo-fill"></div></div>`;
    }

    function updateUI() {
        gemHUD();
        const gadget=document.getElementById('tlbs-gadget');if(gadget){gadget.hidden=!Object.hasOwn(tlbsLoadouts,current);gadget.disabled=!(p.gadgetUses>0)||p.gadgetCooldown>0;gadget.style.display=gadget.hidden?'none':'block';const symbol={Griff:['pig','coins'],Dynamike:['spinner','spark'],Chester:['dice','candy'],Crow:['shield','hourglass'],Piper:['repel','guide'],Frank:['guard','pull'],Bea:['hive','beeCharge'],Bonnie:['reload','push'],Surge:['overdrive','capacitor'],Fang:['kickStun','stance'],Kit:['paw','bandage'],Gale:['gust','frost'],Bo:['signal','tether'],Tick:['shell','spread'],Barley:['remedy','sticky'],Jessie:['repair','rapid'],Nita:['stomp','bearShield'],Pam:['aid','pulse']};
        const symbolName=symbol[current]?.[Number(p.gadgetChoice)]||'spark';
        if(gadget.dataset.symbol!==symbolName){gadget.replaceChildren();const icon=document.createElement('span');icon.className='tlbs-gadget-symbol';icon.dataset.symbol=symbolName;if(tlbsGadgetIcons[symbolName]){icon.className='tlbs-gadget-svg';icon.innerHTML=tlbsGadgetIcons[symbolName];}const count=document.createElement('span');count.className='tlbs-gadget-count';gadget.append(icon,count);gadget.dataset.symbol=symbolName;}
        const count=gadget.lastElementChild;
        const status=String(p.gadgetUses||0)+(p.gadgetCooldown>0?' · '+Math.ceil(p.gadgetCooldown/60)+' с':'');
        if(count.textContent!==status)count.textContent=status;gadget.style.background=p.gadgetUses<=0?'#30343b':p.gadgetCooldown>0?'#737982':'#38ad63';gadget.style.borderColor=gadget.disabled?'#a0a5ad':'#a4ffad';gadget.title=(tlbsLoadouts[current]?.[0]?.[Number(p.gadgetChoice)]||'Гаджет')+' (G)';gadget.setAttribute('aria-label',gadget.title+', '+count.textContent);}
        isUltReady = (ultCharge >= 100);
        const bar=document.getElementById('ult-bar');
        const revealed=current==='Chester'&&(isUltReady||p.passiveChoice==='1');
        bar.textContent=revealed?chesterSuperIcons[p.jackpot||0].join(' '):'';
        bar.title=revealed?chesterSuperIcons[p.jackpot||0][1]:'';
        bar.style.fontSize='12px';bar.style.textAlign='center';bar.style.color='#172033';
        document.getElementById('ult-bar').style.width = Math.min(ultCharge, 100) + '%';
        document.getElementById('ult-bar').style.background = isUltReady ? '#ff00ff' : '#ffff00';
        for(let i=0; i<BRAWLERS[current].maxAmmo; i++) {
            let fill = document.getElementById('ammo-' + i);
            if(fill) fill.style.width = (ammo > i) ? (Math.min(1, ammo - i) * 100) + "%" : "0%";
        }
    }

    function update(now) {
        if (!gameActive) return;
        try {
            if (!lastFrame) lastFrame = now;
            accumulator += Math.max(0,Math.min(100, now - lastFrame)); lastFrame = now;
            let steps=0;
            while (accumulator >= 1000 / 60 && steps++<6) { tick(); accumulator -= 1000 / 60; }
            if(!match.finished)window.shareMatch?.();
            window.sendRoomPosition?.(p.x/tlbsWorld.width,p.y/tlbsWorld.height);
            tlbsFollowCamera();updateUI();drawFrame();updateFrameStats(now);
        } catch(error) {
            // A single malformed ability must not silently kill requestAnimationFrame.
            console.error('[TL BS] Game frame failed:',error);
            accumulator=0;lastFrame=now;
            if(!window.tlbsLastFrameError || now-window.tlbsLastFrameError>3000){
                window.tlbsLastFrameError=now;
                const notice=document.getElementById('tlbs-error');
                if(notice){notice.textContent='Ошибка боевого эффекта. Игровой цикл восстановлен.';notice.hidden=false;}
            }
        } finally {
            if(gameActive)frameId=requestAnimationFrame(update);
        }
    }
    function tick() {
        if(match.finished) return;
        for(const key of ['frankGuard','frankRage','gadgetFlash','bonnieReload','surgeOverdrive'])if(p[key]>0)p[key]--;
        tickCrowPoison();
        for(const t of [enemy,...trainingTargets])if(t.slow>0)t.slow--;
        if(p.gadgetCooldown>0)p.gadgetCooldown--;if(p.candyReload>0)p.candyReload--;if(p.candyDamage>0)p.candyDamage--;
        if(match.nextRound) duelTurn();
        if(p.hiddenTicks>0) p.hiddenTicks--;
        if(superFx && ++superFx.age>=45) superFx=null;
        attackFx=attackFx.filter(f=>++f.age<18);
        if(realm && --realm.left<=0) realm=null;
        if(p.frankGuard>0)p.stun=0;else if(p.stun>0)p.stun--;
        if(p.slow>0)p.slow--;
        advanceAttachment();
        tickObjective();
        if(match.finished) return;
        tickHammer();tickWaves();advanceSuperMotion();
        combatTick();
        advanceThrows();
        const startX=p.x,startY=p.y;
        keyboardMovement();
        if(!p.out && !realm && (current==='Edgar'||(current==='Kit' && !p.attachment)))
            ultCharge=Math.min(100,ultCharge+100/(current==='Edgar'?1800:1200));
        const maxAmmo=BRAWLERS[current].maxAmmo;
        if(ammo<maxAmmo){
            const reloadRate=p.candyReload>0||p.bonnieReload>0&&!p.bonnieOnFoot?22:16.6;
            ammo=Math.min(maxAmmo,ammo+reloadRate/BRAWLERS[current].reload);
        }
        if(p.boostTimer > 0) { p.boostTimer--; if(p.boostTimer <= 0) p.speedMult = 1; }
        if(p.shield > 0) p.shield--;if(current==='Griff'&&p.passiveChoice==='1'&&!p.out){p.griffHeal=(p.griffHeal||0)+1;if(p.griffHeal>=120){p.griffHeal=0;p.hp=Math.min(p.maxHp,p.hp+(p.maxHp-p.hp)*.15);}}
        [activePin, enemyPin].forEach(p => { if(p.timer > 0) { p.timer--; p.scale += (p.timer > 300 ? 1.2 : 1.0 - p.scale) * 0.2; } else p.scale = 0; });
        if(!arena && !enemy.stun && (!p.hiddenTicks || dist(p,enemy)<65) && inPlane(enemy) && enemyAI && match.mode==='training') {
            let d = Math.hypot(p.x - enemy.x, p.y - enemy.y);
            if(d>160)tlbsBotMove(enemy,p,1.5*(enemy.slow>0?.5:1));
        }
        if(pip.active) {
            if(joyL.active) { let dx=joyL.cx-joyL.x, dy=joyL.cy-joyL.y; pip.angle = Math.atan2(dy, dx); }
            pip.x += Math.cos(pip.angle) * 7; pip.y += Math.sin(pip.angle) * 7; pip.life--;
            if(Math.hypot(pip.x-enemy.x, pip.y-enemy.y) < 40 || pip.life <= 0) {
                if(pip.life > 0) hitEnemy(3000, false);
                zones.push({x: pip.x, y: pip.y, r: 120, life: 20, type: 'boom'});
                pip.active = false;
            }
        } else if(joyL.active && !p.stun && !p.attachment && !p.isFlying && !p.out) {
            let dx=joyL.cx-joyL.x, dy=joyL.cy-joyL.y, dist=Math.hypot(dx,dy); 
            if(dist>5){
                const speed=BRAWLERS[current].speed*p.speedMult*(p.slow>0?.5:1);
                p.x+=dx/dist*speed;p.y+=dy/dist*speed;
            }
        }
        if((arena?.walls.length||tlbsMapWalls.length) && !p.isFlying){const dx=p.x-startX,dy=p.y-startY;p.x=startX;p.y=startY;moveOnPitch(p,dx,dy);}
        p.botVx=p.x-startX;p.botVy=p.y-startY;
        for(let i=bullets.length-1;i>=0;i--){ const b=bullets[i]; 
            if(b.guide){
                const target=combatTargets().filter(t=>!t.safe&&!t.spawnShield&&dist(t,b)<210&&(t.x-b.x)*b.vx+(t.y-b.y)*b.vy>0)
                    .sort((a,c)=>dist(a,b)-dist(c,b))[0];
                if(target){
                    const angle=Math.atan2(b.vy,b.vx);
                    const desired=Math.atan2(target.y-b.y,target.x-b.x);
                    const delta=Math.atan2(Math.sin(desired-angle),Math.cos(desired-angle));
                    const next=angle+Math.max(-.08,Math.min(.08,delta));
                    const speed=Math.hypot(b.vx,b.vy);
                    b.vx=Math.cos(next)*speed;b.vy=Math.sin(next)*speed;
                }
            }
            if(b.type === 'nani') {
                b.progress += 0.035;
                let ang = Math.atan2(b.ty - b.y, b.tx - b.x);
                let offX = Math.cos(ang + 1.57) * Math.sin(b.progress * Math.PI) * b.curve;
                let offY = Math.sin(ang + 1.57) * Math.sin(b.progress * Math.PI) * b.curve;
                b.x = b.originX + (b.tx - b.originX) * b.progress + offX; b.y = b.originY + (b.ty - b.originY) * b.progress + offY;
                if(b.progress >= 1) { bullets.splice(i, 1); continue; }
            } else {
                if(b.special==='griffNote'&&b.life<=b.turn){if(!b.returning){b.returning=true;b.visited=[];}const a=Math.atan2(p.y-b.y,p.x-b.x);b.vx=Math.cos(a)*14;b.vy=Math.sin(a)*14;if(Math.hypot(p.x-b.x,p.y-b.y)<16){bullets.splice(i,1);continue;}}
                b.x+=b.vx; b.y+=b.vy; if(--b.life<=0) {
                    botRocketImpact(b);
                    if(b.special==='Spike')burstSpike(b);
                    if(b.special === 'gene_main') {
                        for(let j=-1; j<=1; j++) {
                            spawnBullet(b.angle + j*0.25, 12, 25, false, 5, 'gene_split');
                            bullets[bullets.length-1].x = b.x; bullets[bullets.length-1].y = b.y;
                        }
                    }
                    bullets.splice(i,1); continue;
                }
                if(b.special==='bounce') { if(b.x<0 || b.x>tlbsWorld.width) b.vx *= -1; if(b.y<0 || b.y>tlbsWorld.height) b.vy *= -1; }
                if(b.special==='bubble') { if(b.x<0 || b.x>tlbsWorld.width) b.vx *= -1; if(b.y<0 || b.y>tlbsWorld.height) b.vy *= -1; }
            }
            if(b.special!=='griffNote'&&insideCover(b.x,b.y)){if(b.blast){b.x-=b.vx;b.y-=b.vy;botRocketImpact(b);}if(b.special==='Spike'||b.wallSplit){b.x-=b.vx;b.y-=b.vy;if(b.wallSplit)splitSurge(b);else burstSpike(b);}bullets.splice(i,1);continue;}
            if(b.special==='hostile' || b.special==='teamShot'){
                const unit=hostileSummons(b.owner||enemy).find(z=>dist(z,b)<20);
                if(unit){strikeSummon(unit,b.damage||(b.special==='hostile'?800:550));botRocketImpact(b);bullets.splice(i,1);continue;}
            }
            if(b.special==='teamShot'){
                const t=[...arena.actors,...arena.safes].find(t=>!t.out && t.team!==b.owner.team && inPlane(t)===inPlane(b.owner) && dist(t,b)<23);
                if(t){
                    if(b.blast)botRocketImpact(b);
                    else botDealDamage(b,t,550);
                    bullets.splice(i,1);
                }continue;
            }
            if(b.special==='hostile') {
                if(Math.hypot(b.x-p.x,b.y-p.y)<27) { bullets.splice(i,1);if(b.blast)botRocketImpact(b);else botDealDamage(b,p,800); }
                continue;
            }
            const targets = combatTargets();
            const target = targets.find(t => !b.visited?.includes(t) && Math.hypot(b.x-t.x,b.y-t.y)<30);
            if (!target) continue;
            if(b.special==='realm' && !target.safe){startRealm(target);break;}
            if(b.special==='anchor'){
                if(!target.safe) beginTravel(angleTo(target),Math.min(dist(p,target),308),18,'Buzz',65,target);
                bullets.splice(i,1);continue;
            }
            if(b.special==='griffCoin'){hitEnemy(280,true,target);bullets.splice(i,1);continue;}
            if(b.special==='griffNote'){(b.visited ||= []).push(target);hitEnemy(Math.round(660+Math.min(1,Math.hypot(b.x-b.originX,b.y-b.originY)/420)*660),false,target);continue;}
            if(b.special==='bats') {
                (b.visited ||= []).push(target);
                const damage=Math.min(1200,target.hp);hitEnemy(damage,false,target);
                p.hp=Math.min(p.maxHp,p.hp+damage);continue;
            }
            if(b.special==='jawbreaker' && !target.safe)target.stun=75;
            if(b.special==='Nita'){
                (b.visited ||= []).push(target);hitEnemy(950,true,target);continue;
            }
            if(b.special==='Piper' || b.special==='Leon' || b.special==='Bea'){
                const distance=Math.hypot(b.x-b.originX,b.y-b.originY);
                let damage=b.special==='Bea'?(b.charged?1800:600):b.special==='Piper'?Math.round(440+Math.min(1250,distance*1.6)):Math.round(500-Math.min(290,distance*.55));
                if(b.special==='Bea' && !b.charged && current==='Bea' && !p.out && !target.safe && !target.spawnShield && !target.altitude)p.beeCharge=true;
                if(b.special==='Piper'){
                    if(b.ambush)damage=Math.round(damage*1.25);
                    if(!target.spawnShield&&!target.altitude){
                        damageNotes.push({x:target.x,y:target.y,age:0,damage});
                        if(b.reloadBonus&&current==='Piper'&&!p.out)ammo=Math.min(BRAWLERS.Piper.maxAmmo,ammo+.4);
                    }
                }
                hitEnemy(damage,true,target);bullets.splice(i,1);continue;
            }
            if(b.special==='shoe'||b.special==='Surge'||b.special==='surgeShard'){
                if(b.special==='Surge')splitSurge(b,target);
                if(b.fangStun&&!target.safe&&!target.spawnShield&&!target.altitude)target.stun=Math.max(target.stun||0,60);
                hitEnemy(b.special==='shoe'?360:b.special==='Surge'?850:340,true,target);
                bullets.splice(i,1);continue;
            }
            if(b.special==='swarm'&&b.beeSlow&&!target.safe&&!target.spawnShield&&!target.altitude)target.slow=Math.max(target.slow||0,120);
            if(b.special==='bonnieFoot'&&b.repair&&!p.out&&!target.safe&&!target.spawnShield&&!target.altitude){
                p.hp=Math.min(p.maxHp,p.hp+90);
            }
            if(b.galeFrost&&!target.safe&&!target.spawnShield&&!target.altitude)target.slow=Math.max(target.slow||0,90);
            if(b.boBind&&!target.safe&&!target.spawnShield&&!target.altitude)target.slow=Math.max(target.slow||0,60);
            if (b.special==='Edgar') p.hp=Math.min(p.maxHp,p.hp+160);
            if (b.special==='silence' || b.special==='swarm') match.cooldown=Math.max(match.cooldown,100);
            if (b.special==='Spike')burstSpike(b);
            if (b.special === 'pull') { target.x=p.x; target.y=p.y; }
            if(b.special==='poison'&&!target.safe&&!target.spawnShield&&!target.altitude){
                const active=tlbsCrowPoison.get(target);
                tlbsCrowPoison.set(target,{left:180,next:active?.next||30});
            }
            hitEnemy(b.special==='Colette'?Math.max(300,Math.round(target.hp*.2)):b.special==='energy' ? Math.round(1200*0.75**(b.visited?.length || 0)) : b.special==='gene_split' ? 150 : b.damage||400,!b.isUlt,target);
            if (b.special==='energy') {
                (b.visited ||= []).push(target);
                const distance = t => Math.hypot(t.x-b.x,t.y-b.y);
                const next = targets.filter(t=>!b.visited.includes(t) && distance(t)<=(b.longBounce?305:250)&&visibleTo(b,t)).sort((a,c)=>distance(a)-distance(c))[0];
                if (next && b.visited.length<3) {
                    const angle=Math.atan2(next.y-b.y,next.x-b.x);
                    b.vx=Math.cos(angle)*12; b.vy=Math.sin(angle)*12; b.life=b.longBounce?27:23;
                    continue;
                }
            }
            if(b.special==='bubble'||b.special==='bounce')(b.visited ||= []).push(target);
            else bullets.splice(i,1);
        }
        for(let i=zones.length-1;i>=0;i--){ const z=zones[i]; 
            if(z.type==='griffPiggy'&&z.life>=120){const u=Math.max(0,Math.min(1,(144-z.life)/24));z.x=z.sx+(z.tx-z.sx)*u;z.y=z.sy+(z.ty-z.sy)*u;}
            if(z.type==='griffPiggy'&&z.life<=1){
                for(const t of combatTargets())if(Math.hypot(t.x-z.x,t.y-z.y)<z.r)hitEnemy(1000,false,t);
                tlbsDestroyCover(z.x,z.y,z.r);
                z.type='blast';z.life=15;
            }
            if(summonStats[z.type]){z.age++;if(z.hitFlash)z.hitFlash--;if(z.guard>0)z.guard--;}
            if(z.type === 'gravity') { enemy.x += (z.x - enemy.x) * 0.1; enemy.y += (z.y - enemy.y) * 0.1; if(z.life === 1) hitEnemy(2000, false); }
            if(z.type === 'stun' && Math.hypot(enemy.x-z.x, enemy.y-z.y)<z.r) hitEnemy(10, false);
            const nearby = combatTargets().filter(t=>Math.hypot(t.x-z.x,t.y-z.y)<z.r);
            if(z.type==='head') {
                const target=combatTargets().filter(t=>!t.safe).sort((a,b)=>dist(z,a)-dist(z,b))[0];
                if(target){
                    const d=dist(z,target);
                    if(d<26){for(const t of nearby)hitEnemy(2400,false,t);z.type='blast';z.life=14;}
                    else {z.x+=(target.x-z.x)/d*4;z.y+=(target.y-z.y)/d*4;}
                }
            }
            if(z.type==='bear') {
                const angle=Math.atan2(enemy.y-z.y,enemy.x-z.x);
                if(!nearby.length) {z.x+=1.7*Math.cos(angle);z.y+=1.7*Math.sin(angle);}
                if(z.age%(z.fastClaws?27:40)===0)for(const t of nearby){
                    if(t.spawnShield||t.altitude||!visibleTo(z,t))continue;
                    hitEnemy(700,false,t);
                    if(z.sharedHeal&&current==='Nita'&&!p.out)p.hp=Math.min(p.maxHp,p.hp+160);
                }
            }
            if(z.type==='aura') {z.x=p.x;z.y=p.y;if(z.life%30===0) for(const t of nearby) hitEnemy(500,false,t);}
            if(z.type==='poprocks' && z.life%20===0)for(const t of nearby)hitEnemy(240,false,t);
            if(z.type==='station'&&summonPulse(z,45,22))healAtStation(z,z.healPower||600);
            if(z.type==='barleyAid'&&z.life%30===0){
                for(const ally of arena?.actors||[p]){
                    if(!ally.out&&(ally===p||ally.team===p.team)&&dist(ally,z)<=z.r)ally.hp=Math.min(ally.maxHp,ally.hp+180);
                }
            }
            if(z.type==='beeField'){
                for(const target of nearby)if(!target.safe&&!target.spawnShield&&!target.altitude&&visibleTo(z,target))target.slow=Math.max(target.slow||0,12);
            }
            if(z.type==='sandstorm' && Math.hypot(p.x-z.x,p.y-z.y)<z.r) p.hiddenTicks=2;
            if(z.type==='boMine') {
                if(z.arm>0) z.arm--;
                else if(z.fuse>0) {
                    if(--z.fuse===0) {
                        for(const target of nearby) hitEnemy(2000,false,target);
                        tlbsDestroyCover(z.x,z.y,z.r);
                        z.type='blast'; z.life=16;
                    }
                } else if(nearby.length) z.fuse=24;
            }
            if (z.type==='mine' && nearby.length) {
                for(const target of nearby) hitEnemy(640,true,target);
                z.type='blast'; z.life=12;
            }
            if(z.type==='turret'&&summonPulse(z,30,15)) {
                const target=combatTargets().sort((a,b)=>Math.hypot(a.x-z.x,a.y-z.y)-Math.hypot(b.x-z.x,b.y-z.y))[0];
                if(target&&Math.hypot(target.x-z.x,target.y-z.y)<390&&visibleTo(z,target))
                    spawnBullet(z.angle=Math.atan2(target.y-z.y,target.x-z.x),10,40,true,5,'turret',z);
            }
            if (z.type==='fire' && z.life%30===0) for(const target of nearby) hitEnemy(z.damage||400,!z.isUlt,target);
            if(z.sticky)for(const target of nearby){
                if(!target.safe&&!target.spawnShield&&!target.altitude)target.slow=Math.max(target.slow||0,18);
            }
            if (z.type==='boom' && !z.exploded) {
                z.exploded=true;
                for(const target of nearby) {if(z.satchel)target.stun=90;hitEnemy(z.isBig?(current==='Dynamike'&&p.passiveChoice==='1'?4000:2400):1200,!z.isUlt,target);}
            }
            if(Number.isFinite(z.life) && --z.life<=0) zones.splice(i,1); 
        }
        p.x = Math.max(22, Math.min(tlbsWorld.width-22,p.x));
        p.y = Math.max(22, Math.min(tlbsWorld.height-22,p.y));
    }

    function draw() {
        ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.save();ctx.translate(-tlbsCamera.x,-tlbsCamera.y);
        ctx.fillStyle = realm ? "#342649" : "#2e7d32"; ctx.fillRect(tlbsCamera.x,tlbsCamera.y,canvas.width,canvas.height);
        if(graphicsQuality()>0&&!realm&&match.mode!=='ball'){
            ctx.save();ctx.strokeStyle='rgba(255,255,255,.045)';ctx.lineWidth=1;
            for(let x=Math.floor(tlbsCamera.x/64)*64;x<tlbsCamera.x+canvas.width;x+=64){ctx.beginPath();ctx.moveTo(x,tlbsCamera.y);ctx.lineTo(x,tlbsCamera.y+canvas.height);ctx.stroke();}
            for(let y=Math.floor(tlbsCamera.y/64)*64;y<tlbsCamera.y+canvas.height;y+=64){ctx.beginPath();ctx.moveTo(tlbsCamera.x,y);ctx.lineTo(tlbsCamera.x+canvas.width,y);ctx.stroke();}
            ctx.strokeStyle='#184d25';ctx.lineWidth=8;ctx.strokeRect(4,4,tlbsWorld.width-8,tlbsWorld.height-8);ctx.restore();
        }
        if(match.mode==='ball')paintPitch();
        else {ctx.save();for(const r of tlbsMapWalls){if(r.x+r.w<tlbsCamera.x||r.x>tlbsCamera.x+canvas.width||r.y+r.h<tlbsCamera.y||r.y>tlbsCamera.y+canvas.height)continue;ctx.fillStyle='#243a4b';ctx.fillRect(r.x,r.y+5,r.w,r.h);ctx.fillStyle='#678393';ctx.fillRect(r.x,r.y,r.w,r.h-5);}ctx.restore();}
        drawObjective();
        if(realm){ctx.save();ctx.fillStyle='#ebd9ff';ctx.font='bold 16px sans-serif';ctx.textAlign='center';ctx.fillText('Царство теней · '+Math.ceil(realm.left/60)+' с',tlbsCamera.x+canvas.width/2,tlbsCamera.y+100);ctx.restore();}
        if(tlbsGadgetAim!==null&&current==='Griff'){const x=Math.max(22,Math.min(tlbsWorld.width-22,p.x+Math.cos(tlbsGadgetAim)*180)),y=Math.max(22,Math.min(tlbsWorld.height-22,p.y+Math.sin(tlbsGadgetAim)*180));ctx.save();ctx.strokeStyle='#baffaa';ctx.fillStyle='#baffaa22';ctx.lineWidth=3;ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(x,y);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(x,y,90,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();}
        if((joyR.active || joyU.active || aimPoint) && !pip.active) {
            let j = joyU.active ? joyU : joyR;
            const angle = j.active ? Math.atan2(j.cy - j.y, j.cx - j.x) : Math.atan2(aimPoint.y, aimPoint.x);
            drawAim(angle,joyU.active || Boolean(aimPoint && pressedKeys.has(bindings.super)));
        }
        if(p.altitude>0){ctx.save();ctx.fillStyle='#14152366';ctx.beginPath();ctx.ellipse(p.x,p.y,23,9,0,0,7);ctx.fill();ctx.restore();}
        for(const t of combatTargets()){
            const effects=[];
            if(t.stun>0)effects.push('Оглушение');
            if(tlbsCrowPoison.has(t))effects.push('Яд');
            if(t.slow>0)effects.push('Замедление '+Math.ceil(t.slow/60)+' с');
            if(!effects.length)continue;
            ctx.save();ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillStyle='#ffe77b';
            ctx.fillText(effects.join(' · '),t.x,t.y-76);ctx.restore();
        }
        if(match.mode!=='gems' && !enemy.out && inPlane(enemy)){
        const botName=match.mode==='duel'?botTrio[Math.min(match.kills,2)]:enemy.fighter;
        ctx.fillStyle=BRAWLERS[botName]?.color||'#d65a65'; ctx.beginPath(); ctx.arc(enemy.x, enemy.y, 30, 0, 7); ctx.fill();
        
        if(match.mode!=='duel'){ctx.save();ctx.textAlign='center';ctx.font='bold 13px sans-serif';ctx.fillStyle='white';ctx.fillText(botName?fighterNames[botName]||botName:match.mode==='training'?'Тренировочный бот':'Бот',enemy.x,enemy.y-58);ctx.restore();}
        }
        for(const t of trainingTargets.filter(t=>match.mode!=='gems' && !t.out && !t.safe && inPlane(t))) {
            ctx.fillStyle='#b04a55'; ctx.beginPath(); ctx.arc(t.x,t.y,24,0,7); ctx.fill();
            ctx.fillStyle='#1a2030'; ctx.fillRect(t.x-25,t.y-36,50,5);
            ctx.fillStyle='#a4ffa5'; ctx.fillRect(t.x-25,t.y-36,50*t.hp/t.maxHp,5);
        }
        for(const t of throws) {
            const u=Math.max(0,Math.min(1,t.age/30)), x=t.x+(t.tx-t.x)*u, y=t.y+(t.ty-t.y)*u;
            ctx.fillStyle='#17213488';ctx.beginPath();ctx.ellipse(x,y,9,4,0,0,7);ctx.fill();
            ctx.fillStyle=t.type==='mine'?'#81dbff':'#ffbd5e';ctx.beginPath();ctx.arc(x,y-70*Math.sin(Math.PI*u),11,0,7);ctx.fill();
        }
        if(match.mode==='duel') {
            ctx.save();ctx.textAlign='center';ctx.fillStyle='white';ctx.font='bold 14px sans-serif';
            ctx.fillText(fighterNames[botTrio[Math.min(match.kills,2)]],enemy.x,enemy.y-57);ctx.restore();
        }
        if(pip.active) { ctx.fillStyle = "yellow"; ctx.beginPath(); ctx.arc(pip.x, pip.y, 15, 0, 7); ctx.fill(); }
        ctx.save(); if(p.out)ctx.globalAlpha=.18; if(p.hiddenTicks)ctx.globalAlpha=.4;ctx.translate(p.x,p.y-(p.altitude||0)); ctx.scale(p.scale, p.scale);
        if(p.gadgetFlash>0){
            const u=1-p.gadgetFlash/24;
            ctx.strokeStyle=BRAWLERS[current].color;ctx.lineWidth=3;
            for(let i=0;i<6;i++){
                const angle=i*Math.PI/3;
                ctx.beginPath();ctx.moveTo(Math.cos(angle)*(25+18*u),Math.sin(angle)*(25+18*u));
                ctx.lineTo(Math.cos(angle)*(34+22*u),Math.sin(angle)*(34+22*u));ctx.stroke();
            }
        }
        if(p.shield > 0) { ctx.strokeStyle = "#4caf50"; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0,0,30,0,7); ctx.stroke(); }
        if(p.boostTimer > 0) { ctx.shadowBlur = 15; ctx.shadowColor = "yellow"; ctx.strokeStyle = "yellow"; ctx.strokeRect(-22,-22,44,44); }
        ctx.fillStyle=BRAWLERS[current].color; ctx.beginPath(); ctx.arc(0,0,22,0,7); ctx.fill(); ctx.strokeStyle="#fff"; ctx.lineWidth=3; ctx.stroke();
        ctx.restore();
        ctx.save(); ctx.font="bold 14px Arial"; ctx.textAlign="center"; ctx.lineWidth=3; ctx.strokeStyle="#17202a"; ctx.fillStyle="white";
        const label=window.playerNickname || "Player"; if(match.mode!=='gems'){ctx.strokeText(label,p.x,p.y-78); ctx.fillText(label,p.x,p.y-78);} ctx.restore();
        if(window.roomPreview && !realm){for(const remote of Object.values(window.remotePlayers||{})){const x=remote.x*tlbsWorld.width,y=remote.y*tlbsWorld.height;ctx.save();ctx.fillStyle="#62cfff";ctx.beginPath();ctx.arc(x,y,22,0,7);ctx.fill();ctx.fillStyle="white";ctx.font="14px Arial";ctx.textAlign="center";ctx.fillText(remote.nickname,x,y-35);ctx.restore()}}
        if(match.mode!=='training' && match.mode!=='gems') {
            ctx.save();ctx.fillStyle='#192338';ctx.fillRect(p.x-32,p.y+30,64,7);
            ctx.fillStyle='#67efac';ctx.fillRect(p.x-32,p.y+30,64*p.hp/p.maxHp,7);
            ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 13px sans-serif';
            ctx.fillText(current+' · '+p.hp+' HP',p.x,p.y+53);
            const score=match.mode==='arms'?'Боец '+Math.min(match.order.length,1+Math.floor(match.kills/2))+'/'+match.order.length+' · '+match.kills+'/'+(2*match.order.length):match.kills+' : '+match.deaths;
            ctx.fillText(score,tlbsCamera.x+canvas.width/2,tlbsCamera.y+75);ctx.restore();
        }
        paintTeamHUD();
        if(p.hiddenTicks){ctx.save();ctx.fillStyle='white';ctx.textAlign='center';ctx.fillText('Скрыт · '+Math.ceil(p.hiddenTicks/60)+' с',p.x,p.y+65);ctx.restore();}
        if(match.mode==='gems')drawGemActors();
        for(const a of new Set([p,...(arena?.actors||[enemy,...trainingTargets])]))if(inPlane(a))tlbsActorHUD(a,a===p);
        drawPin(p.x, p.y, activePin);
        drawPin(enemy.x, enemy.y, enemyPin);
        bullets.forEach(b=>{if(!['griffCoin','griffNote'].includes(b.special)){drawCombatProjectile(b);return;}ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.vy,b.vx));ctx.lineWidth=2;ctx.strokeStyle='#715c24';if(b.special==='griffCoin'){ctx.fillStyle='#ffd34e';ctx.beginPath();ctx.arc(0,0,6,0,Math.PI*2);ctx.fill();ctx.stroke();}else{ctx.fillStyle='#9ee4a1';ctx.fillRect(-11,-6,22,12);ctx.strokeRect(-11,-6,22,12);ctx.fillStyle='#39764a';ctx.fillRect(-3,-4,6,8);}ctx.restore();});
        tlbsPaintHits();
        paintHammer();paintWaves();
        for(const f of attackFx){
            const u=Math.max(0,Math.min(1,f.age/18)),s=f.shape;
            ctx.save();if(p.out||f.fighter!==current){ctx.restore();continue;}ctx.translate(p.x,p.y-(p.altitude||0));ctx.rotate(f.angle);
            ctx.globalAlpha=(1-u)*.65;ctx.strokeStyle=f.color;ctx.fillStyle=f.color;ctx.lineWidth=3;
            if(typeof tlbsDrawWeapon==='function'&&tlbsDrawWeapon(f,u)) {ctx.restore();continue;}
            if(['Barley','Dynamike','Tick'].includes(f.fighter)){ctx.save();ctx.rotate(-.8+u*1.6);ctx.fillStyle=f.color;ctx.fillRect(12,-7,25,14);ctx.strokeStyle='#fff';ctx.strokeRect(12,-7,25,14);ctx.restore();}
            else if(['El_Primo','Rosa','Edgar','Kit'].includes(f.fighter)){for(const side of [-1,1]){ctx.beginPath();ctx.arc(18+u*30,side*13,9*(1-u)+4,0,7);ctx.fill();}}
            else if(['Mortis','Bibi','Fang'].includes(f.fighter)){ctx.beginPath();ctx.arc(0,0,24+u*42,-.8+u,.5+u);ctx.stroke();}
            else {ctx.beginPath();ctx.moveTo(18,-7);ctx.lineTo(34+u*15,0);ctx.lineTo(18,7);ctx.fill();}
            if(s.kind==='fan'){ctx.beginPath();ctx.arc(0,0,s.range*(.25+.75*u),-s.spread,s.spread);ctx.stroke();}
            else if(s.kind==='landing'||s.kind==='jump'){ctx.beginPath();ctx.arc(0,0,22+u*18,0,Math.PI*2);ctx.stroke();}
            else {const reach=Math.min(s.range,75);ctx.beginPath();ctx.moveTo(18,0);ctx.lineTo(reach*(.5+.5*u),-9*(1-u));ctx.lineTo(reach*(.5+.5*u),9*(1-u));ctx.closePath();ctx.fill();}
            ctx.restore();
        }
        zones.forEach(z => {
            if(z.type==='beeField'||z.type==='barleyAid'){
                ctx.save();ctx.strokeStyle=z.type==='barleyAid'?'#9fffc4':'#ffe28e';ctx.lineWidth=2;
                for(let i=0;i<6;i++){
                    const angle=i*Math.PI/3;
                    ctx.beginPath();ctx.arc(z.x,z.y,z.r,angle,angle+.46);ctx.stroke();
                }
                ctx.restore();return;
            }
            if(z.type==='griffPiggy'){ctx.save();ctx.translate(z.x,z.y-(z.life>120?Math.sin(Math.PI*Math.max(0,Math.min(1,(144-z.life)/24)))*45:0));ctx.fillStyle='#f39ab5';ctx.strokeStyle='#733d55';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,21,15,0,0,7);ctx.fill();ctx.stroke();ctx.fillRect(14,-5,12,10);ctx.fillRect(-12,10,7,9);ctx.fillRect(8,10,7,9);ctx.fillStyle='#733d55';ctx.fillRect(-7,-13,14,3);ctx.fillRect(10,-6,3,3);ctx.font='bold 14px system-ui';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText((Math.min(120,z.life)/60).toFixed(1),0,-24);ctx.restore();return;}

            if(drawSummon(z))return;
            if(z.type==='boMine') {
                ctx.save();ctx.strokeStyle=z.fuse?'#ff995e':'#bbcdd580';
                ctx.lineWidth=z.fuse?3:1;ctx.beginPath();ctx.arc(z.x,z.y,z.fuse?8+(24-z.fuse)*1.5:7,0,7);ctx.stroke();ctx.restore();return;
            }
            if(z.type==='gravity') ctx.fillStyle="rgba(0,0,0,0.6)";
            else if(z.type==='mine') ctx.fillStyle="rgba(255,0,0,0.5)";
            else if(z.type==='turret') ctx.fillStyle="rgba(255,87,34,0.6)";
            else ctx.fillStyle="rgba(255,255,0,0.4)";
            ctx.beginPath(); ctx.arc(z.x,z.y,z.r,0,7); ctx.fill(); 
        });
        if(superFx) {
            const u=Math.max(0,Math.min(1,superFx.age/45));
            ctx.save();ctx.globalAlpha=Math.sin(Math.PI*(0.12+0.88*u));
            ctx.strokeStyle='#ffdb72';ctx.lineWidth=3;ctx.beginPath();
            ctx.arc(superFx.x,superFx.y,25+48*u,0,Math.PI*2);ctx.stroke();
            ctx.strokeStyle=BRAWLERS[superFx.fighter]?.color||'#ffdb72';
            ctx.lineWidth=5*(1-u)+1;
            ctx.beginPath();ctx.arc(superFx.x,superFx.y,18+85*u,0,Math.PI*2);ctx.stroke();
            const rays=[4,8,12][graphicsQuality()];
            for(let i=0;i<rays;i++){
                const a=i*Math.PI*2/rays+u*.8, radius=25+95*u;
                ctx.beginPath();ctx.moveTo(superFx.x+Math.cos(a)*radius,superFx.y+Math.sin(a)*radius);
                ctx.lineTo(superFx.x+Math.cos(a)*(radius+18*(1-u)),superFx.y+Math.sin(a)*(radius+18*(1-u)));ctx.stroke();
            }
            ctx.font='bold 15px sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff4bd';
            ctx.fillText('Супер · '+(typeof fighterNames!=='undefined'?fighterNames[superFx.fighter]:superFx.fighter),superFx.x,superFx.y-42-14*u);
            ctx.restore();
        }
        if(drag) {
            ctx.save();ctx.translate(tlbsCamera.x,tlbsCamera.y);ctx.fillStyle='#ffffff30';ctx.strokeStyle='#fff';ctx.lineWidth=2;
            ctx.beginPath();ctx.arc(drag.x,drag.y,16,0,7);ctx.fill();ctx.stroke();
            if(aimPoint) {ctx.beginPath();ctx.moveTo(drag.x,drag.y);ctx.lineTo(drag.x+aimPoint.x,drag.y+aimPoint.y);ctx.stroke();}
            ctx.restore();
        }
        ctx.restore();
        if(!touchControls) return;
        ctx.save();
        ctx.globalAlpha=window.tlbsControlOpacity??.85;
        for(const j of [joyL,joyR,joyU]){
            if(!j.active)continue;
            const r=42*window.tlbsControlScale,dx=j.cx-j.x,dy=j.cy-j.y,d=Math.hypot(dx,dy),k=d>r?r/d:1;
            ctx.fillStyle='#10182766';ctx.strokeStyle=j===joyU?'#ffdb72':j===joyR?'#ff7777':'#a6dfff';ctx.lineWidth=2;
            ctx.beginPath();ctx.arc(j.x,j.y,r,0,Math.PI*2);ctx.fill();ctx.stroke();
            ctx.fillStyle=ctx.strokeStyle;ctx.beginPath();ctx.arc(j.x+dx*k,j.y+dy*k,17*window.tlbsControlScale,0,Math.PI*2);ctx.fill();
        }
        if(isUltReady&&!joyU.active){const h=superHome();ctx.fillStyle='#ffcf55aa';ctx.beginPath();ctx.arc(h.x,h.y,30,0,Math.PI*2);ctx.fill();ctx.fillStyle='#352100';ctx.font='bold 22px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(tlbsSuperIcon(),h.x,h.y);}
        ctx.restore();
        ctx.globalAlpha = 1;
    }

try {
    const saved=localStorage.getItem('tlbs.fighter');
    if(Object.hasOwn(BRAWLERS,saved)) {
        current=saved;
        document.getElementById('active-name').textContent=current.replace('_',' ');

    }
} catch {}

(function(){const button=document.getElementById('tlbs-gadget');if(!button)return;let start=null;button.style.touchAction='none';button.addEventListener('pointerdown',e=>{if(current!=='Griff'||p.gadgetChoice==='1'||button.disabled)return;e.preventDefault();start={x:e.clientX,y:e.clientY,id:e.pointerId};tlbsGadgetAim=Math.atan2(enemy.y-p.y,enemy.x-p.x);button.setPointerCapture(e.pointerId);});button.addEventListener('pointermove',e=>{if(!start||e.pointerId!==start.id||tlbsGadgetAim===null)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.hypot(dx,dy)>8)tlbsGadgetAim=Math.atan2(dy,dx);});button.addEventListener('pointerup',e=>{if(!start||e.pointerId!==start.id)return;const a=tlbsGadgetAim;start=null;tlbsGadgetAim=null;if(a!==null)tlbsUseGadget(a);});button.addEventListener('pointercancel',()=>{start=null;tlbsGadgetAim=null;});})();
