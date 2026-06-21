import { logRelationship, logError } from '../../utils/relationshipLogger.js';
import { log } from '../../utils/functions.js';

export default {
    name: 'relationshipAdd', // This is the correct event name for discord.js-selfbot-v13
    once: false,
    
        execute: async (client, relationship) => {
        try {
            // Skip if relationship logging is disabled
            if (!client.config.relationship_logs || !client.config.relationship_logs.enabled) {
                return;
            }
            
            // Debug the relationship object
            if (client.config.debug_mode && client.config.debug_mode.enabled) {
                log(`[DEBUG] relationshipAdd data: ${JSON.stringify(relationship)}`, 'debug');
            }
            
            // or an object with relationship details
            let userId;
            
            if (typeof relationship === 'string') {
                userId = relationship;
            } else {
                // It's an object with properties
                userId = relationship.id;
            }
            
            // Get the user from cache
            const user = client.users.cache.get(userId) || {
                id: userId,
                tag: `Unknown (${userId})`,
                username: 'Unknown',
                discriminator: '0000'
            };
            
            // Log the friend add event
            if (client.config.debug_mode && client.config.debug_mode.enabled) {
                log(`[DEBUG] Friend added: ${userId}`, 'debug');
            }
            
            // Log the friend add
            await logRelationship({
                event: 'friendAdd',
                data: { user },
                client
            });
            
        } catch (error) {
            logError(error, 'Friend Add Event Error');
        }
    }
};