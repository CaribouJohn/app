import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('api', {
    // Add safe APIs here
});
