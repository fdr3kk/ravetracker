const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Healthcheck / Status endpoint
app.get('/api/status', (req, res) => {
    res.json({ status: 'ok', server: 'RaveTracker Dev Server v1.0' });
});

// Fallback route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`[RaveTracker] Local development server running on http://localhost:${PORT}`);
});
