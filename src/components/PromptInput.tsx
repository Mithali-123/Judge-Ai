import { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function PromptInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [value]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative flex items-end rounded-2xl border border-border bg-card shadow-xl input-glow transition-all duration-200">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything..."
        rows={1}
        disabled={disabled}
        className="flex-1 resize-none bg-transparent px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:opacity-50 font-body"
      />
      <button
        onClick={handleSubmit}
        disabled={!value.trim() || disabled}
        className="m-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-20 hover:opacity-90 transition-all shrink-0 shadow-md"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </div>
  );
}
