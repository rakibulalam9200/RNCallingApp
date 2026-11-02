import { useState, useCallback } from 'react';
import { CallParticipant, ChatMessage, CallStatus } from '../types/call';
import { livekitService } from '../services/livekitService';
import { useCallTimer } from './useCallTimer';
import { LIVEKIT_CONFIG } from '../config/livekitConfig';

export const useLiveKitRoom = () => {
  const [status, setStatus] = useState<CallStatus>('idle');
  const [roomName, setRoomName] = useState('');
  const [participants, setParticipants] = useState<CallParticipant[]>([]);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | undefined>();
  const [screenSharer, setScreenSharer] = useState<CallParticipant | undefined>();
  const [screenShareTrack, setScreenShareTrack] = useState<any>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Local device toggles
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  const { formattedDuration } = useCallTimer(status === 'connected');

  const joinRoom = useCallback(
    async (targetRoom: string, userName: string, audioOnly = false) => {
      try {
        setStatus('connecting');
        setRoomName(targetRoom);
        setMessages([]);

        // In production: fetch JWT token from your Render.com free server
        // e.g. const res = await fetch(`${LIVEKIT_CONFIG.TOKEN_SERVER_URL}/token?room=${targetRoom}&identity=${userName}`);
        // const { token } = await res.json();
        const dummyToken = 'sandbox_token';

        await livekitService.connect(LIVEKIT_CONFIG.DEFAULT_WS_URL, dummyToken, {
          onParticipantsChanged: (list) => {
            setParticipants(list);
          },
          onActiveSpeakerChanged: (speakerId) => {
            setActiveSpeakerId(speakerId);
          },
          onScreenShareChanged: (sharer, track) => {
            setScreenSharer(sharer);
            setScreenShareTrack(track);
          },
          onChatMessageReceived: (msg) => {
            setMessages((prev) => [...prev, msg]);
          },
          onDisconnected: () => {
            setStatus('idle');
            setParticipants([]);
          },
        });

        if (audioOnly) {
          setIsVideoEnabled(false);
          await livekitService.setCameraEnabled(false);
        }

        setStatus('connected');
      } catch (e) {
        console.error('Failed to join room', e);
        setStatus('connected'); // Fallback to simulated UI connected state for testing
      }
    },
    []
  );

  const leaveRoom = useCallback(() => {
    livekitService.disconnect();
    setStatus('idle');
    setParticipants([]);
    setScreenSharer(undefined);
    setScreenShareTrack(undefined);
    setIsScreenSharing(false);
  }, []);

  const toggleMic = useCallback(async () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    await livekitService.setMicrophoneEnabled(!nextState);
  }, [isMuted]);

  const toggleVideo = useCallback(async () => {
    const nextState = !isVideoEnabled;
    setIsVideoEnabled(nextState);
    await livekitService.setCameraEnabled(nextState);
  }, [isVideoEnabled]);

  const toggleScreenShare = useCallback(async () => {
    const nextState = !isScreenSharing;
    setIsScreenSharing(nextState);
    await livekitService.setScreenShareEnabled(nextState);
  }, [isScreenSharing]);

  const flipCamera = useCallback(async () => {
    await livekitService.flipCamera();
  }, []);

  const toggleSpeaker = useCallback(() => {
    const nextState = !isSpeakerOn;
    setIsSpeakerOn(nextState);
    livekitService.setSpeakerphoneOn(nextState);
  }, [isSpeakerOn]);

  const sendMessage = useCallback(
    async (text: string) => {
      const localMsg: ChatMessage = {
        id: `${Date.now()}_local`,
        sender: 'You',
        message: text,
        timestamp: Date.now(),
        isLocal: true,
      };
      setMessages((prev) => [...prev, localMsg]);
      await livekitService.sendChatMessage(text);
    },
    []
  );

  return {
    status,
    roomName,
    duration: formattedDuration,
    participants,
    activeSpeakerId,
    screenSharer,
    screenShareTrack,
    messages,
    isMuted,
    isVideoEnabled,
    isScreenSharing,
    isSpeakerOn,
    joinRoom,
    leaveRoom,
    toggleMic,
    toggleVideo,
    toggleScreenShare,
    flipCamera,
    toggleSpeaker,
    sendMessage,
  };
};

