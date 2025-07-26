// Global type declarations for the Electron renderer process

interface BlueskyAPI {
    login: (identifier: string, password: string) => Promise<{ success: boolean, handle?: string, error?: string }>;
    search: (query: string) => Promise<{ success: boolean, actors?: any[], error?: string }>;
    isLoggedIn: () => Promise<boolean>;
}

declare global {
    interface Window {
        blueskyAPI: BlueskyAPI;
    }

    const blueskyAPI: BlueskyAPI;
}

export { };
