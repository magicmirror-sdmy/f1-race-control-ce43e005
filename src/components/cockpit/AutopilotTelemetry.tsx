import { Navigation, AlertTriangle, RotateCcw, OctagonX, Compass, Activity, Gauge, Ruler } from "lucide-react";

export type AutopilotStatus = 
  | "CRUISING" 
  | "PANIC_BRAKE" 
  | "REVERSING" 
  | "STUCK" 
  | "PIVOTING" 
  | "RECOVERY";

interface AutopilotTelemetryProps {
  status: AutopilotStatus;
  accelerationPercent: number;
  distanceToObstacle: number; // in cm
}

const STATUS_CONFIG: Record<AutopilotStatus, {
  icon: React.ElementType;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}> = {
  CRUISING: {
    icon: Navigation,
    label: "CRUISING",
    color: "text-primary",
    bgColor: "bg-primary/20",
    borderColor: "border-primary",
    description: "Moving forward, adjusting speed",
  },
  PANIC_BRAKE: {
    icon: AlertTriangle,
    label: "PANIC BRAKE",
    color: "text-destructive",
    bgColor: "bg-destructive/20",
    borderColor: "border-destructive",
    description: "Obstacle detected, braking",
  },
  REVERSING: {
    icon: RotateCcw,
    label: "REVERSING",
    color: "text-amber-500",
    bgColor: "bg-amber-500/20",
    borderColor: "border-amber-500",
    description: "Creating escape space",
  },
  STUCK: {
    icon: OctagonX,
    label: "STUCK",
    color: "text-destructive",
    bgColor: "bg-destructive/20",
    borderColor: "border-destructive",
    description: "Blocked, waiting for clearance",
  },
  PIVOTING: {
    icon: Compass,
    label: "PIVOTING",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/20",
    borderColor: "border-cyan-500",
    description: "Changing direction",
  },
  RECOVERY: {
    icon: Activity,
    label: "RECOVERY",
    color: "text-success",
    bgColor: "bg-success/20",
    borderColor: "border-success",
    description: "Stabilizing sensors",
  },
};

export const AutopilotTelemetry = ({
  status,
  accelerationPercent,
  distanceToObstacle,
}: AutopilotTelemetryProps) => {
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;
  
  // Determine distance warning level
  const distanceWarning = distanceToObstacle < 20 
    ? "text-destructive" 
    : distanceToObstacle < 50 
      ? "text-warning" 
      : "text-primary";

  return (
    <div className="flex flex-col items-center h-full py-1 px-1 overflow-hidden gap-1">
      {/* Header */}
      <div className="flex items-center gap-1">
        <Navigation className="w-3 h-3 sm:w-4 sm:h-4 text-primary animate-pulse" />
        <span className="racing-text text-[8px] sm:text-xs text-primary font-bold">AUTOPILOT</span>
      </div>
      
      {/* Status Display */}
      <div className={`
        w-full p-1.5 rounded border-2 ${config.borderColor} ${config.bgColor}
        flex flex-col items-center gap-0.5 transition-all duration-300
      `}>
        <StatusIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${config.color} ${status === "PANIC_BRAKE" || status === "STUCK" ? "animate-pulse" : ""}`} />
        <span className={`racing-text text-[10px] sm:text-xs font-bold ${config.color}`}>
          {config.label}
        </span>
        <span className="text-[6px] sm:text-[8px] text-muted-foreground text-center leading-tight">
          {config.description}
        </span>
      </div>
      
      {/* Acceleration Gauge */}
      <div className="w-full bg-card/50 rounded border border-border p-1">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-0.5">
            <Gauge className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
            <span className="racing-text text-[6px] sm:text-[8px] text-muted-foreground">ACCEL</span>
          </div>
          <span className={`racing-text text-[8px] sm:text-[10px] font-bold ${accelerationPercent > 80 ? "text-primary text-glow-teal" : "text-foreground"}`}>
            {accelerationPercent.toFixed(0)}%
          </span>
        </div>
        <div className="w-full h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-200 rounded-full"
            style={{ width: `${accelerationPercent}%` }}
          />
        </div>
      </div>
      
      {/* Distance to Obstacle */}
      <div className="w-full bg-card/50 rounded border border-border p-1">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-0.5">
            <Ruler className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-500" />
            <span className="racing-text text-[6px] sm:text-[8px] text-muted-foreground">OBSTACLE</span>
          </div>
          <span className={`racing-text text-[8px] sm:text-[10px] font-bold ${distanceWarning}`}>
            {distanceToObstacle}cm
          </span>
        </div>
        {/* Visual distance indicator */}
        <div className="w-full h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-200 rounded-full ${
              distanceToObstacle < 20 
                ? "bg-gradient-to-r from-destructive/60 to-destructive" 
                : distanceToObstacle < 50 
                  ? "bg-gradient-to-r from-warning/60 to-warning" 
                  : "bg-gradient-to-r from-cyan-500/60 to-cyan-500"
            }`}
            style={{ width: `${Math.min(100, (distanceToObstacle / 200) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-0.5">
          <span className="text-[5px] sm:text-[6px] text-destructive">NEAR</span>
          <span className="text-[5px] sm:text-[6px] text-success">FAR</span>
        </div>
      </div>
      
      {/* Telemetry Wave - Active indicator */}
      <div className="w-full overflow-hidden h-3 sm:h-4 border border-primary/50 rounded bg-primary/10">
        <svg className="w-[200%] h-full animate-telemetry" viewBox="0 0 200 30" preserveAspectRatio="none">
          <path
            d="M0,15 Q10,5 20,15 T40,15 T60,15 T80,15 T100,15 T120,15 T140,15 T160,15 T180,15 T200,15"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            className="opacity-90"
          />
          <path
            d="M0,15 Q10,25 20,15 T40,15 T60,15 T80,15 T100,15 T120,15 T140,15 T160,15 T180,15 T200,15"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            className="opacity-60"
          />
        </svg>
      </div>
      <div className="text-[5px] sm:text-[7px] text-primary racing-text font-bold">AUTOPILOT ACTIVE</div>
    </div>
  );
};
