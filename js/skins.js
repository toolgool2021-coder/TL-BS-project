const fighterSkins = [
    {name:'Классика', fill:null, trim:'#ffffff', mark:null},
    {name:'Неон', fill:'#242342', trim:'#79efff', mark:'bolt'},
    {name:'Графит', fill:'#252932', trim:'#f6c269', mark:'stripe'}
];
const selectedSkins = Object.create(null);

function selectedFighterSkin(fighter){
    if(!Object.hasOwn(selectedSkins,fighter)){
        let saved=0;
        try{saved=Number(localStorage.getItem('tlbs.skin.'+fighter));}catch{}
        selectedSkins[fighter]=fighterSkins[saved]?saved:0;
    }
    return selectedSkins[fighter];
}

function fighterAppearance(fighter,skin=selectedFighterSkin(fighter)){
    const style=fighterSkins[skin]||fighterSkins[0];
    return {fill:style.fill||BRAWLERS[fighter]?.color||'#d7e1ef',trim:style.trim,mark:style.mark};
}

function drawFighterBody(brush,x,y,radius,fighter,skin){
    const appearance=fighterAppearance(fighter,skin);
    brush.save();brush.translate(x,y);
    brush.fillStyle=appearance.fill;brush.strokeStyle=appearance.trim;brush.lineWidth=3;
    brush.beginPath();brush.arc(0,0,radius,0,Math.PI*2);brush.fill();brush.stroke();
    if(appearance.mark){
        brush.strokeStyle=BRAWLERS[fighter].color;brush.lineWidth=Math.max(2,radius*.17);
        brush.beginPath();
        if(appearance.mark==='bolt'){
            brush.moveTo(radius*.35,-radius*.65);brush.lineTo(-radius*.35,0);
            brush.lineTo(radius*.28,0);brush.lineTo(-radius*.25,radius*.62);
        }else{
            brush.moveTo(-radius*.62,radius*.50);brush.lineTo(radius*.50,-radius*.62);
            brush.moveTo(-radius*.24,radius*.65);brush.lineTo(radius*.66,-radius*.25);
        }
        brush.stroke();
    }
    brush.restore();
}

function syncSkinMenu(fighter){
    const selector=document.getElementById('skin-choice');
    if(!selector.options.length)fighterSkins.forEach((skin,i)=>selector.add(new Option(skin.name,String(i))));
    selector.value=String(selectedFighterSkin(fighter));
    const preview=document.getElementById('char-preview');
    const appearance=fighterAppearance(fighter);
    preview.dataset.skin=selector.value;
    preview.style.setProperty('--accent',appearance.fill);
    preview.style.setProperty('--skin-trim',appearance.trim);
    preview.style.setProperty('--skin-emblem',BRAWLERS[fighter].color);
}
