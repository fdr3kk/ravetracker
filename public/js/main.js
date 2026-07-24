document.addEventListener('DOMContentLoaded', () => {
    const btn = document.querySelector('.translate-btn');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    if (btn) {
        btn.addEventListener('click', () => {
            document.body.classList.toggle('show-en');
            if (document.body.classList.contains('show-en')) {
                if (searchInput) searchInput.placeholder = "Search lineup, location...";
                if (searchBtn) searchBtn.value = "Search";
            } else {
                if (searchInput) searchInput.placeholder = "Поиск лайнапа, локации...";
                if (searchBtn) searchBtn.value = "Поиск";
            }
        });
    }

    // Load and render Ads dynamically
    loadAds();
});

async function loadAds() {
    const container = document.getElementById('ad-banner-container');
    if (!container) return;

    try {
        const response = await fetch('/api/ads');
        if (!response.ok) return;
        const ads = await response.json();
        
        const activeAds = ads.filter(ad => ad.active);
        if (activeAds.length === 0) return;

        // Display a random active ad or top active ad
        const ad = activeAds[Math.floor(Math.random() * activeAds.length)];

        container.innerHTML = `
            <div class="ad-slot">
                <a href="/ad/${ad.id}" target="_blank" rel="noopener" title="${ad.title || 'Advertisement'}">
                    <img src="${ad.image}" alt="${ad.title || 'Ad Banner'}">
                </a>
                <div class="ad-label">Реклама / Advertisement</div>
            </div>
        `;
    } catch (err) {
        console.error('Failed to load ads:', err);
    }
}
