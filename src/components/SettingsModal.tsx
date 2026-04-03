import { useState, useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';
import { X, Key, Eye, EyeOff, ExternalLink, Shield, Sparkles, Cpu, Brain, Search, Zap, Box } from 'lucide-react';

const API_GUIDES = {
  gemini: {
    name: 'Google Gemini',
    icon: Sparkles,
    color: 'text-gemini',
    borderColor: 'border-gemini/20',
    bgColor: 'bg-gemini/5',
    placeholder: 'AIza...',
    steps: [
      { text: 'Go to Google AI Studio', url: 'https://aistudio.google.com/apikey' },
      { text: 'Sign in with your Google account' },
      { text: 'Click "Create API Key"' },
      { text: 'Copy the key and paste it below' },
    ],
    link: 'https://aistudio.google.com/apikey',
  },
  openai: {
    name: 'OpenAI (GPT-4o)',
    icon: Cpu,
    color: 'text-gpt',
    borderColor: 'border-gpt/20',
    bgColor: 'bg-gpt/5',
    placeholder: 'sk-...',
    steps: [
      { text: 'Go to OpenAI API Keys page', url: 'https://platform.openai.com/api-keys' },
      { text: 'Sign in or create an account' },
      { text: 'Click "Create new secret key"' },
      { text: 'Add billing credits to use the API', url: 'https://platform.openai.com/settings/organization/billing/overview' },
      { text: 'Copy the key and paste it below' },
    ],
    link: 'https://platform.openai.com/api-keys',
  },
  claude: {
    name: 'Anthropic (Claude) (Requires Payment)',
    icon: Brain,
    color: 'text-claude',
    borderColor: 'border-claude/20',
    bgColor: 'bg-claude/5',
    placeholder: 'sk-ant-...',
    steps: [
      { text: 'Go to Anthropic Console', url: 'https://console.anthropic.com/settings/keys' },
      { text: 'Sign in or create an account' },
      { text: 'Click "Create Key"' },
      { text: 'Add billing credits if needed', url: 'https://console.anthropic.com/settings/billing' },
      { text: 'Copy the key and paste it below' },
    ],
    link: 'https://console.anthropic.com/settings/keys',
  },
  perplexity: {
    name: 'Perplexity (Requires Payment)',
    icon: Search,
    color: 'text-perplexity',
    borderColor: 'border-perplexity/20',
    bgColor: 'bg-perplexity/5',
    placeholder: 'pplx-...',
    steps: [
      { text: 'Go to Perplexity API Settings', url: 'https://www.perplexity.ai/settings/api' },
      { text: 'Sign in or create an account' },
      { text: 'Generate an API key' },
      { text: 'Add credits to your account if needed' },
      { text: 'Copy the key and paste it below' },
    ],
    link: 'https://www.perplexity.ai/settings/api',
  },
  groq: {
    name: 'Groq (Free & Fast)',
    icon: Zap,
    color: 'text-green-400',
    borderColor: 'border-green-400/20',
    bgColor: 'bg-green-400/5',
    placeholder: 'gsk_...',
    steps: [
      { text: 'Go to Groq Console', url: 'https://console.groq.com/keys' },
      { text: 'Sign in or create an account' },
      { text: 'Click "Create API Key"' },
      { text: 'Copy the key and paste it below' },
    ],
    link: 'https://console.groq.com/keys',
  },
  huggingface: {
    name: 'Hugging Face (Free)',
    icon: Box,
    color: 'text-yellow-400',
    borderColor: 'border-yellow-400/20',
    bgColor: 'bg-yellow-400/5',
    placeholder: 'hf_...',
    steps: [
      { text: 'Go to Hugging Face Settings', url: 'https://huggingface.co/settings/tokens' },
      { text: 'Sign in or create an account' },
      { text: 'Click "New token" (Role: Read)' },
      { text: 'Copy the token and paste it below' },
    ],
    link: 'https://huggingface.co/settings/tokens',
  },
};

type GuideKey = keyof typeof API_GUIDES;

export function SettingsModal() {
  const { settingsOpen, setSettingsOpen, apiKeys, setApiKeys } = useChatStore();
  const [keys, setKeys] = useState(apiKeys);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [expandedGuide, setExpandedGuide] = useState<GuideKey | null>(null);

  useEffect(() => {
    setKeys(apiKeys);
    setExpandedGuide(null);
    setShowKeys({});
  }, [apiKeys, settingsOpen]);

  if (!settingsOpen) return null;

  const handleSave = () => {
    setApiKeys(keys);
    setSettingsOpen(false);
  };

  const guideEntries: { key: GuideKey; field: keyof typeof keys }[] = [
    { key: 'gemini', field: 'gemini' },
    { key: 'groq', field: 'groq' },
    { key: 'huggingface', field: 'huggingface' },
    { key: 'openai', field: 'openai' },
    { key: 'claude', field: 'claude' },
    { key: 'perplexity', field: 'perplexity' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-md animate-fade-in" onClick={() => setSettingsOpen(false)}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-0 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Key className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-base text-foreground">API Configuration</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Bring your own keys — stored locally</p>
            </div>
          </div>
          <button onClick={() => setSettingsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Security note */}
          <div className="flex items-start gap-2.5 rounded-xl bg-secondary/50 p-3 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 shrink-0 mt-0.5 text-primary/70" />
            <span>Your keys are stored in your browser's local storage. They are <strong className="text-foreground">never</strong> sent to any server other than the respective AI provider. You only need <strong className="text-foreground">at least one</strong> key to start.</span>
          </div>

          {guideEntries.map(({ key, field }) => (
            <KeySection
              key={key}
              guide={API_GUIDES[key]}
              value={keys[field]}
              onChange={v => setKeys({ ...keys, [field]: v })}
              show={!!showKeys[key]}
              onToggleShow={() => setShowKeys(s => ({ ...s, [key]: !s[key] }))}
              expanded={expandedGuide === key}
              onToggleExpand={() => setExpandedGuide(expandedGuide === key ? null : key)}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border bg-secondary/20">
          <button onClick={() => setSettingsOpen(false)} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity glow-primary">
            Save Keys
          </button>
        </div>
      </div>
    </div>
  );
}

function KeySection({
  guide,
  value,
  onChange,
  show,
  onToggleShow,
  expanded,
  onToggleExpand,
}: {
  guide: typeof API_GUIDES.gemini;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const Icon = guide.icon;
  const isConfigured = !!value;

  return (
    <div className={`rounded-xl border ${isConfigured ? 'border-border' : guide.borderColor} overflow-hidden transition-all`}>
      <div className={`flex items-center justify-between px-4 py-3 ${guide.bgColor}`}>
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${guide.color}`} />
          <span className="text-sm font-medium text-foreground">{guide.name}</span>
          {isConfigured && (
            <span className="text-[10px] bg-gpt/20 text-gpt px-1.5 py-0.5 rounded-full font-medium">Connected</span>
          )}
        </div>
        <button
          onClick={onToggleExpand}
          className="text-xs text-primary hover:underline transition-colors"
        >
          {expanded ? 'Hide guide' : 'How to get key?'}
        </button>
      </div>

      {expanded && (
        <div className="px-4 py-3 border-t border-border/50 bg-secondary/30 animate-fade-in">
          <ol className="space-y-2">
            {guide.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center shrink-0 text-[10px] font-bold text-foreground">{i + 1}</span>
                <span className="pt-0.5">
                  {step.url ? (
                    <a href={step.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      {step.text} <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : step.text}
                </span>
              </li>
            ))}
          </ol>
          <a
            href={guide.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
          >
            Open {guide.name} Dashboard <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      <div className="px-4 py-3">
        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={guide.placeholder}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          />
          <button onClick={onToggleShow} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}