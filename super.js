// Ultimate/Super ability system for brawlers

function useUltimate(angle) {
    switch(current) {
        case 'Shelly':
            for(let i=-4; i<=4; i++) spawnBullet(angle+i*0.15, 16, 40, true);
            break;

        case 'Colt':
            for(let i=0; i<12; i++) setTimeout(()=>spawnBullet(angle, 20, 60, true), i*50);
            break;

        case 'Max':
            p.speedMult = 1.6;
            p.boostTimer = 240;
            break;

        case 'Rosa':
            p.shield = 180;
            break;

        case 'Jessie':
            zones.push({
                x: p.x + Math.cos(angle) * 150,
                y: p.y + Math.sin(angle) * 150,
                r: 60,
                life: 300,
                type: 'turret'
            });
            break;

        case 'Bo':
            for(let i=-1; i<=1; i++) {
                let tx = p.x + Math.cos(angle+i*0.4) * 200;
                let ty = p.y + Math.sin(angle+i*0.4) * 200;
                zones.push({
                    x: tx,
                    y: ty,
                    r: 50,
                    life: 500,
                    type: 'mine'
                });
            }
            break;

        case 'Frank':
            zones.push({
                x: p.x + Math.cos(angle) * 180,
                y: p.y + Math.sin(angle) * 180,
                r: 150,
                life: 30,
                type: 'stun'
            });
            break;

        case 'Nani':
            pip.active = true;
            pip.x = p.x;
            pip.y = p.y;
            pip.angle = angle;
            pip.life = 600;
            break;

        case 'Tick':
            pip.active = true;
            pip.x = p.x;
            pip.y = p.y;
            pip.angle = angle;
            pip.life = 400;
            break;

        case 'Tara':
            zones.push({
                x: p.x + Math.cos(angle) * 250,
                y: p.y + Math.sin(angle) * 250,
                r: 100,
                life: 60,
                type: 'gravity'
            });
            break;

        case 'Gene':
            spawnBullet(angle, 18, 40, true, 12, 'pull');
            break;

        case 'Bibi':
            bullets.push({
                x: p.x,
                y: p.y,
                vx: Math.cos(angle) * 10,
                vy: Math.sin(angle) * 10,
                life: 300,
                type: 'bubble',
                size: 15
            });
            break;

        case 'Stu':
            p.x += Math.cos(angle) * 200;
            p.y += Math.sin(angle) * 200;
            break;

        case 'Bull':
        case 'Darryl':
            p.isFlying = true;
            let step = 0;
            let f = setInterval(() => {
                p.x += Math.cos(angle) * 12;
                p.y += Math.sin(angle) * 12;
                if(Math.hypot(p.x-enemy.x, p.y-enemy.y) < 50) hitEnemy(1000, false);
                if(++step > 25) {
                    clearInterval(f);
                    p.isFlying = false;
                }
            }, 20);
            break;

        case 'El_Primo':
            p.isFlying = true;
            p.scale = 2.2;
            let jx = p.x + Math.cos(angle) * 250;
            let jy = p.y + Math.sin(angle) * 250;
            let c = 0;
            let fly = setInterval(() => {
                p.x += (jx - p.x) / 5;
                p.y += (jy - p.y) / 5;
                if(++c >= 20) {
                    clearInterval(fly);
                    p.isFlying = false;
                    p.scale = 1;
                    if(Math.hypot(p.x-enemy.x, p.y-enemy.y) < 120) hitEnemy(1800, false);
                }
            }, 25);
            break;

        case 'Barley':
            for(let i=0; i<5; i++) spawnBarleyBottle(angle+(i-2)*0.3, 250, 'fire', true);
            break;

        case 'Dynamike':
            zones.push({
                x: p.x + Math.cos(angle) * 250,
                y: p.y + Math.sin(angle) * 250,
                r: 140,
                life: 60,
                type: 'boom',
                isBig: true,
                isUlt: true
            });
            break;
    }
}