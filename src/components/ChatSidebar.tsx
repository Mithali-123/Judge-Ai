import { useChatStore } from '@/store/chatStore';
import { Plus, MessageSquare, Trash2, Settings, Scale, PanelLeftClose } from 'lucide-react';

export function ChatSidebar() {
  const { chats, activeChatId, sidebarOpen, setActiveChat, createChat, deleteChat, setSettingsOpen, toggleSidebar } = useChatStore();

  if (!sidebarOpen) return null;

  return (
    <aside className="w-[260px] h-screen flex flex-col border-r border-border bg-sidebar shrink-0">
      {/* Header */}
      <div className="px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Scale className="h-5 w-5 text-judge-gold" />
            <div className="absolute -inset-1 bg-judge-gold/10 rounded-full blur-sm -z-10 animate-glow-pulse" />
          </div>
          <span className="font-display text-sm font-bold text-foreground tracking-tight">Judge.ai</span>
        </div>
        <button onClick={toggleSidebar} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary">
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* New Chat */}
      <div className="px-3 pb-3">
        <button
          onClick={() => createChat()}
          className="w-full flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      {/* Divider */}
      <div className="px-4 pb-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">History</span>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {chats.length === 0 && (
          <p className="text-xs text-muted-foreground/40 text-center py-8 px-4">No conversations yet</p>
        )}
        {chats.map(chat => (
          <div
            key={chat.id}
            className={`group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm cursor-pointer transition-all duration-150 ${
              chat.id === activeChatId
                ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
            }`}
            onClick={() => setActiveChat(chat.id)}
          >
            <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-50" />
            <span className="truncate flex-1 text-[13px]">{chat.title}</span>
            <button
              onClick={e => { e.stopPropagation(); deleteChat(chat.id); }}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-0.5 rounded"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => setSettingsOpen(true)}
          className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-150"
        >
          <Settings className="h-4 w-4" />
          <span>API Keys</span>
          {/* Show a dot indicator if no keys configured */}
          {!useChatStore.getState().apiKeys.gemini && !useChatStore.getState().apiKeys.openai && !useChatStore.getState().apiKeys.claude && !useChatStore.getState().apiKeys.perplexity && (
            <span className="ml-auto w-2 h-2 rounded-full bg-judge-gold animate-pulse" />
          )}
        </button>
      </div>
    </aside>
  );
}