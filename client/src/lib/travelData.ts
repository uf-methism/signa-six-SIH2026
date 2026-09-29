/* Civic Calm style: DISHA Context-Aware Hospitality Intelligence. */

export type DemoContext = {
  time: "Morning" | "Sunset" | "Night" | "Late Night" | "Rain";
  weather: "Clear" | "Heavy Rain";
  crowd: "Low" | "High" | "Peak";
  location: "The Amber Heritage Resort & Spa" | "Jaipur Palace Suites";
  alert: boolean;
  /** Triggers the global PropertyAlertModal for SIH demo purposes */
  disasterAlert: boolean;
  /** Toggles unverified staff reports → verified in the live feed */
  authorityVerified: boolean;
};

// Hotel Property & Guest Models
export type Property = {
  id: string;
  name: string;
  tagline: string;
  location: { address: string; lat: number; lng: number };
  totalRooms: number;
  currentOccupancy: number;
  amenities: string[];
};

export const currentProperty: Property = {
  id: "amber-resort-jaipur",
  name: "The Amber Heritage Resort & Spa",
  tagline: "Personalized Stays. Smarter Operations. Safer Guests.",
  location: { address: "Amer Hills Corridor, Jaipur, Rajasthan", lat: 26.9855, lng: 75.8513 },
  totalRooms: 120,
  currentOccupancy: 102, // 85% occupancy
  amenities: ["Spa & Wellness Center", "Courtyard Dining", "Infinity Pool", "24/7 Digital Concierge", "Helipad & Transfers"],
};

export type GuestProfile = {
  id: string;
  name: string;
  firstName: string;
  roomNumber: string;
  roomType: string;
  floor: number;
  checkIn: string;
  checkOut: string;
  nights: number;
  stayStatus: "In House" | "Upcoming" | "Checked Out";
  memberSince?: string;
  interests: ("Heritage" | "Food" | "Shopping" | "Relaxation" | "Culture" | "Nature" | "Adventure")[];
  timingPreference: "Morning" | "Afternoon" | "Evening" | "Flexible";
  budgetPreference: "Low" | "Medium" | "Premium";
  dietaryNeeds: string[];
  accessibilityNeeds: string[];
  languagePreference: string;
  contactNumber?: string;
  savedRecommendations: string[];
  preferences: {
    quietFloor: boolean;
    highFloor: boolean;
    extraPillows: boolean;
    lateCheckoutRequested: boolean;
    doNotDisturbActive: boolean;
  };
};

/** @demo Aarav Sharma - 2 night heritage+food stay */
export const sampleGuestProfile: GuestProfile = {
  id: "guest-aarav",
  name: "Aarav Sharma",
  firstName: "Aarav",
  roomNumber: "204",
  roomType: "Heritage Deluxe",
  floor: 2,
  checkIn: "2026-09-29",
  checkOut: "2026-10-01",
  nights: 2,
  stayStatus: "In House",
  memberSince: "2024",
  interests: ["Heritage", "Food", "Culture"],
  timingPreference: "Morning",
  budgetPreference: "Medium",
  dietaryNeeds: ["Vegetarian"],
  accessibilityNeeds: [],
  languagePreference: "English",
  savedRecommendations: ["amber-fort", "lmb-jaipur"],
  preferences: {
    quietFloor: true,
    highFloor: false,
    extraPillows: true,
    lateCheckoutRequested: false,
    doNotDisturbActive: false,
  },
};

// Keep legacy alias for backward compat
export const sampleGuestStay = {
  guestName: sampleGuestProfile.name,
  roomNumber: `Room ${sampleGuestProfile.roomNumber}`,
  checkIn: sampleGuestProfile.checkIn,
  checkOut: sampleGuestProfile.checkOut,
  stayStatus: sampleGuestProfile.stayStatus,
  preferences: {
    quietFloor: sampleGuestProfile.preferences.quietFloor,
    highFloor: sampleGuestProfile.preferences.highFloor,
    dietary: sampleGuestProfile.dietaryNeeds,
    lateCheckoutRequested: sampleGuestProfile.preferences.lateCheckoutRequested,
  },
};

