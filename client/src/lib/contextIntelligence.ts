/**
 * DISHA Context Intelligence Engine
 * Connects Guest Context + Property State + Environment Radar + AI Rules
 */

import { DemoContext, Place, ServiceTicketCategory, places } from "./travelData";

export type GuestContext = {
  id: string;
  name: string;
  roomNumber: string;
  preferences: {
    dietary: string[];
    roomTemperature: number;
    pillowType: string;
    quietHours: boolean;
    interests: string[];
  };
  accessibilityNeeds: string[];
  stayStage: "Check-in Day" | "Mid-Stay" | "Check-out Day";
  stayDates: { checkIn: string; checkOut: string };
  currentLocation?: { lat: number; lng: number; locationName: string; isOutdoor: boolean };
};

export type PropertyContext = {
  occupancyPct: number;
  totalRooms: number;
  occupiedRooms: number;
  expectedArrivalsToday: number;
  pendingArrivals: number;
  expectedDeparturesToday: number;
  pendingDepartures: number;
  openServiceRequests: number;
  highPriorityRequests: number;
  activeIncidentsCount: number;
  staffWorkloadIndex: number; // 0 - 100
};

export type EnvironmentContext = {
  weatherCondition: "Clear" | "Partly Cloudy" | "Moderate Rain" | "Heavy Rain" | "Extreme Heat";
  temperatureC: number;
  rainProbabilityPct: number;
  trafficDensity: "Low" | "Moderate" | "Heavy" | "Severe Bypass Active";
  crowdIndex: number; // 0 - 100
  localEvents: string[];
  activeAlerts: string[];
};

export type NormalizedContext = {
  timestamp: string;
  guest: GuestContext;
  property: PropertyContext;
  environment: EnvironmentContext;
  timeContext: {
    hour: number;
    minute: number;
    timeOfDay: "Morning" | "Afternoon" | "Evening" | "Night";
  };
};

