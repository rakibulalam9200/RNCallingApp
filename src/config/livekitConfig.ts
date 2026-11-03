/**
 * LiveKit & Signaling Configuration
 * 
 * 100% Free Setup:
 * 1. Register a free account at https://cloud.livekit.io (Free 100 GB/month bandwidth)
 * 2. Get your WebSocket URL (e.g., wss://my-app-xyz.livekit.cloud)
 * 3. Deploy the included free server script in `/server` to Render.com ($0 free tier)
 *    to generate JWT tokens, OR test with demo sandbox tokens.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  WS_URL: '@rncalling_ws_url',
  TOKEN_SERVER_URL: '@rncalling_token_server_url',
  STATIC_TOKEN: '@rncalling_static_token',
  USER_NAME: '@rncalling_user_name',
};

export const LIVEKIT_CONFIG = {
  // Replace with your free LiveKit Cloud URL: wss://<your-project>.livekit.cloud
  DEFAULT_WS_URL: 'wss://rncalling-prod-1wkhfsvi.livekit.cloud',

  // Replace with your Render.com / Railway / Local token server URL: https://<your-app>.onrender.com
  TOKEN_SERVER_URL: 'https://demo-calling-token-server.onrender.com',

  // Optional direct JWT token generated from cloud.livekit.io dashboard for quick MVP testing without a server
  STATIC_DEV_TOKEN: '',

  // Fallback room and participant defaults
  DEFAULT_ROOM_NAME: 'group-call-room',
  DEFAULT_USER_NAME: `User_${Math.floor(1000 + Math.random() * 9000)}`,

  // Video resolution defaults optimized for 10+ mobile users
  VIDEO_PRESETS: {
    width: 640,
    height: 360,
    maxBitrate: 450000, // 450 kbps for smooth cellular transmission
    maxFramerate: 24,
  },

  // 1-on-1 Direct Call HD Video Preset
  DIRECT_CALL_VIDEO_PRESETS: {
    width: 1280,
    height: 720,
    maxBitrate: 1200000, // 1.2 Mbps for crisp 1-on-1 direct video
    maxFramerate: 30,
  },

  // Screen share resolution
  SCREEN_SHARE_PRESETS: {
    width: 1280,
    height: 720,
    maxBitrate: 1500000,
    maxFramerate: 15,
  },
};

export interface RuntimeServerConfig {
  wsUrl: string;
  tokenServerUrl: string;
  staticToken: string;
}

export const loadRuntimeConfig = async (): Promise<RuntimeServerConfig> => {
  try {
    const [wsUrl, tokenServerUrl, staticToken] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.WS_URL),
      AsyncStorage.getItem(STORAGE_KEYS.TOKEN_SERVER_URL),
      AsyncStorage.getItem(STORAGE_KEYS.STATIC_TOKEN),
    ]);
    return {
      wsUrl: wsUrl || LIVEKIT_CONFIG.DEFAULT_WS_URL,
      tokenServerUrl: tokenServerUrl || LIVEKIT_CONFIG.TOKEN_SERVER_URL,
      staticToken: staticToken || LIVEKIT_CONFIG.STATIC_DEV_TOKEN,
    };
  } catch {
    return {
      wsUrl: LIVEKIT_CONFIG.DEFAULT_WS_URL,
      tokenServerUrl: LIVEKIT_CONFIG.TOKEN_SERVER_URL,
      staticToken: LIVEKIT_CONFIG.STATIC_DEV_TOKEN,
    };
  }
};

export const saveRuntimeConfig = async (config: Partial<RuntimeServerConfig>) => {
  try {
    if (config.wsUrl !== undefined) {
      await AsyncStorage.setItem(STORAGE_KEYS.WS_URL, config.wsUrl.trim());
    }
    if (config.tokenServerUrl !== undefined) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.TOKEN_SERVER_URL,
        config.tokenServerUrl.trim()
      );
    }
    if (config.staticToken !== undefined) {
      await AsyncStorage.setItem(STORAGE_KEYS.STATIC_TOKEN, config.staticToken.trim());
    }
  } catch (e) {
    console.warn('[Config] Failed to persist runtime config', e);
  }
};


