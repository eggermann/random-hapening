// components/UserLocationMarker.js
import { Marker, Popup } from 'react-leaflet';

export default function UserLocationMarker({ userLocation }) {
  if (!userLocation) {
    return null;
  }

  return (
    <Marker position={[userLocation.latitude, userLocation.longitude]}>
      <Popup>Your Location</Popup>
    </Marker>
  );
}
