import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildMockDebugData, DebugSample } from "@/lib/mockDebugData";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft, Download, FileText, Clock, Activity, Pause, Play, Search, X, Image
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, ZAxis,
  Cell, ReferenceLine
} from "recharts";

const ALL_DATA = buildMockDebugData(1);

const C = {
  teal: "hsl(177,100%,40%)",
  red: "hsl(345,100%,55%)",
  orange: "hsl(30,100%,55%)",
  green: "hsl(142,76%,46%)",
  purple: "hsl(260,80%,60%)",
  blue: "hsl(200,80%,55%)",
  yellow: "hsl(48,100%,55%)",
  pink: "hsl(320,80%,60%)",
  grid: "hsl(200,20%,12%)",
  axis: "hsl(200,10%,35%)",
  axisText: "hsl(200,10%,50%)",
};

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "hsl(200,30%,6%)",
    border: "1px solid hsl(177,100%,25%)",
    borderRadius: "3px",
    fontSize: "9px",
    fontFamily: "monospace",
    padding: "4px 6px",
  },
  labelStyle: { color: "hsl(180,5%,85%)", fontSize: "9px" },
};

const tickStyle = { fontSize: 8, fill: C.axisText };

type TimeRange = "all" | "0-10" | "10-18" | "18-22" | "22-25" | "25-28" | "28-30";

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: "ALL", value: "all" },
  { label: "IDLE 0-10s", value: "0-10" },
  { label: "SLOW 10-18s", value: "10-18" },
  { label: "CRAWL 18-22s", value: "18-22" },
  { label: "STOP 22-25s", value: "22-25" },
  { label: "AVOID 25-28s", value: "25-28" },
  { label: "RESUME 28-30s", value: "28-30" },
];

function filterByRange(data: DebugSample[], range: TimeRange): DebugSample[] {
  if (range === "all") return data;
  const [start, end] = range.split("-").map(Number);
  return data.filter((_, i) => i >= start && i < end);
}

