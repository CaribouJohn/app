// Renderer process - communicates with preload script via window.blueskyAPI

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Renderer: DOM loaded');

    let isLoggedIn = await blueskyAPI.isLoggedIn();
    const menuHome = document.getElementById('menu-home');
    const menuSearch = document.getElementById('menu-search');
    const menuLogin = document.getElementById('menu-login');
    const loginSection = document.getElementById('login-section');
    const searchSection = document.getElementById('search-section');

    function updateUI() {
        console.log('Renderer: Updating UI, logged in:', isLoggedIn);
        if (loginSection && searchSection) {
            if (isLoggedIn) {
                loginSection.style.display = 'none';
                searchSection.classList.remove('hidden');
                searchSection.style.display = 'block';
            } else {
                loginSection.style.display = 'block';
                searchSection.classList.add('hidden');
                searchSection.style.display = 'none';
            }
        }
    }

    // Initial UI update
    updateUI();

    // Navigation handlers
    menuHome?.addEventListener('click', () => {
        console.log('Renderer: Home clicked');
        updateUI();
    });

    menuSearch?.addEventListener('click', () => {
        console.log('Renderer: Search clicked');
        if (isLoggedIn && loginSection && searchSection) {
            loginSection.style.display = 'none';
            searchSection.classList.remove('hidden');
            searchSection.style.display = 'block';
        } else {
            updateUI();
        }
    });

    menuLogin?.addEventListener('click', () => {
        console.log('Renderer: Login clicked');
        updateUI();
    });

    // Login form handler
    const loginForm = document.getElementById('login-form') as HTMLFormElement;
    const loginMessage = document.getElementById('login-message');

    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Renderer: Login form submitted');

        const handle = (document.getElementById('handle') as HTMLInputElement)?.value;
        const password = (document.getElementById('password') as HTMLInputElement)?.value;

        if (!handle || !password) {
            if (loginMessage) loginMessage.textContent = 'Please enter handle and password';
            return;
        }

        if (loginMessage) loginMessage.textContent = 'Logging in...';

        try {
            const result = await blueskyAPI.login(handle, password);
            console.log('Renderer: Login result', result);

            if (result.success) {
                isLoggedIn = true;
                if (loginMessage) loginMessage.textContent = `Logged in as ${result.handle}`;
                updateUI();
                // Clear message after 2 seconds
                setTimeout(() => {
                    if (loginMessage) loginMessage.textContent = '';
                }, 2000);
            } else {
                if (loginMessage) loginMessage.textContent = `Login failed: ${result.error}`;
            }
        } catch (err: any) {
            console.error('Renderer: Login error', err);
            if (loginMessage) loginMessage.textContent = `Login error: ${err.message}`;
        }
    });

    // Search form handler
    const searchForm = document.getElementById('search-form') as HTMLFormElement;
    const resultsDiv = document.getElementById('results');

    searchForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Renderer: Search form submitted');

        const query = (document.getElementById('search-query') as HTMLInputElement)?.value;

        if (!query) {
            if (resultsDiv) resultsDiv.textContent = 'Please enter a search term';
            return;
        }

        if (!isLoggedIn) {
            if (resultsDiv) resultsDiv.textContent = 'You must be logged in to search';
            return;
        }

        if (resultsDiv) resultsDiv.textContent = 'Searching...';

        try {
            const result = await blueskyAPI.search(query);
            console.log('Renderer: Search result', result);

            if (result.success && result.actors) {
                if (result.actors.length > 0) {
                    displayResults(result.actors);
                } else {
                    if (resultsDiv) resultsDiv.textContent = 'No results found';
                }
            } else {
                if (resultsDiv) resultsDiv.textContent = `Search failed: ${result.error}`;
            }
        } catch (err: any) {
            console.error('Renderer: Search error', err);
            if (resultsDiv) resultsDiv.textContent = `Search error: ${err.message}`;
        }
    });

    function displayResults(actors: any[]) {
        console.log('Renderer: Displaying', actors.length, 'results');
        if (!resultsDiv) return;

        resultsDiv.innerHTML = actors.map(actor => `
            <div class="result-item">
                <div class="result-item-row">
                    <img src="${actor.avatar || 'https://placehold.co/48x48'}" alt="Profile" class="result-item-avatar">
                    <div>
                        <strong>${actor.handle || 'Unknown handle'}</strong><br>
                        <span>${actor.displayName || ''}</span>
                    </div>
                </div>
                <div class="result-item-meta">${actor.description || ''}</div>
                <button class="result-item-follow">Follow</button>
            </div>
        `).join('');
    }
});