export type HotelService = {
  id: string;
  title: string;
  category: "Housekeeping" | "Dining" | "Wellness" | "Concierge" | "Maintenance" | "Laundry" | "Transport" | "Special Assistance";
  description: string;
  estMinutes: number;
  price: string;
  iconName: string;
  availableNow: boolean;
};

export const hotelServicesCatalog: HotelService[] = [
  { id: "srv-hk-1", title: "Fresh Towels & Linen", category: "Housekeeping", description: "Plush organic cotton towels and fresh bedding delivered to your room.", estMinutes: 15, price: "Complimentary", iconName: "Sparkles", availableNow: true },
  { id: "srv-hk-2", title: "Room Cleaning", category: "Housekeeping", description: "Full room cleaning with aromatherapy turn-down service.", estMinutes: 25, price: "Complimentary", iconName: "Sparkles", availableNow: true },
  { id: "srv-hk-3", title: "Extra Amenities", category: "Housekeeping", description: "Request extra pillows, hangers, iron, or any room essentials.", estMinutes: 10, price: "Complimentary", iconName: "Plus", availableNow: true },
  { id: "srv-din-1", title: "Rajasthani Royal Thali", category: "Dining", description: "Traditional multi-course thali served in-room with silver dining setup.", estMinutes: 30, price: "₹1,850", iconName: "Utensils", availableNow: true },
  { id: "srv-din-2", title: "Breakfast In Bed", category: "Dining", description: "Chef's selection continental or full Indian breakfast served in room.", estMinutes: 25, price: "₹850", iconName: "Coffee", availableNow: true },
  { id: "srv-din-3", title: "Restaurant Table Reservation", category: "Dining", description: "Reserve a table at our courtyard restaurant — specify time and guest count.", estMinutes: 5, price: "Complimentary", iconName: "Utensils", availableNow: true },
  { id: "srv-spa-1", title: "Ayurvedic Massage", category: "Wellness", description: "60-minute therapeutic session at the Spa or in-suite. Heritage oil selection.", estMinutes: 60, price: "₹3,500", iconName: "Heart", availableNow: true },
  { id: "srv-spa-2", title: "Yoga & Meditation Session", category: "Wellness", description: "Private 45-minute sunrise yoga session in our heritage courtyard.", estMinutes: 45, price: "₹1,200", iconName: "Sun", availableNow: true },
  { id: "srv-con-1", title: "Airport / Station Transfer", category: "Transport", description: "Private luxury sedan to Jaipur International Airport or Railway Station.", estMinutes: 45, price: "₹2,200", iconName: "Car", availableNow: true },
  { id: "srv-con-2", title: "City Sightseeing Cab", category: "Transport", description: "Full-day cab with verified driver for Amber Fort, City Palace, and bazaars.", estMinutes: 480, price: "₹3,800", iconName: "Car", availableNow: true },
  { id: "srv-laun-1", title: "Express Laundry", category: "Laundry", description: "Wash & fold returned within 4 hours. Dry cleaning available overnight.", estMinutes: 240, price: "₹150/item", iconName: "Wind", availableNow: true },
  { id: "srv-maint-1", title: "AC / Climate Adjustment", category: "Maintenance", description: "HVAC technician check and air purification filter setup.", estMinutes: 20, price: "Complimentary", iconName: "Wind", availableNow: true },
  { id: "srv-maint-2", title: "Technical Support", category: "Maintenance", description: "WiFi, TV, or any in-room technical issue resolved immediately.", estMinutes: 15, price: "Complimentary", iconName: "Zap", availableNow: true },
  { id: "srv-assist-1", title: "Special Assistance Request", category: "Special Assistance", description: "Wheelchair access, visual/hearing assistance, or any special need — our team will coordinate personally.", estMinutes: 10, price: "Complimentary", iconName: "HeartHandshake", availableNow: true },
];

