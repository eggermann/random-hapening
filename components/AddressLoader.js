// components/AddressLoader.js
import React from 'react';

export default function AddressLoader({ lat, lng }) {
  const [address, setAddress] = React.useState("Wird geladen...");
  React.useEffect(() => {
    if (!lat || !lng) {
      setAddress("Keine Koordinaten verfügbar");
      return;
    }
    setAddress("Wird geladen...");
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      .then(res => res.json())
      .then(data => {
        setAddress(data.display_name || "Adresse nicht gefunden");
      })
      .catch(() => {
        setAddress("Adresse nicht gefunden");
      });
  }, [lat, lng]);
  return <span>{address}</span>;
}
