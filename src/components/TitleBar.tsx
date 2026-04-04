import { Minus, Square, X } from 'lucide-react';

export function TitleBar() {
  const handleMinimize = () => {
    // @ts-ignore
    if (window.electronAPI) window.electronAPI.minimize();
  };

  const handleMaximize = () => {
    // @ts-ignore
    if (window.electronAPI) window.electronAPI.maximize();
  };

  const handleClose = () => {
    // @ts-ignore
    if (window.electronAPI) window.electronAPI.close();
  };

  return (
    <>
      {/* Invisible drag area - Leaves the left side open so your sidebar buttons still work! */}
      <div 
        className="absolute top-0 right-0 w-[calc(100%-260px)] h-10 z-40"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      />
      
      {/* Window Controls - Floating top right */}
      <div 
        className="absolute top-0 right-0 flex h-10 z-50 bg-background/30 backdrop-blur-sm rounded-bl-xl border-b border-l border-border/50" 
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button 
          onClick={handleMinimize}
          className="h-full px-4 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button 
          onClick={handleMaximize}
          className="h-full px-4 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <Square className="h-3.5 w-3.5" />
        </button>
        <button 
          onClick={handleClose}
          className="h-full px-4 text-muted-foreground hover:bg-red-500 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}