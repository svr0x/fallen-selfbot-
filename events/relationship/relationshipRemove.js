import { logRelationship, logError } from '../../utils/relationshipLogger.js';
import { log } from '../../utils/functions.js';

export default {
    name: 'relationshipRemove',
    once: false,
    
        execute: async (client, relationship) => {
        try {
            // Debug the relationship object
            if (client.config.debug_mode && client.config.debug_mode.enabled) {
                log(`[DEBUG] relationshipRemove data: ${JSON.stringify(relationship)}`, 'debug');
            }
            
            // or an object with relationship details
            let userId;
            let relationshipType = 'FRIEND'; // Default to FRIEND for removal events
            
            if (typeof relationship === 'string') {
                userId = relationship;
            } else {
                // It's an object with properties
                userId = relationship.id;
                relationshipType = relationship.type || 'FRIEND';
            }
            
            // Get the user from cache
            const user = client.users.cache.get(userId) || {
                id: userId,
                tag: `Unknown (${userId})`,
                username: 'Unknown',
                discriminator: '0000'
            };
            
            // Handle different relationship types
            switch (relationshipType) {
                case 'FRIEND':
                    await logRelationship({
                        event: 'friendRemove',
                        data: { user },
                        client
                    });
                    break;
                    
                case 'BLOCKED':
                    await logRelationship({
                        event: 'friendUnblock',
                        data: { user },
                        client
                    });
                    break;
                    
                case 'INCOMING_REQUEST':
                    await logRelationship({
                        event: 'friendRequestCancelled',
                        data: { user },
                        client
                    });
                    break;
                    
                case 'OUTGOING_REQUEST':
                    await logRelationship({
                        event: 'friendRequestWithdrawn',
                        data: { user },
                        client
                    });
                    break;
                    
                default:
                    await logRelationship({
                        event: 'friendRemove',
                        data: { user },
                        client
                    });
                    break;
            }
        } catch (error) {
            logError(error, 'Relationship Remove Handler Error');
        }
    }
};