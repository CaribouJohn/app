// Entry point for renderer process


document.addEventListener('DOMContentLoaded', () => {
    let isLoggedIn = false;
    const menuHome = document.getElementById('menu-home');
    const menuSearch = document.getElementById('menu-search');
    const menuLogin = document.getElementById('menu-login');
    const loginSection = document.getElementById('login-section');
    const searchSection = document.getElementById('search-section');

    // Initial state: show only login
    loginSection!.style.display = 'block';
    searchSection!.style.display = 'none';

    function updateUI() {
        if (isLoggedIn) {
            loginSection!.style.display = 'none';
            searchSection!.style.display = 'block';
        } else {
            loginSection!.style.display = 'block';
            searchSection!.style.display = 'none';
        }
    }

    menuHome?.addEventListener('click', () => {
        updateUI();
    });
    menuSearch?.addEventListener('click', () => {
        if (isLoggedIn) {
            loginSection!.style.display = 'none';
            searchSection!.style.display = 'block';
        } else {
            loginSection!.style.display = 'block';
            searchSection!.style.display = 'none';
        }
    });
    menuLogin?.addEventListener('click', () => {
        updateUI();
    });

    // Login form handler (placeholder)
    const loginForm = document.getElementById('login-form') as HTMLFormElement;
    const loginMessage = document.getElementById('login-message');
    loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        loginMessage!.textContent = 'Logging in... (simulated)';
        setTimeout(() => {
            isLoggedIn = true;
            loginMessage!.textContent = '';
            updateUI();
        }, 800);
        // TODO: Implement Bluesky authentication
    });

    // Search form handler (placeholder)
    const searchForm = document.getElementById('search-form') as HTMLFormElement;
    const resultsDiv = document.getElementById('results');
    searchForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        resultsDiv!.textContent = 'Searching... (not implemented)';
        // TODO: Implement Bluesky search
    });
});
