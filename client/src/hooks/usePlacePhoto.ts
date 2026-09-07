import { useState, useEffect } from "react";

interface UsePlacePhotoOptions {
  placeName?: string;
  lat?: number;
  lng?: number;
  fallbackUrl?: string;
}

interface UsePlacePhotoResult {
  photoUrl: string;
  isLoading: boolean;
  isGooglePhoto: boolean;
}

// In-memory cache for fetched Google Place photos to prevent duplicate API requests
const photoCache = new Map<string, string>();

export function usePlacePhoto({
  placeName = "",
  lat,
  lng,
  fallbackUrl = "",
}: UsePlacePhotoOptions): UsePlacePhotoResult {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const isGoogleKey = apiKey && apiKey.startsWith("AIza");

  const [photoUrl, setPhotoUrl] = useState<string>(fallbackUrl);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGooglePhoto, setIsGooglePhoto] = useState<boolean>(false);

  useEffect(() => {
    const queryKey = `${placeName.trim().toLowerCase()}_${lat || ""}_${lng || ""}`;

    if (!placeName && !lat && !lng) {
      setPhotoUrl(fallbackUrl);
      setIsLoading(false);
      return;
    }

    // 1. Check cache first
    if (photoCache.has(queryKey)) {
      setPhotoUrl(photoCache.get(queryKey)!);
      setIsGooglePhoto(true);
      setIsLoading(false);
      return;
    }

    // 2. Try Google Places Service if google.maps is loaded
    if (isGoogleKey && typeof window !== "undefined" && window.google?.maps?.places) {
      setIsLoading(true);

      try {
        const dummyElement = document.createElement("div");
        const service = new window.google.maps.places.PlacesService(dummyElement);

        const searchQuery = `${placeName} Jaipur Rajasthan`;
        const request: google.maps.places.PlaceSearchRequest = {
          query: searchQuery,
          fields: ["photos", "name", "geometry"],
        };

        if (lat !== undefined && lng !== undefined) {
          request.locationBias = { lat, lng };
        }

        service.findPlaceFromQuery(request, (results, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            results &&
            results[0]?.photos &&
            results[0].photos.length > 0
          ) {
            const googlePhotoUrl = results[0].photos[0].getUrl({ maxWidth: 1200, maxHeight: 800 });
            photoCache.set(queryKey, googlePhotoUrl);
            setPhotoUrl(googlePhotoUrl);
            setIsGooglePhoto(true);
          } else {
            setPhotoUrl(fallbackUrl);
            setIsGooglePhoto(false);
          }
          setIsLoading(false);
        });

        return;
      } catch {
        setPhotoUrl(fallbackUrl);
        setIsGooglePhoto(false);
        setIsLoading(false);
        return;
      }
    }

    // 3. Fallback to specified image URL
    setPhotoUrl(fallbackUrl);
    setIsGooglePhoto(false);
    setIsLoading(false);
  }, [placeName, lat, lng, fallbackUrl, isGoogleKey]);

  return { photoUrl, isLoading, isGooglePhoto };
}
