import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ModelId = 'gemini' | 'gpt' | 'claude' | 'perplexity' | 'groq' | 'ollama';

export interface ModelResponse {
  model: ModelId;
  content: string;
  done: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelResponses?: ModelResponse[];
  judgeSummary?: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}

export interface ApiKeys {
  gemini: string;
  openai: string;
  claude: string;
  perplexity: string;
  groq: string;
  ollama: string;
}

interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  apiKeys: ApiKeys;
  sidebarOpen: boolean;
  settingsOpen: boolean;
  
  createChat: () => string;
  setActiveChat: (id: string | null) => void;
  addMessage: (chatId: string, message: ChatMessage) => void;
  updateMessage: (chatId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  setApiKeys: (keys: ApiKeys) => void;
  toggleSidebar: () => void;
  setSettingsOpen: (open: boolean) => void;
  deleteChat: (id: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChatId: null,
      apiKeys: { gemini: '', openai: '', claude: '', perplexity: '', groq: '', ollama: ''},
      sidebarOpen: true,
      settingsOpen: false,

      createChat: () => {
        const id = crypto.randomUUID();
        const chat: Chat = { id, title: 'New Chat', messages: [], createdAt: Date.now() };
        set(state => ({ chats: [chat, ...state.chats], activeChatId: id }));
        return id;
      },

      setActiveChat: (id) => set({ activeChatId: id }),

      addMessage: (chatId, message) =>
        set(state => ({
          chats: state.chats.map(c =>
            c.id === chatId
              ? {
                  ...c,
                  messages: [...c.messages, message],
                  title: c.messages.length === 0 && message.role === 'user'
                    ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
                    : c.title,
                }
              : c
          ),
        })),

      updateMessage: (chatId, messageId, updates) =>
        set(state => ({
          chats: state.chats.map(c =>
            c.id === chatId
              ? {
                  ...c,
                  messages: c.messages.map(m =>
                    m.id === messageId ? { ...m, ...updates } : m
                  ),
                }
              : c
          ),
        })),

      setApiKeys: (keys) => set({ apiKeys: keys }),
      toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
      setSettingsOpen: (open) => set({ settingsOpen: open }),
      deleteChat: (id) =>
        set(state => ({
          chats: state.chats.filter(c => c.id !== id),
          activeChatId: state.activeChatId === id ? null : state.activeChatId,
        })),
    }),
    { name: 'judge-ai-storage' }
  )
);