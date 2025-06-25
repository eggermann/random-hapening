// components/GeoCircleMarker.js
import { Circle, useMap } from 'react-leaflet';
import { useEffect } from 'react';

export default function GeoCircleMarker({ center, radius, userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, map.getZoom());
    }
  }, [center, map]);

  return (
    <>
      {center && radius && (
        <Circle
          center={center}
          radius={radius} // Radius in Metern
          pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.3 }}
        />
      )}
      {userLocation && (
        <Circle
          center={[userLocation.latitude, userLocation.longitude]}
          radius={5} // Kleiner Kreis für den Benutzerstandort
          pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.8 }}
        />
      )}
    </>
  );
}
