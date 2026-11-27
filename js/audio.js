
    // --- ЗВУКОВАЯ СИСТЕМА ---
    const sounds = {
        menuMusic: new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3'),
        battleMusic: new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
        click: new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_c8c8a73484.mp3'),
        shoot: new Audio('https://cdn.pixabay.com/audio/2022/02/11/audio_f687989389.mp3'),
        ult: new Audio('https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c7443c.mp3'),
        hit: new Audio('https://cdn.pixabay.com/audio/2021/08/09/audio_8849646b14.mp3')
    };
    sounds.menuMusic.loop = true;
    sounds.battleMusic.loop = true;
    sounds.menuMusic.volume = 0.4;
    sounds.battleMusic.volume = 0.3;

