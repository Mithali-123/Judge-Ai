export function ThinkingDots({ label = 'Thinking' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
      <span>{label}</span>
      <div className="flex gap-1">
        <span className="thinking-dot inline-block w-1.5 h-1.5 rounded-full bg-primary" />
        <span className="thinking-dot inline-block w-1.5 h-1.5 rounded-full bg-primary" />
        <span className="thinking-dot inline-block w-1.5 h-1.5 rounded-full bg-primary" />
      </div>
    </div>
  );
}
