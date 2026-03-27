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
        <svg viewBox="0 0 120 180" className="w-full h-auto">
          {/* Car Shadow */}
          <ellipse cx="60" cy="90" rx="30" ry="55" fill="hsl(var(--primary) / 0.08)" />
          
          <defs>
            <clipPath id="tireFrontLeft">
              <rect x="6" y="18" width="16" height="24" rx="3" />
            </clipPath>
            <clipPath id="tireFrontRight">
              <rect x="98" y="18" width="16" height="24" rx="3" />
            </clipPath>
            <clipPath id="tireRearLeft">
              <rect x="6" y="128" width="16" height="24" rx="3" />
            </clipPath>
            <clipPath id="tireRearRight">
              <rect x="98" y="128" width="16" height="24" rx="3" />
            </clipPath>
            <linearGradient id="tire3d" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--foreground) / 0.18)" />
              <stop offset="40%" stopColor="transparent" />
              <stop offset="100%" stopColor="hsl(var(--foreground) / 0.12)" />
            </linearGradient>
            <pattern id="chassisHoles" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="1.2" fill="hsl(var(--background) / 0.3)" />
            </pattern>
          </defs>

          {/* ===== FRONT LEFT TIRE with steering ===== */}
          <g transform={`rotate(${frontWheelAngle}, 14, 30)`}>
            <rect x="6" y="18" width="16" height="24" rx="3" fill="hsl(0 65% 42%)" stroke="hsl(0 70% 30%)" strokeWidth="1" />
            <rect x="7.5" y="19.5" width="13" height="21" rx="2.5"
              className={`transition-colors ${throttle ? 'fill-muted' : 'fill-card'}`}
              stroke="hsl(var(--foreground) / 0.5)" strokeWidth="0.5" />
            <rect x="7.5" y="19.5" width="13" height="21" rx="2.5" fill="url(#tire3d)" />
            {[0, 1, 2, 3, 4].map(i => (
              <line key={i} x1="14" y1="30" x2={14 + Math.cos((i * 72 * Math.PI) / 180) * 5} y2={30 + Math.sin((i * 72 * Math.PI) / 180) * 8} stroke="hsl(0 60% 35%)" strokeWidth="1.2" />
            ))}
            <circle cx="14" cy="30" r="2" fill="hsl(var(--foreground) / 0.4)" />
            {speed > 0 && (
              <g clipPath="url(#tireFrontLeft)">
                <g className={gear === 'R' ? 'animate-tread-reverse' : 'animate-tread'}
                   style={{ animationDuration: `${Math.max(0.08, 0.6 - speed / 200)}s` }}>
                  {[-1, 0, 1, 2, 3, 4, 5].map(i => (
                    <rect key={i} x="8" y={18 + i * 4} width="12" height="2" rx="0.5"
                      fill="hsl(var(--muted-foreground) / 0.35)" />
                  ))}
                </g>
              </g>
            )}
          </g>

          {/* ===== FRONT RIGHT TIRE with steering ===== */}
          <g transform={`rotate(${frontWheelAngle}, 106, 30)`}>
            <rect x="98" y="18" width="16" height="24" rx="3" fill="hsl(0 65% 42%)" stroke="hsl(0 70% 30%)" strokeWidth="1" />
            <rect x="99.5" y="19.5" width="13" height="21" rx="2.5"
              className={`transition-colors ${throttle ? 'fill-muted' : 'fill-card'}`}
              stroke="hsl(var(--foreground) / 0.5)" strokeWidth="0.5" />
            <rect x="99.5" y="19.5" width="13" height="21" rx="2.5" fill="url(#tire3d)" />
            {[0, 1, 2, 3, 4].map(i => (
              <line key={i} x1="106" y1="30" x2={106 + Math.cos((i * 72 * Math.PI) / 180) * 5} y2={30 + Math.sin((i * 72 * Math.PI) / 180) * 8} stroke="hsl(0 60% 35%)" strokeWidth="1.2" />
            ))}
            <circle cx="106" cy="30" r="2" fill="hsl(var(--foreground) / 0.4)" />
            {speed > 0 && (
              <g clipPath="url(#tireFrontRight)">
                <g className={gear === 'R' ? 'animate-tread-reverse' : 'animate-tread'}
                   style={{ animationDuration: `${Math.max(0.08, 0.6 - speed / 200)}s` }}>
                  {[-1, 0, 1, 2, 3, 4, 5].map(i => (
                    <rect key={i} x="100" y={18 + i * 4} width="12" height="2" rx="0.5"
                      fill="hsl(var(--muted-foreground) / 0.35)" />
                  ))}
                </g>
              </g>
            )}
          </g>

          {/* ===== FRONT AXLE & SERVO ===== */}
          <line x1="22" y1="30" x2="98" y2="30" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="1.5" />
          <rect x="48" y="24" width="24" height="12" rx="1.5" fill="hsl(var(--foreground) / 0.25)" stroke="hsl(var(--foreground) / 0.4)" strokeWidth="0.8" />
          <text x="60" y="33" textAnchor="middle" fill="hsl(var(--primary))" fontSize="4" fontWeight="bold">SERVO</text>

          {/* ===== CHASSIS PLATE (Anodized Metal Bracket) ===== */}
          <rect x="24" y="15" width="72" height="140" rx="4" fill="hsl(var(--foreground) / 0.12)" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="1" />
          <rect x="24" y="15" width="72" height="140" rx="4" fill="url(#chassisHoles)" />
          
          {/* Ventilation slots */}
          {[0, 1, 2, 3].map(i => (
            <g key={`slot-${i}`}>
              <rect x="26" y={55 + i * 18} width="14" height="4" rx="1" fill="hsl(var(--background) / 0.4)" />
              <rect x="80" y={55 + i * 18} width="14" height="4" rx="1" fill="hsl(var(--background) / 0.4)" />
            </g>
          ))}

          {/* Cutout windows */}
          <rect x="35" y="40" width="12" height="18" rx="2" fill="hsl(var(--background) / 0.25)" />
          <rect x="73" y="40" width="12" height="18" rx="2" fill="hsl(var(--background) / 0.25)" />

          {/* Front bumper */}
          <rect x="30" y="16" width="60" height="6" rx="2" fill="hsl(var(--foreground) / 0.18)" stroke="hsl(var(--foreground) / 0.25)" strokeWidth="0.5" />

          {/* ===== BRASS STANDOFFS ===== */}
          {[[32, 22], [88, 22], [32, 145], [88, 145], [32, 80], [88, 80]].map(([cx, cy], i) => (
            <g key={`standoff-${i}`}>
              <circle cx={cx} cy={cy} r="2.5" fill="hsl(43 70% 45%)" stroke="hsl(43 60% 35%)" strokeWidth="0.5" />
              <circle cx={cx} cy={cy} r="1" fill="hsl(43 50% 55%)" />
            </g>
          ))}

          {/* ===== ENCODER MOTORS (rear) ===== */}
          <rect x="26" y="112" width="12" height="30" rx="2" fill="hsl(var(--foreground) / 0.2)" stroke="hsl(var(--foreground) / 0.35)" strokeWidth="0.8" />
          <circle cx="32" cy="127" r="3" fill="hsl(var(--foreground) / 0.15)" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="0.5" />
          <rect x="82" y="112" width="12" height="30" rx="2" fill="hsl(var(--foreground) / 0.2)" stroke="hsl(var(--foreground) / 0.35)" strokeWidth="0.8" />
          <circle cx="88" cy="127" r="3" fill="hsl(var(--foreground) / 0.15)" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="0.5" />
          <line x1="22" y1="127" x2="26" y2="127" stroke="hsl(var(--foreground) / 0.4)" strokeWidth="2" />
          <line x1="94" y1="127" x2="98" y2="127" stroke="hsl(var(--foreground) / 0.4)" strokeWidth="2" />

          {/* ===== CONTROLLER BOARD ===== */}
          <rect x="40" y="68" width="40" height="28" rx="2" fill="hsl(var(--foreground) / 0.15)" stroke="hsl(var(--primary) / 0.4)" strokeWidth="0.8" />
          <rect x="43" y="71" width="6" height="4" rx="0.5" fill="hsl(var(--primary) / 0.3)" />
          <rect x="51" y="71" width="8" height="4" rx="0.5" fill="hsl(var(--foreground) / 0.2)" />
          <circle cx="72" cy="73" r="2" fill="hsl(0 65% 42% / 0.5)" />
          <rect x="48" y="78" width="16" height="12" rx="1" fill="hsl(var(--foreground) / 0.25)" stroke="hsl(var(--foreground) / 0.35)" strokeWidth="0.5" />
          <text x="56" y="86" textAnchor="middle" fill="hsl(var(--primary) / 0.7)" fontSize="3.5">MCU</text>
          {[0, 1, 2, 3, 4].map(i => (
            <rect key={`pin-${i}`} x={43 + i * 6} y="92" width="3" height="2" rx="0.3" fill="hsl(43 70% 45%)" />
          ))}

          {/* ===== BATTERY PACK ===== */}
          <rect x="42" y="100" width="36" height="16" rx="2" fill="hsl(var(--foreground) / 0.1)" stroke="hsl(var(--primary) / 0.3)" strokeWidth="0.8" />
          <text x="60" y="110" textAnchor="middle" fill="hsl(var(--primary) / 0.5)" fontSize="4">BATT</text>

          {/* ===== REAR AXLE ===== */}
          <line x1="22" y1="140" x2="98" y2="140" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="1.5" />

          {/* ===== REAR LEFT TIRE (driven) ===== */}
          <g>
            <rect x="6" y="128" width="16" height="24" rx="3" fill="hsl(0 65% 42%)" stroke="hsl(0 70% 30%)" strokeWidth="1" />
            <rect x="7.5" y="129.5" width="13" height="21" rx="2.5"
              className={`transition-all ${throttle || brake ? 'fill-destructive/80' : 'fill-card'}`}
              stroke={throttle || brake ? "hsl(var(--destructive))" : "hsl(var(--foreground) / 0.5)"}
              strokeWidth="0.5"
              style={{ filter: throttle || brake ? 'drop-shadow(0 0 4px hsl(var(--destructive)))' : 'none' }} />
            <rect x="7.5" y="129.5" width="13" height="21" rx="2.5" fill="url(#tire3d)" />
            {[0, 1, 2, 3, 4].map(i => (
              <line key={i} x1="14" y1="140" x2={14 + Math.cos((i * 72 * Math.PI) / 180) * 5} y2={140 + Math.sin((i * 72 * Math.PI) / 180) * 8} stroke="hsl(0 60% 35%)" strokeWidth="1.2" />
            ))}
            <circle cx="14" cy="140" r="2" fill="hsl(var(--foreground) / 0.4)" />
            {speed > 0 && (
              <g clipPath="url(#tireRearLeft)">
                <g className={gear === 'R' ? 'animate-tread-reverse' : 'animate-tread'}
                   style={{ animationDuration: `${Math.max(0.08, 0.6 - speed / 200)}s` }}>
                  {[-1, 0, 1, 2, 3, 4, 5].map(i => (
                    <rect key={i} x="8" y={128 + i * 4} width="12" height="2" rx="0.5"
                      fill="hsl(var(--muted-foreground) / 0.35)" />
                  ))}
                </g>
              </g>
            )}
          </g>

          {/* ===== REAR RIGHT TIRE (driven) ===== */}
          <g>
            <rect x="98" y="128" width="16" height="24" rx="3" fill="hsl(0 65% 42%)" stroke="hsl(0 70% 30%)" strokeWidth="1" />
            <rect x="99.5" y="129.5" width="13" height="21" rx="2.5"
              className={`transition-all ${throttle || brake ? 'fill-destructive/80' : 'fill-card'}`}
              stroke={throttle || brake ? "hsl(var(--destructive))" : "hsl(var(--foreground) / 0.5)"}
              strokeWidth="0.5"
              style={{ filter: throttle || brake ? 'drop-shadow(0 0 4px hsl(var(--destructive)))' : 'none' }} />
            <rect x="99.5" y="129.5" width="13" height="21" rx="2.5" fill="url(#tire3d)" />
            {[0, 1, 2, 3, 4].map(i => (
              <line key={i} x1="106" y1="140" x2={106 + Math.cos((i * 72 * Math.PI) / 180) * 5} y2={140 + Math.sin((i * 72 * Math.PI) / 180) * 8} stroke="hsl(0 60% 35%)" strokeWidth="1.2" />
            ))}
            <circle cx="106" cy="140" r="2" fill="hsl(var(--foreground) / 0.4)" />
            {speed > 0 && (
              <g clipPath="url(#tireRearRight)">
                <g className={gear === 'R' ? 'animate-tread-reverse' : 'animate-tread'}
                   style={{ animationDuration: `${Math.max(0.08, 0.6 - speed / 200)}s` }}>
                  {[-1, 0, 1, 2, 3, 4, 5].map(i => (
                    <rect key={i} x="100" y={128 + i * 4} width="12" height="2" rx="0.5"
                      fill="hsl(var(--muted-foreground) / 0.35)" />
                  ))}
                </g>
              </g>
            )}
          </g>

          {/* ===== BRAKE LIGHTS ===== */}
          <rect x="45" y="150" width="30" height="3" rx="1"
            className={`transition-all duration-100 ${brake ? 'fill-destructive' : 'fill-muted'}`}
            style={{ filter: brake ? 'drop-shadow(0 0 6px hsl(var(--destructive))) drop-shadow(0 0 10px hsl(var(--destructive)))' : 'none' }}
          />
          {brake && (
            <ellipse cx="60" cy="151" rx="18" ry="6" fill="hsl(var(--destructive) / 0.3)" className="animate-pulse" />
          )}

          {/* ===== REVERSE SONAR ===== */}
          {gear === 'R' && (
            <g>
              <ellipse cx="60" cy="158" rx="14" ry="6" fill="none"
                stroke="hsl(var(--warning))" strokeWidth="1.5" className="animate-sonar-1" style={{ transformOrigin: '60px 158px' }} />
              <ellipse cx="60" cy="158" rx="14" ry="6" fill="none"
                stroke="hsl(var(--warning))" strokeWidth="1.2" className="animate-sonar-2" style={{ transformOrigin: '60px 158px' }} />
              <ellipse cx="60" cy="158" rx="14" ry="6" fill="none"
                stroke="hsl(var(--warning))" strokeWidth="0.8" className="animate-sonar-3" style={{ transformOrigin: '60px 158px' }} />
              <rect x="38" y="172" width="44" height="5" rx="1"
                fill="hsl(var(--destructive) / 0.6)" stroke="hsl(var(--destructive))" strokeWidth="0.8" className="animate-pulse" />
              <text x="60" y="185" textAnchor="middle" fill="hsl(var(--destructive))" fontSize="5" fontWeight="bold" className="animate-pulse">
                OBSTACLE
              </text>
            </g>
          )}
        </svg>
        
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
