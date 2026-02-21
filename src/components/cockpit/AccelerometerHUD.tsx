import { useState, useEffect } from "react";

interface AccelerometerHUDProps {
  className?: string;
}

export const AccelerometerHUD = ({ className }: AccelerometerHUDProps) => {
  const [accel, setAccel] = useState({ x: 0.98, y: 0.25, z: -0.12 });

  // Simulate fluctuating MPU6050 data
  useEffect(() => {
    const interval = setInterval(() => {
      setAccel({
        x: parseFloat((0.95 + Math.random() * 0.1 - 0.05).toFixed(2)),
        y: parseFloat((0.2 + Math.random() * 0.3 - 0.15).toFixed(2)),
        z: parseFloat((-0.1 + Math.random() * 0.2 - 0.1).toFixed(2)),
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const formatVal = (v: number) => (v >= 0 ? ` ${v.toFixed(2)}` : v.toFixed(2));

  return (
    <div className={`flex items-center gap-1.5 px-1.5 py-0.5 border border-primary/20 rounded-sm bg-card/40 backdrop-blur-sm ${className}`}>
      <span className="text-[6px] sm:text-[8px] racing-text text-muted-foreground tracking-widest opacity-60">MPU</span>
      <div className="flex gap-1.5 font-mono">
        <span className="text-[8px] sm:text-[10px] text-primary tracking-wider" style={{ filter: 'drop-shadow(0 0 2px hsl(var(--primary)))' }}>
          X{formatVal(accel.x)}
        </span>
        <span className="text-[8px] sm:text-[10px] text-primary tracking-wider" style={{ filter: 'drop-shadow(0 0 2px hsl(var(--primary)))' }}>
          Y{formatVal(accel.y)}
        </span>
        <span className="text-[8px] sm:text-[10px] text-primary tracking-wider" style={{ filter: 'drop-shadow(0 0 2px hsl(var(--primary)))' }}>
          Z{formatVal(accel.z)}
        </span>
      </div>
      <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
    </div>
  );
};
