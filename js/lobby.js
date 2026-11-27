const fighterNames = Object.fromEntries(Object.keys(BRAWLERS).map((key,index)=>[key,
    'Шелли Кольт Эль_Примо Барли Брок Динамайк Мортис Сту Дэррил Нани Макс Ворон Тара Джин Биби Булл Джесси Бо Тик Роза Рико Фрэнк Поко Нита Пайпер Пэм Леон Спайк Сэнди Эдгар Колетт Эмз Беа Гейл Вольт Фэнг Базз Честер Корделиус Кит'.split(' ')[index].replace('_',' ')]));
const hints={training:'Свободная тренировка с тремя мишенями.',skirmish:'Побеждает тот, кто первым наберёт три устранения.',arms:'Начни выбранным бойцом. По два устранения каждым из 40 бойцов. После смерти прогресс сохраняется.',duel:'Выбери тройку. После поражения выходит следующий боец. Победи всю тройку бота.'};
const modeSelect=document.querySelector('#mode');
for(const [id,[name,hint]] of Object.entries(objectives)){modeSelect.add(new Option(name,id));hints[id]=hint;}
const reserves=['#reserve-two','#reserve-three'].map(id=>document.querySelector(id));
function syncLobby() {
    const b=BRAWLERS[current], name=fighterNames[current];
    document.querySelector('#active-name').textContent=name;
    document.querySelector('#crest').textContent=name.slice(0,2).toUpperCase();
    document.querySelector('#char-preview').style.setProperty('--accent',b.color);
    document.querySelector('#fighter-stats').textContent=(b.hp || practiceHp[current])+' HP  ·  '+(b.reload/1000).toLocaleString('ru')+' с / заряд';
    document.querySelector('#custom-limit').hidden=modeSelect.value!=='custom';
    const used=new Set([current]);
    for(const select of reserves) {
        const previous=select.value;
        select.replaceChildren();
        for(const key of Object.keys(BRAWLERS)) if(!used.has(key)) select.add(new Option(fighterNames[key],key));
        if(previous && !used.has(previous)) select.value=previous;
        used.add(select.value);
    }
    document.querySelector('#mode-help').textContent=hints[modeSelect.value];
    document.querySelector('#reserves').hidden=modeSelect.value!=='duel';
    document.querySelector('#ai-toggle').hidden=modeSelect.value!=='training';
}
modeSelect.addEventListener('change',syncLobby);
reserves[0].addEventListener('change',syncLobby);
document.querySelector('#fighter-search').addEventListener('input',renderList);
syncLobby();
