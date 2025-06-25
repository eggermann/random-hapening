// components/AddressLoader.js
import React, { useState, useEffect } from 'react';

export default function AddressLoader({ lat, lng }) {
  const [address, setAddress] = useState("Wird geladen...");
  const [codeWord, setCodeWord] = useState(null);
  const [teaser, setTeaser] = useState(null);
  const [loadingMeta, setLoadingMeta] = useState(false);

  useEffect(() => {
    let fetchedAddress = "Keine Koordinaten verfügbar";
    if (!lat || !lng) {
      setAddress(fetchedAddress);
      setCodeWord(null);
      setTeaser(null);
      return;
    }

    setAddress("Wird geladen...");
    setCodeWord(null);
    setTeaser(null);
    setLoadingMeta(true); // Setze Ladezustand für Meta-Daten

    // 1. Adresse über Nominatim abrufen
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      .then(res => res.json())
      .then(data => {
        fetchedAddress = data.display_name || "Adresse nicht gefunden";
        setAddress(fetchedAddress);

        // 2. Nach erfolgreichem Adressabruf, Meta-Daten über unsere API abrufen
        return fetch(`/api/location-meta?lat=${lat}&lng=${lng}&address=${encodeURIComponent(fetchedAddress)}`);
      })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(metaData => {
        setCodeWord(metaData.codeWord);
        setTeaser(metaData.teaser);
      })
      .catch(error => {
        console.error("Error fetching location data or meta:", error);
        setAddress("Adresse nicht gefunden");
        setCodeWord("Fehler");
        setTeaser("Meta-Daten konnten nicht geladen werden.");
      })
      .finally(() => {
        setLoadingMeta(false); // Ladezustand beenden
      });
  }, [lat, lng]);

  return (
    <span>
      {address}
      {loadingMeta ? (
        <span className="text-gray-500 ml-2">(Meta lädt...)</span>
      ) : (
        <>
          {codeWord && <span className="font-bold ml-2">[{codeWord}]</span>}
          {teaser && <span className="italic ml-2">"{teaser}"</span>}
        </>
      )}
    </span>
  );
}
