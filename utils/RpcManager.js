import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class RpcManager {
  constructor(clientId = 'main') {
    this.rpcConfig = null;
    this.lastUpdate = 0;
    this.updateQueue = [];
    this.rateLimitWindow = 20000;
    this.maxUpdates = 15;
    this.clientId = clientId;
    const fileName = clientId === 'main' ? 'rpc.yml' : `rpc-${clientId}.yml`;
    this.configPath = path.join(__dirname, '..', fileName);
    this.isInitialized = false;
    this.applicationAssets = new Map();
  }

  async initialize() {
    // Always reload fresh from file
    try {
      if (fs.existsSync(this.configPath)) {
        const fileContents = fs.readFileSync(this.configPath, 'utf8');
        this.rpcConfig = yaml.load(fileContents);
      } else {
        this.rpcConfig = this.getDefaultConfig();
        await this.saveConfig(this.rpcConfig);
      }
      this.isInitialized = true;
      return this.rpcConfig;
    } catch (error) {
      this.rpcConfig = this.getDefaultConfig();
      this.isInitialized = true;
      return this.rpcConfig;
    }
  }

  async loadConfig() {
    return this.initialize();
  }

  updateConfig(newConfig) {
    this.rpcConfig = newConfig;
    this.saveConfig(newConfig).catch(() => {});
  }

  async saveConfig(config) {
    try {
      const yamlStr = yaml.dump(config, { indent: 2 });
      fs.writeFileSync(this.configPath, yamlStr, 'utf8');
      this.rpcConfig = config;
      return true;
    } catch (error) {
      return false;
    }
  }

  canUpdate() {
    const now = Date.now();
    this.updateQueue = this.updateQueue.filter(t => now - t < this.rateLimitWindow);
    return this.updateQueue.length < this.maxUpdates;
  }

  getCurrentConfig() {
    return this.rpcConfig;
  }

  async fetchAssetsViaAPI(applicationId) {
    try {
      const apiUrl = `https://discord.com/api/v9/oauth2/applications/${applicationId}/assets`;
      const fetch = await import('node-fetch');
      const response = await fetch.default(apiUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
      });
      if (!response.ok) return new Map();
      const assets = await response.json();
      const assetMap = new Map();
      if (Array.isArray(assets)) {
        assets.forEach(a => { if (a.name && a.id) assetMap.set(a.name.toLowerCase(), a.id); });
      }
      return assetMap;
    } catch { return new Map(); }
  }

  async ensureAssetsFetched(client, applicationId) {
    const cacheKey = `${applicationId}_assets`;
    if (this.applicationAssets.has(cacheKey)) return this.applicationAssets.get(cacheKey);
    const assets = await this.fetchAssetsViaAPI(applicationId);
    this.applicationAssets.set(cacheKey, assets);
    return assets;
  }

  // User-uploaded attachments (cdn.discordapp.com/attachments/... with
  async processImageAsset(client, imageInput) {
    if (!imageInput) return null;
    if (/^\d+$/.test(imageInput)) return imageInput;
    if (imageInput.startsWith('mp:')) return imageInput;

    const isSignedAttachment = imageInput.includes('?ex=') || imageInput.includes('&ex=');

    if (!isSignedAttachment) {
      const cleanUrl = imageInput.split('?')[0];

      if (cleanUrl.includes('cdn.discordapp.com/')) {
        const match = cleanUrl.match(/cdn\.discordapp\.com\/(.+)/);
        if (match) return `mp:${match[1]}`;
      }

      if (cleanUrl.includes('media.discordapp.net/')) {
        const match = cleanUrl.match(/media\.discordapp\.net\/(.+)/);
        if (match) return `mp:${match[1]}`;
      }
    }

    if (imageInput.startsWith('https://') || imageInput.startsWith('http://')) {
      try {
        const { RichPresence } = await import('discord.js-selfbot-v13');
        const applicationId = this.rpcConfig?.rpc?.application_id || '1306468377539379241';
        const resolved = await RichPresence.getExternal(client, applicationId, imageInput);
        if (Array.isArray(resolved) && resolved[0]?.external_asset_path) {
          return `mp:${resolved[0].external_asset_path}`;
        }
      } catch {
      }
      return imageInput;
    }

    return imageInput;
  }

  resolveAsset(assetInput, assetMap) {
    if (!assetInput) return null;
    if (/^\d+$/.test(assetInput)) return assetInput;
    if (assetInput.startsWith('mp:')) return assetInput;
    if (assetInput.includes('cdn.discordapp.com') || assetInput.includes('media.discordapp.net') ||
        assetInput.startsWith('http://') || assetInput.startsWith('https://')) {
      return assetInput;
    }
    const name = assetInput.toLowerCase();
    if (assetMap.has(name)) return assetMap.get(name);
    return assetInput;
  }

  getActivityType(type) {
    const types = { 'PLAYING': 0, 'STREAMING': 1, 'LISTENING': 2, 'WATCHING': 3, 'COMPETING': 5 };
    return types[type?.toUpperCase()] ?? 0;
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  async updatePresence(client, customConfig = null) {
    if (!this.canUpdate()) return false;

    try {
      const config = customConfig || this.rpcConfig;
      if (!config?.rpc?.enabled) return false;

      const rpcData = config.rpc.default || {};
      const applicationId = config.rpc.application_id || '1306468377539379241';
      const assetMap = await this.ensureAssetsFetched(client, applicationId);

      const { RichPresence } = await import('discord.js-selfbot-v13');

      const rpc = new RichPresence(client)
        .setApplicationId(applicationId)
        .setType(this.getActivityType(rpcData.type || 'PLAYING'))
        .setName(rpcData.name || 'fallen');

      // Only set details/state if not empty
      if (rpcData.details?.trim()) rpc.setDetails(rpcData.details);
      if (rpcData.state?.trim()) rpc.setState(rpcData.state);

      if (rpcData.type === 'STREAMING') {
        rpc.setURL(rpcData.url || 'https://www.twitch.tv/directory');
      }

      // Timestamps
      if (rpcData.timestamps?.start) {
        rpc.setStartTimestamp(new Date(Number(rpcData.timestamps.start)));
      }
      if (rpcData.timestamps?.end) {
        rpc.setEndTimestamp(new Date(Number(rpcData.timestamps.end)));
      }

      if (rpcData.party?.current && rpcData.party?.max) {
        rpc.setParty({
          id: this.generateUUID(),
          current: Number(rpcData.party.current),
          max: Number(rpcData.party.max)
        });
      }

      // Large image
      if (rpcData.assets?.large_image) {
        const resolved = this.resolveAsset(rpcData.assets.large_image, assetMap);
        const processed = await this.processImageAsset(client, resolved);
        if (processed) {
          rpc.setAssetsLargeImage(processed);
          if (rpcData.assets.large_text?.trim()) rpc.setAssetsLargeText(rpcData.assets.large_text);
        }
      }

      // Small image
      if (rpcData.assets?.small_image) {
        const resolved = this.resolveAsset(rpcData.assets.small_image, assetMap);
        const processed = await this.processImageAsset(client, resolved);
        if (processed) {
          rpc.setAssetsSmallImage(processed);
          if (rpcData.assets.small_text?.trim()) rpc.setAssetsSmallText(rpcData.assets.small_text);
        }
      }

      // Buttons
      if (Array.isArray(rpcData.buttons) && rpcData.buttons.length > 0) {
        rpcData.buttons.slice(0, 2).forEach(btn => {
          if (btn.label && btn.url) rpc.addButton(btn.label, btn.url);
        });
      }

      await client.user.setPresence({
        activities: [rpc],
        status: client.config?.selfbot?.status || 'online'
      });

      this.lastUpdate = Date.now();
      this.updateQueue.push(this.lastUpdate);
      return true;

    } catch (error) {
      const { log } = await import('./functions.js').catch(() => ({ log: console.log }));
      log(`RPC error: ${error.message}`, 'error');
      return false;
    }
  }

  getDefaultConfig() {
    return {
      rpc: {
        enabled: true,
        application_id: '1306468377539379241',
        default: {
          type: 'PLAYING',
          name: 'fallen',
          details: '',
          state: '',
          url: '',
          party: { current: 999, max: 999 },
          timestamps: { start: null, end: null },
          assets: { large_image: '', large_text: '', small_image: '', small_text: '' },
          buttons: []
        }
      }
    };
  }

  clearAssetCache() { this.applicationAssets.clear(); }

  async forceReload() {
    this.clearAssetCache();
    this.isInitialized = false;
    return this.initialize();
  }
}

export default new RpcManager();
