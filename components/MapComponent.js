// components/MapComponent.js
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Leaflet CSS importieren
import { setupLeafletIcons } from '../lib/leafletConfig'; // Importiere die Konfigurationsfunktion
import GeoCircleMarker from './GeoCircleMarker';
import UserLocationMarker from './UserLocationMarker'; // Importiere die neue Komponente

// Führe die Leaflet-Icon-Konfiguration einmalig aus
setupLeafletIcons();

export default function MapComponent({ center, radius, userLocation, isActive }) {
  if (!center || !radius) {
    return <div className="flex items-center justify-center h-full text-gray-500">Loading map...</div>;
  }

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoCircleMarker
        center={center}
        radius={radius}
        userLocation={userLocation}
        isActive={isActive}
      />
      <UserLocationMarker userLocation={userLocation} /> {/* Verwende die neue Komponente */}
    </MapContainer>
  );
}
