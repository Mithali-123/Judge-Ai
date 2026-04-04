import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Square } from 'lucide-react';

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
  isStreaming?: boolean; // New prop
  onStop?: () => void;   // New prop
}

export function PromptInput({ onSend, disabled, isStreaming, onStop }: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [value]);

  const handleSubmit = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    
    // If it's streaming, hitting the button should STOP it
    if (isStreaming && onStop) {
      onStop();
      return;
    }

    // Otherwise, handle the normal send
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Only allow sending via Enter if we are NOT currently streaming
      if (!isStreaming) {
        handleSubmit();
      }
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
        // We only disable the textarea during streaming, not the button!
        disabled={isStreaming} 
        className="flex-1 resize-none bg-transparent px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:opacity-50 font-body"
      />
      <button
        onClick={handleSubmit}
        // The button is active if it's streaming (so we can stop it) OR if there's text to send
        disabled={(!value.trim() && !isStreaming) || (disabled && !isStreaming)}
        className="m-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-20 hover:opacity-90 transition-all shrink-0 shadow-md"
      >
        {isStreaming ? (
          <Square className="h-4 w-4" fill="currentColor" />
        ) : (
          <ArrowUp className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}