export type ServiceTicketCategory =
  | "Housekeeping"
  | "Room Service"
  | "Maintenance"
  | "Transport"
  | "Laundry"
  | "Amenities"
  | "Special Assistance"
  | "Other";

export type TicketStateAction =
  | "Created"
  | "Accepted"
  | "Started Work"
  | "Completed Work"
  | "Closed"
  | "Reopened"
  | "Reassigned"
  | "Priority Updated";

export type TicketAuditLog = {
  timestamp: string;
  user: string;
  role: "Guest" | "Staff" | "Manager" | "System AI";
  action: TicketStateAction;
  note?: string;
  fromStatus?: string;
  toStatus?: string;
};

export const CATEGORY_SLA_MINUTES: Record<ServiceTicketCategory, number> = {
  Transport: 10,
  Maintenance: 15,
  Housekeeping: 20,
  "Room Service": 15,
  Laundry: 30,
  Amenities: 15,
  "Special Assistance": 10,
  Other: 20,
};

export function classifyServiceRequestText(text: string): {
  suggestedCategory: ServiceTicketCategory;
  suggestedPriority: "Low" | "Medium" | "High" | "Urgent";
  confidence: number;
  reason: string;
} {
  const lower = text.toLowerCase();

  if (
    lower.includes("leak") ||
    lower.includes("ac") ||
    lower.includes("broken") ||
    lower.includes("shower") ||
    lower.includes("water") ||
    lower.includes("repair") ||
    lower.includes("light") ||
    lower.includes("noise")
  ) {
    const isUrgent = lower.includes("leak") || lower.includes("overflow") || lower.includes("spark");
    return {
      suggestedCategory: "Maintenance",
      suggestedPriority: isUrgent ? "High" : "Medium",
      confidence: 0.92,
      reason: "Detected HVAC / plumbing keywords",
    };
  }

  if (
    lower.includes("cab") ||
    lower.includes("pickup") ||
    lower.includes("transport") ||
    lower.includes("shuttle") ||
    lower.includes("airport") ||
    lower.includes("ride") ||
    lower.includes("rain pickup")
  ) {
    const isHigh = lower.includes("rain") || lower.includes("flight") || lower.includes("urgent");
    return {
      suggestedCategory: "Transport",
      suggestedPriority: isHigh ? "High" : "Medium",
      confidence: 0.95,
      reason: "Detected transit / shuttle request",
    };
  }

  if (
    lower.includes("towel") ||
    lower.includes("pillow") ||
    lower.includes("clean") ||
    lower.includes("blanket") ||
    lower.includes("bed") ||
    lower.includes("trash") ||
    lower.includes("housekeeping")
  ) {
    return {
      suggestedCategory: "Housekeeping",
      suggestedPriority: lower.includes("urgent") ? "High" : "Low",
      confidence: 0.90,
      reason: "Detected room linen & amenity keywords",
    };
  }

  if (
    lower.includes("food") ||
    lower.includes("tea") ||
    lower.includes("dinner") ||
    lower.includes("breakfast") ||
    lower.includes("drink") ||
    lower.includes("water bottle") ||
    lower.includes("coffee") ||
    lower.includes("snack")
  ) {
    return {
      suggestedCategory: "Room Service",
      suggestedPriority: "Medium",
      confidence: 0.88,
      reason: "Detected F&B / in-room dining keywords",
    };
  }

  if (
    lower.includes("laundry") ||
    lower.includes("iron") ||
    lower.includes("dry clean") ||
    lower.includes("press") ||
    lower.includes("wash")
  ) {
    return {
      suggestedCategory: "Laundry",
      suggestedPriority: lower.includes("express") ? "High" : "Medium",
      confidence: 0.91,
      reason: "Detected garment care keywords",
    };
  }

  if (
    lower.includes("wheelchair") ||
    lower.includes("elderly") ||
    lower.includes("disability") ||
    lower.includes("assistance") ||
    lower.includes("medical")
  ) {
    return {
      suggestedCategory: "Special Assistance",
      suggestedPriority: "High",
      confidence: 0.96,
      reason: "Detected accessibility & special care request",
    };
  }

  return {
    suggestedCategory: "Housekeeping",
    suggestedPriority: "Medium",
    confidence: 0.70,
    reason: "Default context classification",
  };
}