/** Default active normalized context generator */
export function getNormalizedContext(demoCtx: DemoContext): NormalizedContext {
  const dateNow = new Date();
  const hour = dateNow.getHours();
  const minute = dateNow.getMinutes();

  const timeOfDay =
    hour >= 6 && hour < 12
      ? "Morning"
      : hour >= 12 && hour < 17
      ? "Afternoon"
      : hour >= 17 && hour < 22
      ? "Evening"
      : "Night";

  const isRain = demoCtx.weather === "Heavy Rain";

  return {
    timestamp: dateNow.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    guest: {
      id: "gst-408",
      name: "Aarav Sharma",
      roomNumber: "204",
      preferences: {
        dietary: ["Vegetarian", "Gluten-Sensitive"],
        roomTemperature: 22,
        pillowType: "Hypoallergenic Foam",
        quietHours: true,
        interests: ["Heritage Architecture", "Local Handicrafts", "Sunset Views", "Wellness Spa"],
      },
      accessibilityNeeds: ["Elevator preferred", "Pre-arranged transport for excursions"],
      stayStage: "Mid-Stay",
      stayDates: { checkIn: "Oct 24, 2026", checkOut: "Oct 28, 2026" },
      currentLocation: {
        lat: 26.9855,
        lng: 75.8513,
        locationName: "Amber Fort Courtyard",
        isOutdoor: true,
      },
    },
    property: {
      occupancyPct: demoCtx.crowd === "Low" ? 45 : demoCtx.crowd === "High" ? 82 : 92,
      totalRooms: 200,
      occupiedRooms: Math.round(((demoCtx.crowd === "Low" ? 45 : 82) / 100) * 200),
      expectedArrivalsToday: 28,
      pendingArrivals: 14,
      expectedDeparturesToday: 19,
      pendingDepartures: 5,
      openServiceRequests: 12,
      highPriorityRequests: 3,
      activeIncidentsCount: demoCtx.disasterAlert || isRain ? 2 : 0,
      staffWorkloadIndex: isRain ? 78 : 54,
    },
    environment: {
      weatherCondition: isRain ? "Heavy Rain" : "Clear",
      temperatureC: 28,
      rainProbabilityPct: isRain ? 85 : 10,
      trafficDensity: isRain ? "Severe Bypass Active" : "Moderate",
      crowdIndex: 88,
      localEvents: ["Jaipur Heritage Craft Fair at City Palace"],
      activeAlerts: isRain ? ["Heavy Rain Flash Flood Alert — NH-11 Bypass Active"] : [],
    },
    timeContext: {
      hour,
      minute,
      timeOfDay,
    },
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// 1. RANKED RECOMMENDATION ENGINE WITH EXPLAINABILITY
// ──────────────────────────────────────────────────────────────────────────────

export type RankedRecommendation = {
  placeId: string;
  title: string;
  category: string;
  score: number;
  whyRecommended: string;
  factorsConsidered: string[];
  confidence: number; // 0-1
  isRainSafe: boolean;
};

export function getRankedRecommendations(
  ctx: NormalizedContext,
  allPlaces: Place[] = places
): RankedRecommendation[] {
  const isRainy = ctx.environment.weatherCondition === "Heavy Rain" || ctx.environment.rainProbabilityPct > 60;
  const guestInterests = ctx.guest.preferences.interests.map((i) => i.toLowerCase());

  return allPlaces.map((place) => {
    let score = place.score; // Base quality score (0-100)
    const factors: string[] = [];

    // 1. Guest Interest Match
    const matchesInterest = guestInterests.some((int) =>
      place.description.toLowerCase().includes(int) ||
      place.category.toLowerCase().includes(int) ||
      place.name.toLowerCase().includes(int)
    );

    if (matchesInterest) {
      score += 12;
      factors.push(`Heritage & culture interest match (+12)`);
    }

    // 2. Weather Sensitivity
    const isStepwellOrFort = place.name.includes("Stepwell") || place.name.includes("Fort") || place.name.includes("Outdoor");
    const isRainSafe = !isStepwellOrFort;

    if (isRainy && isStepwellOrFort) {
      score -= 30;
      factors.push(`Outdoor spot penalized due to ${ctx.environment.weatherCondition} (-30)`);
    } else if (isRainy && isRainSafe) {
      score += 15;
      factors.push(`Covered indoor experience recommended for rain (+15)`);
    } else {
      factors.push(`Favorable weather window for outdoor visit (+8)`);
      score += 8;
    }

    // 3. Time of Day Fit
    if (ctx.timeContext.timeOfDay === "Afternoon" && place.bestFor.toLowerCase().includes("afternoon")) {
      score += 10;
      factors.push(`Ideal afternoon time window (+10)`);
    }

    // Normalize final score
    const finalScore = Math.min(99, Math.max(40, score));

    return {
      placeId: place.id,
      title: place.name,
      category: place.category,
      score: finalScore,
      whyRecommended: `${place.name} matches ${matchesInterest ? "guest heritage interests" : "curated stay path"} with ${isRainy ? "rain-safe coverage" : "favorable weather window"}.`,
      factorsConsidered: factors,
      confidence: Math.round((0.85 + (matchesInterest ? 0.08 : 0)) * 100) / 100,
      isRainSafe,
    };
  }).sort((a, b) => b.score - a.score);
}

// ──────────────────────────────────────────────────────────────────────────────
// 2. DEMAND PREDICTION ENGINE
// ──────────────────────────────────────────────────────────────────────────────

export type ServiceDemandPrediction = {
  timeWindow: string;
  category: ServiceTicketCategory;
  predictedDemand: number; // Expected count
  confidencePct: number;
  reasoning: string;
  contributingFactors: string[];
};

export function predictPropertyDemand(ctx: NormalizedContext): ServiceDemandPrediction[] {
  const isRain = ctx.environment.weatherCondition === "Heavy Rain" || ctx.environment.rainProbabilityPct > 60;

  return [
    {
      timeWindow: "18:00 – 20:00",
      category: "Room Service",
      predictedDemand: isRain ? 40 : 22,
      confidencePct: isRain ? 92 : 84,
      reasoning: isRain
        ? "Rain forecast at 17:30 forces guest transition from outdoor dining terrace to in-room dining."
        : "Standard evening dinner dining peak hour.",
      contributingFactors: [
        isRain ? "Heavy rain alert at 17:30 (85% prob)" : "Normal clear weather",
        "82% property occupancy (164 occupied rooms)",
        "Peak dinner dining window (18:00 - 20:00)",
      ],
    },
    {
      timeWindow: "16:30 – 18:00",
      category: "Transport",
      predictedDemand: isRain ? 25 : 12,
      confidencePct: isRain ? 94 : 81,
      reasoning: isRain
        ? "12 excursion guests returning from Amber Fort & City Palace prior to rainfall."
        : "Standard afternoon excursion return shuttles.",
      contributingFactors: [
        "12 guests currently registered outside at Amber Fort",
        "NH-11 Bypass congestion active (+18m delay)",
        "4 pending transport pre-requests",
      ],
    },
    {
      timeWindow: "11:00 – 13:00",
      category: "Housekeeping",
      predictedDemand: 18,
      confidencePct: 88,
      reasoning: "Mid-day checkout room turnover & mid-stay towel replenishment.",
      contributingFactors: [
        "19 expected departures (14 already completed)",
        "14 expected arrivals pending key handover",
        "Guest linen requests peak after morning excursions",
      ],
    },
    {
      timeWindow: "14:00 – 16:00",
      category: "Maintenance",
      predictedDemand: isRain ? 6 : 10,
      confidencePct: 85,
      reasoning: "Peak ambient temperature reading (28°C) causing high HVAC cooling load.",
      contributingFactors: [
        "28°C afternoon ambient heat",
        "82% occupancy with active in-room climate control",
        "1 open AC calibration request in Room 318",
      ],
    },
  ];
}

// ──────────────────────────────────────────────────────────────────────────────
// 3. RISK & CONTEXT SIGNAL ENGINE
// ──────────────────────────────────────────────────────────────────────────────

export type ContextRiskSignal = {
  level: "Low" | "Moderate" | "High" | "Critical";
  signalTitle: string;
  summary: string;
  contributingFactors: { factor: string; impact: "High" | "Medium" | "Low" }[];
  suggestedActions: string[];
  lastUpdated: string;
};

export function computeRiskSignal(ctx: NormalizedContext): ContextRiskSignal {
  const isRain = ctx.environment.weatherCondition === "Heavy Rain" || ctx.environment.rainProbabilityPct > 60;
  const isDisaster = ctx.environment.activeAlerts.length > 0;

  if (isDisaster || isRain) {
    return {
      level: isDisaster ? "High" : "Moderate",
      signalTitle: "WEATHER SHIFT & EXCURSION MOBILITY SIGNAL",
      summary: "Impending heavy rainfall (17:30–19:30) combining with 12 guests outdoors and NH-11 bypass traffic congestion.",
      contributingFactors: [
        { factor: "Heavy Rainfall Alert 17:30–19:30 (85% prob)", impact: "High" },
        { factor: "12 guests currently outside at Amber Fort / Stepwell", impact: "High" },
        { factor: "4 pre-scheduled transport requests near rain window", impact: "Medium" },
        { factor: "NH-11 Bypass road congestion (+18 min transit delay)", impact: "Medium" },
      ],
      suggestedActions: [
        "Stage 3 covered SUV shuttles at Amber Fort lower parking gate",
        "Prepare lobby warm beverage & dry towel welcome station",
        "Re-route airport transfers via elevated Link Road Bypass",
      ],
      lastUpdated: ctx.timestamp,
    };
  }

  return {
    level: "Low",
    signalTitle: "NORMAL OPERATIONAL STATE",
    summary: "Clear weather, smooth property flow, and all service metrics operating within normal SLA thresholds.",
    contributingFactors: [
      { factor: "Clear skies (28°C ambient temperature)", impact: "Low" },
      { factor: "Occupancy at 82% with balanced staff workload", impact: "Low" },
      { factor: "All open service requests assigned and within SLA", impact: "Low" },
    ],
    suggestedActions: [
      "Maintain standard resort operations & guest concierge availability",
    ],
    lastUpdated: ctx.timestamp,
  };
}
