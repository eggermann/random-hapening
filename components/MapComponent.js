// components/MapComponent.js
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import GeoCircleMarker from './GeoCircleMarker'; // Import the new component

// Workaround für fehlende Marker-Icons in Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'leaflet/images/marker-icon-2x.png',
  iconUrl: 'leaflet/images/marker-icon.png',
  shadowUrl: 'leaflet/images/marker-shadow.png',
});

export default function MapComponent({ center, radius, userLocation }) {
  if (!center || !radius) {
    return <div className="flex items-center justify-center h-full text-gray-500">Loading map...</div>;
  }

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoCircleMarker center={center} radius={radius} userLocation={userLocation} />
    </MapContainer>
  );
}
