import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { VisionProcessor } from "@/components/VisionProcessor";
import { MetricCard } from "@/components/MetricCard";
import { DeviceCard } from "@/components/DeviceCard";
import { OccupancyChart } from "@/components/OccupancyChart";
import { ActivityLog } from "@/components/ActivityLog";
import { useDevices } from "@/hooks/use-devices";
import { useSettings, useUpdateSetting } from "@/hooks/use-settings";
import { Users, Zap, Settings, Activity } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Dashboard() {
  const [currentOccupancy, setCurrentOccupancy] = useState(0);
  const { data: devices } = useDevices();
  const { data: settings } = useSettings();
  const { mutate: updateSetting } = useUpdateSetting();
  
  // Derived state
  const mainLight = devices?.find(d => d.name === "Main Light");
  const activeDevicesCount = devices?.filter(d => d.isOn).length || 0;

  const handleTimeoutChange = (value: number[]) => {
    updateSetting({ key: "timeout_seconds", value: String(value[0]) });
  };

  const timeoutValue = settings?.find(s => s.key === "timeout_seconds")?.value 
    ? parseInt(settings.find(s => s.key === "timeout_seconds")!.value) 
    : 30;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-foreground p-4 md:p-8 font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-background to-background">
      
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Smart Room AI
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            System Online • Intelligent Automation Active
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/5">
              <Settings className="w-4 h-4" />
              Configuration
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10 text-foreground">
            <DialogHeader>
              <DialogTitle>System Settings</DialogTitle>
            </DialogHeader>
            <div className="py-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Auto-off Timeout (seconds)</Label>
                  <span className="font-mono text-sm text-primary">{timeoutValue}s</span>
                </div>
                <Slider 
                  defaultValue={[timeoutValue]} 
                  max={300} 
                  step={5}
                  onValueCommit={handleTimeoutChange}
                  className="py-4"
                />
                <p className="text-xs text-muted-foreground">
                  Time to wait before turning off lights after occupancy drops to 0.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Metrics Row */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard 
            title="Real-time Occupancy" 
            value={currentOccupancy} 
            icon={<Users className="w-6 h-6 text-primary" />}
            trend={currentOccupancy > 0 ? "Detected" : "Empty"}
            trendUp={currentOccupancy > 0}
            color="primary"
          />
          <MetricCard 
            title="Main Light Status" 
            value={mainLight?.isOn ? "ON" : "OFF"} 
            icon={<Zap className={cn("w-6 h-6", mainLight?.isOn ? "text-yellow-400" : "text-muted-foreground")} />}
            color={mainLight?.isOn ? "secondary" : "accent"}
          />
          <MetricCard 
            title="Active Devices" 
            value={activeDevicesCount} 
            icon={<Activity className="w-6 h-6 text-emerald-400" />}
            color="secondary"
          />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* Vision Feed */}
          <section className="bg-card/30 rounded-3xl p-1 border border-white/5 shadow-2xl">
            <VisionProcessor onOccupancyChange={setCurrentOccupancy} />
          </section>

          {/* Charts Area */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[300px]">
            <OccupancyChart />
            <ActivityLog />
          </section>
        </div>

        {/* Right Sidebar - Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-white/5 bg-card/20 backdrop-blur-xl p-6 h-full">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Device Controls
            </h2>
            
            <div className="space-y-4">
              {devices?.map((device) => (
                <DeviceCard key={device.id} device={device} />
              ))}
              
              {!devices?.length && (
                <div className="text-center p-8 text-muted-foreground border border-dashed border-white/10 rounded-xl">
                  Loading devices...
                </div>
              )}
            </div>

            <div className="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <h4 className="text-sm font-semibold text-blue-200 mb-2">Automation Logic</h4>
              <ul className="text-xs text-blue-200/70 space-y-2 list-disc pl-4">
                <li>Lights turn ON when person detected</li>
                <li>Lights turn OFF after {timeoutValue}s of no occupancy</li>
                <li>Manual override disables auto-logic temporarily</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
