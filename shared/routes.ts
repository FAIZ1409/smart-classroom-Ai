import { z } from 'zod';
import { occupancyLogs, deviceStates, systemSettings } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  occupancy: {
    log: {
      method: 'POST' as const,
      path: '/api/occupancy',
      input: z.object({ count: z.number().min(0) }),
      responses: {
        200: z.object({
          message: z.string(),
          automationTriggered: z.boolean(),
          newLightState: z.boolean().optional(),
        }),
      },
    },
    history: {
      method: 'GET' as const,
      path: '/api/occupancy/history',
      responses: {
        200: z.array(z.custom<typeof occupancyLogs.$inferSelect>()),
      },
    },
    analytics: {
      method: 'GET' as const,
      path: '/api/occupancy/analytics',
      responses: {
        200: z.array(z.object({
          hour: z.string(),
          averageOccupancy: z.number(),
          peakOccupancy: z.number()
        })),
      },
    }
  },
  devices: {
    list: {
      method: 'GET' as const,
      path: '/api/devices',
      responses: {
        200: z.array(z.custom<typeof deviceStates.$inferSelect>()),
      },
    },
    toggle: {
      method: 'POST' as const,
      path: '/api/devices/:name/toggle',
      input: z.object({ isOn: z.boolean(), mode: z.enum(['auto', 'manual']).optional() }),
      responses: {
        200: z.custom<typeof deviceStates.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  settings: {
    list: {
      method: 'GET' as const,
      path: '/api/settings',
      responses: {
        200: z.array(z.custom<typeof systemSettings.$inferSelect>()),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/settings/:key',
      input: z.object({ value: z.string() }),
      responses: {
        200: z.custom<typeof systemSettings.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
