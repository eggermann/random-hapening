// components/EventDetails.js
import React from 'react';
import AddressLoader from './AddressLoader'; // Importiere die neue Komponente

export default function EventDetails({ currentEvent, nextEvent, timeRemaining, userLocation, isInside }) {
  return (
    <>
      {userLocation && (
        <p className={`mt-2 text-sm ${isInside ? 'text-green-600' : 'text-red-600'}`}>
          You are {isInside ? 'inside' : 'outside'} the geofence.
        </p>
      )}

      {currentEvent ? (
        <>
          <p className="mb-2">
            **Location:** {currentEvent.city} (Lat: {currentEvent.latitude.toFixed(4)}, Lng: {currentEvent.longitude.toFixed(4)})
          </p>
          <p className="mb-2">
            **Date:** {currentEvent.date.toLocaleDateString()}
          </p>
          <p className="mb-4">
            **Time:** {currentEvent.startTime} - {currentEvent.endTime}
          </p>
          <p className="mt-2 text-sm text-gray-700">
            Event läuft!
          </p>
        </>
      ) : nextEvent ? (
        <>
          <p className="mb-2">
            **Upcoming Event (Geofan):** {nextEvent.city} (Lat: {nextEvent.latitude.toFixed(4)}, Lng: {nextEvent.longitude.toFixed(4)})
          </p>
          <p className="mb-2">
            <span className="text-sm text-gray-600">
              Adresse: {nextEvent.latitude && nextEvent.longitude ? <AddressLoader lat={nextEvent.latitude} lng={nextEvent.longitude} /> : "n/a"}
            </span>
          </p>
          <p className="mb-2">
            **Startet am:** {nextEvent.date && !isNaN(new Date(nextEvent.date)) ? new Date(nextEvent.date).toLocaleDateString() : 'n/a'} um {nextEvent.startTime || 'n/a'} {/* KORREKTUR: nextEvent.startTime direkt verwenden */}
          </p>
          <p className="mt-2 text-sm text-gray-700">
            Nächstes Event startet in: {timeRemaining || 'Lädt...'}
          </p>
        </>
      ) : (
        <p>No current or upcoming happening found for the selected city.</p>
      )}
    </>
  );
}
