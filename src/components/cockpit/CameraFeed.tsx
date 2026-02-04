import { Video } from "lucide-react";

interface CameraFeedProps {
  isConnected: boolean;
}

export const CameraFeed = ({ isConnected }: CameraFeedProps) => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="racing-text text-[8px] sm:text-[10px] text-muted-foreground text-center mb-0.5 sm:mb-1">LIVE FEED</div>
      
      <div className="flex-1 racing-panel overflow-hidden relative bg-card/80">
        {/* Placeholder for camera feed */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Video className={`w-4 h-4 sm:w-6 sm:h-6 ${isConnected ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className="text-[6px] sm:text-[8px] text-muted-foreground racing-text mt-0.5">
            {isConnected ? 'CONNECTING...' : 'NO SIGNAL'}
          </span>
        </div>
        
        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--primary) / 0.1) 2px, hsl(var(--primary) / 0.1) 4px)',
            }}
          />
        </div>
        
        {/* Corner brackets */}
        <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-primary/50" />
        <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-primary/50" />
        <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-primary/50" />
        <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-primary/50" />
        
        {/* Recording indicator */}
        {isConnected && (
          <div className="absolute top-1 right-3 flex items-center gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
            <span className="text-[5px] sm:text-[6px] text-destructive racing-text">REC</span>
          </div>
        )}
      </div>
    </div>
  );
};
