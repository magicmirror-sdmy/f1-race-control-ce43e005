import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Crosshair, RotateCcw, Locate, Navigation } from "lucide-react";
import { useOdometry, OdometryPoint } from "@/hooks/useOdometry";

interface MiniMapProps {
  className?: string;
}

const MAP_SIZE = 300; // logical SVG size
const DEFAULT_SCALE = 75; // pixels per meter (shows ~4m range)
const MIN_SCALE = 15;
const MAX_SCALE = 300;

export const MiniMap = ({ className = "" }: MiniMapProps) => {
  const { odometry, trail, distanceFromStart, resetTrail } = useOdometry();
  const [autoFollow, setAutoFollow] = useState(true);
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  // Auto-scale: fit trail in view with padding
  useEffect(() => {
    if (!autoFollow || trail.length < 2) return;
    
    const xs = trail.map((p) => p.x);
    const ys = trail.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    const maxRange = Math.max(rangeX, rangeY, 1.0); // min 1m view
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, (MAP_SIZE * 0.6) / maxRange));
    
    setScale(newScale);
    setPanOffset({ x: 0, y: 0 });
  }, [autoFollow, trail]);

  const center = useMemo(() => {
    if (autoFollow) {
      return { x: odometry.x, y: odometry.y };
    }
    return { x: panOffset.x, y: panOffset.y };
  }, [autoFollow, odometry.x, odometry.y, panOffset]);

  const worldToScreen = useCallback(
    (wx: number, wy: number) => ({
      x: MAP_SIZE / 2 + (wx - center.x) * scale,
      y: MAP_SIZE / 2 - (wy - center.y) * scale, // Y-up in world, Y-down in SVG
    }),
    [center, scale]
  );

  const handleRecenter = () => {
    setAutoFollow(true);
    setPanOffset({ x: 0, y: 0 });
    setScale(DEFAULT_SCALE);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (autoFollow) setAutoFollow(false);
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning.current) return;
    const dx = (e.clientX - panStart.current.x) / scale;
    const dy = (e.clientY - panStart.current.y) / scale;
    setPanOffset((prev) => ({ x: prev.x - dx, y: prev.y + dy }));
    panStart.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isPanning.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setAutoFollow(false);
    setScale((s) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s * (e.deltaY > 0 ? 0.9 : 1.1))));
  };

  // Build trail path
  const trailPath = useMemo(() => {
    if (trail.length < 2) return "";
    return trail
      .map((p, i) => {
        const s = worldToScreen(p.x, p.y);
        return `${i === 0 ? "M" : "L"}${s.x.toFixed(1)},${s.y.toFixed(1)}`;
      })
      .join(" ");
  }, [trail, worldToScreen]);

  // Trail segments with opacity for fading
  const trailSegments = useMemo(() => {
    if (trail.length < 2) return [];
    const segments: { d: string; opacity: number }[] = [];
    const chunkSize = Math.max(1, Math.floor(trail.length / 20));
    
    for (let i = 0; i < trail.length - 1; i += chunkSize) {
      const end = Math.min(i + chunkSize + 1, trail.length);
      const slice = trail.slice(i, end);
      if (slice.length < 2) continue;
      
      const opacity = 0.15 + 0.85 * (i / (trail.length - 1));
      const d = slice
        .map((p, j) => {
          const s = worldToScreen(p.x, p.y);
          return `${j === 0 ? "M" : "L"}${s.x.toFixed(1)},${s.y.toFixed(1)}`;
        })
        .join(" ");
      segments.push({ d, opacity });
    }
    return segments;
  }, [trail, worldToScreen]);

  const originScreen = worldToScreen(0, 0);
  const roverScreen = worldToScreen(odometry.x, odometry.y);
  const headingRad = ((-odometry.heading + 90) * Math.PI) / 180;

  // Grid lines
  const gridLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; label?: string; isAxis?: boolean }[] = [];
    const gridSpacing = scale > 100 ? 0.25 : scale > 40 ? 0.5 : 1.0;
    const viewRange = MAP_SIZE / scale / 2;

    for (let w = Math.floor((center.x - viewRange) / gridSpacing) * gridSpacing;
      w <= center.x + viewRange;
      w += gridSpacing
    ) {
      const sx = MAP_SIZE / 2 + (w - center.x) * scale;
      const isAxis = Math.abs(w) < 0.001;
      lines.push({ x1: sx, y1: 0, x2: sx, y2: MAP_SIZE, isAxis });
    }
    for (let w = Math.floor((center.y - viewRange) / gridSpacing) * gridSpacing;
      w <= center.y + viewRange;
      w += gridSpacing
    ) {
      const sy = MAP_SIZE / 2 - (w - center.y) * scale;
      const isAxis = Math.abs(w) < 0.001;
      lines.push({ x1: 0, y1: sy, x2: MAP_SIZE, y2: sy, isAxis });
    }
    return lines;
  }, [center, scale]);

  const formatNum = (n: number) => n.toFixed(2);
  const gridLabel = scale > 100 ? "0.25m" : scale > 40 ? "0.5m" : "1.0m";

  return (
    <div className={`flex flex-col h-full w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-border/30">
        <div className="flex items-center gap-1.5">
          <Navigation className="w-3 h-3 text-primary" />
          <span className="text-[8px] sm:text-[10px] racing-text text-primary">ODOMETRY MAP</span>
          {!odometry.active && (
            <span className="text-[7px] px-1 py-0.5 rounded bg-destructive/20 text-destructive border border-destructive/30 racing-text">
              INACTIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setAutoFollow(!autoFollow)}
            className={`p-0.5 rounded transition-colors ${
              autoFollow
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title={autoFollow ? "Auto-follow ON" : "Auto-follow OFF"}
          >
            <Locate className="w-3 h-3" />
          </button>
          <button
            onClick={handleRecenter}
            className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
            title="Recenter"
          >
            <Crosshair className="w-3 h-3" />
          </button>
          <button
            onClick={resetTrail}
            className="p-0.5 rounded text-muted-foreground hover:text-destructive transition-colors"
            title="Reset trail"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="flex-1 relative min-h-0 overflow-hidden">
        {!odometry.active ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Navigation className="w-6 h-6 text-muted-foreground/30 mx-auto mb-1" />
              <p className="text-[8px] sm:text-[10px] text-muted-foreground racing-text">
                ODOMETRY INACTIVE
              </p>
              <p className="text-[7px] text-muted-foreground/50">
                Waiting for sensor data…
              </p>
            </div>
          </div>
        ) : (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${MAP_SIZE} ${MAP_SIZE}`}
            className="w-full h-full touch-none select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onWheel={handleWheel}
          >
            <defs>
              <clipPath id="mapClip">
                <rect x="0" y="0" width={MAP_SIZE} height={MAP_SIZE} />
              </clipPath>
            </defs>

            <g clipPath="url(#mapClip)">
              {/* Grid */}
              {gridLines.map((l, i) => (
                <line
                  key={i}
                  x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                  stroke={l.isAxis ? "hsl(var(--primary) / 0.25)" : "hsl(var(--border) / 0.3)"}
                  strokeWidth={l.isAxis ? 1 : 0.5}
                />
              ))}

              {/* Trail with fading */}
              {trailSegments.map((seg, i) => (
                <path
                  key={i}
                  d={seg.d}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={seg.opacity}
                />
              ))}

              {/* Origin marker */}
              <circle
                cx={originScreen.x}
                cy={originScreen.y}
                r={4}
                fill="none"
                stroke="hsl(var(--accent))"
                strokeWidth={1.5}
                opacity={0.8}
              />
              <circle
                cx={originScreen.x}
                cy={originScreen.y}
                r={1.5}
                fill="hsl(var(--accent))"
                opacity={0.9}
              />
              <text
                x={originScreen.x + 6}
                y={originScreen.y - 5}
                fill="hsl(var(--accent))"
                fontSize="7"
                fontFamily="Rajdhani, sans-serif"
                fontWeight="600"
                opacity={0.8}
              >
                START
              </text>

              {/* Rover arrow */}
              <g transform={`translate(${roverScreen.x}, ${roverScreen.y}) rotate(${-odometry.heading + 90})`}>
                {/* Heading cone */}
                <path
                  d="M0,-12 L-6,4 L6,4 Z"
                  fill="hsl(var(--primary) / 0.15)"
                  stroke="none"
                />
                {/* Body */}
                <path
                  d="M0,-8 L-4,4 L0,2 L4,4 Z"
                  fill="hsl(var(--primary))"
                  stroke="hsl(var(--primary-foreground) / 0.3)"
                  strokeWidth={0.5}
                />
                {/* Center dot */}
                <circle r={1.5} fill="hsl(var(--primary-foreground))" />
              </g>
            </g>

            {/* Grid scale label */}
            <text
              x={MAP_SIZE - 4}
              y={MAP_SIZE - 4}
              textAnchor="end"
              fill="hsl(var(--muted-foreground))"
              fontSize="7"
              fontFamily="Rajdhani, sans-serif"
              opacity={0.6}
            >
              grid: {gridLabel}
            </text>
          </svg>
        )}
      </div>

      {/* Telemetry Footer */}
      <div className="grid grid-cols-4 gap-0.5 px-1.5 py-1 border-t border-border/30 bg-card/50">
        <TelemetryCell label="X" value={`${formatNum(odometry.x)}m`} />
        <TelemetryCell label="Y" value={`${formatNum(odometry.y)}m`} />
        <TelemetryCell label="HDG" value={`${odometry.heading.toFixed(0)}°`} />
        <TelemetryCell label="DIST" value={`${formatNum(distanceFromStart)}m`} active />
      </div>
    </div>
  );
};

const TelemetryCell = ({
  label,
  value,
  active = false,
}: {
  label: string;
  value: string;
  active?: boolean;
}) => (
  <div className="text-center">
    <div className="text-[6px] sm:text-[7px] text-muted-foreground racing-text leading-none">
      {label}
    </div>
    <div
      className={`text-[8px] sm:text-[10px] font-bold racing-number leading-tight ${
        active ? "text-primary" : "text-foreground"
      }`}
    >
      {value}
    </div>
  </div>
);
