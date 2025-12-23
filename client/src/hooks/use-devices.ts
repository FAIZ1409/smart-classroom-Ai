import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { ToggleDeviceRequest } from "@shared/schema";

export function useDevices() {
  return useQuery({
    queryKey: [api.devices.list.path],
    queryFn: async () => {
      const res = await fetch(api.devices.list.path);
      if (!res.ok) throw new Error("Failed to fetch devices");
      return api.devices.list.responses[200].parse(await res.json());
    },
    refetchInterval: 1000, // Poll frequently for real-time status
  });
}

export function useToggleDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, ...data }: { name: string } & ToggleDeviceRequest) => {
      const validated = api.devices.toggle.input.parse(data);
      const url = buildUrl(api.devices.toggle.path, { name });
      const res = await fetch(url, {
        method: api.devices.toggle.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("Device not found");
        throw new Error("Failed to toggle device");
      }
      return api.devices.toggle.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.devices.list.path] });
    },
  });
}
