import { useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { buildMockDebugData, DebugSample, FIELD_GROUPS } from "@/lib/mockDebugData";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft, Download, Image, FileText, Filter, Clock,
  Activity, Zap, AlertTriangle, ChevronDown, ChevronRight,
  Pause, Play, Search, X
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ALL_DATA = buildMockDebugData(1);

const STATE_COLORS: Record<string, string> = {
  IDLE: "text-primary",
  SLOW: "text-accent",
  CRAWL: "text-yellow-400",
  STOP: "text-destructive",
  AVOID: "text-purple-400",
};

const CHART_COLORS = [
  "hsl(177, 100%, 40%)",
  "hsl(345, 100%, 55%)",
  "hsl(30, 100%, 55%)",
  "hsl(142, 76%, 46%)",
  "hsl(260, 80%, 60%)",
  "hsl(200, 80%, 55%)",
];

type TimeRange = "all" | "0-10" | "10-18" | "18-22" | "22-25" | "25-28" | "28-30";

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: "ALL (0-30s)", value: "all" },
  { label: "IDLE (0-10s)", value: "0-10" },
  { label: "SLOW (10-18s)", value: "10-18" },
  { label: "CRAWL (18-22s)", value: "18-22" },
  { label: "STOP (22-25s)", value: "22-25" },
  { label: "AVOID (25-28s)", value: "25-28" },
  { label: "RESUME (28-30s)", value: "28-30" },
];

function filterByRange(data: DebugSample[], range: TimeRange): DebugSample[] {
  if (range === "all") return data;
  const [start, end] = range.split("-").map(Number);
  return data.filter((_, i) => i >= start && i < end);
}

