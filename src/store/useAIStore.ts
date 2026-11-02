import { create } from 'zustand';
import { AIAssistantStatus, LiveTranscript } from '../types/call';

interface AIState {
  status: AIAssistantStatus;
  isEnabled: boolean;
  model: 'gemini-2.0-flash-live' | 'openai-realtime' | 'custom-agent';
  transcripts: LiveTranscript[];
  lastSummary: string;

  // Actions
  setStatus: (status: AIAssistantStatus) => void;
  toggleAIAssistant: () => void;
  appendTranscript: (transcript: LiveTranscript) => void;
  setLastSummary: (summary: string) => void;
  clearSession: () => void;
}

export const useAIStore = create<AIState>((set) => ({
  status: 'idle',
  isEnabled: false,
  model: 'gemini-2.0-flash-live',
  transcripts: [],
  lastSummary: '',

  setStatus: (status) => set({ status }),
  toggleAIAssistant: () => set((state) => ({ isEnabled: !state.isEnabled })),
  appendTranscript: (transcript) =>
    set((state) => ({
      transcripts: [...state.transcripts.slice(-50), transcript], // keep latest 50
    })),
  setLastSummary: (lastSummary) => set({ lastSummary }),
  clearSession: () =>
    set({
      status: 'idle',
      isEnabled: false,
      transcripts: [],
      lastSummary: '',
    }),
}));
