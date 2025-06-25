// lib/leafletConfig.js
import L from 'leaflet';

export function setupLeafletIcons() {
  // Fix default icon issues with Webpack/Next.js
  // Dies muss einmalig ausgeführt werden, bevor Leaflet-Marker gerendert werden.
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
    iconUrl: '/leaflet/images/marker-icon.png',
    shadowUrl: '/leaflet/images/marker-shadow.png',
  });
}
