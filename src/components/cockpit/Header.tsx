import { ConnectionDialog } from "./ConnectionDialog";

interface HeaderProps {
  driverName?: string;
  position?: string;
  isConnected: boolean;
  onConnect: (ip: string) => void;
  onDisconnect: () => void;
}

export const Header = ({ 
  driverName = "HAMILTON", 
  position = "P1",
  isConnected,
  onConnect,
  onDisconnect
}: HeaderProps) => {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-primary/30 bg-card/30 backdrop-blur-sm">
      {/* Left: Team Logo */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {/* AMG Stripes */}
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="w-1 h-5 bg-gradient-to-b from-muted-foreground to-muted transform -skew-x-12"
              />
            ))}
          </div>
          <span className="text-foreground font-bold tracking-wider ml-1">AMG</span>
        </div>
        <span className="text-primary font-bold racing-text">PETRONAS</span>
      </div>
      
      {/* Center: Connection Status */}
      <div className="flex items-center gap-2 text-xs racing-text text-muted-foreground">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-primary animate-pulse' : 'bg-destructive'}`} />
        <span className="hidden sm:inline">{isConnected ? 'CONNECTED' : 'OFFLINE'}</span>
      </div>
      
      {/* Right: Driver Status + Connection */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold text-lg racing-text">{position}</span>
          <span className="text-foreground font-bold racing-text hidden sm:inline">{driverName}</span>
        </div>
        {/* Driver Number Badge */}
        <div className="w-7 h-7 bg-primary rounded flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">44</span>
        </div>
        {/* Connection Dialog */}
        <ConnectionDialog
          isConnected={isConnected}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
        />
      </div>
    </header>
  );
};
