// components/GeoCircleMarker.js
import { Circle, Popup, useMap } from 'react-leaflet'; // Popup hinzufügen
import { useEffect } from 'react';

// NEU: isActive Prop hinzufügen
export default function GeoCircleMarker({ center, radius, userLocation, isActive }) {
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
          pathOptions={{
            color: 'red',
            fillColor: 'red',
            fillOpacity: isActive ? 0.3 : 0.1 // ÄNDERUNG: Opazität basierend auf isActive
          }}>
          {/* NEU: Popup hinzufügen */}
          <Popup>{isActive ? 'Current happening!' : 'Past happening'}</Popup>
        </Circle>
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
