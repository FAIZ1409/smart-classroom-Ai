import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// Logs every time occupancy changes or periodic snapshots
export const occupancyLogs = pgTable("occupancy_logs", {
  id: serial("id").primaryKey(),
  occupancyCount: integer("occupancy_count").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Stores the current state of devices (simulated hardware)
export const deviceStates = pgTable("device_states", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // e.g., "Main Light", "AC"
  isOn: boolean("is_on").default(false).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  mode: text("mode").default("auto").notNull(), // 'auto' or 'manual'
});

// System configuration
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(), // e.g., "timeout_seconds"
  value: text("value").notNull(),
  description: text("description"),
});

// === SCHEMAS ===

export const insertOccupancyLogSchema = createInsertSchema(occupancyLogs).omit({ id: true, timestamp: true });
export const insertDeviceStateSchema = createInsertSchema(deviceStates).omit({ id: true, lastUpdated: true });
export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({ id: true });

// === TYPES ===

export type OccupancyLog = typeof occupancyLogs.$inferSelect;
export type InsertOccupancyLog = z.infer<typeof insertOccupancyLogSchema>;

export type DeviceState = typeof deviceStates.$inferSelect;
export type InsertDeviceState = z.infer<typeof insertDeviceStateSchema>;

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;

// API Payloads
export type UpdateOccupancyRequest = { count: number };
export type ToggleDeviceRequest = { isOn: boolean; mode?: 'auto' | 'manual' };
