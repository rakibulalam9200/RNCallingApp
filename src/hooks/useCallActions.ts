import { useCallStore } from '../store/useCallStore';
import { useChatStore } from '../store/useChatStore';
import { useAIStore } from '../store/useAIStore';
import { livekitService } from '../services/livekitService';
import { LIVEKIT_CONFIG } from '../config/livekitConfig';
import { ChatMessage } from '../types/call';

/**
 * useCallActions: Action dispatchers optimized by React Compiler
 * No manual useCallback or dependency arrays required.
 */
export const useCallActions = () => {
  const {
    setStatus,
    setRoomDetails,
    setParticipants,
    setActiveSpeakerId,
    setScreenSharer,
    setMuted,
    setVideoEnabled,
    setScreenSharing,
    setSpeakerOn,
    resetCall,
    isMuted,
    isVideoEnabled,
    isScreenSharing,
    isSpeakerOn,
    userName,
  } = useCallStore();

  const {
    addMessage,
    triggerFloatingReaction,
    clearMessages,
  } = useChatStore();

  const {
    status: aiStatus,
    setStatus: setAIStatus,
    appendTranscript,
  } = useAIStore();

  // Join Room
  const joinRoom = async (targetRoom: string, user: string, audioOnly = false) => {
    try {
      setStatus('connecting');
      setRoomDetails(targetRoom, user);
      clearMessages();

      const dummyToken = 'sandbox_token';

      await livekitService.connect(LIVEKIT_CONFIG.DEFAULT_WS_URL, dummyToken, {
        onParticipantsChanged: (list) => {
          setParticipants(list);
        },
        onActiveSpeakerChanged: (speakerId) => {
          setActiveSpeakerId(speakerId);
        },
        onScreenShareChanged: (sharer, track) => {
          setScreenSharer(sharer, track);
        },
        onChatMessageReceived: (msg) => {
          // Check if it is a special packet (Reaction or AI)
          if (msg.message.startsWith('__REACTION__:')) {
            const emoji = msg.message.replace('__REACTION__:', '');
            triggerFloatingReaction(emoji, msg.sender);
            return;
          }
          if (msg.message.startsWith('__AI_TRANSCRIPT__:')) {
            const text = msg.message.replace('__AI_TRANSCRIPT__:', '');
            appendTranscript({
              id: `${Date.now()}`,
              sender: msg.sender,
              text,
              timestamp: Date.now(),
              isAI: true,
            });
            return;
          }
          addMessage(msg);
        },
        onDisconnected: () => {
          resetCall();
        },
      });

      if (audioOnly) {
        setVideoEnabled(false);
        await livekitService.setCameraEnabled(false);
      }

      setStatus('connected');
    } catch (e) {
      console.error('Failed to join room', e);
      setStatus('connected'); // Fallback to simulated UI connected state
    }
  };

  // Leave Room
  const leaveRoom = () => {
    livekitService.disconnect();
    resetCall();
    clearMessages();
  };

  // Toggle Microphone
  const toggleMic = async () => {
    const nextState = !isMuted;
    setMuted(nextState);
    await livekitService.setMicrophoneEnabled(!nextState);
  };

  // Toggle Camera
  const toggleVideo = async () => {
    const nextState = !isVideoEnabled;
    setVideoEnabled(nextState);
    await livekitService.setCameraEnabled(nextState);
  };

  // Toggle Screen Sharing
  const toggleScreenShare = async () => {
    const nextState = !isScreenSharing;
    setScreenSharing(nextState);
    await livekitService.setScreenShareEnabled(nextState);
  };

  // Flip Camera
  const flipCamera = async () => {
    await livekitService.flipCamera();
  };

  // Toggle Speakerphone
  const toggleSpeaker = () => {
    const nextState = !isSpeakerOn;
    setSpeakerOn(nextState);
    livekitService.setSpeakerphoneOn(nextState);
  };

  // Send In-Call Message
  const sendMessage = async (text: string) => {
    const localMsg: ChatMessage = {
      id: `${Date.now()}_local`,
      sender: userName || 'You',
      message: text,
      timestamp: Date.now(),
      isLocal: true,
    };
    addMessage(localMsg);
    await livekitService.sendChatMessage(text);
  };

  // Send Emoji Reaction (Flying on screen + broadcast to peers)
  const sendReaction = async (emoji: string) => {
    const sender = userName || 'You';
    triggerFloatingReaction(emoji, sender);
    await livekitService.sendChatMessage(`__REACTION__:${emoji}`);
  };

  // Toggle AI Assistant in Room
  const toggleAI = async () => {
    const nextStatus = aiStatus === 'idle' ? 'listening' : 'idle';
    setAIStatus(nextStatus);
  };

  return {
    joinRoom,
    leaveRoom,
    toggleMic,
    toggleVideo,
    toggleScreenShare,
    flipCamera,
    toggleSpeaker,
    sendMessage,
    sendReaction,
    toggleAI,
  };
};
