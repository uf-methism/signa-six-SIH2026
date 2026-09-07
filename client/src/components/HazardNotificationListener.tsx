/**
 * HazardNotificationListener.tsx
 * Global zero-UI component that polls /api/incidents every 30s.
 * When a new incident appears, it fires a Sonner toast with action CTAs.
 */
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const POLL_INTERVAL_MS = 30_000;
const CATEGORY_ICONS: Record<string, string> = {
  Flooding: "🌊",
  Landslide: "⛰️",
  "Road Blocked": "🚧",
  "Extreme Weather": "⛈️",
  "Power Failure": "⚡",
  Trapped: "🆘",
  "Unsafe Area": "⚠️",
  Other: "📢",
};

export function HazardNotificationListener() {
  const seenIdsRef = useRef<Set<string>>(new Set());
  const isFirstFetchRef = useRef(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    async function fetchAndNotify() {
      try {
        const res = await fetch("/api/incidents");
        if (!res.ok) return;
        const data = await res.json();
        const incidents: Array<{ id: string; category: string; location: string; severity?: string }> =
          Array.isArray(data) ? data : data.incidents ?? [];

        // On first fetch, just populate the seen set — don't toast for existing incidents
        if (isFirstFetchRef.current) {
          incidents.forEach((i) => seenIdsRef.current.add(i.id));
          isFirstFetchRef.current = false;
          return;
        }

        // Notify for any new incident not previously seen
        incidents.forEach((incident) => {
          if (!seenIdsRef.current.has(incident.id)) {
            seenIdsRef.current.add(incident.id);

            const icon = CATEGORY_ICONS[incident.category] ?? "⚠️";
            const severityLabel = incident.severity ? ` · ${incident.severity}` : "";

            toast.error(
              `${icon} CRITICAL SAFETY ALERT`,
              {
                description: `New Hazard Reported: ${incident.category}${severityLabel} near ${incident.location}`,
                duration: 12000,
                action: {
                  label: "View Hazard Details",
                  onClick: () => setLocation("/disaster"),
                },
              }
            );
          }
        });
      } catch {
        // Silently ignore network errors — this is a background listener
      }
    }

    // Initial fetch
    fetchAndNotify();

    const interval = setInterval(fetchAndNotify, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [setLocation]);

  return null;
}
