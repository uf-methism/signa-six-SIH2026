import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Compass } from "lucide-react";
import { usePlacePhoto } from "@/hooks/usePlacePhoto";

interface PlaceImageProps {
  query?: string;
  lat?: number;
  lng?: number;
  alt: string;
  className?: string;
  category?: string;
  fallbackUrl?: string;
}

// Curated high-resolution fallback photos for Jaipur & travel safety categories
const CURATED_LOCATION_PHOTOS: Record<string, string> = {
  "amber fort": "https://images.unsplash.com/photo-1603201236596-eb1a63eb0f51?auto=format&fit=crop&w=1200&q=80",
  "panna meena": "https://images.unsplash.com/photo-1627894006066-b45f47f2efef?auto=format&fit=crop&w=1200&q=80",
  "hawa mahal": "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80",
  "jal mahal": "https://images.unsplash.com/photo-1588083949439-d8e2025e1628?auto=format&fit=crop&w=1200&q=80",
  "nahargarh fort": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
  "city palace": "https://images.unsplash.com/photo-1588083949474-77b7ee00c0db?auto=format&fit=crop&w=1200&q=80",
  "albert hall": "https://images.unsplash.com/photo-1580974852861-f3817e0826a1?auto=format&fit=crop&w=1200&q=80",
  "lmb": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80",
  "laxmi mishthan": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80",
  "ramganj": "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80",
  "bapu bazaar": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200&q=80",
  "jantar mantar": "https://images.unsplash.com/photo-1603201236596-eb1a63eb0f51?auto=format&fit=crop&w=1200&q=80",
  "jaipur": "https://images.unsplash.com/photo-1603201236596-eb1a63eb0f51?auto=format&fit=crop&w=1200&q=80",
  "shelter": "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80",
  "hospital": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
  "police": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
  "flooding": "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80",
  "default": "https://images.unsplash.com/photo-1603201236596-eb1a63eb0f51?auto=format&fit=crop&w=1200&q=80",
};

export const PlaceImage: React.FC<PlaceImageProps> = ({
  query = "",
  lat,
  lng,
  alt,
  className = "w-full h-full object-cover object-center",
  category = "",
  fallbackUrl,
}) => {
  // Determine curated fallback matching query or category
  const lowerSearch = (query || alt || category).toLowerCase();
  let defaultFallback = CURATED_LOCATION_PHOTOS["default"];
  for (const key of Object.keys(CURATED_LOCATION_PHOTOS)) {
    if (lowerSearch.includes(key)) {
      defaultFallback = CURATED_LOCATION_PHOTOS[key];
      break;
    }
  }

  const effectiveFallback = fallbackUrl || defaultFallback;

  // Use dynamic Google Places photo hook with fallback
  const { photoUrl, isLoading: isHookLoading } = usePlacePhoto({
    placeName: query || alt,
    lat,
    lng,
    fallbackUrl: effectiveFallback,
  });

  const [imageSrc, setImageSrc] = useState<string>(photoUrl);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    setImageSrc(photoUrl);
    setIsLoading(isHookLoading);
    setHasError(false);
  }, [photoUrl, isHookLoading]);

  const handleImageError = () => {
    if (imageSrc !== defaultFallback) {
      setImageSrc(defaultFallback);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100">
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-amber-100/40 via-amber-200/50 to-amber-100/40 animate-pulse flex items-center justify-center">
          <MapPin className="w-6 h-6 text-amber-500 animate-bounce" />
        </div>
      )}

      {hasError ? (
        <div className="w-full h-full bg-gradient-to-br from-amber-500/90 via-amber-600/90 to-orange-600/90 flex flex-col items-center justify-center p-4 text-center text-white">
          <Compass className="w-7 h-7 mb-1.5 opacity-90 text-white" />
          <span className="text-xs font-bold tracking-tight text-white leading-snug line-clamp-2">{alt || "Jaipur Spot"}</span>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-100 mt-1 opacity-80">DISHA Destination</span>
        </div>
      ) : (
        <motion.img
          src={imageSrc}
          alt={alt}
          onLoad={() => setIsLoading(false)}
          onError={handleImageError}
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`object-cover object-center w-full h-full transform transition-transform duration-300 ${className} ${isLoading ? "opacity-0" : "opacity-100"}`}
        />
      )}
    </div>
  );
};
