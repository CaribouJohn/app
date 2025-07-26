document.addEventListener('DOMContentLoaded', () => {

import { AtpAgent } from '@atproto/api';

document.addEventListener('DOMContentLoaded', () => {
    let isLoggedIn = false;
    let agent: AtpAgent | null = null;
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

    // Login form handler
    const loginForm = document.getElementById('login-form') as HTMLFormElement;
    const loginMessage = document.getElementById('login-message');
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const handle = (document.getElementById('handle') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;
        loginMessage!.textContent = 'Logging in...';
        try {
            agent = new AtpAgent({ service: 'https://bsky.social' });
            await agent.login({ identifier: handle, password });
            isLoggedIn = true;
            loginMessage!.textContent = '';
            updateUI();
        } catch (err: any) {
            loginMessage!.textContent = 'Login failed: ' + (err?.message || 'Unknown error');
        }
    });

    // Search form handler
    const searchForm = document.getElementById('search-form') as HTMLFormElement;
    const resultsDiv = document.getElementById('results');
    searchForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = (document.getElementById('search-query') as HTMLInputElement).value;
        resultsDiv!.textContent = 'Searching...';
        if (!agent || !isLoggedIn) {
            resultsDiv!.textContent = 'You must be logged in to search.';
            return;
        }
        try {
            const res = await agent.searchActors({ term: query });
            if (res?.data?.actors?.length) {
                resultsDiv!.innerHTML = res.data.actors.map((actor: any) => `
                  <div class="result-item">
                    <div style="display:flex;align-items:center;gap:1rem;">
                      <img src="${actor.avatar || 'https://placehold.co/48x48'}" alt="Profile" style="border-radius:50%;width:48px;height:48px;">
                      <div>
                        <strong>${actor.handle}</strong><br>
                        <span>${actor.displayName || ''}</span>
                      </div>
                    </div>
                    <div style="margin-top:0.5rem;color:#1976d2;font-size:0.95rem;">${actor.description || ''}</div>
                    <button style="margin-top:0.75rem;align-self:flex-end;">Follow</button>
                  </div>
                `).join('');
            } else {
                resultsDiv!.textContent = 'No results found.';
            }
        } catch (err: any) {
            resultsDiv!.textContent = 'Search failed: ' + (err?.message || 'Unknown error');
        }
    });
});
