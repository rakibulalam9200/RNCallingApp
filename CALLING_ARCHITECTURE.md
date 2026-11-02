# Calling App Architecture & Technical Documentation

This document explains the **Micro-Component Architecture**, real-time **WebRTC SFU data flows**, Android native configurations, and instructions to build and test the app for Android on cellular data and Wi-Fi networks for **10+ users completely free**.

---

## 1. Micro-Component Architecture

The mobile frontend is designed using **Atomic Micro-Component Architecture**, separating UI into single-responsibility, highly reusable layers:

```
src/
├── components/
│   ├── atoms/                  <-- Atomic visual primitives (no business logic)
│   │   ├── MicroButton.tsx     # Micro circular action button with variants & ripple
│   │   ├── MicroBadge.tsx      # Badges for screen share, audio-only, network quality
│   │   ├── MicroAvatar.tsx     # Participant initials avatar + glowing active speaker ring
│   │   ├── MicroTag.tsx        # Participant name tag + mic mute indicator overlay
│   │   └── StatusIndicator.tsx # Room name pill, live duration timer, participant counter
│   ├── molecules/              <-- Composed atomic units
│   │   ├── ControlBar.tsx      # Floating bottom bar (Mic, Cam, ScreenShare, Flip, Chat, Leave)
│   │   ├── ParticipantTile.tsx # Individual video tile (WebRTC video + Avatar fallback)
│   │   ├── ChatMessageBubble.tsx # In-call message bubble with self/peer styling & timestamps
│   │   └── IncomingCallCard.tsx# Micro dialog for incoming 1-on-1 calls with Accept / Decline
│   ├── organisms/              <-- Complex domain views
│   │   ├── VideoGrid.tsx       # Adaptive grid (1-on-1, 2x2, or 5-10+ Spotlight + Rail)
│   │   ├── ScreenShareViewer.tsx # Dedicated high-definition spotlight for shared screens
│   │   └── ChatDrawer.tsx      # In-call real-time text chat drawer
│   └── templates/              <-- Complete screen layouts
│       ├── LobbyTemplate.tsx   # Pre-call room entry, name picker & audio/video preview
│       └── CallRoomTemplate.tsx# Active call layout coordinating all organisms
```

### Why "Spotlight + Thumbnail Rail" for 10+ Users?
In `VideoGrid.tsx`, when 5 to 10+ participants join:
- Rendering 10 high-resolution video tracks simultaneously would overwhelm a mobile GPU and drain the battery.
- The **Spotlight + Rail** architecture displays the **Active Speaker** (or screen sharer) on the main stage in high quality, while other peers are displayed on a lightweight bottom thumbnail rail.

---

## 2. How the Real-Time Calling System Works

### A. WebRTC SFU (Selective Forwarding Unit) Pipeline
```
[ Device A (Android) ] ──(1 Single Stream)──┐
[ Device B (Android) ] ──(1 Single Stream)──┼──> [ LiveKit SFU Cloud ] ──> Optimally forwards
[ Device C (Android) ] ──(1 Single Stream)──┘     (Free 100 GB Tier)       media to all 10+ peers
```
1. **Single Uplink Stream**: Unlike pure P2P mesh (where a device must upload 9 separate video streams for 10 users), LiveKit only requires **1 upload stream per phone**.
2. **Adaptive Bitrate & Simulcast**: LiveKit automatically adjusts video resolution (720p, 360p, 180p) based on whether a tester is on fast Wi-Fi or weak 4G cellular data.
3. **Cross-Network Traversal (Cellular $\leftrightarrow$ Wi-Fi)**: Built-in global TURN servers relay media when devices are behind strict Carrier-Grade NAT (CGNAT) on mobile 4G/5G.

### B. Android Native Screen Sharing (`MediaProjection`)
- When the user taps the **Share Screen** button in `ControlBar`:
  1. The app invokes Android's native `MediaProjectionManager`.
  2. Android displays the system prompt: *"RNCallingApp will start capturing everything that's displayed on your screen"*.
  3. Once approved, LiveKit captures the phone display as a virtual video track and publishes it to the room.
  4. The `ScreenShareViewer` organism automatically spotlights the screen for all participants in the call.

### C. In-Call Real-Time Text Messaging
- In-call chat messages do not use HTTP polling or third-party database services.
- Messages are broadcasted over the **WebRTC Data Channel** (`room.localParticipant.publishData`) with zero latency and zero server database costs.

---

## 3. Android Native Configuration (Included in Codebase)

### A. Android 14/15 Compliance (`android/app/src/main/AndroidManifest.xml`)
The manifest includes mandatory permissions and foreground service declarations:
- `CAMERA` and `RECORD_AUDIO`: For real-time video and audio capture.
- `POST_NOTIFICATIONS`: For Android 13+ incoming call ring notifications.
- `FOREGROUND_SERVICE_MEDIA_PROJECTION`: Required by Android 14+ for background screen capturing.
- `FOREGROUND_SERVICE_MICROPHONE`: Keeps audio connected when the app is placed in the background.

### B. ProGuard & R8 Release Rules (`android/app/proguard-rules.pro`)
WebRTC native C++ bindings are protected from being stripped during release builds:
```proguard
-keep class org.webrtc.** { *; }
-dontwarn org.webrtc.**
-keep class io.livekit.** { *; }
-dontwarn io.livekit.**
```

---

## 4. 100% Free Backend Token Server (`/server`)

LiveKit requires secure JWT tokens to let users enter rooms. A turnkey Express server is included in `/server/server.js`:
- `GET /health`: Verifies server status.
- `GET /token?room=xyz&identity=john`: Generates an authorized LiveKit room token.

### Free 1-Click Deployment to Render.com:
1. Push your repository to GitHub.
2. Go to [Render.com](https://render.com) and create a **New Web Service** pointing to the `server/` directory.
3. Set environment variables from your free [cloud.livekit.io](https://cloud.livekit.io) dashboard:
   - `LIVEKIT_API_KEY`: Your LiveKit API Key.
   - `LIVEKIT_API_SECRET`: Your LiveKit API Secret.
4. Copy the public Render URL (e.g. `https://my-calling-server.onrender.com`) and paste it into `src/config/livekitConfig.ts`.

---

## 5. Building & Testing on Android

### A. Install Node Dependencies
Run in the project root:
```bash
npm install
```

### B. Test in Debug Mode on Connected Android Device
```bash
npm run android
```

### C. Build Release Standalone APK (For Direct Testing on Multiple Phones)
To install the APK directly on multiple Android phones across cellular and Wi-Fi:
```bash
cd android
./gradlew assembleRelease
```
The output APK will be generated at:
`android/app/build/outputs/apk/release/app-release.apk`

### D. Build Release AAB (For Google Play Store Testing)
To upload to Google Play Console (Internal Testing / Closed Testing track):
```bash
cd android
./gradlew bundleRelease
```
The output AAB bundle will be generated at:
`android/app/build/outputs/bundle/release/app-release.aab`

