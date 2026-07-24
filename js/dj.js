document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    let slug = params.get('slug') || params.get('name') || 'feast-and-famine';

    slug = slug.toLowerCase().replace(/\s+/g, '-');

    const DJ_PROFILES = {
        'feast-and-famine': {
            slug: 'feast-and-famine',
            name: 'feast and famine',
            genre: 'Industrial Acid Techno',
            bpm: 135,
            setTime: '23:00 - 00:30',
            stage: 'Main Stage (ГЛАВНАЯ СЦЕНА)',
            bio_ru: 'Дуэт из тёмных промзон Петербурга. Тёмный гипнотический эсид-техно сет на открытии главной сцены.',
            bio_en: 'Duo from St. Petersburg industrial outskirts. Dark hypnotic acid techno set opening the main stage.',
            tracks: ['Corrosive Resonance', 'Warehouse Ritual 04', 'Static Horizon'],
            seeders: 402,
            leechers: 5
        },
        'sliskagekonica': {
            slug: 'sliskagekonica',
            name: 'sliskagekonica',
            genre: 'Hardgroove & Peak Time Techno',
            bpm: 140,
            setTime: '00:30 - 02:00',
            stage: 'Main Stage (ГЛАВНАЯ СЦЕНА)',
            bio_ru: 'Скоростной хардгрув с аналоговыми синтезаторами и нелинейными ритмами.',
            bio_en: 'High-speed hardgroove featuring analog hardware synths and non-linear rhythms.',
            tracks: ['Slipstream Overdrive', 'Gekkonica Pressure', 'Sub-Zero Resonance'],
            seeders: 650,
            leechers: 8
        },
        'fred3000': {
            slug: 'fred3000',
            name: 'fred3000',
            genre: 'Ghetto Tech / Raw Techno',
            bpm: 145,
            setTime: '02:00 - 03:30',
            stage: 'Main Stage (ГЛАВНАЯ СЦЕНА)',
            bio_ru: 'Андеграундный резидент серии секретных вечеринок. Геттотех и сырое бескомпромиссное звучание.',
            bio_en: 'Underground resident of secret rave series. Ghettotech and raw uncompromising soundscapes.',
            tracks: ['3000 Volts', 'Detroit Underground Jack', 'Acid Booty Bounce'],
            seeders: 890,
            leechers: 15
        },
        'tmx-boom': {
            slug: 'tmx-boom',
            name: 'tmx boom',
            genre: 'Schranz / Hard Techno',
            bpm: 150,
            setTime: '03:30 - 05:00',
            stage: 'Main Stage (ГЛАВНАЯ СЦЕНА)',
            bio_ru: 'Мощнейший шранц и тяжелейший хард-техно сет в пиковое время ночи.',
            bio_en: 'Relentless schranz and heavy hard-techno peak hour madness.',
            tracks: ['Subwoofer Havoc', 'Industrial Impact', 'Concrete Crusher'],
            seeders: 1120,
            leechers: 22
        },
        'dj-analkanal': {
            slug: 'dj-analkanal',
            name: 'dj analkanal',
            genre: 'Speedcore / Terrorcore / Gabber',
            bpm: '160+',
            setTime: '05:00 - END',
            stage: 'Main Stage (ГЛАВНАЯ СЦЕНА)',
            bio_ru: 'Финал рейва! Утренний спидкор и габбер для тех, кто останется до самого конца.',
            bio_en: 'The legendary closing act! Morning speedcore and gabber for the ultimate survivors.',
            tracks: ['Morning Slaughter', 'Channel 666', 'Infinite BPM Breakdown'],
            seeders: 1450,
            leechers: 40
        }
    };

    let dj = null;
    try {
        const response = await fetch(`/api/dj/${slug}`);
        if (response.ok) {
            dj = await response.json();
        }
    } catch (err) {}

    if (!dj) {
        dj = DJ_PROFILES[slug] || DJ_PROFILES['feast-and-famine'];
    }

    document.title = `${dj.name} - RaveTracker.org`;
    document.getElementById('dj-breadcrumb-name').innerText = dj.name;
    document.getElementById('dj-name').innerText = dj.name;
    document.getElementById('dj-genre').innerText = dj.genre;
    document.getElementById('dj-set-time').innerText = dj.setTime;
    document.getElementById('dj-bpm').innerText = dj.bpm;
    document.getElementById('dj-stage').innerText = dj.stage;
    
    const bioEl = document.getElementById('dj-bio');
    bioEl.innerHTML = `
        <span class="lang-ru">${dj.bio_ru}</span>
        <span class="lang-en">${dj.bio_en}</span>
    `;

    const tracksList = document.getElementById('dj-tracks');
    tracksList.innerHTML = dj.tracks.map(t => `<li>🎵 <code>${t}</code></li>`).join('');

    document.getElementById('dj-seeders').innerText = dj.seeders;
    document.getElementById('dj-leechers').innerText = dj.leechers;
});