function exportCSV(data: DebugSample[]) {
  if (!data.length) return;
  const keys = Object.keys(data[0]) as (keyof DebugSample)[];
  const header = keys.join(",");
  const rows = data.map(row => keys.map(k => row[k]).join(","));
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `debug_log_${new Date().toISOString().slice(0, 19)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportPNG(el: HTMLElement | null) {
  if (!el) return;
  // Simple canvas fallback
  const canvas = document.createElement("canvas");
  const rect = el.getBoundingClientRect();
  canvas.width = rect.width * 2;
  canvas.height = rect.height * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(2, 2);
  ctx.fillStyle = "#0a1a1f";
  ctx.fillRect(0, 0, rect.width, rect.height);
  ctx.fillStyle = "#e8e8e8";
  ctx.font = "11px monospace";
  const text = "Debug Log Export - Use CSV for full data";
  ctx.fillText(text, 20, 30);
  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debug_snapshot_${new Date().toISOString().slice(0, 19)}.png`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

const Debug = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [selectedFields, setSelectedFields] = useState<(keyof DebugSample)[]>(["current_pwm", "laser_distance_cm", "steer_angle"]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Control"]);
  const [isPaused, setIsPaused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showTimeFilter, setShowTimeFilter] = useState(false);
  const [selectedLogIndex, setSelectedLogIndex] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const filteredData = useMemo(() => filterByRange(ALL_DATA, timeRange), [timeRange]);

  const searchedData = useMemo(() => {
    if (!searchQuery) return filteredData;
    const q = searchQuery.toLowerCase();
    return filteredData.filter(row =>
      row.obstacle_state.toLowerCase().includes(q) ||
      row.timestamp.includes(q)
    );
  }, [filteredData, searchQuery]);

  const toggleGroup = useCallback((group: string) => {
    setExpandedGroups(prev =>
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  }, []);

  const toggleField = useCallback((field: keyof DebugSample) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : prev.length < 6
          ? [...prev, field]
          : prev
    );
  }, []);

  const chartData = useMemo(() => {
    return searchedData.map((row, i) => {
      const point: Record<string, unknown> = { t: i };
      selectedFields.forEach(f => {
        const val = row[f];
        point[f] = typeof val === "number" ? val : 0;
      });
      return point;
    });
  }, [searchedData, selectedFields]);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return `${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-background overflow-hidden font-rajdhani">
      {/* Header Bar */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-border/40 bg-card/80 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold tracking-wider text-foreground uppercase">Debug Console</span>
          </div>
          <div className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-primary/20 text-primary border border-primary/30">
            LIVE
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-7 w-28 pl-6 pr-6 text-xs bg-secondary/60 border border-border/40 rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-1.5 top-1/2 -translate-y-1/2">
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 ${showTimeFilter ? "text-primary" : ""}`}
            onClick={() => setShowTimeFilter(p => !p)}
          >
            <Clock className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 ${showFilters ? "text-primary" : ""}`}
            onClick={() => setShowFilters(p => !p)}
          >
            <Filter className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsPaused(p => !p)}>
            {isPaused ? <Play className="h-3.5 w-3.5 text-success" /> : <Pause className="h-3.5 w-3.5" />}
          </Button>

          <div className="w-px h-5 bg-border/40 mx-1" />

          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => exportCSV(searchedData)} title="Export CSV">
            <FileText className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => exportPNG(contentRef.current)} title="Export PNG">
            <Image className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
            const json = JSON.stringify(searchedData, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `debug_log_${new Date().toISOString().slice(0, 19)}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }} title="Export JSON">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Time Range Filter Bar */}
      {showTimeFilter && (
        <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border/30 bg-secondary/40 flex-shrink-0 overflow-x-auto">
          <Clock className="h-3 w-3 text-muted-foreground mr-1 flex-shrink-0" />
          {TIME_RANGES.map(tr => (
            <button
              key={tr.value}
              onClick={() => setTimeRange(tr.value)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors
                ${timeRange === tr.value
                  ? "bg-primary/25 text-primary border border-primary/40"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
                }`}
            >
              {tr.label}
            </button>
          ))}
          <span className="ml-auto text-[10px] text-muted-foreground">{searchedData.length} samples</span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden" ref={contentRef}>
        {/* Field Selector Panel */}
        {showFilters && (
          <div className="w-48 border-r border-border/30 bg-card/60 flex-shrink-0 overflow-hidden flex flex-col">
            <div className="px-2 py-1.5 border-b border-border/30">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Fields ({selectedFields.length}/6)</span>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-1.5">
                {Object.entries(FIELD_GROUPS).map(([group, fields]) => (
                  <div key={group} className="mb-1">
                    <button
                      onClick={() => toggleGroup(group)}
                      className="flex items-center gap-1 w-full px-1.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {expandedGroups.includes(group) ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                      {group}
                    </button>
                    {expandedGroups.includes(group) && (
                      <div className="ml-3 space-y-0.5">
                        {fields.map(field => (
                          <button
                            key={field}
                            onClick={() => toggleField(field)}
                            className={`block w-full text-left px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors
                              ${selectedFields.includes(field)
                                ? "bg-primary/20 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                              }`}
                          >
                            {selectedFields.includes(field) && (
                              <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{
                                backgroundColor: CHART_COLORS[selectedFields.indexOf(field) % CHART_COLORS.length]
                              }} />
                            )}
                            {field}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Center Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Chart Area */}
          <div className="h-[35%] min-h-32 border-b border-border/30 p-2 flex-shrink-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Telemetry Graph</span>
              </div>
              <div className="flex items-center gap-2">
                {selectedFields.map((f, i) => (
                  <div key={f} className="flex items-center gap-1">
                    <span className="w-2 h-0.5 rounded" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-[9px] font-mono text-muted-foreground">{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 20%, 15%)" />
                <XAxis dataKey="t" tick={{ fontSize: 9, fill: "hsl(200, 10%, 55%)" }} stroke="hsl(180, 30%, 20%)" />
                <YAxis tick={{ fontSize: 9, fill: "hsl(200, 10%, 55%)" }} stroke="hsl(180, 30%, 20%)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(200, 30%, 8%)",
                    border: "1px solid hsl(177, 100%, 31%)",
                    borderRadius: "4px",
                    fontSize: "10px",
                    fontFamily: "monospace",
                  }}
                  labelStyle={{ color: "hsl(180, 5%, 95%)" }}
                />
                {selectedFields.map((f, i) => (
                  <Line
                    key={f}
                    type="monotone"
                    dataKey={f}
                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Log Table */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 px-3 py-1 border-b border-border/30 flex-shrink-0">
              <AlertTriangle className="h-3 w-3 text-accent" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Event Log</span>
            </div>
            <ScrollArea className="flex-1">
              <table className="w-full text-[10px] font-mono">
                <thead className="sticky top-0 bg-card/95 backdrop-blur z-10">
                  <tr className="border-b border-border/30">
                    <th className="text-left px-2 py-1 text-muted-foreground font-semibold">#</th>
                    <th className="text-left px-2 py-1 text-muted-foreground font-semibold">TIME</th>
                    <th className="text-left px-2 py-1 text-muted-foreground font-semibold">STATE</th>
                    <th className="text-right px-2 py-1 text-muted-foreground font-semibold">PWM</th>
                    <th className="text-right px-2 py-1 text-muted-foreground font-semibold">STEER</th>
                    <th className="text-right px-2 py-1 text-muted-foreground font-semibold">LASER</th>
                    <th className="text-right px-2 py-1 text-muted-foreground font-semibold">BATT</th>
                    <th className="text-right px-2 py-1 text-muted-foreground font-semibold">HDG</th>
                    <th className="text-center px-2 py-1 text-muted-foreground font-semibold">GAS</th>
                    <th className="text-center px-2 py-1 text-muted-foreground font-semibold">BRK</th>
                  </tr>
                </thead>
                <tbody>
                  {searchedData.map((row, i) => (
                    <tr
                      key={i}
                      onClick={() => setSelectedLogIndex(selectedLogIndex === i ? null : i)}
                      className={`border-b border-border/10 cursor-pointer transition-colors
                        ${selectedLogIndex === i ? "bg-primary/10" : "hover:bg-muted/20"}
                        ${row.obstacle_state === "STOP" ? "bg-destructive/5" : ""}
                        ${row.obstacle_state === "AVOID" ? "bg-purple-500/5" : ""}
                      `}
                    >
                      <td className="px-2 py-0.5 text-muted-foreground">{i}</td>
                      <td className="px-2 py-0.5 text-foreground">{formatTime(row.timestamp)}</td>
                      <td className={`px-2 py-0.5 font-bold ${STATE_COLORS[row.obstacle_state] || "text-foreground"}`}>
                        {row.obstacle_state}
                      </td>
                      <td className="px-2 py-0.5 text-right text-foreground">{row.current_pwm.toFixed(1)}</td>
                      <td className="px-2 py-0.5 text-right text-foreground">{row.steer_angle.toFixed(1)}°</td>
                      <td className={`px-2 py-0.5 text-right ${row.laser_distance_cm < 25 ? "text-destructive" : row.laser_distance_cm < 40 ? "text-accent" : "text-foreground"}`}>
                        {row.laser_distance_cm.toFixed(1)}
                      </td>
                      <td className={`px-2 py-0.5 text-right ${row.battery_voltage < 7.3 ? "text-accent" : "text-foreground"}`}>
                        {row.battery_voltage.toFixed(2)}V
                      </td>
                      <td className="px-2 py-0.5 text-right text-foreground">{row.compass_heading.toFixed(1)}°</td>
                      <td className="px-2 py-0.5 text-center">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${row.gas_pressed ? "bg-primary" : "bg-muted"}`} />
                      </td>
                      <td className="px-2 py-0.5 text-center">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${row.brake_pressed ? "bg-destructive" : "bg-muted"}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </div>
        </div>

        {/* Detail Panel - shown when a log row is selected */}
        {selectedLogIndex !== null && searchedData[selectedLogIndex] && (
          <div className="w-56 border-l border-border/30 bg-card/60 flex-shrink-0 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/30">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Detail #{selectedLogIndex}</span>
              <button onClick={() => setSelectedLogIndex(null)}>
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-0.5">
                {Object.entries(searchedData[selectedLogIndex]).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-baseline gap-2">
                    <span className="text-[9px] font-mono text-muted-foreground truncate">{key}</span>
                    <span className="text-[10px] font-mono text-foreground whitespace-nowrap">
                      {typeof val === "number" ? val.toFixed(4) : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="h-6 flex items-center justify-between px-3 border-t border-border/40 bg-card/60 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono text-muted-foreground">
            RANGE: <span className="text-foreground">{timeRange.toUpperCase()}</span>
          </span>
          <span className="text-[9px] font-mono text-muted-foreground">
            SAMPLES: <span className="text-foreground">{searchedData.length}</span>
          </span>
          <span className="text-[9px] font-mono text-muted-foreground">
            FIELDS: <span className="text-primary">{selectedFields.length}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${isPaused ? "bg-accent" : "bg-primary animate-pulse"}`} />
          <span className="text-[9px] font-mono text-muted-foreground">
            {isPaused ? "PAUSED" : "STREAMING"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Debug;
