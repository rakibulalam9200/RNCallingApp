import { createStore } from './createStore';
import { CallParticipant, CallStatus, AudioRoute, CallType } from '../types/call';

interface CallState {
  status: CallStatus;
  callType: CallType;
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
  setCallType: (callType: CallType) => void;
  setRoomDetails: (roomName: string, userName: string, callType?: CallType) => void;
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
  callType: 'group',
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
  setCallType: (callType) => set({ callType }),
  setRoomDetails: (roomName, userName, callType = 'group') =>
    set({ roomName, userName, callType }),
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
