import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { AtpAgent } from '@atproto/api';

let agent: AtpAgent | null = null;
let isLoggedIn = false;

// Handle Bluesky API calls
ipcMain.handle('bluesky-login', async (event, identifier: string, password: string) => {
    console.log('Main: Login attempt for', identifier);
    try {
        agent = new AtpAgent({ service: 'https://bsky.social' });
        const loginRes = await agent.login({ identifier, password });
        isLoggedIn = true;
        console.log('Main: Login successful', loginRes.data);
        return {
            success: true,
            handle: loginRes.data?.handle || identifier,
            did: loginRes.data?.did
        };
    } catch (err: any) {
        console.error('Main: Login failed', err);
        return {
            success: false,
            error: err?.message || 'Login failed'
        };
    }
});

ipcMain.handle('bluesky-search', async (event, query: string, searchType: string = 'combined') => {
    console.log('Main: Search attempt for', query, 'with type', searchType);
    if (!agent || !isLoggedIn) {
        console.warn('Main: Search attempted without login');
        return { success: false, error: 'Not logged in' };
    }
    try {
        let actors: any[] = [];
        let searchInfo = '';

        switch (searchType) {
            case 'profiles':
                // Only search actors by handle and display name
                const actorResults = await agent.searchActors({ term: query, limit: 25 });
                actors = actorResults.data.actors || [];
                searchInfo = `Profile search: ${actors.length} users found by handle/name`;
                console.log('Main: Profile-only search successful', actors.length, 'results');
                break;

            case 'content':
                // Only search posts to find users who post about the topic
                const postResults = await agent.app.bsky.feed.searchPosts({
                    q: query,
                    limit: 25
                });
                const contentActors = new Map();
                if (postResults.data.posts) {
                    postResults.data.posts.forEach((post: any) => {
                        if (post.author) {
                            contentActors.set(post.author.did, post.author);
                        }
                    });
                }
                actors = Array.from(contentActors.values());
                searchInfo = `Content search: ${actors.length} users found by post content`;
                console.log('Main: Content-only search successful', actors.length, 'results');
                break;

            case 'combined':
            default:
                // Combined search (original behavior)
                const combinedActorResults = await agent.searchActors({ term: query, limit: 25 });
                const profileActors = combinedActorResults.data.actors || [];

                let postActors: any[] = [];
                try {
                    const combinedPostResults = await agent.app.bsky.feed.searchPosts({
                        q: query,
                        limit: 20
                    });
                    const additionalActors = new Map();
                    if (combinedPostResults.data.posts) {
                        combinedPostResults.data.posts.forEach((post: any) => {
                            if (post.author && !profileActors.find((actor: any) => actor.did === post.author.did)) {
                                additionalActors.set(post.author.did, post.author);
                            }
                        });
                    }
                    postActors = Array.from(additionalActors.values());
                } catch (postErr) {
                    console.warn('Main: Post search failed in combined mode, continuing with actor results only', postErr);
                }

                actors = [...profileActors, ...postActors];
                searchInfo = `Combined search: ${profileActors.length} by profile + ${postActors.length} by content = ${actors.length} total`;
                console.log('Main: Combined search successful', actors.length, 'total results');
                break;
        }

        return {
            success: true,
            actors: actors,
            searchInfo: searchInfo
        };
    } catch (err: any) {
        console.error('Main: Search failed', err);
        return {
            success: false,
            error: err?.message || 'Search failed'
        };
    }
});

ipcMain.handle('bluesky-get-profile', async (event, userHandle: string) => {
    console.log('Main: Profile request for', userHandle);
    if (!agent || !isLoggedIn) {
        console.warn('Main: Profile request attempted without login');
        return { success: false, error: 'Not logged in' };
    }
    try {
        // Get detailed profile information
        const profileResponse = await agent.getProfile({ actor: userHandle });
        const profile = profileResponse.data;

        // Get recent posts from this user
        let posts: any[] = [];
        try {
            const feedResponse = await agent.getAuthorFeed({
                actor: userHandle,
                limit: 10
            });
            posts = feedResponse.data.feed || [];
        } catch (feedErr) {
            console.warn('Main: Failed to get user feed, continuing with profile only', feedErr);
        }

        console.log('Main: Profile retrieved successfully', profile.handle, 'with', posts.length, 'posts');
        return {
            success: true,
            profile: profile,
            posts: posts
        };
    } catch (err: any) {
        console.error('Main: Profile request failed', err);
        return {
            success: false,
            error: err?.message || 'Failed to load profile'
        };
    }
});

ipcMain.handle('bluesky-is-logged-in', async (event) => {
    console.log('Main: Check login status:', isLoggedIn);
    return isLoggedIn;
});

function createWindow() {
    const win = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            preload: path.join(__dirname, '../preload/preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true
        }
    });
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
    win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
