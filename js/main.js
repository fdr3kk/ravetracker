let currentAuthMode = 'login'; // 'login' or 'register'

document.addEventListener('DOMContentLoaded', () => {
    // Language Switcher Logic
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

    // Load Ads
    loadAds();

    // Load Attendees Count
    fetchAttendeesCount();

    // Initialize User Session / Greeting Bar
    renderUserBar();

    // Bind RSVP / Register button
    const wantToGoBtn = document.getElementById('btn-want-to-go');
    if (wantToGoBtn) {
        wantToGoBtn.addEventListener('click', () => {
            openAuthModal('register');
        });
    }
});

// User Session State Management
function getCurrentUser() {
    try {
        const u = localStorage.getItem('ravetracker_user');
        return u ? JSON.parse(u) : null;
    } catch (e) {
        return null;
    }
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('ravetracker_user', JSON.stringify(user));
    } else {
        localStorage.removeItem('ravetracker_user');
    }
    renderUserBar();
}

function renderUserBar() {
    const userBar = document.getElementById('user-bar');
    if (!userBar) return;

    const user = getCurrentUser();

    if (user) {
        userBar.innerHTML = `
            <span class="lang-ru">Вы вошли как:</span><span class="lang-en">Logged in as:</span> 
            <strong style="color:#004C99;">${escapeHtml(user.username)}</strong> | 
            <span style="color:#008000; font-weight:bold;">[✓ <span class="lang-ru">Вы идёте!</span><span class="lang-en">RSVP: Attending</span>]</span> | 
            <a href="#" onclick="logoutUser(event); return false;"><span class="lang-ru">Выход</span><span class="lang-en">Log out</span></a>
        `;
    } else {
        userBar.innerHTML = `
            <span class="lang-ru">Вы вошли как:</span><span class="lang-en">Logged in as:</span> <strong><span class="lang-ru">Гость</span><span class="lang-en">Guest</span></strong> | 
            <a href="#" onclick="openAuthModal('login'); return false;"><span class="lang-ru">Вход</span><span class="lang-en">Log in</span></a> | 
            <a href="#" onclick="openAuthModal('register'); return false;"><strong style="color:#ff4500;"><span class="lang-ru">Я хочу пойти!</span><span class="lang-en">I Want To Go!</span></strong></a>
        `;
    }
}

function logoutUser(e) {
    if (e) e.preventDefault();
    setCurrentUser(null);
}

// Modal Dialog Handlers
function openAuthModal(mode = 'login') {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.add('active');
        switchAuthTab(mode);
    }
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    const msg = document.getElementById('auth-msg');
    if (msg) msg.innerText = '';
}

function switchAuthTab(mode) {
    currentAuthMode = mode;
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const submitBtn = document.getElementById('auth-submit-btn');

    if (mode === 'login') {
        if (tabLogin) tabLogin.style.backgroundColor = '#C3D3E4';
        if (tabRegister) tabRegister.style.backgroundColor = '#E5EDF4';
        if (submitBtn) {
            submitBtn.innerHTML = '<span class="lang-ru">Войти</span><span class="lang-en">Login</span>';
        }
    } else {
        if (tabLogin) tabLogin.style.backgroundColor = '#E5EDF4';
        if (tabRegister) tabRegister.style.backgroundColor = '#C3D3E4';
        if (submitBtn) {
            submitBtn.innerHTML = '<span class="lang-ru">Зарегистрироваться</span><span class="lang-en">Register & RSVP</span>';
        }
    }
    const msg = document.getElementById('auth-msg');
    if (msg) msg.innerText = '';
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('auth-username');
    const passwordInput = document.getElementById('auth-password');
    const msgEl = document.getElementById('auth-msg');

    const username = usernameInput ? usernameInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    if (!username || !password) return;

    msgEl.className = 'auth-msg';
    msgEl.innerText = 'Communicating with server...';

    // Try Express Backend API first; fallback to LocalStorage for GitHub Pages static hosting
    try {
        const endpoint = currentAuthMode === 'login' ? '/api/login' : '/api/register';
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (res.ok) {
            const data = await res.json();
            if (data.success) {
                msgEl.className = 'auth-msg success';
                msgEl.innerText = currentAuthMode === 'login' ? 'Login successful!' : 'Account registered & saved to users.xlsx!';
                setCurrentUser(data.user);
                fetchAttendeesCount();
                setTimeout(() => {
                    closeAuthModal();
                    if (usernameInput) usernameInput.value = '';
                    if (passwordInput) passwordInput.value = '';
                }, 800);
                return;
            }
        }
    } catch (backendErr) {
        console.log('Backend API unavailable, using GitHub Pages static fallback');
    }

    // Static GitHub Pages Fallback
    const user = { username: username, attending: true };
    setCurrentUser(user);

    // Save attendee to local storage list
    let localAttendees = JSON.parse(localStorage.getItem('ravetracker_attendees') || '["Underground_Raver", "CyberRaver99", "ExcelRaver2026"]');
    if (!localAttendees.includes(username)) {
        localAttendees.push(username);
        localStorage.setItem('ravetracker_attendees', JSON.stringify(localAttendees));
    }

    msgEl.className = 'auth-msg success';
    msgEl.innerText = currentAuthMode === 'login' ? 'Login successful!' : 'Account registered & RSVP saved!';
    fetchAttendeesCount();

    setTimeout(() => {
        closeAuthModal();
        if (usernameInput) usernameInput.value = '';
        if (passwordInput) passwordInput.value = '';
    }, 800);
}

