import { useState, useCallback, useRef, useEffect } from "react";
import { Header } from "./Header";
import { SteeringWheel } from "./SteeringWheel";
import { CameraFeed } from "./CameraFeed";
import { CarTelemetry } from "./CarTelemetry";
import { GearShifter } from "./GearShifter";
import { Pedals } from "./Pedals";
 import { ImmersiveHUD } from "./ImmersiveHUD";

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
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [isEmergencyStop, setIsEmergencyStop] = useState(false);
  const [isImmersiveMode, setIsImmersiveMode] = useState(false);
  const [isInfraredOn, setIsInfraredOn] = useState(false);
  const [isSonarOn, setIsSonarOn] = useState(false);
  const [isAutopilotOn, setIsAutopilotOn] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  // Simulate speed based on throttle/brake/gear
  useEffect(() => {
    if (speedIntervalRef.current) {
      clearInterval(speedIntervalRef.current);
    }

    speedIntervalRef.current = window.setInterval(() => {
      setControlState(prev => {
        let newSpeed = prev.speed;
         
         // Emergency stop - immediate halt
         if (isEmergencyStop) {
           return { ...prev, speed: 0, throttle: false };
         }
         
        const gearMultiplier = {
          'R': -0.3,
          'N': 0,
          '1': 0.5,
          '2': 0.7,
          '3': 0.9,
          'S': 1.2,
        }[prev.gear] || 0;

         // Auto mode - auto accelerate in current gear
         const isThrottleActive = prev.throttle || isAutoMode;
 
         if (isThrottleActive && !prev.brake && prev.gear !== 'N') {
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
   }, [isAutoMode, isEmergencyStop]);

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
     setIsAutoMode(false);
     setIsEmergencyStop(false);
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

   const handleEmergencyStop = useCallback(() => {
     setIsEmergencyStop(prev => {
       const newState = !prev;
       if (newState) {
         setControlState(prev => ({ ...prev, speed: 0, throttle: false }));
         setIsAutoMode(false);
       }
       sendCommand("emergency_stop", newState);
       return newState;
     });
   }, [sendCommand]);
 
   const handleAutoModeToggle = useCallback(() => {
     if (isEmergencyStop) return; // Don't allow auto mode during emergency stop
     setIsAutoMode(prev => {
       const newState = !prev;
       sendCommand("auto_mode", newState);
       return newState;
     });
   }, [sendCommand, isEmergencyStop]);
 
  const handleOpenImmersive = useCallback(() => {
    setIsImmersiveMode(true);
  }, []);

  const handleCloseImmersive = useCallback(() => {
    setIsImmersiveMode(false);
  }, []);

  const handleInfraredToggle = useCallback(() => {
    setIsInfraredOn(prev => {
      const newState = !prev;
      sendCommand("infrared", newState);
      return newState;
    });
  }, [sendCommand]);

  const handleSonarToggle = useCallback(() => {
    setIsSonarOn(prev => {
      const newState = !prev;
      sendCommand("sonar", newState);
      return newState;
    });
  }, [sendCommand]);

  const handleAutopilotToggle = useCallback(() => {
    if (isEmergencyStop) return;
    setIsAutopilotOn(prev => {
      const newState = !prev;
      sendCommand("autopilot", newState);
      return newState;
    });
  }, [sendCommand, isEmergencyStop]);

  const handleStart = useCallback(() => {
    if (isEmergencyStop) return;
    setIsStarted(true);
    sendCommand("power", "start");
  }, [sendCommand, isEmergencyStop]);

  const handleStop = useCallback(() => {
    setIsStarted(false);
    setIsAutopilotOn(false);
    setIsAutoMode(false);
    sendCommand("power", "stop");
  }, [sendCommand]);
 
  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden">
       {/* Immersive HUD Overlay */}
       <ImmersiveHUD
         isOpen={isImmersiveMode}
         onClose={handleCloseImmersive}
         speed={controlState.speed}
         gear={controlState.gear}
         throttle={controlState.throttle}
         brake={controlState.brake}
         isConnected={isConnected}
         isAutoMode={isAutoMode}
         isEmergencyStop={isEmergencyStop}
         onThrottleChange={handleThrottleChange}
         onBrakeChange={handleBrakeChange}
         onEmergencyStop={handleEmergencyStop}
         onAutoModeToggle={handleAutoModeToggle}
         onSteeringChange={handleAngleChange}
       />
       
      {/* Header */}
      <Header 
        isConnected={isConnected}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Zone: Camera Feed + Steering Wheel */}
        <div className="flex-[0.35] border-r border-border/30 racing-panel m-0.5 flex flex-col overflow-hidden">
          {/* Camera Feed - Top */}
          <div className="h-[30%] min-h-[4rem] p-0.5 border-b border-border/30">
             <CameraFeed isConnected={isConnected} onTap={handleOpenImmersive} />
          </div>
          
          {/* Steering Wheel - Bottom */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <SteeringWheel 
              angle={controlState.steeringAngle} 
              onAngleChange={handleAngleChange} 
            />
          </div>
        </div>
        
        {/* Center Zone: Car Telemetry */}
        <div className="flex-[0.4] racing-panel m-0.5 overflow-hidden">
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
        <div className="flex-[0.25] border-l border-border/30 racing-panel m-0.5 overflow-hidden">
          <GearShifter 
            currentGear={controlState.gear} 
            onGearChange={handleGearChange} 
            isAutoMode={isAutoMode}
            onAutoModeToggle={handleAutoModeToggle}
            isEmergencyStop={isEmergencyStop}
            onEmergencyStop={handleEmergencyStop}
            isInfraredOn={isInfraredOn}
            onInfraredToggle={handleInfraredToggle}
            isSonarOn={isSonarOn}
            onSonarToggle={handleSonarToggle}
            isAutopilotOn={isAutopilotOn}
            onAutopilotToggle={handleAutopilotToggle}
            isStarted={isStarted}
            onStart={handleStart}
            onStop={handleStop}
          />
        </div>
      </div>
      
      {/* Footer Zone: Pedals */}
      <div className="h-[12dvh] min-h-12 max-h-20 border-t border-primary/30 flex-shrink-0">
        <Pedals 
          onThrottleChange={handleThrottleChange}
          onBrakeChange={handleBrakeChange}
        />
      </div>
    </div>
  );
};
