import express, { type Request, type Response } from "express";

export const apiRouter = express.Router();

export type DemoContext = {
  time: "Morning" | "Sunset" | "Night" | "Rain";
  weather: "Clear" | "Heavy Rain";
  crowd: "Low" | "High" | "Peak";
  location: string;
  alert: boolean;
};

export type Place = {
  id: string;
  name: string;
  category: "POPULAR / MUST VISIT" | "HIDDEN GEM" | "LOCAL FAVORITE" | "TRENDING" | "ALTERNATIVE";
  neighborhood: string;
  description: string;
  image: string;
  score: number;
  quality: number;
  localRelevance: number;
  uniqueness: number;
  accessibility: number;
  crowding: number;
  duration: string;
  bestFor: string;
  signal: string;
  lat: number;
  lng: number;
  openHours: { open: number; close: number };
  trending: boolean;
};

export type Incident = {
  id: string;
  type: "Hazard" | "Harassment" | "Medical";
  description: string;
  lat: number;
  lng: number;
  location: string;
  timestamp: string;
};

// In-memory incidents storage for demo
const mockIncidents: Incident[] = [
  {
    id: "inc-1",
    type: "Hazard",
    description: "Road construction near Amer Fort lower gates causing narrow pedestrian walkway.",
    lat: 26.9850,
    lng: 75.8510,
    location: "Amer Fort Approach",
    timestamp: new Date().toISOString(),
  },
];

const mockPlaces: Place[] = [
  {
    id: "amber-fort",
    name: "Amber Fort",
    category: "POPULAR / MUST VISIT",
    neighborhood: "Amer",
    description: "Honey-colored courtyards, mirror work, and a dramatic hilltop arrival.",
    image: "/manus-storage/travel-guardian-hero_e964d97a.jpg",
    score: 91,
    quality: 29,
    localRelevance: 18,
    uniqueness: 17,
    accessibility: 15,
    crowding: 12,
    duration: "2–3 hrs",
    bestFor: "First visit",
    signal: "Arrive before 10:00 for softer light and fewer reported bottlenecks.",
    lat: 26.9855,
    lng: 75.8513,
    openHours: { open: 8, close: 18 },
    trending: true,
  },
  {
    id: "panna-meena",
    name: "Panna Meena Stepwell",
    category: "HIDDEN GEM",
    neighborhood: "Amer village",
    description: "A geometric stepwell with quiet corners just beyond the fort route.",
    image: "/manus-storage/travel-guardian-courtyard_0967ebc2.jpg",
    score: 84,
    quality: 24,
    localRelevance: 19,
    uniqueness: 19,
    accessibility: 12,
    crowding: 10,
    duration: "45 min",
    bestFor: "Slow explorers",
    signal: "Lower crowd signal this morning; access conditions are not verified live.",
    lat: 26.9876,
    lng: 75.8484,
    openHours: { open: 6, close: 19 },
    trending: false,
  },
  {
    id: "ramganj",
    name: "Ramganj Bazaar Walk",
    category: "LOCAL FAVORITE",
    neighborhood: "Old City",
    description: "A textured evening loop for bangles, kachori, and everyday Jaipur rhythms.",
    image: "/manus-storage/travel-guardian-market_24a268ea.jpg",
    score: 79,
    quality: 21,
    localRelevance: 22,
    uniqueness: 16,
    accessibility: 10,
    crowding: 10,
    duration: "1.5 hrs",
    bestFor: "Food + craft",
    signal: "Choose the brighter main-road variant after sunset based on available signals.",
    lat: 26.9196,
    lng: 75.8235,
    openHours: { open: 9, close: 22 },
    trending: true,
  },
  {
    id: "jal-mahal",
    name: "Jal Mahal Viewpoint",
    category: "ALTERNATIVE",
    neighborhood: "Man Sagar Lake",
    description: "A pause beside the lake with a clean sightline to the palace in the water.",
    image: "/manus-storage/travel-guardian-lake_a421a170.jpg",
    score: 76,
    quality: 20,
    localRelevance: 16,
    uniqueness: 16,
    accessibility: 14,
    crowding: 10,
    duration: "35 min",
    bestFor: "Golden hour",
    signal: "Best light window in 42 minutes; lakeside conditions are demo data.",
    lat: 26.9534,
    lng: 75.8462,
    openHours: { open: 0, close: 24 },
    trending: false,
  },
];

