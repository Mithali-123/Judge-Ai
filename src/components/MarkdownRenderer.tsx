import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

function CodeBlock({ language, children }: { language: string; children: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 rounded-lg overflow-hidden border border-border">
      <div className="flex items-center justify-between bg-secondary px-4 py-1.5 text-xs text-muted-foreground">
        <span>{language || 'code'}</span>
        <button onClick={handleCopy} className="flex items-center gap-1 hover:text-foreground transition-colors">
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={vscDarkPlus}
        customStyle={{ margin: 0, borderRadius: 0, background: 'hsl(0 0% 4%)' }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match;
          if (isInline) {
            return <code className="bg-secondary px-1.5 py-0.5 rounded text-sm font-display" {...props}>{children}</code>;
          }
          return <CodeBlock language={match[1]}>{String(children).replace(/\n$/, '')}</CodeBlock>;
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-3">
              <table className="min-w-full text-sm border border-border">{children}</table>
            </div>
          );
        },
        th({ children }) {
          return <th className="border border-border bg-secondary px-3 py-1.5 text-left font-medium">{children}</th>;
        },
        td({ children }) {
          return <td className="border border-border px-3 py-1.5">{children}</td>;
        },
        blockquote({ children }) {
          return <blockquote className="border-l-2 border-primary pl-4 my-3 text-muted-foreground italic">{children}</blockquote>;
        },
        a({ href, children }) {
          return <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:opacity-80">{children}</a>;
        },
        ul({ children }) {
          return <ul className="list-disc pl-5 space-y-1 my-2">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal pl-5 space-y-1 my-2">{children}</ol>;
        },
        h2({ children }) {
          return <h2 className="text-lg font-semibold mt-4 mb-2">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-base font-semibold mt-3 mb-1.5">{children}</h3>;
        },
        p({ children }) {
          return <p className="my-1.5 leading-relaxed">{children}</p>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
