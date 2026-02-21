interface BatteryGaugeProps {
  level: number; // 0-100
}

export const BatteryGauge = ({ level }: BatteryGaugeProps) => {
  const percentage = Math.min(100, Math.max(0, level));
  const needleRotation = -135 + (percentage / 100) * 270;
  const isLow = percentage < 20;
  const isMid = percentage < 50;

  const ticks = [];
  for (let i = 0; i <= 8; i++) {
    const tickAngle = -135 + (i / 8) * 270;
    const isMajor = i % 2 === 0;
    ticks.push(
      <line
        key={i}
        x1="50"
        y1={isMajor ? "14" : "17"}
        x2="50"
        y2="22"
        stroke={i < 2 ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))"}
        strokeWidth={isMajor ? "2" : "1"}
        transform={`rotate(${tickAngle} 50 50)`}
      />
    );
  }

  const color = isLow ? "hsl(var(--destructive))" : isMid ? "hsl(var(--warning))" : "hsl(var(--primary))";
  const glowClass = isLow ? "text-destructive text-glow-red" : "text-foreground";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[min(12vw,3.5rem)] aspect-square">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Outer bezel */}
          <circle cx="50" cy="50" r="48" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
          {/* Inner dial */}
          <circle cx="50" cy="50" r="42" fill="hsl(var(--secondary))" stroke="hsl(var(--muted))" strokeWidth="1" />

          {/* Arc background */}
          <path d="M 17 70 A 38 38 0 1 1 83 70" fill="none" stroke="hsl(var(--muted))" strokeWidth="3.5" strokeLinecap="round" />
          {/* Arc active */}
          <path
            d="M 17 70 A 38 38 0 1 1 83 70"
            fill="none"
            stroke={color}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="210"
            strokeDashoffset={210 - (210 * percentage) / 100}
            style={{
              filter: percentage < 30 ? `drop-shadow(0 0 4px ${color})` : "none",
              transition: "stroke-dashoffset 0.3s ease-out",
            }}
          />

          {ticks}

          {/* Needle */}
          <g transform={`rotate(${needleRotation} 50 50)`} style={{ transition: "transform 0.3s ease-out" }}>
            <polygon points="50,18 48.5,50 51.5,50" fill={color} style={{ filter: `drop-shadow(0 0 2px ${color})` }} />
          </g>

          {/* Center cap */}
          <circle cx="50" cy="50" r="5" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="1" />

          {/* Labels */}
          <text x="20" y="66" fill="hsl(var(--destructive))" fontSize="5" textAnchor="middle">E</text>
          <text x="80" y="66" fill="hsl(var(--primary))" fontSize="5" textAnchor="middle">F</text>

          {/* Battery icon at top */}
          <rect x="44" y="12" width="12" height="7" rx="1" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
          <rect x="47" y="10" width="6" height="2" rx="0.5" fill="hsl(var(--muted-foreground))" />
        </svg>

        {/* Digital readout */}
        <div className="absolute bottom-[16%] left-1/2 -translate-x-1/2">
          <span className={`text-[6px] sm:text-[9px] racing-number font-bold ${glowClass}`}>
            {Math.round(level)}%
          </span>
        </div>
      </div>
      <div className="text-[4px] sm:text-[6px] text-muted-foreground racing-text">BATTERY</div>
    </div>
  );
};
