import { useState } from "react";
import { Rocket, RotateCcw } from "lucide-react";
import { Speedometer } from "./Speedometer";
import { BatteryGauge } from "./BatteryGauge";
import { ServiceIndicator, SensorStatus } from "./ServiceIndicator";
import { CompassHUD } from "./CompassHUD";
import { SonarHUD } from "./SonarHUD";
import { NowPlayingHUD } from "./NowPlayingHUD";
import { CarChassisSVG } from "./CarChassisSVG";

interface CarTelemetryProps {
  steeringAngle: number;
  heading: number;
  throttle: boolean;
  brake: boolean;
  gear: string;
  speed: number;
  batteryLevel?: number;
  onLaunch: () => void;
  onDonut: () => void;
  sensorStatuses?: SensorStatus[];
  requiresService?: boolean;
}

const defaultSensorStatuses: SensorStatus[] = [
  { name: "Front Sonar", status: "ok" },
  { name: "Rear Sonar", status: "ok" },
  { name: "Left IR", status: "ok" },
  { name: "Right IR", status: "ok" },
  { name: "GPS Module", status: "ok" },
  { name: "IMU Sensor", status: "ok" },
];

export const CarTelemetry = ({
  steeringAngle,
  heading,
  throttle,
  brake,
  gear,
  speed,
  batteryLevel = 75,
  onLaunch,
  onDonut,
  sensorStatuses = defaultSensorStatuses,
  requiresService = false,
}: CarTelemetryProps) => {
  const [launchActive, setLaunchActive] = useState(false);
  const [donutActive, setDonutActive] = useState(false);

  const handleLaunch = () => {
    setLaunchActive(true);
    onLaunch();
    setTimeout(() => setLaunchActive(false), 500);
  };

  const handleDonut = () => {
    setDonutActive(true);
    onDonut();
    setTimeout(() => setDonutActive(false), 500);
  };

  // Calculate front wheel angles for display
  const frontWheelAngle = steeringAngle * 0.4;

  return (
    <div className="flex flex-col items-center justify-center h-full p-0.5 overflow-hidden">
      {/* Compass HUD */}
      <CompassHUD heading={heading} className="mb-0.5" />
      
      {/* Speedometer + Battery Gauge */}
      <div className="relative flex items-center gap-1.5">
        <BatteryGauge level={batteryLevel} />
        <Speedometer speed={speed} maxSpeed={100} />
        {/* Service indicator positioned to the right of speedometer */}
        <div className="ml-0.5">
          <ServiceIndicator 
            sensors={sensorStatuses} 
            requiresService={requiresService} 
          />
        </div>
      </div>
      
      <div className="relative w-[min(22vw,8rem)] mt-0.5">
        {/* Car Body - Top Down View */}
        <CarChassisSVG
          frontWheelAngle={frontWheelAngle}
          throttle={throttle}
          brake={brake}
          gear={gear}
          speed={speed}
        />
        
        {/* Round Action Buttons */}
        <button
          onClick={handleLaunch}
          className={`
            absolute -left-[2.5vw] sm:-left-8 top-1/2 -translate-y-1/2
            w-[8vw] h-[8vw] max-w-10 max-h-10 rounded-full border-2 flex flex-col items-center justify-center
            transition-all duration-100 touch-feedback
            ${launchActive 
              ? 'bg-primary border-primary text-primary-foreground glow-teal scale-95' 
              : 'bg-card border-primary/50 text-primary hover:bg-primary/20'
            }
          `}
        >
          <Rocket className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span className="text-[4px] sm:text-[6px] font-bold racing-text leading-none">LAUNCH</span>
        </button>
        
        <button
          onClick={handleDonut}
          className={`
            absolute -right-[2.5vw] sm:-right-8 top-1/2 -translate-y-1/2
            w-[8vw] h-[8vw] max-w-10 max-h-10 rounded-full border-2 flex flex-col items-center justify-center
            transition-all duration-100 touch-feedback
            ${donutActive 
              ? 'bg-accent border-accent text-accent-foreground glow-accent scale-95' 
              : 'bg-card border-accent/50 text-accent hover:bg-accent/20'
            }
          `}
        >
          <RotateCcw className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span className="text-[4px] sm:text-[6px] font-bold racing-text leading-none">DONUT</span>
        </button>
      </div>
      
      {/* Status Indicators */}
      <div className="flex gap-2 mt-0.5 text-[6px] sm:text-[8px] racing-text">
        <div className={`flex items-center gap-0.5 ${throttle ? 'text-primary text-glow-teal' : 'text-muted-foreground'}`}>
          <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${throttle ? 'bg-primary' : 'bg-muted'}`} />
          PWR
        </div>
        <div className={`flex items-center gap-0.5 ${brake ? 'text-destructive text-glow-red' : 'text-muted-foreground'}`}>
          <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${brake ? 'bg-destructive' : 'bg-muted'}`} />
          BRK
        </div>
      </div>
    </div>
  );
};