const mockAuthorities = [
  { label: "Police Hotline", number: "112", note: "National Emergency Response System" },
  { label: "Ambulance", number: "108", note: "Emergency Medical Services" },
  { label: "Fire Department", number: "101", note: "Fire & Rescue Services" },
  { label: "Tourist Helpline", number: "1363", note: "24x7 Multi-lingual Tourist Assistance" },
];

/** Helper to compute Discovery Score based on place + context */
function computeDiscoveryScore(place: Place, time?: string, crowd?: string, weather?: string): number {
  let score = place.quality + place.localRelevance + place.uniqueness + place.accessibility;

  // Crowding impact
  let crowdingPenalty = place.crowding;
  if (crowd === "Peak") crowdingPenalty += 8;
  if (crowd === "High") crowdingPenalty += 4;
  if (crowd === "Low") crowdingPenalty -= 2;
  score -= Math.max(0, crowdingPenalty);

  // Weather & time adjustments
  if (weather === "Heavy Rain" || time === "Rain") {
    if (place.id === "jal-mahal" || place.id === "panna-meena") {
      score -= 10; // Outdoor stepwell / lake viewpoint slippery during rain
    } else {
      score += 5; // Indoor heritage site boost
    }
  }

  if (time === "Night") {
    if (place.id === "ramganj") score += 6; // Markets lit up
    if (place.id === "amber-fort") score += 4; // Sound and light show
  }

  return Math.min(100, Math.max(40, score));
}

/* ─────────────────────────────────────────────────────────────
 * GET /api/places?category=...&classification=...
 * Returns filtered places with computed Discovery Scores.
 * ───────────────────────────────────────────────────────────── */
apiRouter.get("/places", (req: Request, res: Response) => {
  const { category, classification, time, crowd, weather } = req.query;

  let result = mockPlaces.map((p) => {
    const computedScore = computeDiscoveryScore(
      p,
      time as string | undefined,
      crowd as string | undefined,
      weather as string | undefined
    );
    return { ...p, score: computedScore };
  });

  // Filter by category
  if (category && typeof category === "string" && category !== "All places") {
    const catLower = category.toLowerCase();
    result = result.filter((p) => p.category.toLowerCase().includes(catLower));
  }

  // Filter by classification (e.g. "must-visit", "hidden-gem", "trending", "good-right-now")
  if (classification && typeof classification === "string") {
    const classLower = classification.toLowerCase();
    if (classLower === "must-visit" || classLower === "popular") {
      result = result.filter((p) => p.category.includes("POPULAR"));
    } else if (classLower === "hidden-gem") {
      result = result.filter((p) => p.category.includes("HIDDEN"));
    } else if (classLower === "local-favorite") {
      result = result.filter((p) => p.category.includes("LOCAL"));
    } else if (classLower === "trending") {
      result = result.filter((p) => p.trending);
    } else if (classLower === "good-right-now") {
      result = result.filter((p) => p.score >= 75);
    }
  }

  // Sort descending by score
  result.sort((a, b) => b.score - a.score);

  res.json({
    success: true,
    count: result.length,
    places: result,
  });
});

/* ─────────────────────────────────────────────────────────────
 * POST /api/planner/generate
 * Accepts { hours: number, interests: string[], time?: string, crowd?: string, weather?: string }
 * Returns structured chronological itinerary object.
 * ───────────────────────────────────────────────────────────── */
