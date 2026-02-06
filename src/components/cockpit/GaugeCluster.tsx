import { CircularGauge } from "./CircularGauge";

interface GaugeClusterProps {
  speed: number;
  rpm: number;
  temperature: number;
  gpuClock: number;
  cpuClock: number;
  isActive: boolean;
  sweepAnimation: boolean;
  onSweepComplete?: () => void;
}

export const GaugeCluster = ({
  speed,
  rpm,
  temperature,
  gpuClock,
  cpuClock,
  isActive,
  sweepAnimation,
  onSweepComplete,
}: GaugeClusterProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-1 p-1">
      {/* Top Row - 3 small gauges */}
      <div className="flex justify-center gap-2 sm:gap-4">
        <CircularGauge
          value={temperature}
          maxValue={100}
          label="TEMP"
          unit="°C"
          size="sm"
          color="accent"
          isActive={isActive}
          sweepAnimation={sweepAnimation}
        />
        <CircularGauge
          value={gpuClock}
          maxValue={2000}
          label="GPU CLK"
          unit="MHz"
          size="sm"
          color="primary"
          isActive={isActive}
          sweepAnimation={sweepAnimation}
        />
        <CircularGauge
          value={cpuClock}
          maxValue={2000}
          label="CPU CLK"
          unit="MHz"
          size="sm"
          color="primary"
          isActive={isActive}
          sweepAnimation={sweepAnimation}
        />
      </div>

      {/* Bottom Row - 2 large gauges */}
      <div className="flex justify-center items-end gap-3 sm:gap-6">
        <CircularGauge
          value={rpm}
          maxValue={100}
          label="RPM"
          unit="%"
          size="md"
          color="destructive"
          isActive={isActive}
          sweepAnimation={sweepAnimation}
        />
        <CircularGauge
          value={speed}
          maxValue={100}
          label="SPEED"
          unit="km/h"
          size="lg"
          color="primary"
          isActive={isActive}
          sweepAnimation={sweepAnimation}
          onSweepComplete={onSweepComplete}
        />
      </div>
    </div>
  );
};
