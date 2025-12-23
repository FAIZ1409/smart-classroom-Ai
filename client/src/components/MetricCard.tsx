import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: string | number | ReactNode;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  color?: "primary" | "secondary" | "accent" | "destructive";
  className?: string;
}

const colorMap = {
  primary: "from-primary/20 to-primary/5 text-primary border-primary/20",
  secondary: "from-secondary/20 to-secondary/5 text-secondary border-secondary/20",
  accent: "from-accent/20 to-accent/5 text-foreground border-accent/20",
  destructive: "from-destructive/20 to-destructive/5 text-destructive border-destructive/20",
};

export function MetricCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendUp, 
  color = "primary",
  className 
}: MetricCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border p-6 glass-panel",
        "bg-gradient-to-br transition-all duration-300 hover:shadow-lg hover:border-white/10",
        colorMap[color],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-display font-bold tracking-tight text-foreground">
            {value}
          </h3>
          {trend && (
            <div className="flex items-center mt-2 gap-1.5">
              <span className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full bg-background/50 border border-white/5",
                trendUp ? "text-emerald-400" : "text-rose-400"
              )}>
                {trend}
              </span>
              <span className="text-xs text-muted-foreground/70">vs last hour</span>
            </div>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl bg-background/30 backdrop-blur-md border border-white/5 shadow-inner",
          "text-foreground"
        )}>
          {icon}
        </div>
      </div>
      
      {/* Decorative background glow */}
      <div className={cn(
        "absolute -bottom-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none",
        color === "primary" && "bg-blue-500",
        color === "secondary" && "bg-emerald-500",
        color === "destructive" && "bg-red-500",
      )} />
    </motion.div>
  );
}