apiRouter.post("/planner/generate", (req: Request, res: Response) => {
  const { hours = 4, interests = [], time = "Morning", crowd = "Low", weather = "Clear" } = req.body || {};

  const numericHours = Math.max(2, Math.min(12, Number(hours) || 4));
  const isNight = time === "Night";
  const isRainy = weather === "Heavy Rain" || time === "Rain";
  const isPeakCrowd = crowd === "Peak" || crowd === "High";

  let firstStop = "Amber Fort Hilltop Complex";
  let firstDetail = "Arrive early for smooth access through Suraj Pol and mirror work courtyard.";
  let firstTag = "START";

  if (isNight) {
    firstStop = "Amber Fort Night View & Sound Show";
    firstDetail = "Well-lit main entrance corridor; avoid secluded ramparts after dusk.";
    firstTag = "SAFE AFTER DARK";
  } else if (isRainy) {
    firstStop = "Indoor Sheesh Mahal & Palace Galleries";
    firstDetail = "Covered heritage courtyards with slip-resistant covered walkways.";
    firstTag = "RAIN SAFE";
  } else if (isPeakCrowd) {
    firstStop = "Panna Meena Stepwell (Lower Crowd Window)";
    firstDetail = "Quieter stepwell alternative before fort tour bus congestion peaks.";
    firstTag = "LOW CROWD";
  }

  let secondStop = "Panna Meena Stepwell & Amer Village";
  let secondDetail = "Short 10-minute walk down to geometric stepwell architecture.";
  if (isNight) {
    secondStop = "Ramganj Main Bazaar Lit Corridor";
    secondDetail = "Stay on main illuminated avenue; lively evening craft market.";
  } else if (isRainy) {
    secondStop = "Amer Heritage Cafe & Crafts Rest Stop";
    secondDetail = "Dry seating with view of lake misty sightlines.";
  }

  let thirdStop = numericHours >= 4 ? "Jal Mahal Lake Viewpoint" : "Local Chai & Artisanal Craft Pause";
  let thirdDetail = numericHours >= 4
    ? "Sunset sightline across Man Sagar lake with safety-aware pathway signal."
    : "Unhurried conclusion near well-frequented taxi hub.";

  const itinerary = [
    {
      step: 1,
      time: isNight ? "18:30" : "09:00",
      title: firstStop,
      detail: firstDetail,
      tag: firstTag,
      location: "Amer, Jaipur",
      safetyNote: isNight ? "Safe After Dark mode active: sticking to illuminated routes." : "Standard daylight safety signal.",
    },
    {
      step: 2,
      time: isNight ? "20:00" : "11:15",
      title: secondStop,
      detail: secondDetail,
      tag: "FLEX",
      location: "Amer / Old City",
      safetyNote: "Clear pedestrian sightlines and active local commerce.",
    },
    {
      step: 3,
      time: isNight ? "21:15" : (numericHours >= 4 ? "14:30" : "12:30"),
      title: thirdStop,
      detail: thirdDetail,
      tag: numericHours >= 4 ? "HIGHLIGHT" : "OPTIONAL",
      location: "Man Sagar Lake",
      safetyNote: "Verified exit point near official transport stand.",
    },
  ];

  if (numericHours >= 6) {
    itinerary.push({
      step: 4,
      time: isNight ? "22:00" : "16:45",
      title: "City Palace Heritage Extension",
      detail: "Courtyard architecture walk with curated artisan workshops.",
      tag: "EXTENDED",
      location: "Old City, Jaipur",
      safetyNote: "Staffed gates and broad paved walkways.",
    });
  }

  res.json({
    success: true,
    hours: numericHours,
    context: { time, crowd, weather },
    interests,
    itinerary,
  });
});

/* ─────────────────────────────────────────────────────────────
 * POST /api/incidents & GET /api/incidents
 * Saves user-submitted safety reports (Hazard, Harassment, Medical) with location metadata.
 * ───────────────────────────────────────────────────────────── */
apiRouter.post("/incidents", (req: Request, res: Response) => {
  const { type = "Hazard", description, lat = 26.9850, lng = 75.8510, location = "Jaipur" } = req.body || {};

  if (!description || typeof description !== "string") {
    res.status(400).json({ success: false, error: "Description is required." });
    return;
  }

  const newIncident: Incident = {
    id: `inc-${Date.now()}`,
    type: (["Hazard", "Harassment", "Medical"].includes(type) ? type : "Hazard") as Incident["type"],
    description: description.trim(),
    lat: Number(lat) || 26.9850,
    lng: Number(lng) || 75.8510,
    location: String(location || "Jaipur"),
    timestamp: new Date().toISOString(),
  };

  mockIncidents.unshift(newIncident);

  res.status(201).json({
    success: true,
    message: "Safety report logged successfully",
    incident: newIncident,
  });
});

apiRouter.get("/incidents", (_req: Request, res: Response) => {
  res.json({
    success: true,
    count: mockIncidents.length,
    incidents: mockIncidents,
  });
});

/* ─────────────────────────────────────────────────────────────
 * POST /api/sos
 * Triggers emergency state logging and returns verified authority phone numbers.
 * ───────────────────────────────────────────────────────────── */
apiRouter.post("/sos", (req: Request, res: Response) => {
  const { lat = 26.9855, lng = 75.8513, note } = req.body || {};

  const sosLog = {
    id: `sos-${Date.now()}`,
    timestamp: new Date().toISOString(),
    status: "ARMED_AND_LOGGED",
    coordinates: { lat: Number(lat), lng: Number(lng) },
    note: note || "SOS press-and-hold triggered by user",
  };

  console.log("[SOS EMERGENCY LOGGED]", sosLog);

  res.json({
    success: true,
    status: "ARMED",
    message: "Emergency state active. Verified emergency contacts and nearby help points loaded.",
    sosLog,
    authorities: mockAuthorities,
    nearbyHelpPoints: [
      { id: "sms-hosp", type: "Hospital", name: "SMS Hospital Jaipur", phone: "108", distance: "4.2 km" },
      { id: "amer-police-stn", type: "Police", name: "Amer Police Station", phone: "112", distance: "2.8 km" },
    ],
  });
});

