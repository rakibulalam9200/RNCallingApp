/**
 * LiveKit & Signaling Configuration
 * 
 * 100% Free Setup:
 * 1. Register a free account at https://cloud.livekit.io (Free 100 GB/month bandwidth)
 * 2. Get your WebSocket URL (e.g., wss://my-app-xyz.livekit.cloud)
 * 3. Deploy the included free server script in `/server` to Render.com ($0 free tier)
 *    to generate JWT tokens, OR test with demo sandbox tokens.
 */

export const LIVEKIT_CONFIG = {
  // Replace with your free LiveKit Cloud URL: wss://<your-project>.livekit.cloud
  DEFAULT_WS_URL: 'wss://demo-calling-app.livekit.cloud',

  // Replace with your Render.com free token server URL: https://<your-app>.onrender.com
  TOKEN_SERVER_URL: 'https://demo-calling-token-server.onrender.com',

  // Fallback room and participant defaults
  DEFAULT_ROOM_NAME: 'group-call-room',
  DEFAULT_USER_NAME: `User_${Math.floor(1000 + Math.random() * 9000)}`,

  // Video resolution defaults optimized for 10+ mobile users
  VIDEO_PRESETS: {
    width: 640,
    height: 360,
    maxBitrate: 400000, // 400 kbps for smooth cellular transmission
    maxFramerate: 24,
  },

  // Screen share resolution
  SCREEN_SHARE_PRESETS: {
    width: 1280,
    height: 720,
    maxBitrate: 1500000,
    maxFramerate: 15,
  },
};

