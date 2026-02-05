 import { OctagonX, Zap } from "lucide-react";
 
 interface GearShifterProps {
  currentGear: string;
  onGearChange: (gear: string) => void;
   isAutoMode: boolean;
   onAutoModeToggle: () => void;
   isEmergencyStop: boolean;
   onEmergencyStop: () => void;
}

const GEARS = ["S", "3", "2", "1", "N", "R"];

 export const GearShifter = ({ 
   currentGear, 
   onGearChange,
   isAutoMode,
   onAutoModeToggle,
   isEmergencyStop,
   onEmergencyStop,
 }: GearShifterProps) => {
  return (
     <div className="flex flex-col items-center h-full py-0.5 px-0.5 overflow-hidden gap-0.5">
      <div className="racing-text text-[8px] sm:text-xs text-muted-foreground mb-0.5">GEAR</div>
      
       <div className="flex flex-col gap-0.5 justify-center overflow-hidden">
        {GEARS.map((gear) => {
          const isActive = currentGear === gear;
          const isReverse = gear === "R";
          
          return (
            <button
              key={gear}
              onClick={() => onGearChange(gear)}
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
       <div className="w-full overflow-hidden h-3 sm:h-5 border border-border rounded bg-card/50">
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
       <div className="text-[5px] sm:text-[7px] text-muted-foreground racing-text">LIVE TELEMETRY</div>
       
       {/* Emergency Stop Button */}
       <button
         onClick={onEmergencyStop}
         className={`
           w-full h-[4dvh] max-h-8 min-h-5 rounded border flex items-center justify-center gap-1
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
         onClick={onAutoModeToggle}
         className={`
           w-full h-[4dvh] max-h-8 min-h-5 rounded border flex items-center justify-center gap-1
           text-[8px] sm:text-[10px] font-bold racing-text transition-all touch-feedback
           ${isAutoMode
             ? 'bg-primary border-primary text-primary-foreground glow-teal'
             : 'bg-card border-primary/50 text-primary hover:bg-primary/20 hover:border-primary'
           }
         `}
       >
         <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
         AUTO {isAutoMode ? 'ON' : 'OFF'}
       </button>
    </div>
  );
};
