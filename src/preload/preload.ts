import { contextBridge, ipcRenderer } from 'electron';

console.log('Preload: Script starting');

// Expose the Bluesky API to the renderer process via IPC
contextBridge.exposeInMainWorld('blueskyAPI', {
    login: async (identifier: string, password: string) => {
        console.log('Preload: Forwarding login request to main process');
        return await ipcRenderer.invoke('bluesky-login', identifier, password);
    },

    search: async (query: string) => {
        console.log('Preload: Forwarding search request to main process');
        return await ipcRenderer.invoke('bluesky-search', query);
    },

    isLoggedIn: async () => {
        console.log('Preload: Checking login status via main process');
        return await ipcRenderer.invoke('bluesky-is-logged-in');
    }
});

console.log('Preload: API exposed to renderer via IPC');
