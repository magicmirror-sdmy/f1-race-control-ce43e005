import { useState, useEffect } from "react";

interface SonarHUDProps {
  className?: string;
}

export const SonarHUD = ({ className }: SonarHUDProps) => {
  const [distances, setDistances] = useState({
    front: 42,
    rear: 78,
    left: 31,
    right: 55,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setDistances({
        front: Math.round(35 + Math.random() * 20),
        rear: Math.round(60 + Math.random() * 40),
        left: Math.round(20 + Math.random() * 25),
        right: Math.round(40 + Math.random() * 30),
      });
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const getColor = (d: number) => {
    if (d < 25) return "text-destructive";
    if (d < 40) return "text-warning";
    return "text-primary";
  };

  const getGlow = (d: number) => {
    if (d < 25) return "drop-shadow(0 0 2px hsl(var(--destructive)))";
    if (d < 40) return "drop-shadow(0 0 2px hsl(var(--warning)))";
    return "drop-shadow(0 0 2px hsl(var(--primary)))";
  };

  return (
    <div className={`flex items-center gap-1.5 px-1.5 py-0.5 border border-primary/20 rounded-sm bg-card/40 backdrop-blur-sm ${className}`}>
      <span className="text-[6px] sm:text-[8px] racing-text text-muted-foreground tracking-widest opacity-60">SNR</span>
      <div className="flex gap-1.5 font-mono">
        {(["front", "rear", "left", "right"] as const).map((dir) => {
          const val = distances[dir];
          const label = dir[0].toUpperCase();
          return (
            <span
              key={dir}
              className={`text-[8px] sm:text-[10px] tracking-wider ${getColor(val)}`}
              style={{ filter: getGlow(val) }}
            >
              {label}{val.toString().padStart(3, "\u2007")}
            </span>
          );
        })}
      </div>
      <span className="text-[5px] sm:text-[7px] text-muted-foreground opacity-50 font-mono">cm</span>
      <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
    </div>
  );
};
