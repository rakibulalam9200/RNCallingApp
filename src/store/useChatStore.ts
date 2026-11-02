import { create } from 'zustand';
import { ChatMessage, FloatingReaction } from '../types/call';

interface ChatState {
  messages: ChatMessage[];
  floatingReactions: FloatingReaction[];
  isChatOpen: boolean;
  unreadCount: number;

  // Actions
  addMessage: (message: ChatMessage) => void;
  addMessageReaction: (messageId: string, emoji: string, userName: string) => void;
  triggerFloatingReaction: (emoji: string, sender: string) => void;
  removeFloatingReaction: (id: string) => void;
  setChatOpen: (isOpen: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  floatingReactions: [],
  isChatOpen: false,
  unreadCount: 0,

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
      unreadCount: state.isChatOpen ? 0 : state.unreadCount + 1,
    })),

  addMessageReaction: (messageId, emoji, userName) =>
    set((state) => ({
      messages: state.messages.map((msg) => {
        if (msg.id !== messageId) return msg;
        const currentReactions = msg.reactions || {};
        const currentUsers = currentReactions[emoji] || [];
        const updatedUsers = currentUsers.includes(userName)
          ? currentUsers.filter((u) => u !== userName) // toggle off
          : [...currentUsers, userName]; // toggle on

        return {
          ...msg,
          reactions: {
            ...currentReactions,
            [emoji]: updatedUsers,
          },
        };
      }),
    })),

  triggerFloatingReaction: (emoji, sender) =>
    set((state) => ({
      floatingReactions: [
        ...state.floatingReactions,
        {
          id: `${Date.now()}_${Math.random()}`,
          emoji,
          sender,
          xPosition: 15 + Math.random() * 70, // random percentage (15% to 85% width)
          createdAt: Date.now(),
        },
      ],
    })),

  removeFloatingReaction: (id) =>
    set((state) => ({
      floatingReactions: state.floatingReactions.filter((r) => r.id !== id),
    })),

  setChatOpen: (isChatOpen) =>
    set((state) => ({
      isChatOpen,
      unreadCount: isChatOpen ? 0 : state.unreadCount,
    })),

  clearMessages: () =>
    set({
      messages: [],
      floatingReactions: [],
      unreadCount: 0,
    }),
}));
