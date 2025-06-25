// lib/useIsInside.ts
import { useState, useEffect } from 'react';

interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Custom hook to determine if a user's current location is within a specified geofence.
 * @param eventLocation - The center coordinates of the geofence { latitude, longitude }.
 * @param radius - The radius of the geofence in meters.
 * @returns A boolean indicating if the user is inside the geofence, and the user's current location.
 */
export const useIsInsideGeofence = (eventLocation: Coordinates | null, radius: number | null) => {
  const [userLocation, setUserLocation] = useState(null as Coordinates | null);
  const [isInside, setIsInside] = useState(false);

  useEffect(() => {
    let watchId: number;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });

          if (eventLocation && radius !== null) {
            const distance = calculateDistance(
              latitude,
              longitude,
              eventLocation.latitude,
              eventLocation.longitude
            );
            setIsInside(distance <= radius);
          }
        },
        (error) => {
          console.error("Error getting user location:", error);
          // Optional: Fallback oder Fehlermeldung anzeigen
          setIsInside(false); // Assume outside on error
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
      setIsInside(false);
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [eventLocation, radius]);

  return { isInside, userLocation };
};

/**
 * Calculates the distance between two geographical points using the Haversine formula.
 * @param lat1 - Latitude of point 1.
 * @param lon1 - Longitude of point 1.
 * @param lat2 - Latitude of point 2.
 * @param lon2 - Longitude of point 2.
 * @returns Distance in meters.
 */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};
