/**
 * Free LiveKit JWT Token Generator Server
 * Deploy for $0 on Render.com, Railway, or Fly.io
 */

const express = require('express');
const cors = require('cors');
const { AccessToken } = require('livekit-server-sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Load credentials from environment variables (from your free cloud.livekit.io dashboard)
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'devkey';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'secret';

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/**
 * GET /token?room=roomName&identity=userName
 * Generates an authorized LiveKit JWT token for joining a video/audio/screenshare room
 */
app.get('/token', async (req, res) => {
  const room = req.query.room;
  const identity = req.query.identity || `User_${Math.floor(Math.random() * 1000)}`;

  if (!room) {
    return res.status(400).json({ error: 'Missing room query parameter' });
  }

  try {
    // Generate an access token valid for 24 hours
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: identity,
      ttl: '24h',
    });

    // Grant permissions for video, audio, data chat, and screen share
    at.addGrant({
      roomJoin: true,
      room: room,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();
    res.json({
      token,
      room,
      identity,
    });
  } catch (error) {
    console.error('Failed to create token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[Calling Server] Running on http://localhost:${PORT}`);
  console.log(`[Calling Server] Ready for 10+ user calls and screen sharing.`);
});

