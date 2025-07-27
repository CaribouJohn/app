// Global type declarations for the Electron renderer process

interface BlueskyAPI {
    login: (identifier: string, password: string) => Promise<{ success: boolean, handle?: string, error?: string }>;
    search: (query: string, searchType?: string) => Promise<{ success: boolean, actors?: any[], searchInfo?: string, error?: string }>;
    getUserProfile: (userHandle: string) => Promise<{ success: boolean, profile?: any, posts?: any[], error?: string }>;
    isLoggedIn: () => Promise<boolean>;
}

declare global {
    interface Window {
        blueskyAPI: BlueskyAPI;
    }

    const blueskyAPI: BlueskyAPI;
}

export { };
