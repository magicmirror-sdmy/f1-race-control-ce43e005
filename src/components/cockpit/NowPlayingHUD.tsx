import { useState, useEffect } from "react";
import { Music, SkipBack, Play, Pause, SkipForward } from "lucide-react";

interface NowPlayingHUDProps {
  className?: string;
}

const playlist = [
  { title: "Blinding Lights", artist: "The Weeknd", duration: "3:20" },
  { title: "Starboy", artist: "The Weeknd", duration: "3:50" },
  { title: "Levitating", artist: "Dua Lipa", duration: "3:23" },
  { title: "Save Your Tears", artist: "The Weeknd", duration: "3:35" },
  { title: "Night Rider", artist: "Kavinsky", duration: "4:12" },
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
      className={`flex items-center gap-1.5 px-2 py-0.5 border border-primary/20 rounded-sm bg-card/40 backdrop-blur-sm ${className}`}
    >
      {/* Music icon */}
      <Music
        className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary flex-shrink-0"
        style={{ filter: "drop-shadow(0 0 3px hsl(var(--primary)))" }}
      />

      {/* Track info with marquee for long names */}
      <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
        <span className="text-[7px] sm:text-[9px] font-bold text-foreground truncate leading-tight tracking-wide">
          {track.title}
        </span>
        <span className="text-[5px] sm:text-[7px] text-muted-foreground truncate leading-tight tracking-wider uppercase">
          {track.artist}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-8 sm:w-12 h-[3px] bg-muted rounded-full overflow-hidden flex-shrink-0">
        <div
          className="h-full bg-primary rounded-full transition-all duration-150"
          style={{
            width: `${progress}%`,
            boxShadow: "0 0 4px hsl(var(--primary))",
          }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <button
          onClick={skipPrev}
          className="w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
        >
          <SkipBack className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full border border-primary/40 text-primary hover:bg-primary/20 transition-all"
          style={{
            filter: isPlaying
              ? "drop-shadow(0 0 3px hsl(var(--primary)))"
              : "none",
          }}
        >
          {isPlaying ? (
            <Pause className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
          ) : (
            <Play className="w-2 h-2 sm:w-2.5 sm:h-2.5 ml-px" />
          )}
        </button>
        <button
          onClick={skipNext}
          className="w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
        >
          <SkipForward className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
        </button>
      </div>
    </div>
  );
};
