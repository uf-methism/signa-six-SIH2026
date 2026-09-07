/* Civic Calm style: typed demo services keep safety signals explainable and visually calm. */

export type DemoContext = {
  time: "Morning" | "Sunset" | "Night" | "Late Night" | "Rain";
  weather: "Clear" | "Heavy Rain";
  crowd: "Low" | "High" | "Peak";
  location: "Jaipur" | "Amber Fort";
  alert: boolean;
  /** Triggers the global DisasterAlertModal for SIH demo purposes */
  disasterAlert: boolean;
  /** Toggles unverified community reports → verified in the live feed */
  authorityVerified: boolean;
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

export type EmergencyPlace = {
  id: string;
  name: string;
  type: "Hospital" | "Police" | "Shelter";
  lat: number;
  lng: number;
  distance: string;
  signal: string;
};

export type Shelter = {
  id: string;
  name: string;
  type: "Community Center" | "School" | "Government Building" | "Hospital" | "Elevated Zone";
  distance: string;
  lat: number;
  lng: number;
  occupancy: number;
  capacity: number;
  facilities: ("Food" | "Medical" | "Power" | "Water" | "WiFi")[];
  address: string;
  contactNumber: string;
};

export type DisasterReport = {
  id: string;
  category: "Flooding" | "Landslide" | "Road Blocked" | "Extreme Weather" | "Power Failure" | "Trapped" | "Unsafe Area" | "Other";
  description: string;
  location: string;
  lat: number;
  lng: number;
  severity?: "Low" | "Medium" | "Critical";
  timestamp: string;
  verified: boolean;
  source: "community" | "authority";
  actionAdvice?: string;
  upvotes?: number;
};

export type DisasterAuthority = {
  id: string;
  name: string;
  role: string;
  phone: string;
  smsAvailable: boolean;
  available24x7: boolean;
};

export const places: Place[] = [
  {
    id: "amber-fort",
    name: "Amber Fort",
    category: "POPULAR / MUST VISIT",
    neighborhood: "Amer",
    description: "Honey-colored courtyards, mirror work, and a dramatic hilltop arrival.",
    image: "https://images.unsplash.com/photo-1603201236596-eb1a63eb0f51?auto=format&fit=crop&w=1200&q=80",
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
    image: "https://images.unsplash.com/photo-1627894006066-b45f47f2efef?auto=format&fit=crop&w=1200&q=80",
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
    image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80",
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
    image: "https://images.unsplash.com/photo-1588083949439-d8e2025e1628?auto=format&fit=crop&w=1200&q=80",
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
  {
    id: "lmb-jaipur",
    name: "Laxmi Mishthan Bhandar (LMB)",
    category: "LOCAL FAVORITE",
    neighborhood: "Johari Bazaar",
    description: "Legendary 1727 heritage eatery famous for traditional Rajasthani thali, pyaz kachori, and ghewar.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80",
    score: 88,
    quality: 27,
    localRelevance: 25,
    uniqueness: 18,
    accessibility: 15,
    crowding: 15,
    duration: "1 hr",
    bestFor: "Authentic Food",
    signal: "Peak lunch rush 13:00–14:30. Safe, well-lit market corridor.",
    lat: 26.9208,
    lng: 75.8242,
    openHours: { open: 8, close: 23 },
    trending: true,
  },
  {
    id: "nahargarh-fort",
    name: "Nahargarh Fort Sunset Point",
    category: "POPULAR / MUST VISIT",
    neighborhood: "Aravali Hills",
    description: "Perched on the edge of the Aravali ridge, offering sweeping golden panoramas over the Pink City.",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
    score: 92,
    quality: 28,
    localRelevance: 20,
    uniqueness: 22,
    accessibility: 12,
    crowding: 14,
    duration: "2 hrs",
    bestFor: "Sunset & Views",
    signal: "Depart before full dark or take verified prepaid cab along lit main hill road.",
    lat: 26.9388,
    lng: 75.8155,
    openHours: { open: 10, close: 20 },
    trending: true,
  },
  {
    id: "ghat-ki-guni",
    name: "Ghat Ki Guni",
    category: "HIDDEN GEM",
    neighborhood: "Eastern Heritage Corridor",
    description: "A serene valley gorge corridor flanked by Mughal-era gateways, rock-cut temples, and whispering tamarind groves — virtually unknown to tourists.",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80",
    score: 83,
    quality: 23,
    localRelevance: 22,
    uniqueness: 21,
    accessibility: 10,
    crowding: 7,
    duration: "1 hr",
    bestFor: "Architecture & Solitude",
    signal: "Zero tourist crowd signal. Local walkers only in morning hours.",
    lat: 26.9245,
    lng: 75.8620,
    openHours: { open: 6, close: 18 },
    trending: false,
  },
  {
    id: "sagar-lake",
    name: "Sagar Lake (Amer Backside)",
    category: "HIDDEN GEM",
    neighborhood: "Behind Amer Fort",
    description: "A glassy hidden lake tucked behind Amer Fort's fortification walls. Home to migratory birds and a crumbling domed pavilion that few ever find.",
    image: "https://images.unsplash.com/photo-1618149789083-7d3dba368d32?auto=format&fit=crop&w=1200&q=80",
    score: 81,
    quality: 22,
    localRelevance: 20,
    uniqueness: 22,
    accessibility: 9,
    crowding: 8,
    duration: "1.5 hrs",
    bestFor: "Nature & Birding",
    signal: "Best visited at dawn. No facilities — carry water and wear sturdy footwear.",
    lat: 26.9930,
    lng: 75.8550,
    openHours: { open: 5, close: 19 },
    trending: false,
  },
  {
    id: "gaitore",
    name: "Gaitore Ki Chhatriyan",
    category: "HIDDEN GEM",
    neighborhood: "Nahargarh Road",
    description: "A walled garden of exquisite royal cenotaphs in pure white marble — the final resting place of Jaipur's maharajas. Near-zero tourist crowding.",
    image: "https://images.unsplash.com/photo-1609942072337-c3370e820005?auto=format&fit=crop&w=1200&q=80",
    score: 86,
    quality: 25,
    localRelevance: 19,
    uniqueness: 23,
    accessibility: 11,
    crowding: 6,
    duration: "1 hr",
    bestFor: "Quiet Heritage",
    signal: "Morning visit highly recommended. Entry ₹30 for foreigners, free for Indians.",
    lat: 26.9440,
    lng: 75.8040,
    openHours: { open: 9, close: 17 },
    trending: false,
  },
  {
    id: "sisodia-bagh",
    name: "Sisodia Rani Ka Bagh",
    category: "LOCAL FAVORITE",
    neighborhood: "Jaipur–Agra Road",
    description: "Terraced Mughal-style palace garden built for the queen of Jaipur — fountains, frescoes, and peacock lawns with almost no foreign visitor footfall.",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
    score: 78,
    quality: 20,
    localRelevance: 21,
    uniqueness: 19,
    accessibility: 12,
    crowding: 6,
    duration: "1.5 hrs",
    bestFor: "Garden & Romance",
    signal: "Weekday mornings are completely peaceful. Reachable by auto in 25 min from Old City.",
    lat: 26.8960,
    lng: 75.8740,
    openHours: { open: 8, close: 17 },
    trending: false,
  },
  {
    id: "nataniiyoon-haveli",
    name: "Nataniiyoon Ki Haveli",
    category: "HIDDEN GEM",
    neighborhood: "Old City Artisan Quarter",
    description: "A forgotten Indo-Saracenic haveli housing third-generation block-print artisans. Watch hand-carved wooden stamps turn plain cloth into intricate textiles.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
    score: 80,
    quality: 21,
    localRelevance: 24,
    uniqueness: 20,
    accessibility: 13,
    crowding: 7,
    duration: "45 min",
    bestFor: "Craft & Culture",
    signal: "Artisans work 9 AM–1 PM. Small purchases support the family directly.",
    lat: 26.9215,
    lng: 75.8198,
    openHours: { open: 9, close: 13 },
    trending: false,
  },
];

export const authorities = [
  { label: "Police Hotline", number: "112", note: "National Emergency Response System — verified contact." },
  { label: "Ambulance", number: "108", note: "Medical emergency dispatch hub." },
  { label: "Fire Department", number: "101", note: "Fire & disaster rescue control." },
  { label: "Tourist Helpline", number: "1363", note: "24x7 multi-lingual tourist assistance." },
];

export const disasterAuthorities: DisasterAuthority[] = [
  { id: "ndrf", name: "NDRF Regional Response Team", role: "National Disaster Response Force", phone: "011-24363260", smsAvailable: false, available24x7: true },
  { id: "sdrf", name: "Rajasthan SDRF", role: "State Disaster Response Force", phone: "0141-2227979", smsAvailable: false, available24x7: true },
  { id: "police-hq", name: "Jaipur Police HQ", role: "Law & Order / Emergency Coordinator", phone: "112", smsAvailable: true, available24x7: true },
  { id: "ambulance", name: "Emergency Ambulance", role: "Medical Emergency Dispatch", phone: "108", smsAvailable: false, available24x7: true },
  { id: "district-helpline", name: "District Disaster Helpline", role: "Jaipur District Administration", phone: "0141-2385715", smsAvailable: true, available24x7: true },
  { id: "tourist-police", name: "Tourist Police Helpline", role: "Rajasthan Tourism Police", phone: "1363", smsAvailable: true, available24x7: true },
];

export const shelters: Shelter[] = [
  {
    id: "amer-community",
    name: "Amer Community Emergency Shelter",
    type: "Community Center",
    distance: "1.2 km",
    lat: 26.9862,
    lng: 75.8530,
    occupancy: 45,
    capacity: 100,
    facilities: ["Food", "Medical", "Power", "Water"],
    address: "Near Amer Bus Stand, Amer Village, Jaipur",
    contactNumber: "0141-2530844",
  },
  {
    id: "gov-school-amer",
    name: "Government School – Amer Road",
    type: "School",
    distance: "2.1 km",
    lat: 26.9820,
    lng: 75.8420,
    occupancy: 12,
    capacity: 200,
    facilities: ["Food", "Power", "Water"],
    address: "Amer Road, near RIICO Industrial Area",
    contactNumber: "0141-2530100",
  },
  {
    id: "nahargarh-elevated",
    name: "Nahargarh Hill – Elevated Safe Zone",
    type: "Elevated Zone",
    distance: "3.4 km",
    lat: 26.9388,
    lng: 75.8155,
    occupancy: 8,
    capacity: 150,
    facilities: ["Water"],
    address: "Nahargarh Fort access road, Aravali Hills",
    contactNumber: "0141-2614247",
  },
  {
    id: "sms-hospital",
    name: "SMS Hospital — Trauma & Emergency",
    type: "Hospital",
    distance: "9.3 km",
    lat: 26.9050,
    lng: 75.8003,
    occupancy: 230,
    capacity: 500,
    facilities: ["Medical", "Power", "Water", "Food"],
    address: "J.L.N. Marg, Sawai Ram Singh Road, Jaipur",
    contactNumber: "0141-2518888",
  },
  {
    id: "collectorate-jaipur",
    name: "District Collectorate – Emergency Operations",
    type: "Government Building",
    distance: "11.2 km",
    lat: 26.9220,
    lng: 75.7940,
    occupancy: 0,
    capacity: 300,
    facilities: ["Power", "Water", "WiFi"],
    address: "Civil Lines, Jaipur — District Collector Office",
    contactNumber: "0141-2227398",
  },
];

export const disasterFeed: DisasterReport[] = [
  {
    id: "auth-001",
    category: "Flooding",
    description: "NDRF Team 4 deployed near Amer Road following flash flood advisory. Road to Amber Fort temporarily closed for private vehicles. Pedestrian access restricted.",
    location: "Amer Road Corridor – Jaipur",
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
    description: "Jaipur Metropolitan Police barricaded the Nahargarh Hill winding ascent due to loose gravel & heavy mist. Tourist vehicles use designated bypass.",
    location: "Nahargarh Road – Old City",
    lat: 26.9388,
    lng: 75.8160,
    severity: "Medium",
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    verified: true,
    source: "authority",
    actionAdvice: "Use verified shuttle buses or descend to central Old City corridor.",
    upvotes: 28,
  },
  {
    id: "comm-001",
    category: "Flooding",
    description: "Waterlogging on main market road near Johari Bazaar. Approx 1.5 ft water in low spots. Shopkeepers clearing drains.",
    location: "Johari Bazaar – Old City",
    lat: 26.9210,
    lng: 75.8250,
    severity: "Medium",
    timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
    verified: false,
    source: "community",
    actionAdvice: "Divert through Chaura Rasta or stay on elevated walkways.",
    upvotes: 14,
  },
  {
    id: "comm-002",
    category: "Road Blocked",
    description: "Fallen tree on MI Road near Panch Batti crossing. Traffic slow-moving in right lane.",
    location: "MI Road – Panch Batti",
    lat: 26.9124,
    lng: 75.7873,
    severity: "Low",
    timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
    verified: false,
    source: "community",
    actionAdvice: "Keep to left lanes; municipal clearance team arriving.",
    upvotes: 9,
  },
];

export const nearbyHelp: EmergencyPlace[] = [
  { id: "fortis", type: "Hospital", name: "Fortis Escorts Jaipur", distance: "4.2 km", signal: "Route signal available", lat: 26.8631, lng: 75.7592 },
  { id: "amer-police", type: "Police", name: "Amer Police Station", distance: "2.8 km", signal: "Directory result", lat: 26.9830, lng: 75.8505 },
  { id: "community-help", type: "Shelter", name: "Community Help Point · Amer", distance: "1.1 km", signal: "Sample location", lat: 26.9862, lng: 75.8530 },
];

export const emergencyPlaces: EmergencyPlace[] = [
  { id: "sms-hospital", type: "Hospital", name: "SMS Hospital", lat: 26.9050, lng: 75.8003, distance: "Central Jaipur", signal: "Major government hospital" },
  { id: "fortis-escorts", type: "Hospital", name: "Fortis Escorts Jaipur", lat: 26.8631, lng: 75.7592, distance: "4.2 km", signal: "Private multi-specialty" },
  { id: "nahargarh-police", type: "Police", name: "Nahargarh Police Station", lat: 26.9388, lng: 75.8150, distance: "Near Old City", signal: "Directory result" },
  { id: "amer-police", type: "Police", name: "Amer Police Station", lat: 26.9830, lng: 75.8505, distance: "2.8 km from Amer", signal: "Directory result" },
  { id: "jaipur-police-comm", type: "Police", name: "Jaipur Police Commissionerate", lat: 26.9120, lng: 75.7900, distance: "Central", signal: "Main HQ" },
];

export const scoreFactors = (place: Place) => [
  ["Quality", place.quality, "Experience quality from editorial and demo signals."],
  ["Local Relevance", place.localRelevance, "How strongly the place connects to local context."],
  ["Uniqueness", place.uniqueness, "Distinctiveness compared with nearby alternatives."],
  ["Accessibility", place.accessibility, "Ease of reaching and navigating the place."],
  ["Tourist Crowding", -place.crowding, "Crowding is subtracted; this is not a live occupancy reading."],
] as const;

export function bestTime(context: DemoContext) {
  if (context.time === "Night" || context.time === "Late Night") {
    return {
      label: "Safe After Dark Mode Active",
      detail: "Night illumination signal enabled. Prefer main lit avenues, active commercial loops, and keep your emergency contacts ready.",
    };
  }
  if (context.weather === "Heavy Rain" || context.time === "Rain") {
    return {
      label: "Indoor Heritage Window",
      detail: "Heavy rain can cause slick marble steps and outdoor puddling. Covered courtyard galleries and tea pauses recommended.",
    };
  }
  if (context.crowd === "Peak") {
    return {
      label: "Shift by 45 Minutes",
      detail: "High crowd signal at Amber Fort main gates. Visit Panna Meena Stepwell first while morning tour buses clear.",
    };
  }
  if (context.time === "Sunset") {
    return {
      label: "Golden Hour Window (42 min)",
      detail: "Jal Mahal viewpoint has optimal light and lake reflections right now.",
    };
  }
  return {
    label: "Good Right Now",
    detail: "Soft light and lower crowd signal make Amber Fort a strong starting point for your exploration.",
  };
}

/** Add minutes to a HH:MM time string and return a new HH:MM string */
export function addMinutesToTime(timeStr: string, mins: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  const total = h * 60 + m + mins;
  const hours = Math.floor(total / 60) % 24;
  const minutes = total % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

export function createItinerary(hours: number, context: DemoContext, startTime?: string) {
  const isNight = context.time === "Night" || context.time === "Late Night";
  const isRain = context.weather === "Heavy Rain" || context.time === "Rain";
  const isPeak = context.crowd === "Peak" || context.crowd === "High";

  // Determine base start time — use provided startTime or fall back to context defaults
  const defaultStart = isNight ? "18:30" : "09:10";
  const base = startTime || defaultStart;

  const first = isNight
    ? "Amber Fort Night View (Lit Courtyards)"
    : isRain
    ? "Indoor Sheesh Mahal Galleries"
    : isPeak
    ? "Panna Meena Quiet Stepwell"
    : "Amber Fort Hilltop Complex";

  const second = isNight
    ? "Ramganj Bazaar Illuminated Loop"
    : isRain
    ? "Amer Covered Crafts Cafe"
    : "Panna Meena Stepwell Walk";

  const third = hours >= 4
    ? (isNight ? "Hotel Return via Lit Main Road" : "Jal Mahal Lake Viewpoint")
    : "Local Artisanal Snack Stop";

  // Compute stop durations in minutes based on total hours available
  const stop1Mins = Math.round(hours * 60 * 0.40); // 40% of time
  const stop2Mins = Math.round(hours * 60 * 0.35); // 35% of time
  const time1 = base;
  const time2 = addMinutesToTime(base, stop1Mins + 15); // + 15 min travel
  const time3 = addMinutesToTime(time2, stop2Mins + 20); // + 20 min travel

  return [
    {
      time: time1,
      title: first,
      detail: isNight
        ? "Safe After Dark route: sticking to well-lit main corridors with security personnel."
        : isRain
        ? "Covered heritage galleries to stay dry during rain burst."
        : "A flexible first stop with low congestion buffer.",
      tag: isNight ? "SAFE AFTER DARK" : isRain ? "RAIN SAFE" : "START",
    },
    {
      time: time2,
      title: second,
      detail: isNight
        ? "Lively bazaar street with bright shopfront lighting and active foot traffic."
        : isRain
        ? "Weather-aware tea break near Amer village square."
        : "Keep the walk short and hydrate before next stop.",
      tag: "FLEX",
    },
    {
      time: time3,
      title: third,
      detail: "Verified conclusion spot near official transit and taxi stands.",
      tag: hours >= 4 ? "HIGHLIGHT" : "OPTIONAL",
    },
  ];
}

/** Filter places that are "good right now" based on current time, open status, and high discovery score. */
export function getGoodRightNow(allPlaces: Place[]): Place[] {
  const currentHour = new Date().getHours();
  return allPlaces
    .filter((p) => {
      const { open, close } = p.openHours;
      // Handle venues that span midnight (e.g. 0–24 = always open)
      if (close > open) return currentHour >= open && currentHour < close;
      if (close === open) return true; // always open
      return currentHour >= open || currentHour < close;
    })
    .filter((p) => p.score >= 70) // only high-discovery-score spots
    .sort((a, b) => b.score - a.score);
}

/** Shuffle/reorder itinerary stops to simulate a "regenerate day" action. */
export function shuffleItinerary<T extends { time: string; title: string; detail: string; tag: string }>(items: T[]): T[] {
  const tags = items.map((i) => i.tag);
  const times = items.map((i) => i.time);

  // Fisher-Yates shuffle on the content (title/detail) while preserving time slots and tags
  const contents = items.map((i) => ({ title: i.title, detail: i.detail }));
  for (let i = contents.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [contents[i], contents[j]] = [contents[j], contents[i]];
  }

  return items.map((item, idx) => ({
    ...item,
    time: times[idx],
    tag: tags[idx],
    title: contents[idx].title,
    detail: contents[idx].detail,
  }));
}