function exportCSV(data: DebugSample[]) {
  if (!data.length) return;
  const keys = Object.keys(data[0]) as (keyof DebugSample)[];
  const csv = [keys.join(","), ...data.map(r => keys.map(k => r[k]).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = `debug_${Date.now()}.csv`;
  a.click();
}

function exportJSON(data: DebugSample[]) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  a.download = `debug_${Date.now()}.json`;
  a.click();
}

// Panel wrapper
const Panel = ({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) => (
  <div className={`bg-card/50 border border-border/20 rounded overflow-hidden flex flex-col ${className}`}>
    <div className="px-2 py-1 border-b border-border/20 flex-shrink-0">
      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{title}</span>
    </div>
    <div className="flex-1 min-h-0 p-1">
      {children}
    </div>
  </div>
);

// Mode flags heatmap row
const MODE_COLORS: Record<string, string> = {
  IDLE: "hsl(177,100%,35%)",
  SLOW: "hsl(48,100%,50%)",
  CRAWL: "hsl(30,100%,50%)",
  STOP: "hsl(345,100%,50%)",
  AVOID: "hsl(260,80%,55%)",
};

const Debug = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [isPaused, setIsPaused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const data = useMemo(() => {
    const filtered = filterByRange(ALL_DATA, timeRange);
    if (!searchQuery) return filtered;
    const q = searchQuery.toLowerCase();
    return filtered.filter(r => r.obstacle_state.toLowerCase().includes(q) || r.timestamp.includes(q));
  }, [timeRange, searchQuery]);

  const chartData = useMemo(() => data.map((r, i) => ({ ...r, t: i })), [data]);

  const scatterAccel = useMemo(() => data.map(r => ({
    x: r.accel_x, y: r.accel_y, z: Math.abs(r.accel_z)
  })), [data]);

  const scatterMag = useMemo(() => data.map((r, i) => ({
    x: r.mag_x, y: r.mag_y, t: i
  })), [data]);

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-background overflow-hidden font-rajdhani">
      {/* Header */}
      <div className="h-9 flex items-center justify-between px-3 border-b border-border/40 bg-card/80 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => navigate("/")}>
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <Activity className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold tracking-wider text-foreground uppercase">Debug Log</span>
          <span className="text-[9px] text-muted-foreground font-mono">[{data.length} samples | ~{data.length}Hz]</span>
          <div className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-primary/20 text-primary border border-primary/30">
            {isPaused ? "PAUSED" : "LIVE"}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="relative">
            <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter state..."
              className="h-6 w-24 pl-5 pr-5 text-[10px] bg-secondary/60 border border-border/40 rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 font-mono"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-1 top-1/2 -translate-y-1/2">
                <X className="h-2.5 w-2.5 text-muted-foreground" />
              </button>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsPaused(p => !p)}>
            {isPaused ? <Play className="h-3 w-3 text-primary" /> : <Pause className="h-3 w-3" />}
          </Button>
          <div className="w-px h-4 bg-border/30 mx-0.5" />
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => exportCSV(data)} title="CSV">
            <FileText className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => exportJSON(data)} title="JSON">
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Time filter */}
      <div className="flex items-center gap-1 px-3 py-1 border-b border-border/20 bg-card/40 flex-shrink-0">
        <Clock className="h-2.5 w-2.5 text-muted-foreground mr-1" />
        {TIME_RANGES.map(tr => (
          <button
            key={tr.value}
            onClick={() => setTimeRange(tr.value)}
            className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider transition-colors
              ${timeRange === tr.value
                ? "bg-primary/25 text-primary border border-primary/40"
                : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
          >
            {tr.label}
          </button>
        ))}
      </div>

      {/* Charts Grid */}
      <ScrollArea className="flex-1" ref={contentRef}>
        <div className="p-2 space-y-2">
          {/* Row 1: Overview - PWM, Gear & Braking */}
          <Panel title="Drive Overview — Throttle PWM, Gear & Braking">
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="2 2" stroke={C.grid} />
                <XAxis dataKey="t" tick={tickStyle} stroke={C.axis} label={{ value: "Time (s)", position: "insideBottom", offset: -2, style: { fontSize: 8, fill: C.axisText } }} />
                <YAxis tick={tickStyle} stroke={C.axis} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="current_pwm" stroke={C.teal} strokeWidth={1.5} dot={false} name="PWM" />
                <Line type="stepAfter" dataKey="gas_pressed" stroke={C.green} strokeWidth={1} dot={false} name="Gas" />
                <Line type="stepAfter" dataKey="brake_pressed" stroke={C.red} strokeWidth={1} dot={false} name="Brake" />
                <Line type="stepAfter" dataKey="is_braking" stroke={C.orange} strokeWidth={1} dot={false} name="Braking" />
              </LineChart>
            </ResponsiveContainer>
          </Panel>

          {/* Row 2: Steering + Duty Cycles */}
          <div className="grid grid-cols-2 gap-2">
            <Panel title="Steering — User Angle">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="2 2" stroke={C.grid} />
                  <XAxis dataKey="t" tick={tickStyle} stroke={C.axis} />
                  <YAxis tick={tickStyle} stroke={C.axis} />
                  <Tooltip {...tooltipStyle} />
                  <ReferenceLine y={0} stroke={C.axis} strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="steer_angle" stroke={C.teal} strokeWidth={1.5} dot={false} name="Steer" />
                  <Line type="monotone" dataKey="user_steer_angle" stroke={C.orange} strokeWidth={1} dot={false} name="User Steer" />
                </LineChart>
              </ResponsiveContainer>
            </Panel>

            <Panel title="Per-Wheel Duty Cycles">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="2 2" stroke={C.grid} />
                  <XAxis dataKey="t" tick={tickStyle} stroke={C.axis} />
                  <YAxis tick={tickStyle} stroke={C.axis} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="duty_fl" stroke={C.teal} strokeWidth={1} dot={false} name="FL" />
                  <Line type="monotone" dataKey="duty_fr" stroke={C.green} strokeWidth={1} dot={false} name="FR" />
                  <Line type="monotone" dataKey="duty_rl" stroke={C.orange} strokeWidth={1} dot={false} name="RL" />
                  <Line type="monotone" dataKey="duty_rr" stroke={C.red} strokeWidth={1} dot={false} name="RR" />
                </LineChart>
              </ResponsiveContainer>
            </Panel>
          </div>

          {/* Row 3: Wheel RPM + RPM Drift */}
          <div className="grid grid-cols-2 gap-2">
            <Panel title="Wheel RPM — Rear Left & Right">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="2 2" stroke={C.grid} />
                  <XAxis dataKey="t" tick={tickStyle} stroke={C.axis} />
                  <YAxis tick={tickStyle} stroke={C.axis} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="rpm_rear_left" stroke={C.teal} strokeWidth={1.5} dot={false} name="RL" />
                  <Line type="monotone" dataKey="rpm_rear_right" stroke={C.green} strokeWidth={1.5} dot={false} name="RR" />
                  <Line type="monotone" dataKey="rpm_front_right" stroke={C.orange} strokeWidth={1} dot={false} name="FR" />
                </LineChart>
              </ResponsiveContainer>
            </Panel>

            <Panel title="RPM Drift (RR − RL)">
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={chartData.map(d => ({ t: d.t, drift: +(d.rpm_rear_right - d.rpm_rear_left).toFixed(2) }))}>
                  <CartesianGrid strokeDasharray="2 2" stroke={C.grid} />
                  <XAxis dataKey="t" tick={tickStyle} stroke={C.axis} />
                  <YAxis tick={tickStyle} stroke={C.axis} />
                  <Tooltip {...tooltipStyle} />
                  <ReferenceLine y={0} stroke={C.axis} />
                  <Bar dataKey="drift" isAnimationActive={false}>
                    {chartData.map((_, i) => {
                      const drift = chartData[i].rpm_rear_right - chartData[i].rpm_rear_left;
                      return <Cell key={i} fill={drift >= 0 ? C.teal : C.red} fillOpacity={0.7} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Panel>
          </div>

          {/* Row 4: Accelerometer + Gyroscope */}
          <div className="grid grid-cols-2 gap-2">
            <Panel title="Accelerometer (g)">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="2 2" stroke={C.grid} />
                  <XAxis dataKey="t" tick={tickStyle} stroke={C.axis} />
                  <YAxis tick={tickStyle} stroke={C.axis} domain={[-0.1, 1.1]} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="accel_x" stroke={C.red} strokeWidth={1} dot={false} name="X" />
                  <Line type="monotone" dataKey="accel_y" stroke={C.green} strokeWidth={1} dot={false} name="Y" />
                  <Line type="monotone" dataKey="accel_z" stroke={C.blue} strokeWidth={1} dot={false} name="Z" />
                </LineChart>
              </ResponsiveContainer>
            </Panel>

            <Panel title="Gyroscope (°/s)">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="2 2" stroke={C.grid} />
                  <XAxis dataKey="t" tick={tickStyle} stroke={C.axis} />
                  <YAxis tick={tickStyle} stroke={C.axis} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="gyro_x" stroke={C.red} strokeWidth={1} dot={false} name="X" />
                  <Line type="monotone" dataKey="gyro_y" stroke={C.green} strokeWidth={1} dot={false} name="Y" />
                  <Line type="monotone" dataKey="gyro_z" stroke={C.blue} strokeWidth={1} dot={false} name="Z" />
                </LineChart>
              </ResponsiveContainer>
            </Panel>
          </div>

          {/* Row 5: Magnetometer + IMU Temp */}
          <div className="grid grid-cols-2 gap-2">
            <Panel title="Magnetometer (Gauss)">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="2 2" stroke={C.grid} />
                  <XAxis dataKey="t" tick={tickStyle} stroke={C.axis} />
                  <YAxis tick={tickStyle} stroke={C.axis} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="mag_x" stroke={C.red} strokeWidth={1} dot={false} name="X" />
                  <Line type="monotone" dataKey="mag_y" stroke={C.green} strokeWidth={1} dot={false} name="Y" />
                  <Line type="monotone" dataKey="mag_z" stroke={C.teal} strokeWidth={1} dot={false} name="Z" />
                </LineChart>
              </ResponsiveContainer>
            </Panel>

            <Panel title="IMU Temperature (°C)">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="2 2" stroke={C.grid} />
                  <XAxis dataKey="t" tick={tickStyle} stroke={C.axis} />
                  <YAxis tick={tickStyle} stroke={C.axis} domain={["dataMin - 0.5", "dataMax + 0.5"]} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="temp_c" stroke={C.yellow} strokeWidth={1.5} dot={false} name="Temp" />
                </LineChart>
              </ResponsiveContainer>
            </Panel>
          </div>

          {/* Row 6: Compass Heading + PID Correction */}
          <div className="grid grid-cols-2 gap-2">
            <Panel title="Compass Heading (°)">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="2 2" stroke={C.grid} />
                  <XAxis dataKey="t" tick={tickStyle} stroke={C.axis} />
                  <YAxis tick={tickStyle} stroke={C.axis} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="compass_heading" stroke={C.teal} strokeWidth={1.5} dot={false} name="Heading" />
                  <Line type="monotone" dataKey="compass_target_heading" stroke={C.purple} strokeWidth={1} dot={false} strokeDasharray="4 2" name="Target" />
                </LineChart>
              </ResponsiveContainer>
            </Panel>

            <Panel title="Compass PID Correction (%)">
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={chartData.map(d => ({ t: d.t, pid: d.pid_correction, err: d.heading_error_deg }))}>
                  <CartesianGrid strokeDasharray="2 2" stroke={C.grid} />
                  <XAxis dataKey="t" tick={tickStyle} stroke={C.axis} />
                  <YAxis tick={tickStyle} stroke={C.axis} />
                  <Tooltip {...tooltipStyle} />
                  <ReferenceLine y={0} stroke={C.axis} />
                  <Bar dataKey="pid" isAnimationActive={false}>
                    {chartData.map((d, i) => (
                      <Cell key={i} fill={d.pid_correction >= 0 ? C.teal : C.orange} fillOpacity={0.8} />
                    ))}
                  </Bar>
                  <Line type="monotone" dataKey="err" stroke={C.yellow} strokeWidth={1} dot={false} name="Error" />
                </BarChart>
              </ResponsiveContainer>
            </Panel>
          </div>

          {/* Row 7: Laser Distance (full width) */}
          <Panel title="Laser Distance (cm) — thresholds: 15cm stop / 25 crawl / 40 slow / 60 caution">
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="2 2" stroke={C.grid} />
                <XAxis dataKey="t" tick={tickStyle} stroke={C.axis} label={{ value: "Time (s)", position: "insideBottom", offset: -2, style: { fontSize: 8, fill: C.axisText } }} />
                <YAxis tick={tickStyle} stroke={C.axis} />
                <Tooltip {...tooltipStyle} />
                <ReferenceLine y={15} stroke={C.red} strokeDasharray="4 2" label={{ value: "STOP", position: "right", style: { fontSize: 7, fill: C.red } }} />
                <ReferenceLine y={25} stroke={C.orange} strokeDasharray="4 2" label={{ value: "CRAWL", position: "right", style: { fontSize: 7, fill: C.orange } }} />
                <ReferenceLine y={40} stroke={C.yellow} strokeDasharray="4 2" label={{ value: "SLOW", position: "right", style: { fontSize: 7, fill: C.yellow } }} />
                <ReferenceLine y={60} stroke={C.green} strokeDasharray="4 2" label={{ value: "CAUTION", position: "right", style: { fontSize: 7, fill: C.green } }} />
                <Line type="monotone" dataKey="laser_distance_cm" stroke={C.green} strokeWidth={2} dot={false} name="Distance" />
              </LineChart>
            </ResponsiveContainer>
          </Panel>

          {/* Row 8: Battery + Motor Current */}
          <div className="grid grid-cols-2 gap-2">
            <Panel title="Battery Voltage (V)">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="2 2" stroke={C.grid} />
                  <XAxis dataKey="t" tick={tickStyle} stroke={C.axis} />
                  <YAxis tick={tickStyle} stroke={C.axis} domain={["dataMin - 0.05", "dataMax + 0.05"]} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="battery_voltage" stroke={C.yellow} strokeWidth={1.5} dot={false} name="Voltage" />
                </LineChart>
              </ResponsiveContainer>
            </Panel>

            <Panel title="Motor Current (A) + Power Limiter Max Duty (%)">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="2 2" stroke={C.grid} />
                  <XAxis dataKey="t" tick={tickStyle} stroke={C.axis} />
                  <YAxis yAxisId="left" tick={tickStyle} stroke={C.axis} />
                  <YAxis yAxisId="right" orientation="right" tick={tickStyle} stroke={C.axis} />
                  <Tooltip {...tooltipStyle} />
                  <Line yAxisId="left" type="monotone" dataKey="current_amps" stroke={C.orange} strokeWidth={1.5} dot={false} name="Current" />
                  <Line yAxisId="right" type="monotone" dataKey="power_limiter_max_duty" stroke={C.teal} strokeWidth={1} dot={false} strokeDasharray="3 2" name="Max Duty" />
                </LineChart>
              </ResponsiveContainer>
            </Panel>
          </div>

          {/* Row 9: Mode Flags Heatmap */}
          <Panel title="Mode Flags (event lane)">
            <div className="h-24 flex flex-col justify-center gap-1 px-1">
              {/* Obstacle State Lane */}
              <div className="flex items-center gap-1">
                <span className="text-[8px] font-mono text-muted-foreground w-16 text-right">STATE</span>
                <div className="flex-1 flex h-5 rounded overflow-hidden">
                  {data.map((r, i) => (
                    <div
                      key={i}
                      className="flex-1 min-w-0"
                      style={{ backgroundColor: MODE_COLORS[r.obstacle_state] || C.grid }}
                      title={`t=${i}: ${r.obstacle_state}`}
                    />
                  ))}
                </div>
              </div>
              {/* Binary flag lanes */}
              {(["autonomous_mode", "hunter_mode", "emergency_brake_active", "course_correction_active"] as const).map(field => (
                <div key={field} className="flex items-center gap-1">
                  <span className="text-[8px] font-mono text-muted-foreground w-16 text-right truncate">{field.replace(/_/g, " ").replace("active", "").trim()}</span>
                  <div className="flex-1 flex h-3 rounded overflow-hidden">
                    {data.map((r, i) => (
                      <div
                        key={i}
                        className="flex-1 min-w-0"
                        style={{ backgroundColor: r[field] ? (field === "emergency_brake_active" ? C.red : C.teal) : C.grid }}
                        title={`t=${i}: ${r[field]}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
              {/* Legend */}
              <div className="flex items-center gap-3 mt-1 px-16">
                {Object.entries(MODE_COLORS).map(([state, color]) => (
                  <div key={state} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }} />
                    <span className="text-[7px] font-mono text-muted-foreground">{state}</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          {/* Row 10: Scatter Plots */}
          <div className="grid grid-cols-2 gap-2">
            <Panel title="Magnetometer XY — calibration / hard-iron check">
              <ResponsiveContainer width="100%" height={140}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="2 2" stroke={C.grid} />
                  <XAxis dataKey="x" tick={tickStyle} stroke={C.axis} name="Mag X" type="number" />
                  <YAxis dataKey="y" tick={tickStyle} stroke={C.axis} name="Mag Y" type="number" />
                  <ZAxis dataKey="t" range={[15, 15]} />
                  <Tooltip {...tooltipStyle} />
                  <Scatter data={scatterMag} isAnimationActive={false}>
                    {scatterMag.map((_, i) => (
                      <Cell key={i} fill={`hsl(${(i / scatterMag.length) * 300}, 80%, 55%)`} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </Panel>

            <Panel title="Accel XY scatter (lateral vs longitudinal)">
              <ResponsiveContainer width="100%" height={140}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="2 2" stroke={C.grid} />
                  <XAxis dataKey="x" tick={tickStyle} stroke={C.axis} name="Accel X" type="number" />
                  <YAxis dataKey="y" tick={tickStyle} stroke={C.axis} name="Accel Y" type="number" />
                  <ZAxis dataKey="z" range={[10, 30]} />
                  <Tooltip {...tooltipStyle} />
                  <Scatter data={scatterAccel} fill={C.teal} fillOpacity={0.6} isAnimationActive={false} />
                </ScatterChart>
              </ResponsiveContainer>
            </Panel>
          </div>
        </div>
      </ScrollArea>

      {/* Status Bar */}
      <div className="h-5 flex items-center justify-between px-3 border-t border-border/30 bg-card/60 flex-shrink-0">
        <span className="text-[8px] font-mono text-muted-foreground">
          RANGE: <span className="text-foreground">{timeRange}</span> · SAMPLES: <span className="text-foreground">{data.length}</span>
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? "bg-accent" : "bg-primary animate-pulse"}`} />
          <span className="text-[8px] font-mono text-muted-foreground">{isPaused ? "PAUSED" : "STREAMING"}</span>
        </div>
      </div>
    </div>
  );
};

export default Debug;
