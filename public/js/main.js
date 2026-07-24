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
});
