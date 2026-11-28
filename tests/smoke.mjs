import {readFileSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
function files(dir){return readdirSync(new URL(dir,root),{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(dir+e.name+'/'):e.name.endsWith('.js')?[dir+e.name]:[]);}
for(const file of files('js/')){execFileSync(process.execPath,['--check',new URL(file,root).pathname]);console.log('syntax OK',file);}
const page=read('index.html');
for(const id of ['gameCanvas','minimap','settings-dialog','control-scale','control-sensitivity','room-dialog']){
 assert(page.includes('id="'+id+'"'),'Missing required element: '+id);
}
for(const file of files('js/').filter(p=>!['js/firebase.js','js/online.js','js/profile.js','js/main.js','js/room-match.js'].includes(p)))assert((page.includes('src="'+file+'"')||page.includes('src="'+file+'?')),'Missing classic script '+file);
const game=read('js/game.js');
const preamble=game.slice(0,game.indexOf('    let superFx='));
assert(preamble.includes('function tlbsConfigureMap'),'Missing map configuration');
const runtime={canvas:{width:800,height:600},p:{x:1150,y:870},document:{getElementById:()=>null}};
runInNewContext(preamble+`
tlbsConfigureMap('duel'); if(tlbsWorld.width!==1200||tlbsWorld.height!==1200)throw Error('Wrong duel size');
tlbsConfigureMap('training');if(tlbsWorld.width!==2400||tlbsWorld.height!==1800)throw Error('Wrong standard size');
tlbsConfigureMap('solo');if(tlbsWorld.width!==3200||tlbsWorld.height!==2400)throw Error('Wrong large size');
tlbsBuildMap('solo');if(!tlbsMapWalls.length)throw Error('Missing map cover');
tlbsFollowCamera(true);if(tlbsCamera.x<0||tlbsCamera.y<0)throw Error('Invalid camera');
`,runtime);
const aim=read('js/aim.js'),combat=read('js/combat.js'),controls=read('js/controls.js');
assert(aim.includes('tlbsAttackPower')&&combat.includes('tlbsAttackPower=power')&&controls.includes('Math.hypot(dx,dy)*window.tlbsSensitivity'),'Throw strength not wired');
// Guard animation math and the previously broken projectile lifetime boundaries.
assert(game.includes('Math.max(0,Math.min(1,t.age/30))'),'Thrown projectile rendering must clamp progress');
assert(game.includes('Math.max(0,Math.min(1,superFx.age/45))'),'Super effect rendering must clamp progress');
assert(game.includes('Math.max(0,Math.min(1,f.age/18))'),'Attack effect rendering must clamp progress');
assert(game.includes("if(z.type==='griffPiggy'&&z.life<=1)"),'Griff piggy bank must detonate on expiration');
assert(game.includes('Math.max(0,Math.min(1,(144-z.life)/24))'),'Griff flight progress must be bounded');
assert(game.includes("else if(current==='Crow'){if(second)"),'Crow second gadget must execute in combat');
assert(read('js/match.js').includes('enemy.slow>0?0.5:1'),'Crow slow must affect opponent movement');
const rules=JSON.parse(read('database.rules.json'));
assert(rules.rules['.read']===false&&rules.rules['.write']===false,'Database root must default deny');
console.log('PASS: static asset, world geometry, throw, rules and syntax smoke tests');
