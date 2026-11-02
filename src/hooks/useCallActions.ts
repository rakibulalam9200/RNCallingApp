import { useCallback } from 'react';
import { useCallStore } from '../store/useCallStore';
import { useChatStore } from '../store/useChatStore';
import { useAIStore } from '../store/useAIStore';
import { livekitService } from '../services/livekitService';
import { LIVEKIT_CONFIG } from '../config/livekitConfig';
import { ChatMessage } from '../types/call';

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
    addMessageReaction,
    triggerFloatingReaction,
    clearMessages,
  } = useChatStore();

  const {
    status: aiStatus,
    isEnabled: isAIEnabled,
    setStatus: setAIStatus,
    appendTranscript,
  } = useAIStore();

  // Join Room
  const joinRoom = useCallback(
    async (targetRoom: string, user: string, audioOnly = false) => {
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
    },
    [
      setStatus,
      setRoomDetails,
      clearMessages,
      setVideoEnabled,
      setParticipants,
      setActiveSpeakerId,
      setScreenSharer,
      triggerFloatingReaction,
      appendTranscript,
      addMessage,
      resetCall,
    ]
  );

  // Leave Room
  const leaveRoom = useCallback(() => {
    livekitService.disconnect();
    resetCall();
    clearMessages();
  }, [resetCall, clearMessages]);

  // Toggle Microphone
  const toggleMic = useCallback(async () => {
    const nextState = !isMuted;
    setMuted(nextState);
    await livekitService.setMicrophoneEnabled(!nextState);
  }, [isMuted, setMuted]);

  // Toggle Camera
  const toggleVideo = useCallback(async () => {
    const nextState = !isVideoEnabled;
    setVideoEnabled(nextState);
    await livekitService.setCameraEnabled(nextState);
  }, [isVideoEnabled, setVideoEnabled]);

  // Toggle Screen Sharing
  const toggleScreenShare = useCallback(async () => {
    const nextState = !isScreenSharing;
    setScreenSharing(nextState);
    await livekitService.setScreenShareEnabled(nextState);
  }, [isScreenSharing, setScreenSharing]);

  // Flip Camera
  const flipCamera = useCallback(async () => {
    await livekitService.flipCamera();
  }, []);

  // Toggle Speakerphone
  const toggleSpeaker = useCallback(() => {
    const nextState = !isSpeakerOn;
    setSpeakerOn(nextState);
    livekitService.setSpeakerphoneOn(nextState);
  }, [isSpeakerOn, setSpeakerOn]);

  // Send In-Call Message
  const sendMessage = useCallback(
    async (text: string) => {
      const localMsg: ChatMessage = {
        id: `${Date.now()}_local`,
        sender: userName || 'You',
        message: text,
        timestamp: Date.now(),
        isLocal: true,
      };
      addMessage(localMsg);
      await livekitService.sendChatMessage(text);
    },
    [userName, addMessage]
  );

  // Send Emoji Reaction (Flying on screen + broadcast to peers)
  const sendReaction = useCallback(
    async (emoji: string) => {
      const sender = userName || 'You';
      triggerFloatingReaction(emoji, sender);
      await livekitService.sendChatMessage(`__REACTION__:${emoji}`);
    },
    [userName, triggerFloatingReaction]
  );

  // Toggle AI Assistant in Room
  const toggleAI = useCallback(async () => {
    const nextStatus = aiStatus === 'idle' ? 'listening' : 'idle';
    setAIStatus(nextStatus);
  }, [aiStatus, setAIStatus]);

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
