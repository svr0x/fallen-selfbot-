import { logRelationship, logError } from '../../utils/relationshipLogger.js';

export default {
    name: 'guildDelete',
    once: false,
    
        execute: async (client, guild) => {
        try {
            // Skip unavailable guilds (Discord outage)
            if (!guild.available) return;
            
            await logRelationship({
                event: 'guildLeave',
                data: { guild: guild },
                client
            });
        } catch (error) {
            logError(error, 'Guild Delete Handler Error');
        }
    }
};