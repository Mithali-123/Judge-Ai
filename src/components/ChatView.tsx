import { useState, useRef, useEffect, useCallback } from 'react';
import { useChatStore, ChatMessage, ModelResponse, ModelId } from '@/store/chatStore';
import { MODEL_CONFIGS, generateJudgeSummary } from '@/lib/aiService';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ThinkingDots } from './ThinkingDots';
import { PromptInput } from './PromptInput';
// ADDED BOX ICON FOR HUGGING FACE
import { Scale, Sparkles, Cpu, Brain, Search, PanelLeft, Zap, Code, BookOpen, Copy, Edit2, Check, ThumbsUp, ThumbsDown, Box } from 'lucide-react';

// FIXED: ADDED GROQ AND HUGGINGFACE ICONS
const MODEL_ICONS: Record<ModelId, { icon: React.ElementType; className: string }> = {
  gemini: { icon: Sparkles, className: 'text-gemini' },
  gpt: { icon: Cpu, className: 'text-gpt' },
  claude: { icon: Brain, className: 'text-claude' },
  perplexity: { icon: Search, className: 'text-perplexity' },
  groq: { icon: Zap, className: 'text-green-400' },
  huggingface: { icon: Box, className: 'text-yellow-400' },
  deepseek: { icon: Brain, className: 'text-blue-400' },
  ollama: { icon: Zap, className: 'text-orange-400' }, // Ollama Icon
};

const SUGGESTIONS = [
  { icon: Zap, text: 'Explain quantum computing', sub: 'in simple terms' },
  { icon: Code, text: 'Write a Python script', sub: 'to sort a linked list' },
  { icon: BookOpen, text: 'Compare REST vs GraphQL', sub: 'pros and cons' },
];

