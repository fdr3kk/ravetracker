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

    const endpoint = currentAuthMode === 'login' ? '/api/login' : '/api/register';

    try {
        msgEl.className = 'auth-msg';
        msgEl.innerText = 'Communicating with server...';

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            msgEl.className = 'auth-msg error';
            msgEl.innerText = data.error || 'Authentication failed.';
            return;
        }

        // Success
        msgEl.className = 'auth-msg success';
        msgEl.innerText = currentAuthMode === 'login' ? 'Login successful!' : 'Account registered & saved to users.xml!';

        setCurrentUser(data.user);
        fetchAttendeesCount();

        setTimeout(() => {
            closeAuthModal();
            if (usernameInput) usernameInput.value = '';
            if (passwordInput) passwordInput.value = '';
        }, 800);

    } catch (err) {
        msgEl.className = 'auth-msg error';
        msgEl.innerText = 'Network or server error.';
        console.error('Auth error:', err);
    }
}

async function fetchAttendeesCount() {
    const el = document.getElementById('attendees-count-display');
    if (!el) return;

    try {
        const res = await fetch('/api/attendees');
        if (!res.ok) return;
        const data = await res.json();
        el.innerText = data.count || 0;
    } catch (err) {
        console.error('Failed to fetch attendees count:', err);
    }
}

// Ads Loader
async function loadAds() {
    const container = document.getElementById('ad-banner-container');
    if (!container) return;

    try {
        const response = await fetch('/api/ads');
        if (!response.ok) return;
        const ads = await response.json();
        
        const activeAds = ads.filter(ad => ad.active);
        if (activeAds.length === 0) return;

        const ad = activeAds[Math.floor(Math.random() * activeAds.length)];

        container.innerHTML = `
            <div class="ad-slot">
                <a href="/ad/${ad.id}" target="_blank" rel="noopener" title="${escapeHtml(ad.title || 'Advertisement')}">
                    <img src="${ad.image}" alt="${escapeHtml(ad.title || 'Ad Banner')}">
                </a>
                <div class="ad-label">Реклама / Advertisement</div>
            </div>
        `;
    } catch (err) {
        console.error('Failed to load ads:', err);
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}
