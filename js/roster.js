// Local arena tuning: distances are canvas units, lifetimes are simulation ticks.
const additions = {
    Poco:['#f3cf51',7400,1600,10,27,0.42,5,'heal'],
    Nita:['#d66b53',8000,1100,12,28,0,1,'bear'],
    Piper:['#f1a4be',4600,2300,18,46,0,1,'escape'],
    Pam:['#da7049',9600,1400,13,37,0.30,7,'station'],
    Leon:['#7ecf69',6800,1900,15,36,0.16,4,'cloak'],
    Spike:['#5bc999',4800,2000,12,36,0,1,'thorns'],
    Sandy:['#bc8edb',7600,1800,12,28,0.26,3,'sandstorm'],
    Edgar:['#8e79dc',6600,750,11,8,0,2,'leap'],
    Colette:['#c490d5',6800,1600,15,36,0,1,'return'],
    Emz:['#bd9edd',7200,2000,8,35,0.32,5,'aura'],
    Bea:['#f7bd4a',5000,950,16,40,0,1,'swarm'],
    Gale:['#99dce6',7600,1400,14,36,0.14,5,'wind'],
    Surge:['#ef6879',6800,1900,13,33,0,1,'upgrade'],
    Fang:['#ed8067',8600,1550,15,32,0,1,'kick'],
    Buzz:['#54cbb5',9600,1000,10,12,0.38,5,'hook'],
    Chester:['#dc8bcb',7400,1900,14,32,0.22,3,'surprise'],
    Cordelius:['#ae81e3',6400,1250,13,25,0.07,2,'isolate'],
    Griff:['#e5a84a',6800,1500,14,35,.22,3,'griffReturn'],
    Bonnie:['#ef7790',7200,1800,16,36,0,1,'bonnie'],
    Kit:['#ded9b7',6000,850,10,10,0.35,3,'pounce']
};
for(const [name,[color,hp,reload,speed,life,spread,count,ability]] of Object.entries(additions)) {
    BRAWLERS[name]={color,hp,reload,speed:4.2,type:spread?'spread':'line',ultType:ability,
        ultChargeRate:12,maxAmmo:name==='Bea'?1:3,shot:{speed,life,spread,count}};
}
const originalFighters={
    Kestrel:{name:'Кестрел',color:'#54c8fb',hp:5200,reload:1200,speed:4.6,shot:{speed:19,life:31,spread:.11,count:2},damage:510,super:'salvo',description:'Ульта выпускает веер из семи импульсов.'},
    Basalt:{name:'Базальт',color:'#e4966b',hp:10400,reload:1420,speed:3.7,shot:{speed:12,life:15,spread:.27,count:3},damage:460,super:'fortify',description:'Ульта даёт щит и замедляет врагов рядом.'},
    Lumen:{name:'Люмен',color:'#e9c46d',hp:6500,reload:1250,speed:4.2,shot:{speed:13,life:29,spread:0,count:1},damage:880,super:'restore',description:'Ульта ставит лечебное поле для команды.'},
    Vortex:{name:'Вихрь',color:'#ac91fa',hp:6100,reload:1350,speed:4.3,shot:{speed:14,life:28,spread:.20,count:3},damage:395,super:'well',description:'Ульта притягивает ближайших противников.'},
    Ember:{name:'Искра',color:'#ff775b',hp:5800,reload:1280,speed:4.4,shot:{speed:16,life:30,spread:.15,count:2},damage:550,super:'flare',description:'Ульта оставляет зону периодического урона.'},
    Meridian:{name:'Меридиан',color:'#72dfbf',hp:5650,reload:1530,speed:4.1,shot:{speed:21,life:33,spread:0,count:1},damage:1040,super:'pulse',description:'Ульта наносит урон в выбранной области.'}
};
for(const [id,fighter] of Object.entries(originalFighters)){
    BRAWLERS[id]={...fighter,ultChargeRate:13,maxAmmo:3,ultType:'original'};
}

