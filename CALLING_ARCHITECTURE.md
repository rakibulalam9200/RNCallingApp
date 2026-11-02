# Calling App Architecture & Technical Documentation

This document explains the **Micro-Component Architecture**, **Zustand Global Store Architecture**, **WebRTC SFU data flows**, **AI Integration Roadmap**, **Emoji Reactions**, and performance optimization with the **React Compiler**.

---

## 1. Micro-Component & State Architecture

### A. Separation of Concerns (Atomic Micro-Components)
The frontend separates atomic presentation from state and side-effects:

```
src/
├── store/                      <-- Zustand Global Stores (No Prop-Drilling)
│   ├── useCallStore.ts         # Call status, participants, active speaker, audio/video toggles
│   ├── useChatStore.ts         # In-call messages, reactions, floating reaction animations
│   └── useAIStore.ts           # AI assistant state, live transcription, Gemini model session
├── hooks/
│   ├── useCallActions.ts       # Unified actions invoking LiveKit and mutating Zustand stores
│   └── useCallTimer.ts         # Call duration timer
├── components/
│   ├── atoms/                  # Micro visual primitives
│   │   ├── MicroButton.tsx     # Micro circular action button with variants & ripple
│   │   ├── MicroBadge.tsx      # Badges for screen share, audio-only & network quality
│   │   ├── MicroAvatar.tsx     # Participant initials avatar + glowing active speaker ring
│   │   ├── MicroTag.tsx        # Participant name tag + mic mute icon overlay
│   │   └── StatusIndicator.tsx # Room name pill, live duration timer, participant counter
│   ├── molecules/              # Composed atomic units
│   │   ├── ControlBar.tsx      # Floating action bar (Mic, Cam, ScreenShare, Flip, Chat, Leave)
│   │   ├── ParticipantTile.tsx # Individual video tile (WebRTC video + Avatar fallback)
│   │   ├── ChatMessageBubble.tsx # In-call message bubble with self/peer styling & timestamps
│   │   ├── IncomingCallCard.tsx# Micro dialog for incoming 1-on-1 calls with Accept / Decline
│   │   ├── AIAssistantPill.tsx # Header pill showing AI status (listening/thinking/speaking)
│   │   └── ReactionPicker.tsx  # Horizontal emoji reaction bar (❤️, 👍, 👏, 🔥, 🎉, 😂, 😮)
│   ├── organisms/              # Complex domain views
│   │   ├── VideoGrid.tsx       # Adaptive layout (1-on-1, 2x2, or 5–10+ Spotlight + Rail)
│   │   ├── ScreenShareViewer.tsx # Dedicated high-definition spotlight for shared screens
│   │   ├── ChatDrawer.tsx      # In-call real-time text chat drawer
│   │   └── FloatingReactionsOverlay.tsx # Animated emoji bursts floating up screen
│   └── templates/              # Complete screen layouts
│       ├── LobbyTemplate.tsx   # Pre-call room entry & preview
│       └── CallRoomTemplate.tsx# Active call layout coordinating all organisms
```

### B. Why Zustand Instead of Context or Props?
- **Zero Prop-Drilling**: Deep components like `ControlBar` or `ParticipantTile` read directly from the store.
- **Granular Atomic Subscriptions**: Components subscribe only to the slice of state they care about:
  ```tsx
  // Only re-renders when isMuted changes, ignoring all other 10 participant video updates!
  const isMuted = useCallStore((s) => s.isMuted);
  ```

---

## 2. Future Features: Architecture & Implementation

### A. Real-Time AI Conversation & Voice Agents
How to integrate AI (e.g., **Gemini 2.0 Multimodal Live API** or OpenAI Realtime) into this calling app:

```
[ Android App ]  <====== WebRTC Audio Track ======>  [ LiveKit SFU ]  <====== Audio Track ======>  [ LiveKit AI Agent ]
(You speak)                                                                                         (Gemini Multimodal Live)
```

1. **AI as a WebRTC Participant**:
   - In LiveKit, an AI Agent runs on the backend (using `livekit-agents` in Python/Node.js).
   - The AI Agent joins the room just like any regular human participant (`identity: "Gemini_AI"`).
   - It subscribes to the user's audio track, streams audio chunks to Gemini's Live API, and publishes synthesized voice responses back as an audio track.
2. **In-App AI Status & Transcription (`useAIStore`)**:
   - When the AI speaks, LiveKit sends audio activity events (`isSpeaking: true`).
   - The app's `AIAssistantPill` dynamically glows blue/purple/green:
     - `listening`: User is speaking.
     - `thinking`: Waiting for LLM tokens.
     - `speaking`: AI is talking into the group call.
   - Real-time text captions are received over the Data Channel and recorded into `transcripts` in `useAIStore`.

### B. Emoji Reactions & Floating Bursts
- **Data Channel Broadcasting**:
  When a user taps an emoji in `ReactionPicker.tsx`:
  ```ts
  // Broadcasted over WebRTC data channel with zero latency
  await livekitService.sendChatMessage(`__REACTION__:${emoji}`);
  ```
- **Animation Layer (`FloatingReactionsOverlay.tsx`)**:
  - Receives the reaction and triggers an animated floating burst using React Native's `Animated` native driver.
  - Emojis fly upwards at random screen positions (15% to 85% width) and fade out, identical to Zoom or Microsoft Teams.

### C. In-Call Group Chat & Reactions
- Chat messages are stored in `useChatStore`.
- Supports per-message emoji reactions:
  ```ts
  addMessageReaction(messageId, '👍', 'Alex');
  ```
- Unread counter automatically updates when the chat drawer is closed.

---

## 3. Codebase Optimization & React Compiler

### A. React 19 React Compiler
This project runs on **React 19.3.0** and React Native 0.88.
With React Compiler, manual `useMemo`, `useCallback`, and `React.memo` are **no longer needed**. The compiler analyzes your JavaScript code and memoizes intermediate values and callbacks automatically at build time.

#### How to Enable in `babel.config.js`:
Once `babel-plugin-react-compiler` is installed, add it to plugins:
```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['babel-plugin-react-compiler', { target: '19' }],
  ],
};
```

### B. WebRTC Mobile Performance Best Practices
1. **Adaptive Stream & Dynacast**:
   Enabled by default in `livekitService.ts`. If a participant's tile is minimized into the bottom thumbnail rail, LiveKit's server automatically drops the incoming stream to low-resolution (180p), saving 70% CPU and network bandwidth.
2. **Active Speaker Spotlight**:
   For 5 to 10+ participants, `VideoGrid.tsx` spotlights only the active speaker, preventing Android GPU overload.
3. **Android Native Driver**:
   All animations (floating emojis, pulse rings) use `useNativeDriver: true` to run at 60 FPS off the JavaScript thread.

---

## 4. Building & Running the App

### A. Install Dependencies
```bash
npm install
# or if peer warnings occur:
npm install --legacy-peer-deps
```

### B. Run on Android Device
```bash
npm run android
```

### C. Build Release Standalone APK (Testing across Cellular & Wi-Fi)
```bash
cd android
./gradlew assembleRelease
```
Output: `android/app/build/outputs/apk/release/app-release.apk`

### D. Build Release AAB (Google Play Store Testing)
```bash
cd android
./gradlew bundleRelease
```
Output: `android/app/build/outputs/bundle/release/app-release.aab`
