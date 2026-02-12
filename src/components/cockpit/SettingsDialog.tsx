import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Settings, X, Minus, Plus, ChevronDown, ChevronRight,
  Eye, EyeOff, Camera, Gauge, Brain, Volume2, ImageIcon,
  Mic, RotateCcw, Check, AlertCircle, Loader2,
} from "lucide-react";
import {
  AllSettings, DEFAULT_ALL_SETTINGS,
  TuningConstants, CameraResolution, KokoroStatus,
} from "./settingsTypes";

// Re-export for backward compatibility
export type { TuningConstants } from "./settingsTypes";
export { DEFAULT_TUNING } from "./settingsTypes";

/* ─── Shared sub-components ────────────────────────────────────── */

const SectionHeader = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center gap-2 mb-1">
    <Icon className="w-3.5 h-3.5 text-primary" />
    <span className="racing-text text-[10px] sm:text-xs text-primary tracking-wider">{title}</span>
  </div>
);

const Description = ({ text }: { text: string }) => (
  <p className="text-[8px] sm:text-[9px] text-muted-foreground leading-tight mb-1.5 italic">{text}</p>
);

const CollapsibleGroup = ({
  title, icon, children, defaultOpen = false,
}: {
  title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-border/50 rounded bg-card/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-muted/30 transition-colors"
      >
        <SectionHeader icon={icon} title={title} />
        {isOpen ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
      </button>
      {isOpen && <div className="px-2 pb-2 space-y-1">{children}</div>}
    </div>
  );
};

const NumberRow = ({
  label, value, onChange, min, max, step, unit,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; unit?: string;
}) => {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const decimals = step < 1 ? 1 : 0;
  return (
    <div className="flex items-center justify-between gap-1 py-0.5">
      <span className="text-[9px] sm:text-[11px] text-muted-foreground racing-text flex-1 min-w-0 truncate">{label}</span>
      <div className="flex items-center gap-0.5">
        <button onClick={() => onChange(clamp(+(value - step).toFixed(2)))} disabled={value <= min}
          className="w-5 h-5 sm:w-6 sm:h-6 rounded border border-border bg-muted flex items-center justify-center text-foreground hover:border-primary/50 hover:bg-primary/10 transition-colors disabled:opacity-30">
          <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </button>
        <input type="number" value={Number(value.toFixed(decimals))}
          onChange={(e) => { const p = parseFloat(e.target.value); if (!isNaN(p)) onChange(clamp(p)); }}
          min={min} max={max} step={step}
          className="w-12 sm:w-14 h-5 sm:h-6 bg-card border border-border rounded px-1 text-center text-[10px] sm:text-xs text-foreground racing-number focus:border-primary focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button onClick={() => onChange(clamp(+(value + step).toFixed(2)))} disabled={value >= max}
          className="w-5 h-5 sm:w-6 sm:h-6 rounded border border-border bg-muted flex items-center justify-center text-foreground hover:border-primary/50 hover:bg-primary/10 transition-colors disabled:opacity-30">
          <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </button>
        {unit && <span className="text-[8px] sm:text-[10px] text-muted-foreground racing-text w-5 text-right">{unit}</span>}
      </div>
    </div>
  );
};

const SliderRow = ({
  label, value, onChange, min, max, step, unit,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; unit?: string;
}) => (
  <div className="py-0.5">
    <div className="flex items-center justify-between mb-0.5">
      <span className="text-[9px] sm:text-[11px] text-muted-foreground racing-text">{label}</span>
      <span className="text-[10px] sm:text-xs text-foreground racing-number">{value}{unit}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-foreground"
    />
  </div>
);

const DropdownRow = ({
  label, value, options, onChange,
}: {
  label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void;
}) => (
  <div className="flex items-center justify-between gap-1 py-0.5">
    <span className="text-[9px] sm:text-[11px] text-muted-foreground racing-text flex-1 min-w-0 truncate">{label}</span>
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="bg-card border border-border rounded px-1.5 h-5 sm:h-6 text-[10px] sm:text-xs text-foreground racing-text focus:border-primary focus:outline-none cursor-pointer min-w-[100px]">
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const SwitchRow = ({
  label, checked, onChange, description,
}: {
  label: string; checked: boolean; onChange: (v: boolean) => void; description?: string;
}) => (
  <div className="py-0.5">
    <div className="flex items-center justify-between">
      <span className="text-[9px] sm:text-[11px] text-muted-foreground racing-text">{label}</span>
      <button onClick={() => onChange(!checked)}
        className={`w-8 h-4 sm:w-9 sm:h-5 rounded-full relative transition-colors ${checked ? "bg-primary" : "bg-muted border border-border"}`}>
        <div className={`absolute top-0.5 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-foreground transition-transform ${checked ? "translate-x-4 sm:translate-x-4" : "translate-x-0.5"}`} />
      </button>
    </div>
    {description && <p className="text-[7px] sm:text-[8px] text-muted-foreground/70 mt-0.5">{description}</p>}
  </div>
);

const PasswordRow = ({
  label, value, onChange,
}: {
  label: string; value: string; onChange: (v: string) => void;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="flex items-center justify-between gap-1 py-0.5">
      <span className="text-[9px] sm:text-[11px] text-muted-foreground racing-text flex-shrink-0">{label}</span>
      <div className="flex items-center gap-0.5">
        <input type={show ? "text" : "password"} value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="sk-..."
          className="w-28 sm:w-36 h-5 sm:h-6 bg-card border border-border rounded px-1.5 text-[10px] sm:text-xs text-foreground focus:border-primary focus:outline-none"
        />
        <button onClick={() => setShow(!show)}
          className="w-5 h-5 sm:w-6 sm:h-6 rounded border border-border bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          {show ? <EyeOff className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
        </button>
      </div>
    </div>
  );
};

const StatusIndicator = ({ status, message }: { status: KokoroStatus; message: string }) => {
  if (status === "idle") return null;
  const config = {
    validating: { icon: Loader2, color: "text-primary", spin: true },
    connected: { icon: Check, color: "text-success", spin: false },
    error: { icon: AlertCircle, color: "text-destructive", spin: false },
  }[status]!;
  return (
    <div className={`flex items-center gap-1 py-0.5 ${config.color}`}>
      <config.icon className={`w-3 h-3 ${config.spin ? "animate-spin" : ""}`} />
      <span className="text-[8px] sm:text-[9px] racing-text">{message}</span>
    </div>
  );
};

/* ─── Main Dialog ──────────────────────────────────────────────── */

interface SettingsDialogProps {
  tuning: TuningConstants;
  onTuningChange: (tuning: TuningConstants) => void;
}

export const SettingsDialog = ({ tuning, onTuningChange }: SettingsDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [camera, setCamera] = useState(DEFAULT_ALL_SETTINGS.camera);
  const [narration, setNarration] = useState(DEFAULT_ALL_SETTINGS.narration);
  const [imageAnalysis, setImageAnalysis] = useState(DEFAULT_ALL_SETTINGS.imageAnalysis);
  const [kokoro, setKokoro] = useState(DEFAULT_ALL_SETTINGS.kokoro);

  const handleTuningParam = useCallback((key: keyof TuningConstants, value: number) => {
    onTuningChange({ ...tuning, [key]: value });
  }, [tuning, onTuningChange]);

  const handleValidateKokoro = useCallback(() => {
    setKokoro((prev) => ({ ...prev, status: "validating" as KokoroStatus, statusMessage: "Connecting..." }));
    // Simulate validation (replace with real fetch in production)
    setTimeout(() => {
      const success = Math.random() > 0.3;
      if (success) {
        setKokoro((prev) => ({
          ...prev,
          status: "connected",
          statusMessage: "Connected — 6 voices available",
          availableVoices: ["af_bella", "af_nicole", "am_adam", "am_michael", "bf_emma", "bm_george"],
          voice: prev.voice || "af_bella",
        }));
      } else {
        setKokoro((prev) => ({
          ...prev,
          status: "error",
          statusMessage: "Connection refused. Check address and server status.",
          availableVoices: [],
        }));
      }
    }, 1500);
  }, []);

  const handleResetAll = useCallback(() => {
    onTuningChange({ ...DEFAULT_ALL_SETTINGS.tuning });
    setCamera({ ...DEFAULT_ALL_SETTINGS.camera });
    setNarration({ ...DEFAULT_ALL_SETTINGS.narration });
    setImageAnalysis({ ...DEFAULT_ALL_SETTINGS.imageAnalysis });
    setKokoro({ ...DEFAULT_ALL_SETTINGS.kokoro });
  }, [onTuningChange]);

  return (
    <>
      <button onClick={() => setIsOpen(true)}
        className="p-1.5 sm:p-2 rounded-lg border border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-primary transition-all touch-feedback">
        <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="racing-panel bg-card p-3 sm:p-4 w-[92vw] max-w-lg max-h-[88vh] border border-primary/30 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span className="racing-text text-xs sm:text-sm text-foreground">SETTINGS</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0">

              {/* 1. CAMERA & VISION */}
              <CollapsibleGroup title="CAMERA & VISION" icon={Camera} defaultOpen>
                <Description text="Choose the camera's resolution. Higher values give sharper images but may slow down streaming." />
                <DropdownRow label="Resolution" value={camera.resolution}
                  options={[
                    { value: "640x480", label: "640×480 (Low)" },
                    { value: "1280x720", label: "1280×720 (Medium)" },
                    { value: "1920x1080", label: "1920×1080 (High)" },
                  ]}
                  onChange={(v) => setCamera((p) => ({ ...p, resolution: v as CameraResolution }))}
                />
                <Description text="Set how clear the camera images are. Higher quality means better images but uses more data." />
                <SliderRow label="JPEG Quality" value={camera.jpegQuality} onChange={(v) => setCamera((p) => ({ ...p, jpegQuality: v }))}
                  min={10} max={100} step={5} unit="%" />
                <Description text="How many pictures per second the camera takes. Higher is smoother, but uses more power." />
                <SliderRow label="Framerate" value={camera.framerate} onChange={(v) => setCamera((p) => ({ ...p, framerate: v }))}
                  min={5} max={60} step={1} unit=" FPS" />
                <Description text="Turn on real-time object detection. Needs the camera to be enabled." />
                <SwitchRow label="Computer Vision (CV)" checked={camera.cvEnabled}
                  onChange={(v) => setCamera((p) => ({ ...p, cvEnabled: v }))} />
              </CollapsibleGroup>

              {/* 2. DISTANCE THRESHOLDS */}
              <CollapsibleGroup title="DISTANCE THRESHOLDS" icon={Gauge}>
                <Description text="Set how close the car can get to obstacles before reacting. Lower values mean riskier driving." />
                <NumberRow label="Front Critical" value={tuning.FRONT_CRITICAL_CM} onChange={(v) => handleTuningParam("FRONT_CRITICAL_CM", v)} min={2} max={100} step={1} unit="cm" />
                <NumberRow label="Rear Blocked" value={tuning.REAR_BLOCKED_CM} onChange={(v) => handleTuningParam("REAR_BLOCKED_CM", v)} min={2} max={100} step={1} unit="cm" />
                <NumberRow label="Rear Critical" value={tuning.REAR_CRITICAL_CM} onChange={(v) => handleTuningParam("REAR_CRITICAL_CM", v)} min={2} max={100} step={1} unit="cm" />
                <NumberRow label="Danger Zone" value={tuning.DANGER_CM} onChange={(v) => handleTuningParam("DANGER_CM", v)} min={2} max={100} step={1} unit="cm" />
                <NumberRow label="Full Speed" value={tuning.FULL_SPEED_CM} onChange={(v) => handleTuningParam("FULL_SPEED_CM", v)} min={100} max={500} step={5} unit="cm" />
              </CollapsibleGroup>

              {/* 3. SPEED & MANEUVER */}
              <CollapsibleGroup title="SPEED & MANEUVER" icon={Gauge}>
                <Description text="Adjust how fast the car moves in different situations." />
                <NumberRow label="Max Speed" value={tuning.MAX_SPEED} onChange={(v) => handleTuningParam("MAX_SPEED", v)} min={10} max={100} step={5} unit="%" />
                <NumberRow label="Min Speed" value={tuning.MIN_SPEED} onChange={(v) => handleTuningParam("MIN_SPEED", v)} min={10} max={100} step={5} unit="%" />
                <NumberRow label="Reverse Speed" value={tuning.REVERSE_SPEED} onChange={(v) => handleTuningParam("REVERSE_SPEED", v)} min={10} max={100} step={5} unit="%" />
                <NumberRow label="Pivot Speed" value={tuning.PIVOT_SPEED} onChange={(v) => handleTuningParam("PIVOT_SPEED", v)} min={10} max={100} step={5} unit="%" />
                <Description text="How long the car performs each maneuver." />
                <NumberRow label="Reverse Duration" value={tuning.REVERSE_DURATION} onChange={(v) => handleTuningParam("REVERSE_DURATION", v)} min={0.1} max={5} step={0.1} unit="s" />
                <NumberRow label="Pivot Duration" value={tuning.PIVOT_DURATION} onChange={(v) => handleTuningParam("PIVOT_DURATION", v)} min={0.1} max={5} step={0.1} unit="s" />
                <NumberRow label="Recovery Duration" value={tuning.RECOVERY_DURATION} onChange={(v) => handleTuningParam("RECOVERY_DURATION", v)} min={0.1} max={5} step={0.1} unit="s" />
              </CollapsibleGroup>

              {/* 4. FILTER */}
              <CollapsibleGroup title="FILTER" icon={Gauge}>
                <Description text="Smooth out sonar readings. Higher values are more stable but slower to react." />
                <NumberRow label="Sonar Filter Window" value={tuning.SONAR_HISTORY_LEN} onChange={(v) => handleTuningParam("SONAR_HISTORY_LEN", v)} min={1} max={5} step={1} />
              </CollapsibleGroup>

              {/* 5. SMART POWER */}
              <CollapsibleGroup title="SMART POWER" icon={Gauge}>
                <Description text="Settings for detecting and escaping when the car is stuck." />
                <NumberRow label="Stuck Distance" value={tuning.STUCK_DISTANCE_THRESH} onChange={(v) => handleTuningParam("STUCK_DISTANCE_THRESH", v)} min={1} max={20} step={1} unit="cm" />
                <NumberRow label="Stuck Time" value={tuning.STUCK_TIME_THRESH} onChange={(v) => handleTuningParam("STUCK_TIME_THRESH", v)} min={0.1} max={5} step={0.1} unit="s" />
                <NumberRow label="Boost Step" value={tuning.STUCK_BOOST_STEP} onChange={(v) => handleTuningParam("STUCK_BOOST_STEP", v)} min={1} max={20} step={1} unit="%" />
                <NumberRow label="Boost Max" value={tuning.STUCK_BOOST_MAX} onChange={(v) => handleTuningParam("STUCK_BOOST_MAX", v)} min={30} max={100} step={5} unit="%" />
                <NumberRow label="Move Reset" value={tuning.STUCK_MOVE_RESET} onChange={(v) => handleTuningParam("STUCK_MOVE_RESET", v)} min={1} max={20} step={1} unit="cm" />
              </CollapsibleGroup>

              {/* 6. ESCALATING ESCAPE */}
              <CollapsibleGroup title="ESCALATING ESCAPE" icon={Gauge}>
                <Description text="Advanced settings for how the car tries to escape obstacles." />
                <NumberRow label="Max Escapes" value={tuning.MAX_NORMAL_ESCAPES} onChange={(v) => handleTuningParam("MAX_NORMAL_ESCAPES", v)} min={1} max={10} step={1} />
                <NumberRow label="U-Turn Speed" value={tuning.UTURN_SPEED} onChange={(v) => handleTuningParam("UTURN_SPEED", v)} min={20} max={100} step={5} unit="%" />
                <NumberRow label="U-Turn Duration" value={tuning.UTURN_DURATION} onChange={(v) => handleTuningParam("UTURN_DURATION", v)} min={0.1} max={5} step={0.1} unit="s" />
                <NumberRow label="Escape Clear" value={tuning.ESCAPE_CLEAR_CM} onChange={(v) => handleTuningParam("ESCAPE_CLEAR_CM", v)} min={5} max={100} step={5} unit="cm" />
              </CollapsibleGroup>

              {/* 7. AI NARRATION */}
              <CollapsibleGroup title="AI NARRATION" icon={Brain}>
                <Description text="Choose the AI voice provider." />
                <DropdownRow label="Provider" value={narration.provider}
                  options={[
                    { value: "openai", label: "OpenAI" },
                    { value: "google", label: "Google Cloud" },
                    { value: "elevenlabs", label: "ElevenLabs" },
                  ]}
                  onChange={(v) => setNarration((p) => ({ ...p, provider: v }))}
                />
                <Description text="Enter your API key for narration." />
                <PasswordRow label="API Key" value={narration.apiKey}
                  onChange={(v) => setNarration((p) => ({ ...p, apiKey: v }))} />
                <Description text="Select the AI model for narration." />
                <DropdownRow label="Model" value={narration.model}
                  options={
                    narration.provider === "openai"
                      ? [{ value: "gpt-4o-mini", label: "GPT-4o Mini" }, { value: "gpt-4o", label: "GPT-4o" }]
                      : narration.provider === "google"
                        ? [{ value: "gemini-pro", label: "Gemini Pro" }, { value: "gemini-flash", label: "Gemini Flash" }]
                        : [{ value: "eleven-turbo", label: "Turbo v2.5" }, { value: "eleven-multi", label: "Multilingual v2" }]
                  }
                  onChange={(v) => setNarration((p) => ({ ...p, model: v }))}
                />
                <Description text="How often the car speaks updates." />
                <NumberRow label="Interval" value={narration.interval} onChange={(v) => setNarration((p) => ({ ...p, interval: v }))} min={3} max={60} step={1} unit="s" />
              </CollapsibleGroup>

              {/* 8. IMAGE ANALYSIS */}
              <CollapsibleGroup title="IMAGE ANALYSIS" icon={ImageIcon}>
                <Description text="Enable AI-powered image analysis. When on, the car describes what it sees using TTS." />
                <SwitchRow label="Image Analysis" checked={imageAnalysis.enabled}
                  onChange={(v) => setImageAnalysis({ enabled: v })} />
              </CollapsibleGroup>

              {/* 9. KOKORO TTS */}
              <CollapsibleGroup title="KOKORO TTS" icon={Mic}>
                <Description text="Enable or disable Kokoro TTS, a remote speech server for high-quality voices. Falls back to local TTS if off or unavailable." />
                <SwitchRow label="Kokoro TTS" checked={kokoro.enabled}
                  onChange={(v) => setKokoro((p) => ({ ...p, enabled: v }))} />
                {kokoro.enabled && (
                  <>
                    <Description text="Enter the address of your Kokoro TTS server. Click 'Validate' to check connection and fetch available voices." />
                    <div className="flex items-center gap-1 py-0.5">
                      <span className="text-[9px] sm:text-[11px] text-muted-foreground racing-text flex-shrink-0">Address</span>
                      <input type="text" value={kokoro.apiAddress}
                        onChange={(e) => setKokoro((p) => ({ ...p, apiAddress: e.target.value, status: "idle" as KokoroStatus }))}
                        placeholder="192.168.29.105:8880"
                        className="flex-1 h-5 sm:h-6 bg-card border border-border rounded px-1.5 text-[10px] sm:text-xs text-foreground focus:border-primary focus:outline-none min-w-0"
                      />
                      <button onClick={handleValidateKokoro}
                        disabled={kokoro.status === "validating"}
                        className="h-5 sm:h-6 px-2 rounded border border-primary/50 bg-primary/10 text-primary racing-text text-[9px] sm:text-[10px] hover:bg-primary/20 transition-colors disabled:opacity-50">
                        {kokoro.status === "validating" ? "..." : "Validate"}
                      </button>
                    </div>
                    <StatusIndicator status={kokoro.status} message={kokoro.statusMessage} />
                    {kokoro.availableVoices.length > 0 && (
                      <DropdownRow label="Voice" value={kokoro.voice}
                        options={kokoro.availableVoices.map((v) => ({ value: v, label: v }))}
                        onChange={(v) => setKokoro((p) => ({ ...p, voice: v }))}
                      />
                    )}
                  </>
                )}
              </CollapsibleGroup>
            </div>

            {/* 10. CONTROLS — Footer */}
            <div className="flex gap-2 mt-2 pt-2 border-t border-border/50 flex-shrink-0">
              <button onClick={handleResetAll}
                className="flex-1 py-1.5 px-3 rounded border border-border bg-muted/30 text-muted-foreground racing-text text-[10px] sm:text-xs hover:bg-muted/50 transition-colors touch-feedback flex items-center justify-center gap-1">
                <RotateCcw className="w-3 h-3" /> RESET DEFAULTS
              </button>
              <button onClick={() => setIsOpen(false)}
                className="flex-1 py-1.5 px-3 rounded border border-primary bg-primary/20 text-primary racing-text text-[10px] sm:text-xs hover:bg-primary/30 transition-colors touch-feedback">
                APPLY & CLOSE
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
