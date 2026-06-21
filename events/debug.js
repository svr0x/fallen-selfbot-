import { log } from '../utils/functions.js';

export default {
    name: 'debug',
    once: false,
    
        execute: async (client, info) => {
        if (client.config.debug_mode && client.config.debug_mode.enabled) {
            if (info.includes('RELATIONSHIP') || 
                info.includes('PRESENCE_UPDATE') || 
                info.includes('USER_UPDATE') || 
                info.includes('FRIEND')) {
                log(`[DEBUG] ${info}`, 'debug');
            }
        }
    }
};