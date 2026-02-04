import { useState, useCallback, useRef, useEffect } from "react";
import { Header } from "./Header";
import { SteeringWheel } from "./SteeringWheel";
import { CameraFeed } from "./CameraFeed";
import { CarTelemetry } from "./CarTelemetry";
import { GearShifter } from "./GearShifter";
import { Pedals } from "./Pedals";

interface ControlState {
  steeringAngle: number;
  throttle: boolean;
  brake: boolean;
  gear: string;
  speed: number;
}

export const CockpitController = () => {
  const [controlState, setControlState] = useState<ControlState>({
    steeringAngle: 0,
    throttle: false,
    brake: false,
    gear: "N",
    speed: 0,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [serverIp, setServerIp] = useState("");
  const speedIntervalRef = useRef<number | null>(null);

  // Simulate speed based on throttle/brake/gear
  useEffect(() => {
    if (speedIntervalRef.current) {
      clearInterval(speedIntervalRef.current);
    }

    speedIntervalRef.current = window.setInterval(() => {
      setControlState(prev => {
        let newSpeed = prev.speed;
        const gearMultiplier = {
          'R': -0.3,
          'N': 0,
          '1': 0.5,
          '2': 0.7,
          '3': 0.9,
          'S': 1.2,
        }[prev.gear] || 0;

        if (prev.throttle && !prev.brake && prev.gear !== 'N') {
          newSpeed = Math.min(100, prev.speed + (2 * gearMultiplier));
        } else if (prev.brake) {
          newSpeed = Math.max(0, prev.speed - 5);
        } else {
          // Natural deceleration
          newSpeed = Math.max(0, prev.speed - 0.5);
        }

        return { ...prev, speed: Math.max(0, newSpeed) };
      });
    }, 100);

    return () => {
      if (speedIntervalRef.current) {
        clearInterval(speedIntervalRef.current);
      }
    };
  }, []);

  const sendCommand = useCallback((command: string, value: unknown) => {
    if (!isConnected || !serverIp) return;
    
    // TODO: Replace with actual fetch to Flask
    console.log(`[${serverIp}] ${command}:`, value);
    
    // Example fetch (uncomment when backend is ready):
    // fetch(`http://${serverIp}/control`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ command, value })
    // }).catch(console.error);
  }, [isConnected, serverIp]);

  const handleConnect = useCallback((ip: string) => {
    setServerIp(ip);
    setIsConnected(true);
    console.log("Connected to:", ip);
  }, []);

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    setServerIp("");
    setControlState(prev => ({ ...prev, speed: 0, throttle: false, brake: false, gear: 'N' }));
    console.log("Disconnected");
  }, []);

  const handleAngleChange = useCallback((angle: number) => {
    setControlState(prev => ({ ...prev, steeringAngle: angle }));
    sendCommand("steering", Math.round(angle));
  }, [sendCommand]);

  const handleThrottleChange = useCallback((active: boolean) => {
    setControlState(prev => ({ ...prev, throttle: active }));
    sendCommand("throttle", active);
  }, [sendCommand]);

  const handleBrakeChange = useCallback((active: boolean) => {
    setControlState(prev => ({ ...prev, brake: active }));
    sendCommand("brake", active);
  }, [sendCommand]);

  const handleGearChange = useCallback((gear: string) => {
    setControlState(prev => ({ ...prev, gear }));
    sendCommand("gear", gear);
  }, [sendCommand]);

  const handleLaunch = useCallback(() => {
    sendCommand("action", "launch");
  }, [sendCommand]);

  const handleDonut = useCallback(() => {
    sendCommand("action", "donut");
  }, [sendCommand]);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Header */}
      <Header 
        isConnected={isConnected}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Zone: Camera Feed + Steering Wheel */}
        <div className="flex-[0.35] border-r border-border/30 racing-panel m-0.5 sm:m-1 sm:mr-0.5 flex flex-col">
          {/* Camera Feed - Top */}
          <div className="h-[35%] p-1 sm:p-1.5 border-b border-border/30">
            <CameraFeed isConnected={isConnected} />
          </div>
          
          {/* Steering Wheel - Bottom */}
          <div className="flex-1">
            <SteeringWheel 
              angle={controlState.steeringAngle} 
              onAngleChange={handleAngleChange} 
            />
          </div>
        </div>
        
        {/* Center Zone: Car Telemetry */}
        <div className="flex-[0.4] racing-panel m-0.5 sm:m-1 sm:mx-0.5">
          <CarTelemetry 
            steeringAngle={controlState.steeringAngle}
            throttle={controlState.throttle}
            brake={controlState.brake}
            gear={controlState.gear}
            speed={controlState.speed}
            onLaunch={handleLaunch}
            onDonut={handleDonut}
          />
        </div>
        
        {/* Right Zone: Gear Shifter */}
        <div className="flex-[0.25] border-l border-border/30 racing-panel m-0.5 sm:m-1 sm:ml-0.5">
          <GearShifter 
            currentGear={controlState.gear} 
            onGearChange={handleGearChange} 
          />
        </div>
      </div>
      
      {/* Footer Zone: Pedals */}
      <div className="h-[15vh] min-h-16 max-h-28 border-t border-primary/30">
        <Pedals 
          onThrottleChange={handleThrottleChange}
          onBrakeChange={handleBrakeChange}
        />
      </div>
    </div>
  );
};
