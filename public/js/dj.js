document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    let slug = params.get('slug') || params.get('name') || 'feast-and-famine';

    // Normalize slug format (e.g. "feast and famine" -> "feast-and-famine")
    slug = slug.toLowerCase().replace(/\s+/g, '-');

    try {
        const response = await fetch(`/api/dj/${slug}`);
        if (!response.ok) {
            document.getElementById('dj-name').innerText = 'DJ Profile Not Found';
            return;
        }
        const dj = await response.json();

        document.title = `${dj.name} - RaveTracker.org`;
        document.getElementById('dj-breadcrumb-name').innerText = dj.name;
        document.getElementById('dj-name').innerText = dj.name;
        document.getElementById('dj-genre').innerText = dj.genre;
        document.getElementById('dj-set-time').innerText = dj.setTime;
        document.getElementById('dj-bpm').innerText = dj.bpm;
        document.getElementById('dj-stage').innerText = dj.stage;
        
        // Handle bilingual bio
        const bioEl = document.getElementById('dj-bio');
        bioEl.innerHTML = `
            <span class="lang-ru">${dj.bio_ru}</span>
            <span class="lang-en">${dj.bio_en}</span>
        `;

        // Populate track samples list
        const tracksList = document.getElementById('dj-tracks');
        tracksList.innerHTML = dj.tracks.map(t => `<li>🎵 <code>${t}</code></li>`).join('');

        document.getElementById('dj-seeders').innerText = dj.seeders;
        document.getElementById('dj-leechers').innerText = dj.leechers;

    } catch (err) {
        console.error('Error fetching DJ profile:', err);
    }
});
