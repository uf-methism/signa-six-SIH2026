import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export type LocationStatus = "locating" | "granted" | "denied" | "fallback" | "idle";

// Default hub location (Jaipur / Dahmi Kalan, Rajasthan)
export const DEFAULT_FALLBACK_LOCATION: GeoCoordinate = {
  lat: 26.9124,
  lng: 75.7873,
};

export const DEFAULT_FALLBACK_NAME = "Jaipur (Dahmi Kalan Hub), Rajasthan";

interface LocationContextType {
  userLocation: GeoCoordinate;
  isLiveGPS: boolean;
  locationStatus: LocationStatus;
  locationName: string;
  accuracy: number | null;
  refreshLocation: () => Promise<void>;
  setUserLocation: (coords: GeoCoordinate, name?: string) => void;
  calculateDistance: (targetLat: number, targetLng: number) => number;
  formatDistance: (targetLat: number, targetLng: number) => string;
  formatTravelTime: (targetLat: number, targetLng: number, mode?: "driving" | "walking") => string;
  enrichWithDistance: <T extends { lat: number; lng: number }>(
    items: T[]
  ) => (T & { distanceKm: number; distanceText: string; travelTimeText: string })[];
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

/**
 * Haversine formula for spherical distance in kilometers
 */
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userLocation, setUserLocationState] = useState<GeoCoordinate>(DEFAULT_FALLBACK_LOCATION);
  const [isLiveGPS, setIsLiveGPS] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [locationName, setLocationName] = useState<string>(DEFAULT_FALLBACK_NAME);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  const requestPosition = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !navigator.geolocation) {
        setLocationStatus("fallback");
        setIsLiveGPS(false);
        setUserLocationState(DEFAULT_FALLBACK_LOCATION);
        setLocationName(DEFAULT_FALLBACK_NAME);
        resolve();
        return;
      }

      setLocationStatus("locating");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = Number(position.coords.latitude.toFixed(5));
          const lng = Number(position.coords.longitude.toFixed(5));
          const acc = position.coords.accuracy ? Math.round(position.coords.accuracy) : null;

          setUserLocationState({ lat, lng });
          setIsLiveGPS(true);
          setLocationStatus("granted");
          setAccuracy(acc);
          setLocationName(`GPS: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`);

          toast.success("Live GPS Location Locked", {
            description: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)} (Accuracy ±${acc || 15}m)`,
          });
          resolve();
        },
        (error) => {
          console.warn("[Geolocation] Fallback to default hub:", error.message);
          setLocationStatus("denied");
          setIsLiveGPS(false);
          setUserLocationState(DEFAULT_FALLBACK_LOCATION);
          setLocationName(DEFAULT_FALLBACK_NAME);

          toast.info("Using Jaipur Regional Destination Hub", {
            description: "Defaulted to Jaipur, Rajasthan for safety & recommendations.",
          });
          resolve();
        },
        {
          enableHighAccuracy: true,
          timeout: 6000,
          maximumAge: 30000,
        }
      );
    });
  }, []);

  useEffect(() => {
    requestPosition();
  }, [requestPosition]);

  const calculateDistance = useCallback(
    (targetLat: number, targetLng: number): number => {
      return getDistanceKm(userLocation.lat, userLocation.lng, targetLat, targetLng);
    },
    [userLocation]
  );

  const formatDistance = useCallback(
    (targetLat: number, targetLng: number): string => {
      const km = calculateDistance(targetLat, targetLng);
      if (km < 1) {
        return `${Math.round(km * 1000)} m`;
      }
      return `${km.toFixed(1)} km`;
    },
    [calculateDistance]
  );

  const formatTravelTime = useCallback(
    (targetLat: number, targetLng: number, mode: "driving" | "walking" = "driving"): string => {
      const km = calculateDistance(targetLat, targetLng);
      // Average city driving speed 28 km/h, walking 4.5 km/h
      const speedKmH = mode === "driving" ? 28 : 4.5;
      const minutes = Math.max(1, Math.round((km / speedKmH) * 60));
      if (minutes < 60) {
        return `~${minutes} min ${mode}`;
      }
      const hrs = Math.floor(minutes / 60);
      const remMins = minutes % 60;
      return `~${hrs}h ${remMins > 0 ? `${remMins}m` : ""} ${mode}`;
    },
    [calculateDistance]
  );

  const enrichWithDistance = useCallback(
    <T extends { lat: number; lng: number }>(
      items: T[]
    ): (T & { distanceKm: number; distanceText: string; travelTimeText: string })[] => {
      return items.map((item) => {
        const km = calculateDistance(item.lat, item.lng);
        return {
          ...item,
          distanceKm: km,
          distanceText: km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`,
          travelTimeText: formatTravelTime(item.lat, item.lng, "driving"),
        };
      });
    },
    [calculateDistance, formatTravelTime]
  );

  const setUserLocation = useCallback((coords: GeoCoordinate, name?: string) => {
    setUserLocationState(coords);
    setIsLiveGPS(true);
    setLocationStatus("granted");
    if (name) setLocationName(name);
    else setLocationName(`Custom: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
  }, []);

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        isLiveGPS,
        locationStatus,
        locationName,
        accuracy,
        refreshLocation: requestPosition,
        setUserLocation,
        calculateDistance,
        formatDistance,
        formatTravelTime,
        enrichWithDistance,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocationContext must be used within a LocationProvider");
  }
  return context;
}
