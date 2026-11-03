export type CallStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'error';

export type CallType = 'group' | 'direct';

export type AudioRoute = 'speaker' | 'earpiece' | 'bluetooth';

export interface CallParticipant {
  identity: string;
  name: string;
  isLocal: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  videoTrack?: any;
  screenShareTrack?: any;
}

export interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: number;
  isLocal: boolean;
  reactions?: Record<string, string[]>; // emoji -> user names/ids
}

export interface FloatingReaction {
  id: string;
  emoji: string;
  sender: string;
  xPosition: number; // percentage across screen (10% - 90%)
  createdAt: number;
}

export type AIAssistantStatus = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface LiveTranscript {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  isAI?: boolean;
}

export interface RoomConnectionConfig {
  serverUrl: string;
  token: string;
  roomName: string;
  userName: string;
}


