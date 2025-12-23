import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { UpdateOccupancyRequest } from "@shared/schema";

export function useOccupancyHistory() {
  return useQuery({
    queryKey: [api.occupancy.history.path],
    queryFn: async () => {
      const res = await fetch(api.occupancy.history.path);
      if (!res.ok) throw new Error("Failed to fetch history");
      return api.occupancy.history.responses[200].parse(await res.json());
    },
    refetchInterval: 5000, // Poll every 5s for updates
  });
}

export function useOccupancyAnalytics() {
  return useQuery({
    queryKey: [api.occupancy.analytics.path],
    queryFn: async () => {
      const res = await fetch(api.occupancy.analytics.path);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return api.occupancy.analytics.responses[200].parse(await res.json());
    },
    refetchInterval: 30000,
  });
}

export function useUpdateOccupancy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateOccupancyRequest) => {
      const validated = api.occupancy.log.input.parse(data);
      const res = await fetch(api.occupancy.log.path, {
        method: api.occupancy.log.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      if (!res.ok) throw new Error("Failed to log occupancy");
      return api.occupancy.log.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.occupancy.history.path] });
      queryClient.invalidateQueries({ queryKey: [api.devices.list.path] }); // Lights might have changed
    },
  });
}
