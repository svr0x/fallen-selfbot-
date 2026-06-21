import { log, hasPermissions } from './functions.js';
import chalk from 'chalk';

export function canExecuteCommand(command, message, client) {
    // Default result
    const result = {
        canExecute: true,
        reason: null
    };
    
    // Check command type restrictions
    if (command.type) {
        // DM only commands
        if (command.type === 'dm_only' && message.guild) {
            result.canExecute = false;
            result.reason = 'This command can only be used in DMs.';
            return result;
        }
        
        // Server only commands
        if (command.type === 'server_only' && !message.guild) {
            result.canExecute = false;
            result.reason = 'This command can only be used in servers.';
            return result;
        }
    }
    
    if (message.guild && command.permissions && command.permissions.length > 0) {
        const missingPermissions = [];

        for (const permission of command.permissions) {
            if (!hasPermissions(message.member, permission)) {
                missingPermissions.push(permission);
            }
        }
        
        // If missing any permissions
        if (missingPermissions.length > 0) {
            result.canExecute = false;
            result.reason = `You need the following permissions to use this command: ${missingPermissions.join(', ')}`;
            return result;
        }
    }
    
    return result;
}

export async function executeCommand(command, client, message, args) {
    try {
        const { canExecute, reason } = canExecuteCommand(command, message, client);
        
        if (!canExecute) {
            // Send the reason to the user
            return message.channel.send(`> ❌ **Error:** ${reason}`);
        }
        
        // Execute the command
        await command.execute(client, message, args);
        
        // Log command usage
        const location = message.guild 
            ? `${message.guild.name} (${message.guild.id})` 
            : 'DM';
            
        log(`${message.author.tag} used ${command.name} command in ${location}`, 'success');
    } catch (error) {
        console.error(chalk.red('[ERROR] Error executing command:'), error);
        message.channel.send('> ❌ **Error:** An error occurred while executing that command.');
    }
}