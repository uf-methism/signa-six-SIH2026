/**
 * DISHA Environmental Intelligence Adapters
 * Clean interface adapters for Weather, Traffic, Crowd Context, Local Events,
 * and Property Incidents, ready for live API connections.
 */

export type WeatherData = {
  condition: "Clear" | "Partly Cloudy" | "Moderate Rain" | "Heavy Rain" | "Extreme Heat";
  temperatureC: number;
  rainProbabilityPct: number;
  expectedRainWindow?: string;
  isAdvisoryActive: boolean;
  advisoryText?: string;
  source: string;
};

export type TrafficData = {
  congestionLevel: "Low" | "Moderate" | "Heavy" | "Severe";
  affectedRoutes: { routeName: string; delayMinutes: number; bypassAvailable: boolean }[];
  advisory: string;
  source: string;
};

export type CrowdData = {
  locationName: string;
  crowdDensityPct: number; // 0-100
  trend: "Increasing" | "Stable" | "Decreasing";
  recommendation: string;
};

export type LocalEventData = {
  id: string;
  title: string;
  location: string;
  trafficImpact: string;
  timeWindow: string;
};

export type PropertyIncidentData = {
  id: string;
  time: string;
  location: string;
  category: "Weather / Flood" | "HVAC / Maintenance" | "Mobility Delay" | "Guest Security" | "Other";
  severity: "Low" | "Medium" | "High" | "Critical";
  description: string;
  source: "Environmental Radar" | "Guest Report" | "Staff Dispatch";
  status: "New" | "Acknowledged" | "Investigating" | "Resolved" | "Closed";
  assignedStaff: string;
  evidence?: string;
};

/** Mock Environmental Adapters (Prototype / Demo Data) */
export const EnvironmentalAdapters = {
  getWeather: async (): Promise<WeatherData> => {
    return {
      condition: "Heavy Rain",
      temperatureC: 28,
      rainProbabilityPct: 85,
      expectedRainWindow: "17:30 – 19:30",
      isAdvisoryActive: true,
      advisoryText: "Heavy rainfall expected around 6 PM. Flash rain runoff possible near low-lying Amer Valley roads.",
      source: "Jaipur Meteorological Radar Adapter [DEMO DATA]",
    };
  },

  getTraffic: async (): Promise<TrafficData> => {
    return {
      congestionLevel: "Heavy",
      affectedRoutes: [
        { routeName: "Amer Valley Road (Old Pass)", delayMinutes: 18, bypassAvailable: fontBypass() },
        { routeName: "City Palace Precinct Pass", delayMinutes: 12, bypassAvailable: true },
      ],
      advisory: "Amer Valley Road experiencing high tourist bus congestion. Pre-route shuttles via elevated Link Road.",
      source: "Jaipur Mobility Traffic Adapter [DEMO DATA]",
    };

    function fontBypass() { return true; }
  },

  getCrowd: async (): Promise<CrowdData[]> => {
    return [
      { locationName: "Amber Fort Grounds", crowdDensityPct: 88, trend: "Stable", recommendation: "Visit before 16:30 prior to rain shift." },
      { locationName: "Panna Meena Stepwell", crowdDensityPct: 42, trend: "Decreasing", recommendation: "Quiet walk window available." },
      { locationName: "City Palace Bazaars", crowdDensityPct: 75, trend: "Increasing", recommendation: "Craft fair traffic active." },
    ];
  },

  getLocalEvents: async (): Promise<LocalEventData[]> => {
    return [
      {
        id: "evt-01",
        title: "Jaipur Heritage Craft Fair",
        location: "City Palace Precinct",
        trafficImpact: "Traffic diversion on Jaleb Chowk",
        timeWindow: "10:00 – 20:00",
      },
    ];
  },

  getInitialIncidents: (): PropertyIncidentData[] => {
    return [
      {
        id: "inc-101",
        time: "14:15",
        location: "Amer Valley Road / Gate 2",
        category: "Weather / Flood",
        severity: "High",
        description: "Heavy rain runoff forecast near Amer lower parking. 12 resort guests outside requiring return transport.",
        source: "Environmental Radar",
        status: "Acknowledged",
        assignedStaff: "Driver Vikram",
        evidence: "Radar signal & shuttle GPS logs",
      },
      {
        id: "inc-102",
        time: "13:50",
        location: "Room 318",
        category: "HVAC / Maintenance",
        severity: "Medium",
        description: "AC cooling efficiency degraded; temperature reading 26°C, target 22°C.",
        source: "Guest Report",
        status: "Investigating",
        assignedStaff: "Technician Rajesh",
        evidence: "Digital thermostat telemetry",
      },
    ];
  },
};
