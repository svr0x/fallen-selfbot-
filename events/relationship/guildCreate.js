import { logRelationship, logError } from '../../utils/relationshipLogger.js';

export default {
    name: 'guildCreate',
    once: false,
    
        execute: async (client, guild) => {
        try {
            // Get owner safely
            let owner = null;
            try {
                if (guild.ownerId) {
                    owner = await guild.members.fetch(guild.ownerId);
                }
            } catch (e) {
                logError(e, 'Failed to fetch guild owner');
            }
            
            await logRelationship({
                event: 'guildJoin',
                data: { 
                    guild: guild,
                    owner: owner
                },
                client
            });
        } catch (error) {
            logError(error, 'Guild Create Handler Error');
        }
    }
};