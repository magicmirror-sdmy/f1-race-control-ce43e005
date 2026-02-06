import { useState, useCallback } from "react";
import { OctagonX, Zap, Radio, Gauge, Power, Square } from "lucide-react";
import { useGameFeedback } from "@/hooks/useGameFeedback";

interface ControlPanelProps {
  currentGear: string;
  onGearChange: (gear: string) => void;
  isAutoMode: boolean;
  onAutoModeToggle: () => void;
  isEmergencyStop: boolean;
  onEmergencyStop: () => void;
  isSystemActive: boolean;
  onSystemStart: () => void;
  onSystemStop: () => void;
  isIREnabled: boolean;
  onIRToggle: () => void;
  speedLimit: number;
  onSpeedLimitChange: (limit: number) => void;
  isSpeedLimitEnabled: boolean;
  onSpeedLimitToggle: () => void;
}

const GEARS = ["S", "3", "2", "1", "N", "R"];

export const ControlPanel = ({
  currentGear,
  onGearChange,
  isAutoMode,
  onAutoModeToggle,
  isEmergencyStop,
  onEmergencyStop,
  isSystemActive,
  onSystemStart,
  onSystemStop,
  isIREnabled,
  onIRToggle,
  speedLimit,
  onSpeedLimitChange,
  isSpeedLimitEnabled,
  onSpeedLimitToggle,
}: ControlPanelProps) => {
  const { triggerHaptic, playSound } = useGameFeedback();

  const handleStart = useCallback(() => {
    triggerHaptic("heavy");
    playSound("click");
    onSystemStart();
  }, [triggerHaptic, playSound, onSystemStart]);

  const handleStop = useCallback(() => {
    triggerHaptic("heavy");
    playSound("click");
    onSystemStop();
  }, [triggerHaptic, playSound, onSystemStop]);

  const handleGearChange = useCallback(
    (gear: string) => {
      if (!isSystemActive) return;
      triggerHaptic("light");
      playSound("click");
      onGearChange(gear);
    },
    [isSystemActive, triggerHaptic, playSound, onGearChange]
  );

  const handleToggle = useCallback(
    (toggleFn: () => void) => {
      if (!isSystemActive) return;
      triggerHaptic("medium");
      playSound("click");
      toggleFn();
    },
    [isSystemActive, triggerHaptic, playSound]
  );

  return (
    <div className={`flex flex-col items-center h-full py-0.5 px-0.5 overflow-hidden gap-0.5 ${!isSystemActive ? "opacity-50" : ""}`}>
      <div className="racing-text text-[8px] sm:text-xs text-muted-foreground mb-0.5">GEAR</div>

      {/* Gear Shifter */}
      <div className="flex flex-col gap-0.5 justify-center overflow-hidden">
        {GEARS.map((gear) => {
          const isActive = currentGear === gear;
          const isReverse = gear === "R";

          return (
            <button
              key={gear}
              onClick={() => handleGearChange(gear)}
              disabled={!isSystemActive}
              className={`
                w-[8vw] h-[3.5dvh] max-w-12 max-h-6 min-w-6 min-h-3 rounded border text-[10px] sm:text-sm font-bold racing-text
                transition-all duration-100 touch-feedback disabled:cursor-not-allowed
                ${
                  isActive
                    ? isReverse
                      ? "gear-reverse-active border-destructive"
                      : "gear-active border-primary"
                    : "bg-card border-border hover:border-primary/50 text-muted-foreground hover:text-foreground disabled:hover:border-border disabled:hover:text-muted-foreground"
                }
              `}
            >
              {gear}
            </button>
          );
        })}
      </div>

      {/* Telemetry Wave */}
      <div className="w-full overflow-hidden h-2 sm:h-4 border border-border rounded bg-card/50">
        <svg
          className={`w-[200%] h-full ${isSystemActive ? "animate-telemetry" : ""}`}
          viewBox="0 0 200 30"
          preserveAspectRatio="none"
        >
          <path
            d="M0,15 Q10,5 20,15 T40,15 T60,15 T80,15 T100,15 T120,15 T140,15 T160,15 T180,15 T200,15"
            fill="none"
            stroke={isSystemActive ? "hsl(var(--primary))" : "hsl(var(--muted))"}
            strokeWidth="1.5"
            className="opacity-70"
          />
        </svg>
      </div>
      <div className="text-[4px] sm:text-[6px] text-muted-foreground racing-text">TELEMETRY</div>

      {/* Emergency Stop */}
      <button
        onClick={() => handleToggle(onEmergencyStop)}
        disabled={!isSystemActive}
        className={`
          w-full h-[3dvh] max-h-6 min-h-4 rounded border flex items-center justify-center gap-0.5
          text-[7px] sm:text-[9px] font-bold racing-text transition-all touch-feedback disabled:cursor-not-allowed
          ${
            isEmergencyStop
              ? "bg-destructive border-destructive text-destructive-foreground glow-red animate-pulse"
              : "bg-card border-destructive/50 text-destructive hover:bg-destructive/20 hover:border-destructive disabled:hover:bg-card disabled:hover:border-destructive/50"
          }
        `}
      >
        <OctagonX className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        {isEmergencyStop ? "STOPPED" : "E-STOP"}
      </button>

      {/* Auto Mode */}
      <button
        onClick={() => handleToggle(onAutoModeToggle)}
        disabled={!isSystemActive}
        className={`
          w-full h-[3dvh] max-h-6 min-h-4 rounded border flex items-center justify-center gap-0.5
          text-[7px] sm:text-[9px] font-bold racing-text transition-all touch-feedback disabled:cursor-not-allowed
          ${
            isAutoMode
              ? "bg-primary border-primary text-primary-foreground glow-teal"
              : "bg-card border-primary/50 text-primary hover:bg-primary/20 hover:border-primary disabled:hover:bg-card disabled:hover:border-primary/50"
          }
        `}
      >
        <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        AUTO
      </button>

      {/* IR Control */}
      <button
        onClick={() => handleToggle(onIRToggle)}
        disabled={!isSystemActive}
        className={`
          w-full h-[3dvh] max-h-6 min-h-4 rounded border flex items-center justify-center gap-0.5
          text-[7px] sm:text-[9px] font-bold racing-text transition-all touch-feedback disabled:cursor-not-allowed
          ${
            isIREnabled
              ? "bg-accent border-accent text-accent-foreground glow-accent"
              : "bg-card border-accent/50 text-accent hover:bg-accent/20 hover:border-accent disabled:hover:bg-card disabled:hover:border-accent/50"
          }
        `}
      >
        <Radio className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        IR
      </button>

      {/* Speed Limit */}
      <button
        onClick={() => handleToggle(onSpeedLimitToggle)}
        disabled={!isSystemActive}
        className={`
          w-full h-[3dvh] max-h-6 min-h-4 rounded border flex items-center justify-center gap-0.5
          text-[7px] sm:text-[9px] font-bold racing-text transition-all touch-feedback disabled:cursor-not-allowed
          ${
            isSpeedLimitEnabled
              ? "bg-primary border-primary text-primary-foreground glow-teal"
              : "bg-card border-border text-muted-foreground hover:border-primary/50 disabled:hover:border-border"
          }
        `}
      >
        <Gauge className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        LIMIT
      </button>

      {/* Speed Limit Slider */}
      {isSpeedLimitEnabled && isSystemActive && (
        <div className="w-full px-1">
          <input
            type="range"
            min="10"
            max="100"
            value={speedLimit}
            onChange={(e) => onSpeedLimitChange(Number(e.target.value))}
            className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="text-[5px] sm:text-[7px] text-primary racing-text text-center">{speedLimit}%</div>
        </div>
      )}

      {/* Start / Stop Controls */}
      <div className="flex gap-1 w-full mt-auto">
        <button
          onClick={handleStart}
          disabled={isSystemActive}
          className={`
            flex-1 h-[3.5dvh] max-h-7 min-h-5 rounded border flex items-center justify-center gap-0.5
            text-[7px] sm:text-[9px] font-bold racing-text transition-all touch-feedback
            ${
              isSystemActive
                ? "bg-muted border-muted text-muted-foreground cursor-not-allowed"
                : "bg-green-600/20 border-green-500 text-green-400 hover:bg-green-600/40 glow-teal"
            }
          `}
        >
          <Power className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          START
        </button>
        <button
          onClick={handleStop}
          disabled={!isSystemActive}
          className={`
            flex-1 h-[3.5dvh] max-h-7 min-h-5 rounded border flex items-center justify-center gap-0.5
            text-[7px] sm:text-[9px] font-bold racing-text transition-all touch-feedback
            ${
              !isSystemActive
                ? "bg-muted border-muted text-muted-foreground cursor-not-allowed"
                : "bg-destructive/20 border-destructive text-destructive hover:bg-destructive/40 glow-red"
            }
          `}
        >
          <Square className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          STOP
        </button>
      </div>
    </div>
  );
};