function originalSuper(angle){
    const fighter=originalFighters[current];
    const shape=combatShape(true);
    const point=destination(angle,shape.range);
    switch(fighter.super){
        case 'salvo':
            for(let i=-3;i<=3;i++){
                spawnBullet(angle+i*.1,18,37,true,6);
                bullets.at(-1).damage=620;
            }
            break;
        case 'fortify':
            p.shield=Math.max(p.shield,180);
            for(const target of combatTargets()){
                if(dist(p,target)>shape.radius||target.spawnShield||target.altitude||!visibleTo(p,target))continue;
                if(!target.safe)target.slow=Math.max(target.slow||0,95);
                hitEnemy(940,false,target);
            }
            break;
        case 'restore':
            zones.push({...point,r:shape.radius,type:'pocoAid',life:120});
            break;
        case 'well':
            zones.push({...point,r:shape.radius,type:'gravity',damage:1850,life:50});
            break;
        case 'flare':
            zones.push({...point,r:shape.radius,type:'fire',damage:510,isUlt:true,life:120});
            break;
        case 'pulse':
            for(const target of combatTargets())if(dist(point,target)<=shape.radius)hitEnemy(1880,false,target);
            zones.push({...point,r:shape.radius,type:'blast',life:16});
            break;
    }
}
function rosterAttack(angle) {
    if(current==='Griff'){const waves=p.griffExtra?4:3;p.griffExtra=false;for(let wave=0;wave<waves;wave++){const fire=()=>{if(current==='Griff'&&!p.out)for(let i=-1;i<=1;i++)spawnBullet(angle+i*.22,14,35,false,6,'griffCoin');};if(wave===0)fire();else scheduleCombatAction(fire,wave*(p.passiveChoice==='0'?75:100));}return;}
    if(['Poco','Nita','Sandy'].includes(current)){startWave(current,angle);return;}
    if(current==='Fang'){
        swipes.push({name:current,x:p.x,y:p.y,age:0,angle});
        const t=combatTargets().filter(t=>inFan(t,angle,fan(85,.58)) && visibleTo(p,t)).sort((a,b)=>dist(p,a)-dist(p,b))[0];
        if(t){
            if(!t.safe&&!t.spawnShield&&!t.altitude){
                if(p.fangStun)t.stun=Math.max(t.stun||0,60);
                if(p.passiveChoice==='1')p.hp=Math.min(p.maxHp,p.hp+180);
            }
            hitEnemy(1440,true,t);
        }else{
            spawnBullet(angle,15,32,false,6,'shoe');
            bullets.at(-1).fangStun=p.fangStun;
        }
        p.fangStun=false;
        return;
    }
    if(current==='Piper'){
        const {speed,life}=BRAWLERS.Piper.shot;
        spawnBullet(angle,speed,life,false,6,'Piper');
        Object.assign(bullets.at(-1),{
            guide:p.piperGuide,
            ambush:p.passiveChoice==='0'&&nearCover(p),
            reloadBonus:p.passiveChoice==='1'
        });
        p.piperGuide=false;
        return;
    }
    if(current==='Bonnie'&&p.bonnieOnFoot){
        for(const offset of [-.18,0,.18]){
            spawnBullet(angle+offset,14,15,false,5,'bonnieFoot');
            bullets.at(-1).repair=p.passiveChoice==='1';
        }
        return;
    }
    if(current==='Surge'){
        spawnBullet(angle,13,surgeLife(),false,7,'Surge');
        Object.assign(bullets.at(-1),{level:surgeAttackLevel(),wallSplit:p.passiveChoice==='0',longShards:p.passiveChoice==='1'});
        return;
    }
    if(current==='Kit'){
        p.hiddenTicks=0;
        if(p.attachment?.ally)spawnBarleyBottle(angle,kitYarn.range,'yarn',false);
        else {
            swipes.push({name:current,x:p.x,y:p.y,age:0,angle});
            for(const t of combatTargets())if(inFan(t,angle,kitClaw))hitEnemy(900,true,t);
        }
        return;
    }
    const {speed,life,spread}=BRAWLERS[current].shot;
    let count=BRAWLERS[current].shot.count;
    if(current==='Chester'){count=1+(p.bells||0);p.bells=count%4;}
    if(current==='Leon'){
        p.hiddenTicks=0;p.leonHealTicks=0;
        const snare=p.leonSnare;
        p.leonSnare=false;
        for(let i=0;i<count;i++){
            const fire=()=>{
                spawnBullet(angle+spread*(2*i/(count-1)-1),speed,life,false,6,'Leon');
                if(i===0)bullets.at(-1).leonSnare=snare;
            };
            if(i===0)fire();else scheduleCombatAction(()=>{if(current==='Leon' && !p.out)fire();},i*80);
        }
        return;
    }
    for(let i=0;i<count;i++) {
        const offset=count===1?0:(current==='Chester'?chesterSpread(count):spread)*(2*i/(count-1)-1);
        const fastBee=current==='Bea'&&p.beeCharge&&p.passiveChoice==='0';
        spawnBullet(angle+offset,fastBee?speed*1.25:speed,fastBee?Math.ceil(life/1.25):life,false,6,current);
        if(current==='Chester'&&count===4&&p.passiveChoice==='0')bullets.at(-1).damage=520;
        if(originalFighters[current])bullets.at(-1).damage=originalFighters[current].damage;
        if(current==='Colette')bullets.at(-1).coletteHeavy=p.coletteHeavy;
        if(current==='Cordelius')bullets.at(-1).cordSlow=p.cordSlow;
        if(current==='Spike')bullets.at(-1).extraThorns=p.passiveChoice==='0';
        if(current==='Emz')bullets.at(-1).emzDense=p.emzDense;
        if(current==='Gale')bullets.at(-1).galeFrost=p.galeFrost;
        if(current==='Bea'){bullets[bullets.length-1].charged=Boolean(p.beeCharge);p.beeCharge=false;}
    }
    if(current==='Gale')p.galeFrost=false;
    if(current==='Emz')p.emzDense=false;
    if(current==='Colette')p.coletteHeavy=false;
    if(current==='Cordelius')p.cordSlow=false;
}
function rosterSuper(angle) {
    const ability=BRAWLERS[current].ultType;
    const targets=combatTargets();
    const step=d=>({x:Math.max(22,Math.min(tlbsWorld.width-22,p.x+Math.cos(angle)*d)),y:Math.max(22,Math.min(tlbsWorld.height-22,p.y+Math.sin(angle)*d))});
    switch(ability) {
        case 'original': originalSuper(angle);break;
        case 'heal':
            for(const ally of playerAllies())if(ally===p||inFan(ally,angle,superAimData.Poco))ally.hp=Math.min(ally.maxHp,ally.hp+3000);
            if(p.passiveChoice==='1')for(const target of targets)if(inFan(target,angle,superAimData.Poco))hitEnemy(750,false,target);
            break;
        case 'station': summon('station',destination(angle,superAimData.Pam.range)); break;
        case 'bear': summon('bear',destination(angle,superAimData.Nita.range)); break;
        case 'escape': zones.push({...p,type:'boom',r:105,life:15,isBig:true,isUlt:true}); beginTravel(angle,combatShape(true).range,32,'Piper',24); break;
        case 'cloak': p.hiddenTicks=260; break;
        case 'sandstorm': zones.push({...step(160),type:'sandstorm',r:combatShape(true).radius,life:360,burn:p.passiveChoice==='0'}); break;
        case 'thorns': zones.push({...step(220),type:'fire',r:100,life:180,isUlt:true,spikeHeal:p.passiveChoice==='1'}); break;
        case 'aura': zones.push({...p,type:'aura',r:125,life:180,drain:p.passiveChoice==='0',slow:p.passiveChoice==='1'}); break;
        case 'wind': startWave('Gale',angle);break;
        case 'griffReturn': for(let i=-2;i<=2;i++){spawnBullet(angle+i*.26,12,72,true,9,'griffNote');bullets.at(-1).turn=35;}break;
        case 'swarm':
            for(let i=-3;i<=3;i++){
                spawnBullet(angle+i*.11,11,45,true,6,'swarm');
                bullets.at(-1).beeSlow=p.passiveChoice==='1';
            }
            break;
        case 'bonnie':
            if(p.bonnieOnFoot)p.bonnieOnFoot=false;
            else {const shape=combatShape(true);beginTravel(angle,shape.range,24,current,shape.radius);}
            break;
        case 'upgrade': case 'return': case 'kick': case 'leap': case 'pounce': {
            const shape=combatShape(true);beginTravel(angle,shape.range,current==='Kit'?26:20,current,shape.radius);break;
        }
        case 'hook':
            spawnBullet(angle,14,p.passiveChoice==='0'?29:23,true,8,'anchor');
            bullets.at(-1).buzzRepair=p.buzzRepair;
            p.buzzRepair=false;
            break;
        case 'surprise': {
            switch(p.jackpot||0){
                case 0:spawnBarleyBottle(angle,220,'boom',true);break;
                case 1:for(const t of targets)if(inFan(t,angle,fan(235,.45)))for(let i=0;i<4;i++)scheduleCombatAction(()=>hitEnemy(300,false,t),i*350);break;
                case 2:spawnBullet(angle,12,35,true,8,'jawbreaker');break;
                case 3:zones.push({...p,type:'poprocks',r:120,life:180});break;
                case 4:for(let i=0;i<3;i++)scheduleCombatAction(()=>{p.hp=Math.min(p.maxHp,p.hp+800);},i*450);break;
            }
            p.jackpot=((p.jackpot||0)+1+Math.floor(Math.random()*4))%5;break;
        }
        case 'isolate': spawnBullet(angle,14,40,true,10,'realm'); break;
    }
}
