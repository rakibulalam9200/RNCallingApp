import { createStore } from './createStore';
import { CallParticipant, CallStatus, AudioRoute } from '../types/call';

interface CallState {
  status: CallStatus;
  roomName: string;
  userName: string;
  participants: CallParticipant[];
  activeSpeakerId?: string;
  screenSharer?: CallParticipant;
  screenShareTrack?: any;

  // Local device toggles
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isSpeakerOn: boolean;
  audioRoute: AudioRoute;

  // Actions
  setStatus: (status: CallStatus) => void;
  setRoomDetails: (roomName: string, userName: string) => void;
  setParticipants: (participants: CallParticipant[]) => void;
  setActiveSpeakerId: (id?: string) => void;
  setScreenSharer: (sharer?: CallParticipant, track?: any) => void;
  setMuted: (isMuted: boolean) => void;
  setVideoEnabled: (enabled: boolean) => void;
  setScreenSharing: (isSharing: boolean) => void;
  setSpeakerOn: (isOn: boolean) => void;
  setAudioRoute: (route: AudioRoute) => void;
  resetCall: () => void;
}

export const useCallStore = createStore<CallState>((set) => ({
  status: 'idle',
  roomName: '',
  userName: '',
  participants: [],
  activeSpeakerId: undefined,
  screenSharer: undefined,
  screenShareTrack: undefined,

  isMuted: false,
  isVideoEnabled: true,
  isScreenSharing: false,
  isSpeakerOn: true,
  audioRoute: 'speaker',

  setStatus: (status) => set({ status }),
  setRoomDetails: (roomName, userName) => set({ roomName, userName }),
  setParticipants: (participants) => set({ participants }),
  setActiveSpeakerId: (activeSpeakerId) => set({ activeSpeakerId }),
  setScreenSharer: (screenSharer, screenShareTrack) =>
    set({ screenSharer, screenShareTrack }),
  setMuted: (isMuted) => set({ isMuted }),
  setVideoEnabled: (isVideoEnabled) => set({ isVideoEnabled }),
  setScreenSharing: (isScreenSharing) => set({ isScreenSharing }),
  setSpeakerOn: (isSpeakerOn) => set({ isSpeakerOn }),
  setAudioRoute: (audioRoute) => set({ audioRoute }),
  resetCall: () =>
    set({
      status: 'idle',
      roomName: '',
      participants: [],
      activeSpeakerId: undefined,
      screenSharer: undefined,
      screenShareTrack: undefined,
      isScreenSharing: false,
    }),
}));
