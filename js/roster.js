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
    Kit:['#ded9b7',6000,850,10,10,0.35,3,'pounce']
};
for(const [name,[color,hp,reload,speed,life,spread,count,ability]] of Object.entries(additions)) {
    BRAWLERS[name]={color,hp,reload,speed:4.2,type:spread?'spread':'line',ultType:ability,
        ultChargeRate:12,maxAmmo:name==='Bea'?1:3,shot:{speed,life,spread,count}};
}
function rosterAttack(angle) {
    if(current==='Kit'){
        if(p.attachment?.ally)spawnBarleyBottle(angle,kitYarn.range,'yarn',false);
        else for(const t of combatTargets())if(inFan(t,angle,kitClaw))hitEnemy(900,true,t);
        return;
    }
    const {speed,life,spread}=BRAWLERS[current].shot;
    let count=BRAWLERS[current].shot.count;
    if(current==='Chester'){count=1+(p.bells||0);p.bells=count%4;}
    if(current==='Leon'){
        p.hiddenTicks=0;
        for(let i=0;i<count;i++){
            const fire=()=>spawnBullet(angle+spread*(2*i/(count-1)-1),speed,life,false,6,'Leon');
            if(i===0)fire();else scheduleCombatAction(()=>{if(current==='Leon' && !p.out)fire();},i*80);
        }
        return;
    }
    for(let i=0;i<count;i++) {
        const offset=count===1?0:spread*(2*i/(count-1)-1);
        spawnBullet(angle+offset,speed,life,false,6,current);
        if(current==='Bea'){bullets[bullets.length-1].charged=Boolean(p.beeCharge);p.beeCharge=false;}
    }
}
function rosterSuper(angle) {
    const ability=BRAWLERS[current].ultType;
    const targets=combatTargets();
    const step=d=>({x:Math.max(22,Math.min(canvas.width-22,p.x+Math.cos(angle)*d)),y:Math.max(22,Math.min(canvas.height-22,p.y+Math.sin(angle)*d))});
    const area=(pos,r,dmg)=>{for(const t of targets) if(Math.hypot(t.x-pos.x,t.y-pos.y)<r) hitEnemy(dmg,false,t);};
    switch(ability) {
        case 'heal':
            for(const ally of arena?.actors || [p])if(!ally.out && ally.team===p.team && (ally===p || inFan(ally,angle,superAimData.Poco)))ally.hp=Math.min(ally.maxHp,ally.hp+3000);
            break;
        case 'station': zones.push({...step(140),type:'station',r:95,life:420}); break;
        case 'bear': zones.push({...step(150),type:'bear',r:32,life:600}); break;
        case 'escape': zones.push({...p,type:'boom',r:105,life:15,isBig:true}); beginTravel(angle,200,28,'Piper',24); break;
        case 'cloak': p.hiddenTicks=260; break;
        case 'sandstorm': zones.push({...step(160),type:'sandstorm',r:140,life:360}); break;
        case 'thorns': zones.push({...step(220),type:'fire',r:100,life:180,isUlt:true}); break;
        case 'aura': zones.push({...p,type:'aura',r:125,life:180}); break;
        case 'wind': for(const t of targets) if(inFan(t,angle,superAimData.Gale)) {
            t.x=Math.max(30,Math.min(canvas.width-30,t.x+Math.cos(angle)*150));
            t.y=Math.max(30,Math.min(canvas.height-30,t.y+Math.sin(angle)*150));
        } break;
        case 'swarm': for(let i=-3;i<=3;i++) spawnBullet(angle+i*.11,11,45,true,6,'swarm'); break;
        case 'upgrade': case 'return': case 'kick': case 'leap': case 'pounce': {
            const shape=combatShape(true);beginTravel(angle,shape.range,current==='Kit'?26:20,current,shape.radius);break;
        }
        case 'hook': spawnBullet(angle,14,23,true,8,'anchor');break;
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
