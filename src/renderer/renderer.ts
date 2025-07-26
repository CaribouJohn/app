// Renderer process - communicates with preload script via window.blueskyAPI

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Renderer: DOM loaded');

    let isLoggedIn = await blueskyAPI.isLoggedIn();
    const menuHome = document.getElementById('menu-home');
    const menuSearch = document.getElementById('menu-search');
    const menuLogin = document.getElementById('menu-login');
    const loginSection = document.getElementById('login-section');
    const searchSection = document.getElementById('search-section');
    const handleInput = document.getElementById('handle') as HTMLInputElement;

    // Load and set the last used username
    const lastUsername = localStorage.getItem('bluesky-last-username');
    if (lastUsername && handleInput) {
        handleInput.value = lastUsername;
        console.log('Renderer: Loaded last username:', lastUsername);
    }

    // Clear username button handler
    const clearUsernameBtn = document.getElementById('clear-username');
    clearUsernameBtn?.addEventListener('click', () => {
        if (handleInput) {
            handleInput.value = '';
            localStorage.removeItem('bluesky-last-username');
            console.log('Renderer: Cleared remembered username');
            handleInput.focus();
        }
    });

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
                // Save the username for next time
                localStorage.setItem('bluesky-last-username', handle);
                console.log('Renderer: Saved username for next login:', handle);

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
        const searchType = (document.getElementById('search-type') as HTMLSelectElement)?.value || 'combined';

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
            const result = await blueskyAPI.search(query, searchType);
            console.log('Renderer: Search result', result);

            if (result.success && result.actors) {
                if (result.actors.length > 0) {
                    displayResults(result.actors, result.searchInfo);
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

    function displayResults(actors: any[], searchInfo?: string) {
        console.log('Renderer: Displaying', actors.length, 'results');
        if (!resultsDiv) return;

        let infoHtml = '';
        if (searchInfo) {
            infoHtml = `<div class="search-info">${searchInfo}</div>`;
        }

        resultsDiv.innerHTML = infoHtml + actors.map((actor, index) => `
            <div class="result-item" data-actor-handle="${actor.handle}" data-actor-index="${index}">
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

        // Add click handlers for profile viewing
        resultsDiv.querySelectorAll('.result-item').forEach((item, index) => {
            item.addEventListener('click', (e) => {
                // Don't trigger on follow button click
                if ((e.target as HTMLElement).classList.contains('result-item-follow')) {
                    e.stopPropagation();
                    return;
                }
                const actor = actors[index];
                showProfileModal(actor);
            });
        });
    }

    // Modal functionality
    const profileModal = document.getElementById('profile-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const modalBody = document.getElementById('modal-body');

    closeModalBtn?.addEventListener('click', () => {
        profileModal?.classList.add('hidden');
    });

    profileModal?.addEventListener('click', (e) => {
        if (e.target === profileModal) {
            profileModal.classList.add('hidden');
        }
    });

    async function showProfileModal(actor: any) {
        console.log('Renderer: Showing profile for', actor.handle);

        if (!profileModal || !modalBody) return;

        // Show modal with loading state
        profileModal.classList.remove('hidden');
        modalBody.innerHTML = '<div style="padding: 2rem; text-align: center;">Loading profile...</div>';

        try {
            const result = await blueskyAPI.getUserProfile(actor.handle);
            console.log('Renderer: Profile result', result);

            if (result.success && result.profile) {
                displayProfile(result.profile, result.posts || []);
            } else {
                modalBody.innerHTML = `<div style="padding: 2rem; text-align: center; color: red;">Failed to load profile: ${result.error}</div>`;
            }
        } catch (err: any) {
            console.error('Renderer: Profile error', err);
            modalBody.innerHTML = `<div style="padding: 2rem; text-align: center; color: red;">Error loading profile: ${err.message}</div>`;
        }
    }

    function displayProfile(profile: any, posts: any[]) {
        if (!modalBody) return;

        const postsHtml = posts.length > 0 ? `
            <div class="posts-section">
                <h4>Recent Posts</h4>
                ${posts.map(feedItem => {
            const post = feedItem.post || feedItem;
            const createdAt = new Date(post.indexedAt || post.createdAt).toLocaleDateString();
            return `
                        <div class="post-item">
                            <div class="post-content">${post.record?.text || 'No content'}</div>
                            <div class="post-meta">${createdAt}</div>
                        </div>
                    `;
        }).join('')}
            </div>
        ` : '<div style="padding: 1rem 1.5rem; color: #666; font-style: italic;">No recent posts available</div>';

        modalBody.innerHTML = `
            <div class="profile-section">
                <div class="profile-header">
                    <img src="${profile.avatar || 'https://placehold.co/80x80'}" alt="Profile" class="profile-avatar">
                    <div class="profile-info">
                        <h4>${profile.displayName || profile.handle}</h4>
                        <div class="profile-handle">@${profile.handle}</div>
                        <div class="profile-stats">
                            <span><strong>${profile.followersCount || 0}</strong> followers</span>
                            <span><strong>${profile.followsCount || 0}</strong> following</span>
                            <span><strong>${profile.postsCount || 0}</strong> posts</span>
                        </div>
                    </div>
                </div>
                ${profile.description ? `<div class="profile-description">${profile.description}</div>` : ''}
            </div>
            ${postsHtml}
        `;
    }
});