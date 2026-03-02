import { useState, useCallback, useRef } from "react";
import { X, Crosshair, Play, Square, Target, Clock, Gauge, MapPin } from "lucide-react";

interface PursuitModeProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TrackedTarget {
  x: number;
  y: number;
  id: number;
}

export const PursuitMode = ({ isOpen, onClose }: PursuitModeProps) => {
  const [isTracking, setIsTracking] = useState(false);
  const [target, setTarget] = useState<TrackedTarget | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const viewfinderRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  const handleViewfinderClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!viewfinderRef.current) return;
    const rect = viewfinderRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setTarget({ x, y, id: Date.now() });
  }, []);

  const handleStart = useCallback(() => {
    if (!target) return;
    setIsTracking(true);
    setElapsedTime(0);
    timerRef.current = window.setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  }, [target]);

  const handleStop = useCallback(() => {
    setIsTracking(false);
    setTarget(null);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setElapsedTime(0);
  }, []);

  const handleClose = useCallback(() => {
    handleStop();
    onClose();
  }, [handleStop, onClose]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm">
      <div className="w-[92vw] max-w-2xl h-[85vh] max-h-[600px] rounded-xl border border-primary/30 bg-card/95 flex flex-col overflow-hidden shadow-2xl shadow-primary/10">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/40 bg-card">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-destructive" />
            <span className="racing-text text-xs sm:text-sm text-foreground tracking-wider">PURSUIT MODE</span>
            {isTracking && (
              <span className="flex items-center gap-1 ml-2">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                <span className="racing-text text-[9px] text-destructive">TRACKING</span>
              </span>
            )}
          </div>
          
          {/* Telemetry Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="racing-text text-[9px] sm:text-[10px] text-muted-foreground">{formatTime(elapsedTime)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Gauge className="w-3 h-3 text-muted-foreground" />
              <span className="racing-text text-[9px] sm:text-[10px] text-muted-foreground">
                {isTracking ? `${Math.floor(Math.random() * 30 + 10)} CM/S` : "-- CM/S"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <span className="racing-text text-[9px] sm:text-[10px] text-muted-foreground">
                {target ? `${target.x.toFixed(0)}%, ${target.y.toFixed(0)}%` : "NO LOCK"}
              </span>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-md border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Viewfinder */}
        <div className="flex-1 relative overflow-hidden m-2 rounded-lg border border-border/30">
          <div
            ref={viewfinderRef}
            onClick={handleViewfinderClick}
            className="absolute inset-0 bg-black cursor-crosshair"
          >
            {/* Simulated camera feed - dark gradient with noise */}
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(ellipse at center, hsl(var(--card)) 0%, hsl(0 0% 5%) 100%)",
              }}
            />
            
            {/* Grid overlay */}
            <svg className="absolute inset-0 w-full h-full opacity-15">
              <defs>
                <pattern id="pursuit-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#pursuit-grid)" />
            </svg>
            
            {/* Center crosshair */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
              <Crosshair className="w-12 h-12 text-primary" />
            </div>
            
            {/* Scanlines */}
            <div
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--primary) / 0.15) 2px, hsl(var(--primary) / 0.15) 4px)",
              }}
            />
            
            {/* Corner brackets */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary/50" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary/50" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary/50" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary/50" />
            
            {/* Placeholder text */}
            {!target && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <Crosshair className="w-8 h-8 text-primary/40 mb-2" />
                <span className="racing-text text-[10px] sm:text-xs text-primary/50">TAP TO LOCK TARGET</span>
                <span className="racing-text text-[8px] text-muted-foreground mt-1">CLICK ANYWHERE ON THE FEED</span>
              </div>
            )}
            
            {/* Target Lock Reticle */}
            {target && (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: `${target.x}%`,
                  top: `${target.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Outer ring */}
                <div className={`w-14 h-14 rounded-full border-2 ${isTracking ? 'border-destructive' : 'border-primary'} flex items-center justify-center ${isTracking ? 'animate-pulse' : ''}`}>
                  {/* Inner ring */}
                  <div className={`w-8 h-8 rounded-full border ${isTracking ? 'border-destructive/70' : 'border-primary/70'}`} />
                  {/* Center dot */}
                  <div className={`absolute w-2 h-2 rounded-full ${isTracking ? 'bg-destructive' : 'bg-primary'}`} />
                </div>
                {/* Tracking lines */}
                <div className={`absolute top-1/2 -left-3 w-2 h-px ${isTracking ? 'bg-destructive' : 'bg-primary'}`} />
                <div className={`absolute top-1/2 -right-3 w-2 h-px ${isTracking ? 'bg-destructive' : 'bg-primary'}`} />
                <div className={`absolute -top-3 left-1/2 h-2 w-px ${isTracking ? 'bg-destructive' : 'bg-primary'}`} />
                <div className={`absolute -bottom-3 left-1/2 h-2 w-px ${isTracking ? 'bg-destructive' : 'bg-primary'}`} />
                {/* Label */}
                <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 racing-text text-[8px] whitespace-nowrap ${isTracking ? 'text-destructive' : 'text-primary'}`}>
                  {isTracking ? "LOCKED" : "TARGET"}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer Controls */}
        <div className="px-3 py-2 border-t border-border/40 bg-card flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${target ? (isTracking ? 'bg-destructive animate-pulse' : 'bg-primary') : 'bg-muted-foreground/30'}`} />
            <span className="racing-text text-[9px] sm:text-[10px] text-muted-foreground">
              {isTracking ? "PURSUIT ACTIVE" : target ? "TARGET ACQUIRED" : "AWAITING TARGET"}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleStart}
              disabled={!target || isTracking}
              className={`
                h-9 px-4 rounded-lg border flex items-center justify-center gap-1.5
                text-[9px] sm:text-[11px] font-bold racing-text transition-all touch-feedback
                ${!target || isTracking
                  ? 'opacity-40 pointer-events-none bg-card/80 border-border text-muted-foreground'
                  : 'bg-primary/20 border-primary text-primary hover:bg-primary/30 glow-teal'
                }
              `}
            >
              <Play className="w-3.5 h-3.5" />
              PURSUE
            </button>
            
            <button
              onClick={handleStop}
              disabled={!isTracking && !target}
              className={`
                h-9 px-4 rounded-lg border flex items-center justify-center gap-1.5
                text-[9px] sm:text-[11px] font-bold racing-text transition-all touch-feedback
                ${!isTracking && !target
                  ? 'opacity-40 pointer-events-none bg-card/80 border-border text-muted-foreground'
                  : 'bg-destructive/20 border-destructive text-destructive hover:bg-destructive/30'
                }
              `}
            >
              <Square className="w-3.5 h-3.5" />
              ABORT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
