const audioContext=()=>{const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;return audioContext.ctx ||= new C();};
function effect(notes){return {currentTime:0,volume:0.6,pause(){},play(){try{const a=audioContext();if(!a)return Promise.resolve();a.resume().catch(()=>{});let t=a.currentTime;for(const [f,end,d,type] of notes){const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(end,t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,this.volume*.12),t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d);t+=d*.65;}return Promise.resolve();}catch{return Promise.resolve();}}};}
const sounds={
menuMusic:new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3'),
battleMusic:new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
click:effect([[620,900,.075,'sine']]),
shoot:effect([[480,140,.12,'triangle']]),
ult:effect([[220,440,.15,'triangle'],[440,880,.22,'sine']]),
hit:effect([[160,65,.10,'triangle']])
};
for(const [s,v] of [[sounds.menuMusic,.4],[sounds.battleMusic,.3]]){s.loop=true;s.volume=v;const play=s.play.bind(s);s.play=()=>play().catch(()=>{});}