async function fetchAttendeesCount() {
    const el = document.getElementById('attendees-count-display');
    if (!el) return;

    try {
        const res = await fetch('/api/attendees');
        if (res.ok) {
            const data = await res.json();
            el.innerText = data.count || 0;
            return;
        }
    } catch (err) {
        // Fallback for static GitHub Pages
    }

    let localAttendees = JSON.parse(localStorage.getItem('ravetracker_attendees') || '["Underground_Raver", "CyberRaver99", "ExcelRaver2026"]');
    el.innerText = localAttendees.length;
}

// Ads Loader (Supports both Server API & GitHub Pages static path)
async function loadAds() {
    try {
        let ads = [];
        
        // Try to fetch from API first
        try {
            const response = await fetch('/api/ads');
            if (response.ok) {
                ads = await response.json();
            }
        } catch (e) {
            console.log('API ads unavailable, trying static fallback');
        }

        // Static GitHub Pages path fallback
        if (!ads || ads.length === 0) {
            try {
                const response = await fetch('ads/ads.json');
                if (response.ok) {
                    ads = await response.json();
                }
            } catch (e) {
                console.log('Static ads fallback failed');
            }
        }

        if (!ads || ads.length === 0) return;

        // Render Banner Ads (type: 'banner')
        const bannerAds = ads.filter(ad => ad.active && (ad.type === 'banner' || ad.type === undefined));
        renderBannerAds(bannerAds);

        // Render Sidebar Ads (type: 'sidebar')
        const sidebarAds = ads.filter(ad => ad.active && ad.type === 'sidebar');
        renderSidebarAds(sidebarAds);

    } catch (err) {
        console.error('Failed to load ads:', err);
    }
}

// Render Banner Ads
function renderBannerAds(bannerAds) {
    const container = document.getElementById('ad-banner-container');
    if (!container || !bannerAds || bannerAds.length === 0) return;

    const ad = bannerAds[Math.floor(Math.random() * bannerAds.length)];
    const target = ad.targetUrl || '#';

    container.innerHTML = `
        <div class="ad-slot banner-ad">
            <a href="${target}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(ad.title || 'Advertisement')}">
                <img src="${escapeHtml(ad.image)}" alt="${escapeHtml(ad.title || 'Ad Banner')}">
            </a>
            <div class="ad-label">Реклама / Advertisement</div>
        </div>
    `;
}

// Render Sidebar Ads
function renderSidebarAds(sidebarAds) {
    if (!sidebarAds || sidebarAds.length === 0) return;

    const leftContainer = document.getElementById('ads-left-sidebar');
    const rightContainer = document.getElementById('ads-right-sidebar');

    // Split ads: half to left, half to right
    const midpoint = Math.ceil(sidebarAds.length / 2);
    const leftAds = sidebarAds.slice(0, midpoint);
    const rightAds = sidebarAds.slice(midpoint);

    if (leftContainer) {
        leftContainer.innerHTML = '';
        leftAds.forEach(ad => {
            const adElement = createSidebarAdElement(ad);
            leftContainer.appendChild(adElement);
        });
    }

    if (rightContainer) {
        rightContainer.innerHTML = '';
        rightAds.forEach(ad => {
            const adElement = createSidebarAdElement(ad);
            rightContainer.appendChild(adElement);
        });
    }
}

// Create Sidebar Ad Element
function createSidebarAdElement(ad) {
    const target = ad.targetUrl || '#';
    
    const wrapper = document.createElement('div');
    wrapper.className = 'sidebar-ad';
    wrapper.innerHTML = `
        <a href="${target}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(ad.title || 'Advertisement')}">
            <img src="${escapeHtml(ad.image)}" alt="${escapeHtml(ad.title || 'Side Ad')}">
        </a>
        <div class="sidebar-ad-label">Реклама / Ad</div>
    `;
    
    return wrapper;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}