export type ServiceTicket = {
  id: string;
  roomNumber: string;
  guestName: string;
  category: ServiceTicketCategory;
  title: string;
  details: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "New" | "Accepted" | "In Progress" | "Completed" | "Closed";
  assignedStaff: string;
  timestamp: string;
  scheduledFor?: string;
  preferredTime?: string;

  // AI Classification metadata
  aiSuggestedCategory?: ServiceTicketCategory;
  aiSuggestedPriority?: "Low" | "Medium" | "High" | "Urgent";
  aiConfidence?: number;

  // SLA & Overdue Logic
  slaMinutes: number;
  createdTimeMs: number;
  acceptedTimeMs?: number;
  startedTimeMs?: number;
  completedTimeMs?: number;
  closedTimeMs?: number;

  // Analytics Metrics
  responseTimeMinutes?: number;
  resolutionTimeMinutes?: number;

  // Audit Log State Machine History
  history: TicketAuditLog[];
};

const nowMs = Date.now();

export const initialServiceTickets: ServiceTicket[] = [
  {
    id: "tkt-204",
    roomNumber: "204",
    guestName: "S. Roy (Aarav Sharma)",
    category: "Transport",
    title: "Amber Fort Rain Pickup",
    details: "Guest requested urgent cab pickup from Amber Fort before 17:30 rainfall.",
    priority: "High",
    status: "New",
    assignedStaff: "Shuttle #2 (Ramesh K.)",
    timestamp: "14:15",
    scheduledFor: "17:15",
    preferredTime: "Immediate (Pre-rain)",
    slaMinutes: 10,
    createdTimeMs: nowMs - 25 * 60 * 1000, // 25 mins ago (SLA exceeded -> Attention Required)
    aiSuggestedCategory: "Transport",
    aiSuggestedPriority: "High",
    aiConfidence: 0.95,
    history: [
      {
        timestamp: "14:15",
        user: "Aarav Sharma",
        role: "Guest",
        action: "Created",
        note: "Submitted request via DISHA Digital Companion",
      },
      {
        timestamp: "14:16",
        user: "DISHA AI Core",
        role: "System AI",
        action: "Priority Updated",
        note: "Auto-tagged High Priority based on weather radar signal",
      },
    ],
  },
  {
    id: "tkt-318",
    roomNumber: "318",
    guestName: "M. Patel",
    category: "Maintenance",
    title: "HVAC Temperature Calibration",
    details: "AC cooling efficiency degraded; room reading 26°C, target 22°C.",
    priority: "Medium",
    status: "In Progress",
    assignedStaff: "Technician Rajesh",
    timestamp: "13:50",
    slaMinutes: 15,
    createdTimeMs: nowMs - 40 * 60 * 1000,
    acceptedTimeMs: nowMs - 35 * 60 * 1000,
    startedTimeMs: nowMs - 20 * 60 * 1000,
    responseTimeMinutes: 5,
    aiSuggestedCategory: "Maintenance",
    aiSuggestedPriority: "Medium",
    aiConfidence: 0.92,
    history: [
      { timestamp: "13:50", user: "M. Patel", role: "Guest", action: "Created", note: "AC leaking / not cooling" },
      { timestamp: "13:55", user: "Priya Singh", role: "Staff", action: "Accepted", note: "Assigned to Tech Rajesh" },
      { timestamp: "14:10", user: "Technician Rajesh", role: "Staff", action: "Started Work", note: "Inspecting condenser unit" },
    ],
  },
  {
    id: "tkt-412",
    roomNumber: "412",
    guestName: "K. Sharma",
    category: "Housekeeping",
    title: "Extra Towels & Foam Pillows",
    details: "Guest requested 2 extra bath sheets and hypoallergenic memory foam pillows.",
    priority: "Low",
    status: "Accepted",
    assignedStaff: "Priya Singh",
    timestamp: "14:05",
    slaMinutes: 20,
    createdTimeMs: nowMs - 12 * 60 * 1000,
    acceptedTimeMs: nowMs - 8 * 60 * 1000,
    responseTimeMinutes: 4,
    history: [
      { timestamp: "14:05", user: "K. Sharma", role: "Guest", action: "Created", note: "Linen request" },
      { timestamp: "14:09", user: "Priya Singh", role: "Staff", action: "Accepted", note: "Retrieving from 4th floor linen locker" },
    ],
  },
  {
    id: "tkt-105",
    roomNumber: "105",
    guestName: "Rajesh Gupta",
    category: "Room Service",
    title: "High Tea & Immunity Toddy",
    details: "In-room afternoon tea set for 2 guests with local herbal infusion.",
    priority: "Medium",
    status: "New",
    assignedStaff: "Unassigned",
    timestamp: "14:22",
    slaMinutes: 15,
    createdTimeMs: nowMs - 5 * 60 * 1000,
    history: [
      { timestamp: "14:22", user: "Rajesh Gupta", role: "Guest", action: "Created", note: "In-room tea service" },
    ],
  },
  {
    id: "tkt-501",
    roomNumber: "Suite 501",
    guestName: "Elena Rostova",
    category: "Laundry",
    title: "Express Evening Dry Cleaning",
    details: "Formal wear press and return required before 19:00 dinner reservation.",
    priority: "High",
    status: "In Progress",
    assignedStaff: "Laundry Care Team",
    timestamp: "13:30",
    slaMinutes: 30,
    createdTimeMs: nowMs - 60 * 60 * 1000,
    acceptedTimeMs: nowMs - 55 * 60 * 1000,
    startedTimeMs: nowMs - 45 * 60 * 1000,
    responseTimeMinutes: 5,
    history: [
      { timestamp: "13:30", user: "Elena Rostova", role: "Guest", action: "Created", note: "Express press request" },
      { timestamp: "13:35", user: "Front Desk", role: "Staff", action: "Accepted", note: "Routed to Laundry Valet" },
      { timestamp: "13:45", user: "Laundry Care Team", role: "Staff", action: "Started Work", note: "Steam press in progress" },
    ],
  },
  {
    id: "tkt-210",
    roomNumber: "210",
    guestName: "L. Fernandez",
    category: "Maintenance",
    title: "Balcony Door Latch Inspection",
    details: "Balcony sliding glass door latch sticking; safety inspection.",
    priority: "Low",
    status: "Completed",
    assignedStaff: "Tech Sanjay",
    timestamp: "11:45",
    slaMinutes: 15,
    createdTimeMs: nowMs - 180 * 60 * 1000,
    acceptedTimeMs: nowMs - 175 * 60 * 1000,
    startedTimeMs: nowMs - 165 * 60 * 1000,
    completedTimeMs: nowMs - 150 * 60 * 1000,
    responseTimeMinutes: 5,
    resolutionTimeMinutes: 30,
    history: [
      { timestamp: "11:45", user: "L. Fernandez", role: "Guest", action: "Created", note: "Door latch sticking" },
      { timestamp: "11:50", user: "Priya Singh", role: "Staff", action: "Accepted", note: "Assigned Tech Sanjay" },
      { timestamp: "12:00", user: "Tech Sanjay", role: "Staff", action: "Started Work", note: "Lubricating track & latch" },
      { timestamp: "12:15", user: "Tech Sanjay", role: "Staff", action: "Completed Work", note: "Latch repaired & verified smooth" },
    ],
  },
];


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
