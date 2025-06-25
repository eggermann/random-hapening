// components/EventDetails.js
import React from 'react';
import AddressLoader from './AddressLoader'; // Importiere die neue Komponente

export default function EventDetails({ currentEvent, nextEvent, timeRemaining, userLocation, isInside }) {
  return (
    <div className="event-details">
      {userLocation && (
        <p className={`event-details__geofence-status mt-2 text-sm ${isInside ? 'text-green-600' : 'text-red-600'}`}>
          You are {isInside ? 'inside' : 'outside'} the geofence.
        </p>
      )}

      {currentEvent ? (
        <div className="event-details__current">
          <p className="event-details__location mb-2">
            <span className="event-details__label">Location:</span> {currentEvent.city} (Lat: {currentEvent.latitude.toFixed(4)}, Lng: {currentEvent.longitude.toFixed(4)})
          </p>
          <p className="event-details__date mb-2">
            <span className="event-details__label">Date:</span> {currentEvent.date.toLocaleDateString()}
          </p>
          <p className="event-details__time mb-4">
            <span className="event-details__label">Time:</span> {currentEvent.startTime} - {currentEvent.endTime}
          </p>
          <p className="event-details__status mt-2 text-sm text-gray-700">
            Event läuft!
          </p>
        </div>
      ) : nextEvent ? (
        <div className="event-details__upcoming">
          <p className="event-details__location mb-2">
            <span className="event-details__label">Upcoming Event (Geofan):</span> {nextEvent.city} (Lat: {nextEvent.latitude.toFixed(4)}, Lng: {nextEvent.longitude.toFixed(4)})
          </p>
          <p className="event-details__address mb-2">
            <span className="event-details__label text-sm text-gray-600">
              Adresse: {nextEvent.latitude && nextEvent.longitude ? <AddressLoader lat={nextEvent.latitude} lng={nextEvent.longitude} /> : "n/a"}
            </span>
          </p>
          <p className="event-details__start mb-2">
            <span className="event-details__label">Startet am:</span> {nextEvent.date && !isNaN(new Date(nextEvent.date)) ? new Date(nextEvent.date).toLocaleDateString() : 'n/a'} um {nextEvent.startTime || 'n/a'}
          </p>
          <p className="event-details__countdown mt-2 text-sm text-gray-700">
            Nächstes Event startet in: {timeRemaining || 'Lädt...'}
          </p>
        </div>
      ) : (
        <p className="event-details__none">No current or upcoming happening found for the selected city.</p>
      )}
    </div>
  );
}
