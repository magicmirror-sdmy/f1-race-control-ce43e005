// ── Tuning Constants (vehicle behavior) ──────────────────────────

export interface TuningConstants {
  FRONT_CRITICAL_CM: number;
  REAR_BLOCKED_CM: number;
  REAR_CRITICAL_CM: number;
  DANGER_CM: number;
  FULL_SPEED_CM: number;
  MAX_SPEED: number;
  MIN_SPEED: number;
  REVERSE_SPEED: number;
  PIVOT_SPEED: number;
  REVERSE_DURATION: number;
  REVERSE_STEP: number;
  PIVOT_DURATION: number;
  RECOVERY_DURATION: number;
  STUCK_RECHECK_INTERVAL: number;
  SONAR_HISTORY_LEN: number;
  STUCK_DISTANCE_THRESH: number;
  STUCK_TIME_THRESH: number;
  STUCK_BOOST_STEP: number;
  STUCK_BOOST_MAX: number;
  STUCK_MOVE_RESET: number;
  MAX_NORMAL_ESCAPES: number;
  UTURN_SPEED: number;
  UTURN_DURATION: number;
  ESCAPE_CLEAR_CM: number;
}

export const DEFAULT_TUNING: TuningConstants = {
  FRONT_CRITICAL_CM: 5,
  REAR_BLOCKED_CM: 3,
  REAR_CRITICAL_CM: 5,
  DANGER_CM: 40,
  FULL_SPEED_CM: 100,
  MAX_SPEED: 80,
  MIN_SPEED: 30,
  REVERSE_SPEED: 40,
  PIVOT_SPEED: 50,
  REVERSE_DURATION: 1,
  REVERSE_STEP: 1.0,
  PIVOT_DURATION: 1.0,
  RECOVERY_DURATION: 1.0,
  STUCK_RECHECK_INTERVAL: 1.0,
  SONAR_HISTORY_LEN: 3,
  STUCK_DISTANCE_THRESH: 2,
  STUCK_TIME_THRESH: 1.0,
  STUCK_BOOST_STEP: 5,
  STUCK_BOOST_MAX: 80,
  STUCK_MOVE_RESET: 5,
  MAX_NORMAL_ESCAPES: 2,
  UTURN_SPEED: 70,
  UTURN_DURATION: 0.8,
  ESCAPE_CLEAR_CM: 20,
};

// ── Camera & Vision ──────────────────────────────────────────────

export type CameraResolution = "640x480" | "1280x720" | "1920x1080";

export interface CameraSettings {
  resolution: CameraResolution;
  jpegQuality: number;
  framerate: number;
  cvEnabled: boolean;
}

export const DEFAULT_CAMERA: CameraSettings = {
  resolution: "1280x720",
  jpegQuality: 70,
  framerate: 30,
  cvEnabled: false,
};

// ── AI Narration ─────────────────────────────────────────────────

export interface NarrationSettings {
  provider: string;
  apiKey: string;
  model: string;
  interval: number;
}

export const DEFAULT_NARRATION: NarrationSettings = {
  provider: "openai",
  apiKey: "",
  model: "gpt-4o-mini",
  interval: 10,
};

// ── Image Analysis ───────────────────────────────────────────────

export interface ImageAnalysisSettings {
  enabled: boolean;
}

export const DEFAULT_IMAGE_ANALYSIS: ImageAnalysisSettings = {
  enabled: false,
};

// ── Kokoro TTS ───────────────────────────────────────────────────

export type KokoroStatus = "idle" | "validating" | "connected" | "error";

export interface KokoroSettings {
  enabled: boolean;
  apiAddress: string;
  voice: string;
  status: KokoroStatus;
  statusMessage: string;
  availableVoices: string[];
}

export const DEFAULT_KOKORO: KokoroSettings = {
  enabled: false,
  apiAddress: "192.168.29.105:8880",
  voice: "",
  status: "idle",
  statusMessage: "",
  availableVoices: [],
};

// ── Combined Settings ────────────────────────────────────────────

export interface AllSettings {
  tuning: TuningConstants;
  camera: CameraSettings;
  narration: NarrationSettings;
  imageAnalysis: ImageAnalysisSettings;
  kokoro: KokoroSettings;
}

export const DEFAULT_ALL_SETTINGS: AllSettings = {
  tuning: { ...DEFAULT_TUNING },
  camera: { ...DEFAULT_CAMERA },
  narration: { ...DEFAULT_NARRATION },
  imageAnalysis: { ...DEFAULT_IMAGE_ANALYSIS },
  kokoro: { ...DEFAULT_KOKORO },
};