/* ─────────────────────────────────────────────────────────────
 * POST /api/assistant
 * Deterministic AI assistant integration with structured fallbacks
 * ───────────────────────────────────────────────────────────── */
apiRouter.post("/assistant", (req: Request, res: Response) => {
  const { query = "", hours = 4, context = {} } = req.body || {};
  const lowerQuery = String(query).toLowerCase();

  let responseText = "";
  let structuredItinerary = null;

  if (lowerQuery.includes("5 hour") || lowerQuery.includes("5-hour") || lowerQuery.includes("hours")) {
    responseText = "Here is a structured 5-hour itinerary optimized for daylight, comfort, and local highlights around Jaipur:";
    structuredItinerary = [
      { time: "09:00", title: "Amber Fort Exploration", detail: "Start at the hilltop fort before tourist buses arrive.", tag: "MUST VISIT" },
      { time: "11:30", title: "Panna Meena Stepwell", detail: "Quiet geometric stepwell walk right in Amer village.", tag: "HIDDEN GEM" },
      { time: "12:45", title: "Rajasthani Heritage Lunch", detail: "Shaded traditional thali at local trusted eatery.", tag: "FOOD" },
      { time: "13:45", title: "Jal Mahal Lakeside Pause", detail: "Scenic water palace view before concluding your circuit.", tag: "SCENIC" },
    ];
  } else if (lowerQuery.includes("gem") || lowerQuery.includes("hidden") || lowerQuery.includes("unusual")) {
    responseText = "Jaipur has incredible quiet spots just off the main tourist trail. Here are top recommended hidden gems:";
    structuredItinerary = [
      { time: "10:00", title: "Panna Meena Stepwell", detail: "Symmetrical stepwell steps tucked behind Amer village.", tag: "ARCHITECTURAL" },
      { time: "11:30", title: "Anokhi Museum of Hand Printing", detail: "Restored haveli showcasing block-printed textiles.", tag: "CRAFT" },
      { time: "13:00", title: "Gaitore Ki Chhatriyan", detail: "Royal marble cenotaphs carved in a serene valley basin.", tag: "QUIET" },
    ];
  } else if (lowerQuery.includes("night") || lowerQuery.includes("dark") || lowerQuery.includes("evening") || lowerQuery.includes("safe")) {
    responseText = "Safe After Dark mode recommends well-lit, highly-trafficked main thoroughfares and official heritage spots:";
    structuredItinerary = [
      { time: "18:30", title: "Amber Fort Illuminated Courtyards", detail: "Guided evening tour along brightly lit main paths.", tag: "SAFE AFTER DARK" },
      { time: "20:00", title: "Ramganj Bazaar Main Avenue Walk", detail: "Stick to main commercial street for bangles and sweets.", tag: "LIT ROUTE" },
      { time: "21:15", title: "Hotel / Stay Return via Main Highway", detail: "Pre-arranged verified taxi drop-off point.", tag: "SAFETY CHECK" },
    ];
  } else {
    responseText = `Thanks for asking! Based on your ${hours}-hour availability in Jaipur, I recommend starting early at Amber Fort, continuing down to Panna Meena Stepwell, and catching sunset near Jal Mahal.`;
    structuredItinerary = [
      { time: "09:10", title: "Amber Fort Main Complex", detail: "Explore honey-colored courtyards and Sheesh Mahal.", tag: "START" },
      { time: "11:35", title: "Panna Meena Stepwell Walk", detail: "Geometric stepwell in Amer village.", tag: "FLEX" },
      { time: "13:10", title: "Jal Mahal Lakeside Sightline", detail: "Low-commitment finish by Man Sagar lake.", tag: "FINISH" },
    ];
  }

  res.json({
    success: true,
    query,
    reply: responseText,
    itinerary: structuredItinerary,
    fallback: true,
  });
});

/* ─────────────────────────────────────────────────────────────
 * POST /api/disaster/alerts & GET /api/disaster/alerts
 * Real-time community hazard reporting and official disaster broadcast feed.
 * ───────────────────────────────────────────────────────────── */
