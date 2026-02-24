import { useState, useEffect } from "react";
import { Music, SkipBack, Play, Pause, SkipForward } from "lucide-react";

interface NowPlayingHUDProps {
  className?: string;
}

const playlist = [
  { title: "Blinding Lights", artist: "The Weeknd", color: "177 100% 31%" },
  { title: "Starboy", artist: "The Weeknd", color: "270 60% 50%" },
  { title: "Levitating", artist: "Dua Lipa", color: "330 80% 55%" },
  { title: "Save Your Tears", artist: "The Weeknd", color: "200 70% 45%" },
  { title: "Night Rider", artist: "Kavinsky", color: "345 100% 50%" },
];

export const NowPlayingHUD = ({ className }: NowPlayingHUDProps) => {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const track = playlist[trackIndex];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setTrackIndex((i) => (i + 1) % playlist.length);
          return 0;
        }
        return p + 0.5;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const skipNext = () => {
    setTrackIndex((i) => (i + 1) % playlist.length);
    setProgress(0);
  };

  const skipPrev = () => {
    setTrackIndex((i) => (i - 1 + playlist.length) % playlist.length);
    setProgress(0);
  };

  return (
    <div
      className={`flex items-center gap-2 px-2 py-1 border border-primary/20 rounded-sm bg-card/50 backdrop-blur-sm ${className}`}
    >
      {/* Album Art */}
      <div
        className="w-7 h-7 sm:w-9 sm:h-9 rounded-sm flex-shrink-0 flex items-center justify-center border border-primary/30 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, hsl(${track.color} / 0.6), hsl(${track.color} / 0.2))`,
          boxShadow: `0 0 8px hsl(${track.color} / 0.3)`,
        }}
      >
        <Music
          className="w-3 h-3 sm:w-4 sm:h-4 text-foreground/80"
        />
      </div>

      {/* Track info */}
      <div className="flex flex-col min-w-0 flex-1 overflow-hidden gap-0.5">
        <span className="text-[8px] sm:text-[11px] font-bold text-foreground truncate leading-tight tracking-wide">
          {track.title}
        </span>
        <span className="text-[6px] sm:text-[8px] text-muted-foreground truncate leading-tight tracking-wider uppercase">
          {track.artist}
        </span>
        {/* Progress bar */}
        <div className="w-full h-[2px] sm:h-[3px] bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-150"
            style={{
              width: `${progress}%`,
              boxShadow: "0 0 4px hsl(var(--primary))",
            }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={skipPrev}
          className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
        >
          <SkipBack className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full border border-primary/40 text-primary hover:bg-primary/20 transition-all"
          style={{
            filter: isPlaying
              ? "drop-shadow(0 0 4px hsl(var(--primary)))"
              : "none",
          }}
        >
          {isPlaying ? (
            <Pause className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          ) : (
            <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-px" />
          )}
        </button>
        <button
          onClick={skipNext}
          className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
        >
          <SkipForward className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </button>
      </div>
    </div>
  );
};