export function ChatView() {
  const { chats, activeChatId, apiKeys, addMessage, updateMessage, createChat, sidebarOpen, toggleSidebar } = useChatStore();
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleEdit = (text: string) => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.value = text;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.focus();
    }
  };

  const activeChat = chats.find(c => c.id === activeChatId);
  const messages = activeChat?.messages || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async (prompt: string) => {
    if (isStreaming) return;

    let chatId = activeChatId;
    if (!chatId) {
      chatId = createChat();
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };
    addMessage(chatId, userMsg);

    const activeModels = MODEL_CONFIGS.filter(m => !!apiKeys[m.apiKeyField]);

    if (activeModels.length === 0) {
      const assistantId = crypto.randomUUID();
      addMessage(chatId, {
        id: assistantId,
        role: 'assistant',
        content: '⚠️ No API keys configured. Click **API Keys** in the sidebar to add at least one API key.',
        timestamp: Date.now(),
      });
      return;
    }

    const assistantId = crypto.randomUUID();
    const initialResponses: ModelResponse[] = activeModels.map(m => ({
      model: m.id,
      content: '',
      done: false,
    }));

    addMessage(chatId, {
      id: assistantId,
      role: 'assistant',
      content: '',
      modelResponses: initialResponses,
      timestamp: Date.now(),
    });
    setIsStreaming(true);

    const history = messages
      .filter(m => m.role === 'user')
      .map(m => ({ role: 'user' as const, content: m.content }));

    const state: Record<ModelId, { text: string; done: boolean }> = {} as any;
    activeModels.forEach(m => { state[m.id] = { text: '', done: false }; });

    const updateResponses = () => {
      const responses: ModelResponse[] = activeModels.map(m => ({
        model: m.id,
        content: state[m.id].text,
        done: state[m.id].done,
      }));
      updateMessage(chatId!, assistantId, { modelResponses: responses });
    };

    const checkDone = () => {
      if (activeModels.every(m => state[m.id].done)) {
        const summaryData = activeModels.map(m => ({
          model: m.id,
          label: m.label,
          content: state[m.id].text,
        }));
        const summary = generateJudgeSummary(summaryData);
        updateMessage(chatId!, assistantId, { judgeSummary: summary });
        setIsStreaming(false);
      }
    };

    const promises = activeModels.map(config =>
      config.streamFn(apiKeys[config.apiKeyField], prompt, history, {
        onDelta: (text) => { state[config.id].text += text; updateResponses(); },
        onDone: () => { state[config.id].done = true; updateResponses(); checkDone(); },
        onError: (err) => { state[config.id].text += `\n\n❌ Error: ${err}`; state[config.id].done = true; updateResponses(); checkDone(); },
      })
    );

    updateResponses();
    await Promise.all(promises);
    checkDone();
  }, [isStreaming, activeChatId, apiKeys, messages, addMessage, updateMessage, createChat]);

  if (!activeChat || messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col h-screen relative">
        {!sidebarOpen && (
          <div className="absolute top-4 left-4 z-10">
            <button onClick={toggleSidebar} className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-secondary">
              <PanelLeft className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="relative mb-8 animate-float">
            <Scale className="h-14 w-14 text-judge-gold" />
            <div className="absolute -inset-4 bg-judge-gold/10 rounded-full blur-xl -z-10 animate-glow-pulse" />
          </div>
          <h1 className="font-display text-3xl md:text-[40px] font-bold text-gradient-gold mb-3 text-center leading-tight animate-fade-in">
            Where should we start?
          </h1>
          <p className="text-muted-foreground text-sm mb-10 text-center max-w-md animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Multiple AI models answer simultaneously. The Judge compares.
          </p>

          <div className="flex flex-wrap gap-2.5 justify-center mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(`${s.text} ${s.sub}`)}
                disabled={isStreaming}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
              >
                <s.icon className="h-3.5 w-3.5 text-primary/60 group-hover:text-primary transition-colors" />
                <span className="font-medium">{s.text}</span>
                <span className="text-muted-foreground/50">{s.sub}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="w-full max-w-3xl mx-auto pb-6 px-4">
          <PromptInput onSend={handleSend} disabled={isStreaming} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen relative">
      {!sidebarOpen && (
        <div className="absolute top-4 left-4 z-10">
          <button onClick={toggleSidebar} className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-secondary bg-background/80 backdrop-blur">
            <PanelLeft className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.map((message, index) => (
            <div key={message.id || index} className={`flex flex-col group ${message.role === 'user' ? 'items-end' : 'items-start'}`}>

              {message.role === 'user' ? (
                <div className="bg-primary/10 text-primary-foreground border border-primary/20 px-5 py-3.5 rounded-2xl max-w-[85%] text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap">
                  {message.content}
                </div>
              ) : (
                <div className="w-full space-y-6">
                  
                  {message.modelResponses && message.modelResponses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {message.modelResponses.map((r, i) => {
                        const config = MODEL_CONFIGS.find(c => c.id === r.model);
                        const Icon = MODEL_ICONS[r.model as ModelId]?.icon || Cpu;
                        return (
                          <div key={i} className="bg-secondary/30 border border-border rounded-xl p-4 flex flex-col">
                            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/50">
                              <Icon className="h-4 w-4" />
                              <span className="font-medium text-sm">{config?.label || r.model}</span>
                              {r.done && <Check className="h-3 w-3 text-green-500 ml-auto" />}
                            </div>
                            <div className="text-[14px] flex-1">
                              {r.content ? <MarkdownRenderer content={r.content} /> : <ThinkingDots />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    message.content && (
                      <div className="bg-secondary/50 border border-border px-5 py-3.5 rounded-2xl max-w-[85%] text-[15px] leading-relaxed">
                         <MarkdownRenderer content={message.content} />
                      </div>
                    )
                  )}

                  {message.judgeSummary && (
                    <div className="bg-judge-gold/5 border border-judge-gold/20 rounded-xl p-5 mb-6">
                      <div className="flex items-center gap-2 mb-3 text-judge-gold font-medium">
                        <Scale className="h-5 w-5" />
                        <h3>The Judge's Verdict</h3>
                      </div>
                      <MarkdownRenderer content={message.judgeSummary} />
                    </div>
                  )}

                </div>
              )}

              <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 mt-2 px-2 text-muted-foreground ${message.role === 'user' ? 'mr-2' : 'ml-2'}`}>
                {message.role === 'user' ? (
                  <button onClick={() => handleEdit(message.content)} className="hover:text-foreground transition-colors p-1" title="Edit Prompt">
                    <Edit2 size={14} />
                  </button>
                ) : (
                  <>
                    <button className="hover:text-foreground transition-colors p-1"><ThumbsUp size={14} /></button>
                    <button className="hover:text-foreground transition-colors p-1"><ThumbsDown size={14} /></button>
                  </>
                )}
                <button 
                  onClick={() => handleCopy(message.judgeSummary || message.content || 'Copied')} 
                  className="hover:text-foreground transition-colors p-1" 
                  title="Copy Text"
                >
                  {copiedText === (message.judgeSummary || message.content || 'Copied') ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>

            </div>
          ))}
          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto pb-6 px-4 bg-gradient-to-t from-background via-background to-transparent pt-4">
        <PromptInput onSend={handleSend} disabled={isStreaming} />
      </div>
    </div>
  );
}