import { db } from "./db";
import {
  occupancyLogs,
  deviceStates,
  systemSettings,
  type OccupancyLog,
  type InsertOccupancyLog,
  type DeviceState,
  type InsertDeviceState,
  type SystemSetting,
  type InsertSystemSetting
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Occupancy
  logOccupancy(log: InsertOccupancyLog): Promise<OccupancyLog>;
  getOccupancyHistory(limit?: number): Promise<OccupancyLog[]>;
  getOccupancyAnalytics(): Promise<any[]>;

  // Devices
  getDevices(): Promise<DeviceState[]>;
  getDevice(name: string): Promise<DeviceState | undefined>;
  updateDevice(name: string, updates: Partial<InsertDeviceState>): Promise<DeviceState>;
  createDevice(device: InsertDeviceState): Promise<DeviceState>;

  // Settings
  getSettings(): Promise<SystemSetting[]>;
  getSetting(key: string): Promise<SystemSetting | undefined>;
  updateSetting(key: string, value: string): Promise<SystemSetting>;
  createSetting(setting: InsertSystemSetting): Promise<SystemSetting>;
}

export class DatabaseStorage implements IStorage {
  async logOccupancy(log: InsertOccupancyLog): Promise<OccupancyLog> {
    const [entry] = await db.insert(occupancyLogs).values(log).returning();
    return entry;
  }

  async getOccupancyHistory(limit = 100): Promise<OccupancyLog[]> {
    return await db.select()
      .from(occupancyLogs)
      .orderBy(desc(occupancyLogs.timestamp))
      .limit(limit);
  }

  async getOccupancyAnalytics(): Promise<any[]> {
    // Simple hourly analytics
    return await db.execute(sql`
      SELECT 
        to_char(timestamp, 'HH24:00') as hour,
        AVG(occupancy_count)::numeric(10,1) as "averageOccupancy",
        MAX(occupancy_count) as "peakOccupancy"
      FROM occupancy_logs
      WHERE timestamp > NOW() - INTERVAL '24 hours'
      GROUP BY 1
      ORDER BY 1 DESC
    `);
  }

  async getDevices(): Promise<DeviceState[]> {
    return await db.select().from(deviceStates).orderBy(deviceStates.name);
  }

  async getDevice(name: string): Promise<DeviceState | undefined> {
    const [device] = await db.select().from(deviceStates).where(eq(deviceStates.name, name));
    return device;
  }

  async updateDevice(name: string, updates: Partial<InsertDeviceState>): Promise<DeviceState> {
    const [updated] = await db.update(deviceStates)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(deviceStates.name, name))
      .returning();
    return updated;
  }

  async createDevice(device: InsertDeviceState): Promise<DeviceState> {
    const [created] = await db.insert(deviceStates).values(device).returning();
    return created;
  }

  async getSettings(): Promise<SystemSetting[]> {
    return await db.select().from(systemSettings);
  }

  async getSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return setting;
  }

  async updateSetting(key: string, value: string): Promise<SystemSetting> {
    const [updated] = await db.update(systemSettings)
      .set({ value })
      .where(eq(systemSettings.key, key))
      .returning();
    return updated;
  }

  async createSetting(setting: InsertSystemSetting): Promise<SystemSetting> {
    const [created] = await db.insert(systemSettings).values(setting).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
