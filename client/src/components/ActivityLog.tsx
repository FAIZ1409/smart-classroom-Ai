import { useOccupancyHistory } from "@/hooks/use-occupancy";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { User, Activity } from "lucide-react";

export function ActivityLog() {
  const { data: history } = useOccupancyHistory();
  
  // Sort latest first
  const logs = history ? [...history].reverse() : [];

  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Recent Activity
        </h3>
        <span className="text-xs text-muted-foreground font-mono">LIVE</span>
      </div>
      
      <ScrollArea className="flex-1 h-[250px]">
        <div className="p-4 space-y-4">
          {logs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 text-sm">
              No activity recorded yet
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 group">
                <div className="mt-1 w-2 h-2 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-foreground">
                      Occupancy Update
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5 bg-white/5 w-fit px-2 py-1 rounded-md">
                    <User className="w-3 h-3" />
                    <span>Count: <span className="text-foreground font-mono font-bold">{log.occupancyCount}</span></span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
