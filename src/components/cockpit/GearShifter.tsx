import { OctagonX, Zap, Play, Square, Eye, Radio, Navigation } from "lucide-react";
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
  // Autopilot telemetry data
  autopilotStatus?: AutopilotStatus;
  autopilotAcceleration?: number;
  autopilotDistance?: number;
}

const GEARS = ["S", "3", "2", "1", "N", "R"];

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
  // Disable all controls except E-STOP and STOP when autopilot is on
  const isDisabled = isAutopilotOn;
  const disabledClass = isDisabled ? "opacity-40 pointer-events-none" : "";

  // If autopilot is on, show the autopilot telemetry instead of gears
  if (isAutopilotOn) {
    return (
      <div className="flex flex-col items-center h-full py-0.5 px-0.5 overflow-hidden gap-0.5">
        {/* Autopilot Telemetry replaces gear display */}
        <div className="flex-1 w-full overflow-hidden">
          <AutopilotTelemetry
            status={autopilotStatus}
            accelerationPercent={autopilotAcceleration}
            distanceToObstacle={autopilotDistance}
          />
        </div>
        
        {/* Emergency Stop Button - Always enabled */}
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
        
        {/* Stop Button - Always enabled to exit autopilot */}
        <button
          onClick={onStop}
          className={`
            w-full h-[4dvh] max-h-8 min-h-5 rounded-lg border-2 flex items-center justify-center gap-0.5
            text-[8px] sm:text-[10px] font-bold racing-text transition-all touch-feedback
            bg-card border-destructive/50 text-destructive hover:bg-destructive/20 hover:border-destructive
          `}
        >
          <Square className="w-3 h-3 sm:w-4 sm:h-4" />
          STOP AUTOPILOT
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-full py-0.5 px-0.5 overflow-hidden gap-0.5">
      <div className="racing-text text-[8px] sm:text-xs text-muted-foreground mb-0.5">GEAR</div>
      
      <div className={`flex flex-col gap-0.5 justify-center overflow-hidden ${disabledClass}`}>
        {GEARS.map((gear) => {
          const isActive = currentGear === gear;
          const isReverse = gear === "R";
          
          return (
            <button
              key={gear}
              onClick={() => !isDisabled && onGearChange(gear)}
              disabled={isDisabled}
              className={`
                w-[8vw] h-[4dvh] max-w-12 max-h-7 min-w-6 min-h-4 rounded border text-[10px] sm:text-sm font-bold racing-text
                transition-all duration-100 touch-feedback
                ${isActive
                  ? isReverse
                    ? "gear-reverse-active border-destructive"
                    : "gear-active border-primary"
                  : "bg-card border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                }
              `}
            >
              {gear}
            </button>
          );
        })}
      </div>
      
      {/* Telemetry Wave */}
      <div className={`w-full overflow-hidden h-3 sm:h-5 border border-border rounded bg-card/50 ${disabledClass}`}>
        <svg className="w-[200%] h-full animate-telemetry" viewBox="0 0 200 30" preserveAspectRatio="none">
          <path
            d="M0,15 Q10,5 20,15 T40,15 T60,15 T80,15 T100,15 T120,15 T140,15 T160,15 T180,15 T200,15"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            className="opacity-70"
          />
          <path
            d="M0,15 Q10,25 20,15 T40,15 T60,15 T80,15 T100,15 T120,15 T140,15 T160,15 T180,15 T200,15"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            className="opacity-40"
          />
        </svg>
      </div>
      <div className={`text-[5px] sm:text-[7px] text-muted-foreground racing-text ${disabledClass}`}>LIVE TELEMETRY</div>
      
      {/* Emergency Stop Button - Always enabled */}
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
      
      {/* Auto Mode Toggle */}
      <button
        onClick={() => !isDisabled && onAutoModeToggle()}
        disabled={isDisabled}
        className={`
          w-full h-[3.5dvh] max-h-7 min-h-4 rounded border flex items-center justify-center gap-1
          text-[8px] sm:text-[10px] font-bold racing-text transition-all touch-feedback
          ${disabledClass}
          ${isAutoMode
            ? 'bg-primary border-primary text-primary-foreground glow-teal'
            : 'bg-card border-primary/50 text-primary hover:bg-primary/20 hover:border-primary'
          }
        `}
      >
        <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
        AUTO {isAutoMode ? 'ON' : 'OFF'}
      </button>
      
      {/* Sensor Toggles - Middle Section */}
      <div className={`w-full grid grid-cols-2 gap-0.5 mt-0.5 ${disabledClass}`}>
        {/* Infrared Toggle */}
        <button
          onClick={() => !isDisabled && onInfraredToggle()}
          disabled={isDisabled}
          className={`
            h-[3.5dvh] max-h-7 min-h-4 rounded border flex flex-col items-center justify-center
            text-[6px] sm:text-[8px] font-bold racing-text transition-all touch-feedback
            ${isInfraredOn
              ? 'bg-amber-500 border-amber-500 text-amber-950 glow-amber'
              : 'bg-card border-amber-500/50 text-amber-500 hover:bg-amber-500/20 hover:border-amber-500'
            }
          `}
        >
          <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span className="leading-none">IR</span>
        </button>
        
        {/* Sonar Toggle */}
        <button
          onClick={() => !isDisabled && onSonarToggle()}
          disabled={isDisabled}
          className={`
            h-[3.5dvh] max-h-7 min-h-4 rounded border flex flex-col items-center justify-center
            text-[6px] sm:text-[8px] font-bold racing-text transition-all touch-feedback
            ${isSonarOn
              ? 'bg-cyan-500 border-cyan-500 text-cyan-950 glow-cyan'
              : 'bg-card border-cyan-500/50 text-cyan-500 hover:bg-cyan-500/20 hover:border-cyan-500'
            }
          `}
        >
          <Radio className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span className="leading-none">SONAR</span>
        </button>
      </div>
      
      {/* Autopilot Toggle */}
      <button
        onClick={onAutopilotToggle}
        className={`
          w-full h-[3.5dvh] max-h-7 min-h-4 rounded border flex items-center justify-center gap-1
          text-[8px] sm:text-[10px] font-bold racing-text transition-all touch-feedback
          ${isAutopilotOn
            ? 'bg-primary border-primary text-primary-foreground glow-teal'
            : 'bg-card border-primary/50 text-primary hover:bg-primary/20 hover:border-primary'
          }
        `}
      >
        <Navigation className="w-3 h-3 sm:w-4 sm:h-4" />
        AUTOPILOT {isAutopilotOn ? 'ON' : 'OFF'}
      </button>
      
      {/* Power Controls - Bottom Section */}
      <div className={`w-full grid grid-cols-2 gap-0.5 mt-auto ${disabledClass}`}>
        {/* Start Button */}
        <button
          onClick={() => !isDisabled && onStart()}
          disabled={isDisabled}
          className={`
            h-[4dvh] max-h-8 min-h-5 rounded-lg border-2 flex items-center justify-center gap-0.5
            text-[8px] sm:text-[10px] font-bold racing-text transition-all touch-feedback
            ${isStarted
              ? 'bg-green-500 border-green-500 text-green-950 glow-green animate-pulse'
              : 'bg-card border-green-500/50 text-green-500 hover:bg-green-500/20 hover:border-green-500'
            }
          `}
        >
          <Play className="w-3 h-3 sm:w-4 sm:h-4" />
          START
        </button>
        
        {/* Stop Button - Always enabled */}
        <button
          onClick={onStop}
          className={`
            h-[4dvh] max-h-8 min-h-5 rounded-lg border-2 flex items-center justify-center gap-0.5
            text-[8px] sm:text-[10px] font-bold racing-text transition-all touch-feedback
            ${!isStarted
              ? 'bg-destructive border-destructive text-destructive-foreground'
              : 'bg-card border-destructive/50 text-destructive hover:bg-destructive/20 hover:border-destructive'
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
