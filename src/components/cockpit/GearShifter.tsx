import { OctagonX, Zap, Play, Square, Eye, Radio, Navigation, Camera } from "lucide-react";
import { AutopilotTelemetry, AutopilotStatus } from "./AutopilotTelemetry";

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

  // If autopilot is on, show autopilot telemetry instead of gears
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
        
        {/* Emergency Stop - Always enabled */}
        <button
          onClick={onEmergencyStop}
          className={`
            w-full h-[3.5dvh] max-h-7 min-h-4 rounded border flex items-center justify-center gap-1
            text-[8px] sm:text-[10px] font-bold racing-text transition-all touch-feedback
            ${isEmergencyStop
              ? 'bg-destructive border-destructive text-destructive-foreground glow-red animate-pulse'
              : 'bg-card border-destructive/50 text-destructive hover:bg-destructive/20 hover:border-destructive'
            }
          `}
        >
          <OctagonX className="w-3 h-3 sm:w-4 sm:h-4" />
          {isEmergencyStop ? 'STOPPED' : 'E-STOP'}
        </button>
        
        {/* Stop Button */}
        <button
          onClick={onStop}
          className="w-full h-[4dvh] max-h-8 min-h-5 rounded-lg border-2 flex items-center justify-center gap-0.5 text-[8px] sm:text-[10px] font-bold racing-text transition-all touch-feedback bg-card border-destructive/50 text-destructive hover:bg-destructive/20 hover:border-destructive"
        >
          <Square className="w-3 h-3 sm:w-4 sm:h-4" />
          STOP AUTOPILOT
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-full py-1 px-1.5 overflow-hidden gap-1">
      {/* LIVE TELEMETRY Header */}
      <div className="racing-text text-[8px] sm:text-xs text-muted-foreground tracking-widest">LIVE TELEMETRY</div>
      
      {/* E-STOP and AUTO side by side */}
      <div className="w-full grid grid-cols-2 gap-1">
        {/* E-STOP */}
        <button
          onClick={onEmergencyStop}
          className={`
            h-[5dvh] max-h-10 min-h-6 rounded-lg border-2 flex items-center justify-center
            transition-all touch-feedback
            ${isEmergencyStop
              ? 'bg-destructive border-destructive text-destructive-foreground glow-red animate-pulse'
              : 'bg-card border-destructive text-destructive hover:bg-destructive/20'
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
            h-[5dvh] max-h-10 min-h-6 rounded-lg border-2 flex items-center justify-center
            transition-all touch-feedback ${disabledClass}
            ${isAutoMode
              ? 'bg-primary border-primary text-primary-foreground glow-teal'
              : 'bg-card border-primary text-primary hover:bg-primary/20'
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
            w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center
            transition-all touch-feedback
            ${isAutopilotOn
              ? 'bg-green-500 border-green-500 text-green-950 glow-green'
              : 'bg-card border-green-500 text-green-500 hover:bg-green-500/20'
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
            w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center
            transition-all touch-feedback
            ${isSonarOn
              ? 'bg-blue-500 border-blue-500 text-blue-950 glow-cyan'
              : 'bg-card border-blue-500 text-blue-500 hover:bg-blue-500/20'
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
            w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center
            transition-all touch-feedback
            ${isInfraredOn
              ? 'bg-amber-500 border-amber-500 text-amber-950 glow-amber'
              : 'bg-card border-amber-500 text-amber-500 hover:bg-amber-500/20'
            }
          `}
        >
          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        
        {/* Camera (placeholder) */}
        <button
          disabled={isDisabled}
          className={`
            w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center
            transition-all touch-feedback ${disabledClass}
            bg-card border-purple-500 text-purple-500 hover:bg-purple-500/20
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
            {/* Vertical lines */}
            <line x1="20" y1="20" x2="20" y2="100" stroke="hsl(var(--muted-foreground))" strokeWidth="3" strokeLinecap="round" />
            <line x1="60" y1="20" x2="60" y2="100" stroke="hsl(var(--muted-foreground))" strokeWidth="3" strokeLinecap="round" />
            <line x1="100" y1="20" x2="100" y2="100" stroke="hsl(var(--muted-foreground))" strokeWidth="3" strokeLinecap="round" />
            {/* Horizontal crossbar */}
            <line x1="20" y1="60" x2="100" y2="60" stroke="hsl(var(--muted-foreground))" strokeWidth="3" strokeLinecap="round" />
          </svg>
          
          {/* Gear buttons positioned on the H-pattern */}
          {GEAR_POSITIONS.map(({ gear, col, row }) => {
            const isActive = currentGear === gear;
            const isReverse = gear === "R";
            const x = col * 40 + 20; // 20, 60, 100
            const y = row * 80 + 20; // 20 (top), 100 (bottom)
            
            return (
              <button
                key={gear}
                onClick={() => !isDisabled && onGearChange(gear)}
                disabled={isDisabled}
                className={`
                  absolute w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 flex items-center justify-center
                  text-xs sm:text-sm font-bold racing-text transition-all touch-feedback z-10
                  ${isActive
                    ? isReverse
                      ? "bg-destructive border-destructive text-destructive-foreground shadow-lg shadow-destructive/40"
                      : "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/40"
                    : "bg-card border-muted-foreground/50 text-foreground hover:border-foreground/70"
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
      
      {/* Power Controls - Bottom */}
      <div className={`w-full grid grid-cols-2 gap-1 mt-auto ${disabledClass}`}>
        {/* Start */}
        <button
          onClick={() => !isDisabled && onStart()}
          disabled={isDisabled}
          className={`
            h-[5dvh] max-h-10 min-h-6 rounded-lg border-2 flex items-center justify-center gap-1
            text-[8px] sm:text-[10px] font-bold racing-text transition-all touch-feedback
            ${isStarted
              ? 'bg-green-500 border-green-500 text-green-950 glow-green animate-pulse'
              : 'bg-card border-primary text-primary hover:bg-primary/20'
            }
          `}
        >
          <Play className="w-3 h-3 sm:w-4 sm:h-4" />
          START
        </button>
        
        {/* Stop - Always enabled */}
        <button
          onClick={onStop}
          className={`
            h-[5dvh] max-h-10 min-h-6 rounded-lg border-2 flex items-center justify-center gap-1
            text-[8px] sm:text-[10px] font-bold racing-text transition-all touch-feedback
            ${!isStarted
              ? 'bg-destructive border-destructive text-destructive-foreground'
              : 'bg-card border-destructive text-destructive hover:bg-destructive/20'
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
