interface SpeedometerProps {
  speed: number; // 0-100
  maxSpeed?: number;
}

export const Speedometer = ({ speed, maxSpeed = 100 }: SpeedometerProps) => {
  const percentage = Math.min(100, Math.max(0, (speed / maxSpeed) * 100));
  const strokeDashoffset = 283 - (283 * percentage) / 100;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20 sm:w-24 sm:h-24">
        {/* Background Arc */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="283"
            strokeDashoffset="70"
          />
          {/* Speed Arc */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={percentage > 80 ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="283"
            strokeDashoffset={strokeDashoffset + 70}
            className="transition-all duration-150"
            style={{
              filter: percentage > 50 ? `drop-shadow(0 0 4px ${percentage > 80 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'})` : 'none'
            }}
          />
        </svg>
        
        {/* Center Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl sm:text-2xl racing-number font-bold ${percentage > 80 ? 'text-destructive text-glow-red' : 'text-foreground'}`}>
            {Math.round(speed)}
          </span>
          <span className="text-[8px] text-muted-foreground racing-text">KM/H</span>
        </div>
      </div>
      
      {/* Label */}
      <div className="text-[10px] text-muted-foreground racing-text mt-1">SPEED</div>
    </div>
  );
};
