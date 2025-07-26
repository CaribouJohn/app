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

ipcMain.handle('bluesky-search', async (event, query: string) => {
    console.log('Main: Search attempt for', query);
    if (!agent || !isLoggedIn) {
        console.warn('Main: Search attempted without login');
        return { success: false, error: 'Not logged in' };
    }
    try {
        // Primary search: Search actors by handle and display name
        const actorResults = await agent.searchActors({ term: query, limit: 25 });
        console.log('Main: Actor search successful', actorResults.data.actors?.length, 'results');

        // Secondary search: Search posts to find users who post about the topic
        let postResults: any = { data: { posts: [] } };
        try {
            postResults = await agent.app.bsky.feed.searchPosts({
                q: query,
                limit: 20
            });
            console.log('Main: Post search successful', postResults.data.posts?.length, 'post results');
        } catch (postErr) {
            console.warn('Main: Post search failed, continuing with actor results only', postErr);
        }

        // Combine results and deduplicate
        const actors = actorResults.data.actors || [];
        const additionalActors = new Map();

        // Extract unique actors from post search
        if (postResults.data.posts) {
            postResults.data.posts.forEach((post: any) => {
                if (post.author && !actors.find((actor: any) => actor.did === post.author.did)) {
                    additionalActors.set(post.author.did, post.author);
                }
            });
        }

        // Merge results
        const allActors = [...actors, ...Array.from(additionalActors.values())];

        console.log('Main: Combined search results:', allActors.length, 'unique actors');
        return {
            success: true,
            actors: allActors
        };
    } catch (err: any) {
        console.error('Main: Search failed', err);
        return {
            success: false,
            error: err?.message || 'Search failed'
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
