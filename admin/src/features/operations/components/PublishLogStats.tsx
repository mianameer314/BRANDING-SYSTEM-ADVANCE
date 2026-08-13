import { Clock, Send, CheckCircle2 } from "lucide-react";

interface PublishLogStatsProps {
  stats?: {
    total_deliveries: number;
    success_rate: number;
    avg_duration_ms: number;
  };
  isLoading: boolean;
}

export function PublishLogStats({ stats, isLoading }: PublishLogStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-background/50 backdrop-blur border-border/50">
        <div className="p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Send className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Deliveries</p>
            {isLoading ? (
              <div className="animate-pulse bg-muted rounded-md h-7 w-20 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-foreground">{stats?.total_deliveries || 0}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-background/50 backdrop-blur border-border/50">
        <div className="p-6 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
            {isLoading ? (
              <div className="animate-pulse bg-muted rounded-md h-7 w-20 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-foreground">{stats?.success_rate || 0}%</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-background/50 backdrop-blur border-border/50">
        <div className="p-6 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xl">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Average Duration</p>
            {isLoading ? (
              <div className="animate-pulse bg-muted rounded-md h-7 w-20 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-foreground">{stats?.avg_duration_ms || 0} ms</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
