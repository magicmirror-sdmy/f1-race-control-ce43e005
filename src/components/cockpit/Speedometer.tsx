interface SpeedometerProps {
  speed: number; // 0-100
  maxSpeed?: number;
}

export const Speedometer = ({ speed, maxSpeed = 100 }: SpeedometerProps) => {
  const percentage = Math.min(100, Math.max(0, (speed / maxSpeed) * 100));
  // Needle rotates from -135deg (0) to +135deg (max) - total 270deg sweep
  const needleRotation = -135 + (percentage / 100) * 270;
  const isHighSpeed = percentage > 80;

  // Generate tick marks
  const ticks = [];
  for (let i = 0; i <= 10; i++) {
    const tickAngle = -135 + (i / 10) * 270;
    const isMajor = i % 2 === 0;
    ticks.push(
      <line
        key={i}
        x1="50"
        y1={isMajor ? "12" : "15"}
        x2="50"
        y2="20"
        stroke={i > 8 ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))"}
        strokeWidth={isMajor ? "2" : "1"}
        transform={`rotate(${tickAngle} 50 50)`}
      />
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[min(22vw,6rem)] aspect-square">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Outer bezel */}
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="hsl(var(--card))"
            stroke="hsl(var(--border))"
            strokeWidth="2"
          />
          
          {/* Inner dial face */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="hsl(var(--secondary))"
            stroke="hsl(var(--muted))"
            strokeWidth="1"
          />
          
          {/* Speed arc background */}
          <path
            d="M 15 72 A 40 40 0 1 1 85 72"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="4"
            strokeLinecap="round"
          />
          
          {/* Speed arc active */}
          <path
            d="M 15 72 A 40 40 0 1 1 85 72"
            fill="none"
            stroke={isHighSpeed ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="220"
            strokeDashoffset={220 - (220 * percentage) / 100}
            style={{
              filter: percentage > 50 ? `drop-shadow(0 0 4px ${isHighSpeed ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'})` : 'none',
              transition: 'stroke-dashoffset 0.15s ease-out'
            }}
          />
          
          {/* Tick marks */}
          {ticks}
          
          {/* Needle */}
          <g transform={`rotate(${needleRotation} 50 50)`} style={{ transition: 'transform 0.1s ease-out' }}>
            <polygon
              points="50,15 48,50 52,50"
              fill={isHighSpeed ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
              style={{
                filter: `drop-shadow(0 0 3px ${isHighSpeed ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'})`
              }}
            />
          </g>
          
          {/* Center cap */}
          <circle
            cx="50"
            cy="50"
            r="6"
            fill="hsl(var(--muted))"
            stroke="hsl(var(--border))"
            strokeWidth="1"
          />
          
          {/* Speed numbers */}
          <text x="18" y="70" fill="hsl(var(--muted-foreground))" fontSize="6" textAnchor="middle">0</text>
          <text x="12" y="40" fill="hsl(var(--muted-foreground))" fontSize="6" textAnchor="middle">20</text>
          <text x="30" y="18" fill="hsl(var(--muted-foreground))" fontSize="6" textAnchor="middle">40</text>
          <text x="70" y="18" fill="hsl(var(--muted-foreground))" fontSize="6" textAnchor="middle">60</text>
          <text x="88" y="40" fill="hsl(var(--destructive))" fontSize="6" textAnchor="middle">80</text>
          <text x="82" y="70" fill="hsl(var(--destructive))" fontSize="6" textAnchor="middle">100</text>
        </svg>
        
        {/* Digital readout */}
        <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2">
          <span className={`text-[10px] sm:text-sm racing-number font-bold ${isHighSpeed ? 'text-destructive text-glow-red' : 'text-foreground'}`}>
            {Math.round(speed)}
          </span>
        </div>
      </div>
      
      {/* Label */}
      <div className="text-[7px] sm:text-[9px] text-muted-foreground racing-text mt-0.5">KM/H</div>
    </div>
  );
};
