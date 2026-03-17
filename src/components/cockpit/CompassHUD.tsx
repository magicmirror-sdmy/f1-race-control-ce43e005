interface CompassHUDProps {
  heading: number; // degrees, 0 = North
  className?: string;
}

const CARDINAL_POINTS = [
  { label: "N", deg: 0 },
  { label: "NE", deg: 45 },
  { label: "E", deg: 90 },
  { label: "SE", deg: 135 },
  { label: "S", deg: 180 },
  { label: "SW", deg: 225 },
  { label: "W", deg: 270 },
  { label: "NW", deg: 315 },
];

export const CompassHUD = ({ heading, className }: CompassHUDProps) => {
  const displayHeading = ((heading % 360) + 360) % 360;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative w-[min(14vw,3.5rem)] aspect-square">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Outer ring */}
          <circle cx="50" cy="50" r="47" fill="none" stroke="hsl(var(--primary) / 0.25)" strokeWidth="1" />
          <circle cx="50" cy="50" r="44" fill="hsl(var(--card) / 0.6)" stroke="hsl(var(--border))" strokeWidth="0.5" />

          {/* Tick marks - rotate with heading */}
          <g style={{ transform: `rotate(${-displayHeading}deg)`, transformOrigin: '50px 50px', transition: 'transform 0.15s ease-out' }}>
            {/* Degree ticks every 15° */}
            {Array.from({ length: 24 }, (_, i) => i * 15).map((deg) => (
              <line
                key={deg}
                x1="50" y1={deg % 90 === 0 ? 10 : deg % 45 === 0 ? 12 : 14}
                x2="50" y2={deg % 90 === 0 ? 17 : 16}
                stroke={deg % 90 === 0 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.4)"}
                strokeWidth={deg % 90 === 0 ? 1.5 : 0.8}
                transform={`rotate(${deg} 50 50)`}
              />
            ))}

            {/* Cardinal labels */}
            {CARDINAL_POINTS.filter(p => p.deg % 90 === 0).map((point) => (
              <text
                key={point.label}
                x="50"
                y="24"
                textAnchor="middle"
                dominantBaseline="central"
                fill={point.label === "N" ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                fontSize="7"
                fontWeight="bold"
                className="racing-text"
                transform={`rotate(${point.deg} 50 50)`}
                style={{ filter: point.label === "N" ? 'drop-shadow(0 0 3px hsl(var(--destructive)))' : undefined }}
              >
                {point.label}
              </text>
            ))}

            {/* North pointer triangle */}
            <polygon
              points="50,8 47,14 53,14"
              fill="hsl(var(--destructive))"
              style={{ filter: 'drop-shadow(0 0 3px hsl(var(--destructive)))' }}
            />
          </g>

          {/* Fixed center reticle */}
          <line x1="50" y1="30" x2="50" y2="36" stroke="hsl(var(--primary))" strokeWidth="1.5" />
          <line x1="50" y1="64" x2="50" y2="70" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1" />
          <line x1="30" y1="50" x2="36" y2="50" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1" />
          <line x1="64" y1="50" x2="70" y2="50" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1" />

          {/* Center dot */}
          <circle cx="50" cy="50" r="2" fill="hsl(var(--primary))" style={{ filter: 'drop-shadow(0 0 3px hsl(var(--primary)))' }} />
        </svg>
      </div>
      {/* Digital heading readout */}
      <div className="flex items-center gap-1 mt-0.5">
        <span className="text-[7px] sm:text-[9px] font-mono text-primary tracking-wider" style={{ filter: 'drop-shadow(0 0 2px hsl(var(--primary)))' }}>
          {Math.round(displayHeading).toString().padStart(3, '0')}°
        </span>
        <span className="text-[5px] sm:text-[7px] racing-text text-muted-foreground opacity-60">HDG</span>
      </div>
    </div>
  );
};
