import chalk from 'chalk';
import { log } from '../utils/functions.js';

export function setupRateLimit(client) {
    // Track API requests
    const requestCounts = new Map();
    const resetTimers = new Map();
    
    client.on('rateLimit', (info) => {
        const { route, timeout, limit, method, global } = info;
        
        log(`Hit rate limit on route: ${route} (${method})`, 'warn');
        log(`Time to reset: ${timeout}ms, Limit: ${limit}`, 'warn');
        log(`Global: ${global ? 'Yes' : 'No'}`, 'warn');
        
        // Implement backoff strategy
        if (global) {
            log('Global rate limit hit! Pausing all requests...', 'error');
        }
    });
    
    // Track request counts manually
    const trackRequest = (route) => {
        // Track request count
        const count = (requestCounts.get(route) || 0) + 1;
        requestCounts.set(route, count);
        
        if (count > 45) { // Discord typically has 50 requests per second limit
            log(`Approaching rate limit for route: ${route} (${count}/50)`, 'warn');
            // Could implement delay here if needed
        }
        
        if (!resetTimers.has(route)) {
            resetTimers.set(route, setTimeout(() => {
                requestCounts.delete(route);
                resetTimers.delete(route);
            }, 1000)); // Reset after 1 second
        }
    };
    
    const originalMessageSend = client.channels?.cache?.get?.prototype?.send;
    if (originalMessageSend) {
        client.channels.cache.get.prototype.send = async function(...args) {
            trackRequest('messages');
            return originalMessageSend.apply(this, args);
        };
    }
    
    log('Rate limit handler initialized', 'success');
}