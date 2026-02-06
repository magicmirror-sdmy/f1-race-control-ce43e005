import { useEffect, useState, useRef } from "react";

interface CircularGaugeProps {
  value: number;
  maxValue: number;
  label: string;
  unit?: string;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "destructive" | "accent";
  isActive?: boolean;
  sweepAnimation?: boolean;
  onSweepComplete?: () => void;
}

export const CircularGauge = ({
  value,
  maxValue,
  label,
  unit = "",
  size = "md",
  color = "primary",
  isActive = true,
  sweepAnimation = false,
  onSweepComplete,
}: CircularGaugeProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isSweeping, setIsSweeping] = useState(false);
  const sweepCompleteRef = useRef(false);

  const sizeClasses = {
    sm: "w-[min(12vw,3.5rem)]",
    md: "w-[min(18vw,5rem)]",
    lg: "w-[min(28vw,8rem)]",
  };

  const colorClasses = {
    primary: {
      stroke: "hsl(var(--primary))",
      glow: "hsl(var(--primary) / 0.5)",
      text: "text-primary",
    },
    destructive: {
      stroke: "hsl(var(--destructive))",
      glow: "hsl(var(--destructive) / 0.5)",
      text: "text-destructive",
    },
    accent: {
      stroke: "hsl(var(--accent))",
      glow: "hsl(var(--accent) / 0.5)",
      text: "text-accent",
    },
  };

  const percentage = Math.min(100, Math.max(0, (displayValue / maxValue) * 100));
  const needleRotation = -135 + (percentage / 100) * 270;
  const isHighValue = percentage > 80;
  const colors = colorClasses[color];

  // Sweep animation on startup
  useEffect(() => {
    if (sweepAnimation && !sweepCompleteRef.current) {
      setIsSweeping(true);
      let phase = 0;
      const totalDuration = 1200; // 1.2 seconds for full sweep
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / totalDuration;

        if (progress < 0.5) {
          // First sweep: 0 -> max
          setDisplayValue(maxValue * (progress * 2));
        } else if (progress < 1) {
          // Second sweep: max -> 0
          setDisplayValue(maxValue * (1 - (progress - 0.5) * 2));
        } else if (progress < 1.5) {
          // Third sweep: 0 -> max
          setDisplayValue(maxValue * ((progress - 1) * 2));
        } else if (progress < 2) {
          // Fourth sweep: max -> 0 -> actual value
          const remaining = (progress - 1.5) * 2;
          setDisplayValue(maxValue * (1 - remaining) * 0.5 + value * remaining);
        } else {
          setDisplayValue(value);
          setIsSweeping(false);
          sweepCompleteRef.current = true;
          onSweepComplete?.();
          return;
        }

        requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    } else if (!sweepAnimation) {
      setDisplayValue(value);
    }
  }, [sweepAnimation, maxValue, value, onSweepComplete]);

  // Update value when not sweeping
  useEffect(() => {
    if (!isSweeping && sweepCompleteRef.current) {
      setDisplayValue(value);
    }
  }, [value, isSweeping]);

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
        opacity={isActive ? 1 : 0.3}
      />
    );
  }

  return (
    <div className={`flex flex-col items-center ${!isActive ? "opacity-40" : ""}`}>
      <div className={`relative ${sizeClasses[size]} aspect-square`}>
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Outer bezel with glow */}
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="hsl(var(--card))"
            stroke="hsl(var(--border))"
            strokeWidth="2"
            style={{
              filter: isActive && percentage > 50 ? `drop-shadow(0 0 8px ${colors.glow})` : "none",
            }}
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

          {/* Arc background */}
          <path
            d="M 15 72 A 40 40 0 1 1 85 72"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Arc active */}
          <path
            d="M 15 72 A 40 40 0 1 1 85 72"
            fill="none"
            stroke={isHighValue ? "hsl(var(--destructive))" : colors.stroke}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="220"
            strokeDashoffset={220 - (220 * (isActive ? percentage : 0)) / 100}
            style={{
              filter:
                isActive && percentage > 50
                  ? `drop-shadow(0 0 4px ${isHighValue ? "hsl(var(--destructive))" : colors.glow})`
                  : "none",
              transition: isSweeping ? "none" : "stroke-dashoffset 0.15s ease-out",
            }}
          />

          {/* Tick marks */}
          {ticks}

          {/* Needle */}
          <g
            transform={`rotate(${isActive ? needleRotation : -135} 50 50)`}
            style={{ transition: isSweeping ? "none" : "transform 0.1s ease-out" }}
          >
            <polygon
              points="50,15 48,50 52,50"
              fill={isActive ? (isHighValue ? "hsl(var(--destructive))" : colors.stroke) : "hsl(var(--muted))"}
              style={{
                filter: isActive
                  ? `drop-shadow(0 0 3px ${isHighValue ? "hsl(var(--destructive))" : colors.glow})`
                  : "none",
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
        </svg>

        {/* Digital readout */}
        <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2">
          <span
            className={`text-[6px] sm:text-[10px] racing-number font-bold ${
              isActive ? (isHighValue ? "text-destructive text-glow-red" : "text-foreground") : "text-muted-foreground"
            }`}
          >
            {isActive ? Math.round(displayValue) : "--"}
            {unit && <span className="text-[4px] sm:text-[6px] ml-0.5">{unit}</span>}
          </span>
        </div>
      </div>

      {/* Label */}
      <div className={`text-[5px] sm:text-[7px] racing-text mt-0.5 ${isActive ? colors.text : "text-muted-foreground"}`}>
        {label}
      </div>
    </div>
  );
};
