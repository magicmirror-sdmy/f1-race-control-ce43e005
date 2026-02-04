interface GearShifterProps {
  currentGear: string;
  onGearChange: (gear: string) => void;
}

const GEARS = ["S", "3", "2", "1", "N", "R"];

export const GearShifter = ({ currentGear, onGearChange }: GearShifterProps) => {
  return (
    <div className="flex flex-col items-center h-full py-0.5 px-0.5 overflow-hidden">
      <div className="racing-text text-[8px] sm:text-xs text-muted-foreground mb-0.5">GEAR</div>
      
      <div className="flex flex-col gap-0.5 flex-1 justify-center overflow-hidden">
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
      <div className="w-full mt-0.5 overflow-hidden h-4 sm:h-6 border border-border rounded bg-card/50">
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
      <div className="text-[5px] sm:text-[7px] text-muted-foreground racing-text mt-0.5">LIVE TELEMETRY</div>
    </div>
  );
};
