const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

const userStore = require('./data/userStore');

// API Endpoints
app.get('/api/status', (req, res) => {
    res.json({ status: 'ok', server: 'RaveTracker Dev Server v1.0' });
});

// User Registration endpoint (stores in users.xml with PBKDF2 salt/hash)
app.post('/api/register', (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password || username.trim().length < 2 || password.length < 3) {
        return res.status(400).json({ error: 'Username (min 2 chars) and password (min 3 chars) required' });
    }
    try {
        const user = userStore.registerUser(username, password);
        res.json({ success: true, user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// User Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    const user = userStore.authenticateUser(username, password);
    if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }
    res.json({ success: true, user });
});

// Attendees count endpoint
app.get('/api/attendees', (req, res) => {
    const users = userStore.getUsers();
    const attendingCount = users.filter(u => u.attending).length;
    res.json({ count: attendingCount, totalUsers: users.length });
});

// View all users endpoint (sanitized without hash/salt)
app.get('/api/users', (req, res) => {
    const users = userStore.getUsers();
    const sanitized = users.map(u => ({
        username: u.username,
        attending: u.attending,
        registered_at: u.registered_at
    }));
    res.json(sanitized);
});

// DJ Profile Data API
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

app.get('/api/djs', (req, res) => {
    res.json(Object.values(DJ_PROFILES));
});

app.get('/api/dj/:slug', (req, res) => {
    const profile = DJ_PROFILES[req.params.slug];
    if (!profile) {
        return res.status(404).json({ error: 'DJ profile not found' });
    }
    res.json(profile);
});

// Serve ads configuration
app.get('/api/ads', (req, res) => {
    const adsPath = path.join(__dirname, 'public', 'ads', 'ads.json');
    res.sendFile(adsPath, (err) => {
        if (err) {
            res.json([]);
        }
    });
});

// Ad Redirect Route (/ad/:id)
app.get('/ad/:id', (req, res) => {
    const adsPath = path.join(__dirname, 'public', 'ads', 'ads.json');
    try {
        const fs = require('fs');
        if (fs.existsSync(adsPath)) {
            const ads = JSON.parse(fs.readFileSync(adsPath, 'utf8'));
            const ad = ads.find(a => a.id === req.params.id);
            if (ad && ad.targetUrl) {
                return res.redirect(ad.targetUrl);
            }
        }
    } catch (e) {
        console.error('Error handling ad redirect:', e);
    }
    res.redirect('/');
});

// Fallback route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`[RaveTracker] Local development server running on http://localhost:${PORT}`);
});
