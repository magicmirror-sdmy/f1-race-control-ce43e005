import { OctagonX, Zap, Play, Square, Eye, Radio, Navigation, Camera } from "lucide-react";
import { AutopilotTelemetry, AutopilotStatus } from "./AutopilotTelemetry";
import { NowPlayingHUD } from "./NowPlayingHUD";

interface GearShifterProps {
  currentGear: string;
  onGearChange: (gear: string) => void;
  isAutoMode: boolean;
  onAutoModeToggle: () => void;
  isEmergencyStop: boolean;
  onEmergencyStop: () => void;
  isInfraredOn: boolean;
  onInfraredToggle: () => void;
  isSonarOn: boolean;
  onSonarToggle: () => void;
  isAutopilotOn: boolean;
  onAutopilotToggle: () => void;
  isStarted: boolean;
  onStart: () => void;
  onStop: () => void;
  autopilotStatus?: AutopilotStatus;
  autopilotAcceleration?: number;
  autopilotDistance?: number;
}

const GEAR_POSITIONS: { gear: string; col: number; row: number }[] = [
  { gear: "S", col: 0, row: 0 },
  { gear: "3", col: 1, row: 0 },
  { gear: "2", col: 2, row: 0 },
  { gear: "1", col: 0, row: 1 },
  { gear: "N", col: 1, row: 1 },
  { gear: "R", col: 2, row: 1 },
];

