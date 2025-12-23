import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useOccupancyHistory } from "@/hooks/use-occupancy";
import { Loader2 } from "lucide-react";

export function OccupancyChart() {
  const { data: history, isLoading } = useOccupancyHistory();

  if (isLoading) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-2xl bg-card/50 border border-white/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Transform data for chart
  const chartData = history?.slice(-20).map(log => ({
    time: new Date(log.timestamp),
    count: log.occupancyCount,
  })) || [];

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Occupancy Trend</CardTitle>
      </CardHeader>
      <CardContent className="pl-0">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="time" 
                tickFormatter={(time) => format(time, "HH:mm:ss")}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))"
                }}
                labelFormatter={(label) => format(label, "PP HH:mm:ss")}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorCount)" 
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
