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
        const res = await agent.searchActors({ term: query });
        console.log('Main: Search successful', res.data.actors?.length, 'results');
        return {
            success: true,
            actors: res.data.actors || []
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