export type DisasterAlertItem = {
  id: string;
  category: "Flooding" | "Landslide" | "Road Blocked" | "Extreme Weather" | "Power Failure" | "Unsafe Area" | "Other";
  description: string;
  location: string;
  lat: number;
  lng: number;
  severity: "Low" | "Medium" | "Critical";
  timestamp: string;
  verified: boolean;
  source: "community" | "authority";
  actionAdvice?: string;
  upvotes?: number;
};

const mockDisasterAlerts: DisasterAlertItem[] = [
  {
    id: "auth-001",
    category: "Flooding",
    description: "NDRF Team 4 deployed near Amer Road following flash flood advisory. Road to Amber Fort temporarily closed for private vehicles.",
    location: "Amer Road Corridor, Jaipur",
    lat: 26.9700,
    lng: 75.8400,
    severity: "Critical",
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
    verified: true,
    source: "authority",
    actionAdvice: "Take elevated bypass route via Jhotwara. Pedestrian fort access strictly restricted.",
    upvotes: 42,
  },
  {
    id: "auth-002",
    category: "Road Blocked",
    description: "Jaipur Metropolitan Police barricaded the Nahargarh Hill winding ascent due to loose gravel & heavy mist.",
    location: "Nahargarh Access Road, Aravali Hills",
    lat: 26.9388,
    lng: 75.8160,
    severity: "Medium",
    timestamp: new Date(Date.now() - 28 * 60000).toISOString(),
    verified: true,
    source: "authority",
    actionAdvice: "Use verified shuttle buses or descend to central Old City corridor.",
    upvotes: 28,
  },
  {
    id: "comm-001",
    category: "Flooding",
    description: "Waterlogging near Johari Bazaar underpass (approx 1.5 ft water). Small scooters stalling, avoid low clearance vehicles.",
    location: "Johari Bazaar Underpass",
    lat: 26.9210,
    lng: 75.8250,
    severity: "Medium",
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    verified: false,
    source: "community",
    actionAdvice: "Divert through Chaura Rasta or stay on elevated sidewalks.",
    upvotes: 14,
  },
  {
    id: "comm-002",
    category: "Road Blocked",
    description: "Fallen tree branch near MI Road / Panch Batti signal. Traffic slow-moving in right lane.",
    location: "MI Road, Panch Batti Crossing",
    lat: 26.9124,
    lng: 75.7873,
    severity: "Low",
    timestamp: new Date(Date.now() - 6 * 60000).toISOString(),
    verified: false,
    source: "community",
    actionAdvice: "Keep to left lanes; municipal clearing vehicle on site.",
    upvotes: 9,
  },
];

apiRouter.get("/disaster/alerts", (req: Request, res: Response) => {
  const { source, verified } = req.query;

  let filtered = [...mockDisasterAlerts];

  if (source && (source === "authority" || source === "community")) {
    filtered = filtered.filter((a) => a.source === source);
  }

  if (verified === "true") {
    filtered = filtered.filter((a) => a.verified === true);
  }

  res.json({
    success: true,
    count: filtered.length,
    alerts: filtered,
  });
});

apiRouter.post("/disaster/alerts", (req: Request, res: Response) => {
  const {
    category = "Flooding",
    description,
    location = "Jaipur Hub",
    lat = 26.9124,
    lng = 75.7873,
    severity = "Medium",
    source = "community",
    actionAdvice,
  } = req.body || {};

  if (!description || typeof description !== "string" || description.trim().length === 0) {
    res.status(400).json({ success: false, error: "Report description is required." });
    return;
  }

  const isAuthority = source === "authority";

  const newAlert: DisasterAlertItem = {
    id: `${isAuthority ? "auth" : "comm"}-${Date.now()}`,
    category,
    description: description.trim(),
    location: String(location).trim(),
    lat: Number(lat) || 26.9124,
    lng: Number(lng) || 75.7873,
    severity: ["Low", "Medium", "Critical"].includes(severity) ? severity : "Medium",
    timestamp: new Date().toISOString(),
    verified: isAuthority,
    source: isAuthority ? "authority" : "community",
    actionAdvice: actionAdvice ? String(actionAdvice).trim() : undefined,
    upvotes: 1,
  };

  mockDisasterAlerts.unshift(newAlert);

  res.status(201).json({
    success: true,
    message: isAuthority ? "Official broadcast published successfully." : "Community hazard report submitted and broadcasted live.",
    alert: newAlert,
  });
});
