import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

// Automation State
let lastMotionTime = Date.now();
const AUTOMATION_LOOP_INTERVAL = 1000; // Check every second

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Seed initial data
  await seedDatabase();

  // === ROUTES ===

  // Occupancy Logging & Automation Trigger
  app.post(api.occupancy.log.path, async (req, res) => {
    try {
      const { count } = api.occupancy.log.input.parse(req.body);
      
      // Log the data
      await storage.logOccupancy({ occupancyCount: count });

      // Automation Logic
      let automationTriggered = false;
      let newLightState: boolean | undefined;

      const mainLight = await storage.getDevice("Main Light");
      const timeoutSetting = await storage.getSetting("timeout_seconds");
      const timeoutMs = parseInt(timeoutSetting?.value || "300") * 1000;

      if (mainLight && mainLight.mode === 'auto') {
        if (count > 0) {
          // Person detected -> Lights ON
          lastMotionTime = Date.now();
          if (!mainLight.isOn) {
            await storage.updateDevice("Main Light", { isOn: true });
            newLightState = true;
            automationTriggered = true;
          }
        } else {
          // No person detected -> Check timeout
          if (mainLight.isOn && (Date.now() - lastMotionTime > timeoutMs)) {
            await storage.updateDevice("Main Light", { isOn: false });
            newLightState = false;
            automationTriggered = true;
          }
        }
      }

      res.json({
        message: "Occupancy logged",
        automationTriggered,
        newLightState
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // History & Analytics
  app.get(api.occupancy.history.path, async (req, res) => {
    const history = await storage.getOccupancyHistory();
    res.json(history);
  });

  app.get(api.occupancy.analytics.path, async (req, res) => {
    const analytics = await storage.getOccupancyAnalytics();
    res.json(analytics.rows || analytics); // Handle pg result format
  });

  // Devices
  app.get(api.devices.list.path, async (req, res) => {
    const devices = await storage.getDevices();
    res.json(devices);
  });

  app.post(api.devices.toggle.path, async (req, res) => {
    try {
      const { isOn, mode } = api.devices.toggle.input.parse(req.body);
      const name = req.params.name;
      
      const device = await storage.getDevice(name);
      if (!device) return res.status(404).json({ message: "Device not found" });

      const updated = await storage.updateDevice(name, { isOn, mode });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Settings
  app.get(api.settings.list.path, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.put(api.settings.update.path, async (req, res) => {
    const { value } = api.settings.update.input.parse(req.body);
    const updated = await storage.updateSetting(req.params.key, value);
    if (!updated) return res.status(404).json({ message: "Setting not found" });
    res.json(updated);
  });

  return httpServer;
}

async function seedDatabase() {
  const settings = await storage.getSettings();
  if (settings.length === 0) {
    console.log("Seeding database...");
    await storage.createSetting({ 
      key: "timeout_seconds", 
      value: "10", // Short timeout for demo purposes
      description: "Seconds of inactivity before turning lights off" 
    });
    
    await storage.createDevice({
      name: "Main Light",
      isOn: false,
      mode: "auto"
    });

    await storage.createDevice({
      name: "AC Unit",
      isOn: false,
      mode: "manual" // AC usually manual
    });

    // Seed some history
    for (let i = 0; i < 10; i++) {
      await storage.logOccupancy({ occupancyCount: Math.floor(Math.random() * 3) });
    }
  }
}
