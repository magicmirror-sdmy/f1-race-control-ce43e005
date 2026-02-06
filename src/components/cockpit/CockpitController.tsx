import { useState, useCallback, useRef, useEffect } from "react";
import { Header } from "./Header";
import { SteeringWheel } from "./SteeringWheel";
import { CameraFeed } from "./CameraFeed";
import { GaugeCluster } from "./GaugeCluster";
import { ControlPanel } from "./ControlPanel";
import { Pedals } from "./Pedals";
import { ImmersiveHUD } from "./ImmersiveHUD";
import { useGameFeedback } from "@/hooks/useGameFeedback";

interface ControlState {
  steeringAngle: number;
  throttle: boolean;
  brake: boolean;
  gear: string;
  speed: number;
}

interface SystemMetrics {
  temperature: number;
  gpuClock: number;
  cpuClock: number;
  rpm: number;
}

export const CockpitController = () => {
  const [controlState, setControlState] = useState<ControlState>({
    steeringAngle: 0,
    throttle: false,
    brake: false,
    gear: "N",
    speed: 0,
  });
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    temperature: 45,
    gpuClock: 1200,
    cpuClock: 1500,
    rpm: 0,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [serverIp, setServerIp] = useState("");
  const speedIntervalRef = useRef<number | null>(null);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [isEmergencyStop, setIsEmergencyStop] = useState(false);
  const [isImmersiveMode, setIsImmersiveMode] = useState(false);
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [isStartingUp, setIsStartingUp] = useState(false);
  const [sweepAnimation, setSweepAnimation] = useState(false);
  const [isIREnabled, setIsIREnabled] = useState(false);
  const [speedLimit, setSpeedLimit] = useState(100);
  const [isSpeedLimitEnabled, setIsSpeedLimitEnabled] = useState(false);

  const { playSound } = useGameFeedback();

  // Simulate system metrics
  useEffect(() => {
    if (!isSystemActive) return;

    const interval = setInterval(() => {
      setSystemMetrics((prev) => ({
        temperature: Math.min(85, Math.max(40, prev.temperature + (Math.random() - 0.4) * 2)),
        gpuClock: Math.min(1800, Math.max(800, prev.gpuClock + (Math.random() - 0.5) * 50)),
        cpuClock: Math.min(1800, Math.max(1000, prev.cpuClock + (Math.random() - 0.5) * 50)),
        rpm: Math.min(100, (controlState.speed / 100) * 80 + (controlState.throttle ? 20 : 0)),
      }));
    }, 500);

    return () => clearInterval(interval);
  }, [isSystemActive, controlState.speed, controlState.throttle]);

  // Simulate speed based on throttle/brake/gear
  useEffect(() => {
    if (speedIntervalRef.current) {
      clearInterval(speedIntervalRef.current);
    }

    if (!isSystemActive) {
      setControlState((prev) => ({ ...prev, speed: 0 }));
      return;
    }

    speedIntervalRef.current = window.setInterval(() => {
      setControlState((prev) => {
        let newSpeed = prev.speed;

        // Emergency stop - immediate halt
        if (isEmergencyStop) {
          return { ...prev, speed: 0, throttle: false };
        }

        const gearMultiplier =
          {
            R: -0.3,
            N: 0,
            "1": 0.5,
            "2": 0.7,
            "3": 0.9,
            S: 1.2,
          }[prev.gear] || 0;

        // Auto mode - auto accelerate in current gear
        const isThrottleActive = prev.throttle || isAutoMode;

        if (isThrottleActive && !prev.brake && prev.gear !== "N") {
          newSpeed = Math.min(isSpeedLimitEnabled ? speedLimit : 100, prev.speed + 2 * gearMultiplier);
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
  }, [isAutoMode, isEmergencyStop, isSystemActive, isSpeedLimitEnabled, speedLimit]);

  const sendCommand = useCallback(
    (command: string, value: unknown) => {
      if (!isConnected || !serverIp) return;
      console.log(`[${serverIp}] ${command}:`, value);
    },
    [isConnected, serverIp]
  );

  const handleConnect = useCallback((ip: string) => {
    setServerIp(ip);
    setIsConnected(true);
    console.log("Connected to:", ip);
  }, []);

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    setServerIp("");
    setControlState((prev) => ({ ...prev, speed: 0, throttle: false, brake: false, gear: "N" }));
    setIsAutoMode(false);
    setIsEmergencyStop(false);
    setIsSystemActive(false);
    console.log("Disconnected");
  }, []);

  const handleSystemStart = useCallback(() => {
    if (isSystemActive) return;

    setIsStartingUp(true);
    playSound("startup");

    // Start sweep animation after a short delay
    setTimeout(() => {
      setSweepAnimation(true);
    }, 300);
  }, [isSystemActive, playSound]);

  const handleSweepComplete = useCallback(() => {
    setIsStartingUp(false);
    setSweepAnimation(false);
    setIsSystemActive(true);
  }, []);

  const handleSystemStop = useCallback(() => {
    playSound("shutdown");
    setIsSystemActive(false);
    setIsAutoMode(false);
    setIsEmergencyStop(false);
    setControlState((prev) => ({ ...prev, speed: 0, throttle: false, brake: false, gear: "N" }));
    setSystemMetrics({ temperature: 45, gpuClock: 0, cpuClock: 0, rpm: 0 });
  }, [playSound]);

  const handleAngleChange = useCallback(
    (angle: number) => {
      if (!isSystemActive) return;
      setControlState((prev) => ({ ...prev, steeringAngle: angle }));
      sendCommand("steering", Math.round(angle));
    },
    [sendCommand, isSystemActive]
  );

  const handleThrottleChange = useCallback(
    (active: boolean) => {
      if (!isSystemActive) return;
      setControlState((prev) => ({ ...prev, throttle: active }));
      sendCommand("throttle", active);
    },
    [sendCommand, isSystemActive]
  );

  const handleBrakeChange = useCallback(
    (active: boolean) => {
      if (!isSystemActive) return;
      setControlState((prev) => ({ ...prev, brake: active }));
      sendCommand("brake", active);
    },
    [sendCommand, isSystemActive]
  );

  const handleGearChange = useCallback(
    (gear: string) => {
      if (!isSystemActive) return;
      setControlState((prev) => ({ ...prev, gear }));
      sendCommand("gear", gear);
    },
    [sendCommand, isSystemActive]
  );

  const handleEmergencyStop = useCallback(() => {
    setIsEmergencyStop((prev) => {
      const newState = !prev;
      if (newState) {
        setControlState((prev) => ({ ...prev, speed: 0, throttle: false }));
        setIsAutoMode(false);
      }
      sendCommand("emergency_stop", newState);
      return newState;
    });
  }, [sendCommand]);

  const handleAutoModeToggle = useCallback(() => {
    if (isEmergencyStop) return;
    setIsAutoMode((prev) => {
      const newState = !prev;
      sendCommand("auto_mode", newState);
      return newState;
    });
  }, [sendCommand, isEmergencyStop]);

  const handleIRToggle = useCallback(() => {
    setIsIREnabled((prev) => {
      const newState = !prev;
      sendCommand("ir_control", newState);
      return newState;
    });
  }, [sendCommand]);

  const handleSpeedLimitToggle = useCallback(() => {
    setIsSpeedLimitEnabled((prev) => !prev);
  }, []);

  const handleSpeedLimitChange = useCallback(
    (limit: number) => {
      setSpeedLimit(limit);
      sendCommand("speed_limit", limit);
    },
    [sendCommand]
  );

  const handleOpenImmersive = useCallback(() => {
    setIsImmersiveMode(true);
  }, []);

  const handleCloseImmersive = useCallback(() => {
    setIsImmersiveMode(false);
  }, []);

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
      <Header isConnected={isConnected} onConnect={handleConnect} onDisconnect={handleDisconnect} />

      {/* Main Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Zone: Camera Feed + Steering Wheel */}
        <div className={`flex-[0.35] border-r border-border/30 racing-panel m-0.5 flex flex-col overflow-hidden ${!isSystemActive && !isStartingUp ? "opacity-50" : ""}`}>
          {/* Camera Feed - Top */}
          <div className="h-[30%] min-h-[4rem] p-0.5 border-b border-border/30">
            <CameraFeed isConnected={isConnected} onTap={handleOpenImmersive} />
          </div>

          {/* Steering Wheel - Bottom */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <SteeringWheel angle={controlState.steeringAngle} onAngleChange={handleAngleChange} />
          </div>
        </div>

        {/* Center Zone: Gauge Cluster */}
        <div className={`flex-[0.4] racing-panel m-0.5 overflow-hidden ${!isSystemActive && !isStartingUp ? "opacity-50" : ""}`}>
          <GaugeCluster
            speed={controlState.speed}
            rpm={systemMetrics.rpm}
            temperature={systemMetrics.temperature}
            gpuClock={systemMetrics.gpuClock}
            cpuClock={systemMetrics.cpuClock}
            isActive={isSystemActive}
            sweepAnimation={sweepAnimation || isStartingUp}
            onSweepComplete={handleSweepComplete}
          />
        </div>

        {/* Right Zone: Control Panel */}
        <div className="flex-[0.25] border-l border-border/30 racing-panel m-0.5 overflow-hidden">
          <ControlPanel
            currentGear={controlState.gear}
            onGearChange={handleGearChange}
            isAutoMode={isAutoMode}
            onAutoModeToggle={handleAutoModeToggle}
            isEmergencyStop={isEmergencyStop}
            onEmergencyStop={handleEmergencyStop}
            isSystemActive={isSystemActive}
            onSystemStart={handleSystemStart}
            onSystemStop={handleSystemStop}
            isIREnabled={isIREnabled}
            onIRToggle={handleIRToggle}
            speedLimit={speedLimit}
            onSpeedLimitChange={handleSpeedLimitChange}
            isSpeedLimitEnabled={isSpeedLimitEnabled}
            onSpeedLimitToggle={handleSpeedLimitToggle}
          />
        </div>
      </div>

      {/* Footer Zone: Pedals */}
      <div className={`h-[12dvh] min-h-12 max-h-20 border-t border-primary/30 flex-shrink-0 ${!isSystemActive ? "opacity-50 pointer-events-none" : ""}`}>
        <Pedals onThrottleChange={handleThrottleChange} onBrakeChange={handleBrakeChange} />
      </div>
    </div>
  );
};
