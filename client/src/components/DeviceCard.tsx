import { motion } from "framer-motion";
import { Lightbulb, Power, Cpu, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToggleDevice } from "@/hooks/use-devices";
import { DeviceState } from "@shared/schema";
import { cn } from "@/lib/utils";

export function DeviceCard({ device }: { device: DeviceState }) {
  const { mutate: toggleDevice, isPending } = useToggleDevice();

  const handleToggle = (checked: boolean) => {
    toggleDevice({ 
      name: device.name, 
      isOn: checked,
      mode: 'manual' // User interaction implies manual override
    });
  };

  const handleModeToggle = () => {
    toggleDevice({
      name: device.name,
      isOn: device.isOn,
      mode: device.mode === 'auto' ? 'manual' : 'auto'
    });
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300",
        device.isOn 
          ? "bg-primary/10 border-primary/30 shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]" 
          : "bg-card/40 border-border shadow-sm hover:border-primary/20"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "p-3 rounded-xl transition-colors duration-300",
          device.isOn ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          <Lightbulb className={cn("w-6 h-6", device.isOn && "fill-current")} />
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge 
            variant="outline" 
            className={cn(
              "font-mono text-[10px] uppercase tracking-wider cursor-pointer transition-colors",
              device.mode === 'auto' 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" 
                : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
            )}
            onClick={handleModeToggle}
          >
            {isPending ? <RefreshCw className="w-3 h-3 animate-spin mr-1 inline" /> : null}
            {device.mode}
          </Badge>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-foreground mb-1">{device.name}</h4>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {device.isOn ? "Active" : "Inactive"}
          </span>
          <Switch 
            checked={device.isOn}
            onCheckedChange={handleToggle}
            disabled={isPending}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </div>
    </motion.div>
  );
}