export const GearShifter = ({ 
  currentGear, 
  onGearChange,
  isAutoMode,
  onAutoModeToggle,
  isEmergencyStop,
  onEmergencyStop,
  isInfraredOn,
  onInfraredToggle,
  isSonarOn,
  onSonarToggle,
  isAutopilotOn,
  onAutopilotToggle,
  isStarted,
  onStart,
  onStop,
  autopilotStatus = "CRUISING",
  autopilotAcceleration = 0,
  autopilotDistance = 100,
}: GearShifterProps) => {
  const isDisabled = isAutopilotOn;
  const disabledClass = isDisabled ? "opacity-40 pointer-events-none" : "";

  // Autopilot telemetry view
  if (isAutopilotOn) {
    return (
      <div className="flex flex-col items-center h-full py-1 px-1 overflow-hidden gap-1">
        <div className="flex-1 w-full overflow-hidden">
          <AutopilotTelemetry
            status={autopilotStatus}
            accelerationPercent={autopilotAcceleration}
            distanceToObstacle={autopilotDistance}
          />
        </div>
        
        <button
          onClick={onEmergencyStop}
          className={`
            w-full h-[3.5dvh] max-h-7 min-h-4 rounded border flex items-center justify-center gap-1
            text-[8px] sm:text-[10px] font-bold racing-text transition-all touch-feedback
            ${isEmergencyStop
              ? 'bg-destructive border-destructive text-destructive-foreground glow-red animate-pulse'
              : 'bg-card border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/60'
            }
          `}
        >
          <OctagonX className="w-3 h-3 sm:w-4 sm:h-4" />
          {isEmergencyStop ? 'STOPPED' : 'E-STOP'}
        </button>
        
        <button
          onClick={onStop}
          className="w-full h-[4dvh] max-h-8 min-h-5 rounded-lg border flex items-center justify-center gap-0.5 text-[8px] sm:text-[10px] font-bold racing-text transition-all touch-feedback bg-card border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/60"
        >
          <Square className="w-3 h-3 sm:w-4 sm:h-4" />
          STOP AUTOPILOT
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-full py-1.5 px-1.5 overflow-hidden gap-1.5">
      {/* LIVE TELEMETRY Header */}
      <div className="racing-text text-[8px] sm:text-xs text-muted-foreground tracking-widest">LIVE TELEMETRY</div>
      
      {/* E-STOP and AUTO side by side */}
      <div className="w-full grid grid-cols-2 gap-1">
        {/* E-STOP */}
        <button
          onClick={onEmergencyStop}
          className={`
            h-[5dvh] max-h-10 min-h-6 rounded-lg border flex items-center justify-center
            transition-all touch-feedback
            ${isEmergencyStop
              ? 'bg-destructive/20 border-destructive text-destructive-foreground glow-red animate-pulse'
              : 'bg-card/80 border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive/70'
            }
          `}
        >
          <OctagonX className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        
        {/* AUTO */}
        <button
          onClick={() => !isDisabled && onAutoModeToggle()}
          disabled={isDisabled}
          className={`
            h-[5dvh] max-h-10 min-h-6 rounded-lg border flex items-center justify-center
            transition-all touch-feedback ${disabledClass}
            ${isAutoMode
              ? 'bg-primary/20 border-primary text-primary glow-teal'
              : 'bg-card/80 border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/70'
            }
          `}
        >
          <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
      
      {/* Circular Sensor Toggles Row */}
      <div className={`w-full flex items-center justify-center gap-1.5 sm:gap-2 py-0.5 ${disabledClass}`}>
        {/* Autopilot */}
        <button
          onClick={onAutopilotToggle}
          className={`
            w-8 h-8 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center
            transition-all touch-feedback
            ${isAutopilotOn
              ? 'bg-primary/20 border-primary text-primary glow-teal'
              : 'bg-card/80 border-primary/30 text-primary/70 hover:bg-primary/10 hover:border-primary/60'
            }
          `}
        >
          <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        
        {/* Sonar */}
        <button
          onClick={() => !isDisabled && onSonarToggle()}
          disabled={isDisabled}
          className={`
            w-8 h-8 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center
            transition-all touch-feedback
            ${isSonarOn
              ? 'bg-primary/20 border-primary text-primary glow-teal'
              : 'bg-card/80 border-border text-muted-foreground hover:bg-primary/10 hover:border-primary/40 hover:text-primary/70'
            }
          `}
        >
          <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        
        {/* IR */}
        <button
          onClick={() => !isDisabled && onInfraredToggle()}
          disabled={isDisabled}
          className={`
            w-8 h-8 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center
            transition-all touch-feedback
            ${isInfraredOn
              ? 'bg-warning/20 border-warning text-warning glow-amber'
              : 'bg-card/80 border-border text-muted-foreground hover:bg-warning/10 hover:border-warning/40 hover:text-warning/70'
            }
          `}
        >
          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        
        {/* Camera */}
        <button
          disabled={isDisabled}
          className={`
            w-8 h-8 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center
            transition-all touch-feedback ${disabledClass}
            bg-card/80 border-border text-muted-foreground hover:bg-muted/30 hover:border-muted-foreground/40
          `}
        >
          <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
      
      {/* H-Pattern Gear Shifter */}
      <div className={`flex-1 w-full flex items-center justify-center ${disabledClass}`}>
        <div className="relative" style={{ width: '120px', height: '120px' }}>
          {/* SVG H-Pattern Lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 120" fill="none">
            <line x1="20" y1="20" x2="20" y2="100" stroke="hsl(var(--border))" strokeWidth="3" strokeLinecap="round" />
            <line x1="60" y1="20" x2="60" y2="100" stroke="hsl(var(--border))" strokeWidth="3" strokeLinecap="round" />
            <line x1="100" y1="20" x2="100" y2="100" stroke="hsl(var(--border))" strokeWidth="3" strokeLinecap="round" />
            <line x1="20" y1="60" x2="100" y2="60" stroke="hsl(var(--border))" strokeWidth="3" strokeLinecap="round" />
          </svg>
          
          {GEAR_POSITIONS.map(({ gear, col, row }) => {
            const isActive = currentGear === gear;
            const isReverse = gear === "R";
            const x = col * 40 + 20;
            const y = row * 80 + 20;
            
            return (
              <button
                key={gear}
                onClick={() => !isDisabled && onGearChange(gear)}
                disabled={isDisabled}
                className={`
                  absolute w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center
                  text-xs sm:text-sm font-bold racing-text transition-all touch-feedback z-10
                  ${isActive
                    ? isReverse
                      ? "bg-destructive/20 border-destructive text-destructive shadow-lg shadow-destructive/20"
                      : "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "bg-card border-border text-muted-foreground hover:border-muted-foreground/60 hover:text-foreground"
                  }
                `}
                style={{
                  left: `${(x / 120) * 100}%`,
                  top: `${(y / 120) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {gear}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Now Playing Music HUD */}
      <NowPlayingHUD className="w-full" />
      
      {/* Power Controls - Bottom */}
      <div className={`w-full grid grid-cols-2 gap-1 ${disabledClass}`}>
        {/* Start */}
        <button
          onClick={() => !isDisabled && onStart()}
          disabled={isDisabled}
          className={`
            h-[5dvh] max-h-10 min-h-6 rounded-lg border flex items-center justify-center gap-1
            text-[8px] sm:text-[10px] font-bold racing-text transition-all touch-feedback
            ${isStarted
              ? 'bg-primary/20 border-primary text-primary glow-teal animate-pulse'
              : 'bg-card/80 border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/70'
            }
          `}
        >
          <Play className="w-3 h-3 sm:w-4 sm:h-4" />
          START
        </button>
        
        {/* Stop */}
        <button
          onClick={onStop}
          className={`
            h-[5dvh] max-h-10 min-h-6 rounded-lg border flex items-center justify-center gap-1
            text-[8px] sm:text-[10px] font-bold racing-text transition-all touch-feedback
            ${!isStarted
              ? 'bg-destructive/20 border-destructive text-destructive'
              : 'bg-card/80 border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive/70'
            }
          `}
        >
          <Square className="w-3 h-3 sm:w-4 sm:h-4" />
          STOP
        </button>
      </div>
    </div>
  );
};
