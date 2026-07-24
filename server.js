const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Endpoints
app.get('/api/status', (req, res) => {
    res.json({ status: 'ok', server: 'RaveTracker Dev Server v1.0' });
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
