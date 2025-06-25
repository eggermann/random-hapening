// components/PastEventsTeaser.js
import React, { useState, useEffect } from 'react';

export default function PastEventsTeaser({ selectedCity }) {
  const [pastEvents, setPastEvents] = useState([]);

  useEffect(() => {
    const fetchPastEvents = async () => {
      try {
        // Annahme: /api/event/archive kann nach Stadt filtern oder wir filtern clientseitig
        // Für eine effizientere Lösung wäre eine API-Route wie /api/event/archive?city=X besser
        const response = await fetch('/api/event/archive');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Filtern nach Stadt und nur die ersten 3 anzeigen
        const filteredEvents = data.events
          .filter(event => event.city === selectedCity)
          .slice(0, 3);
        setPastEvents(filteredEvents);
      } catch (error) {
        console.error("Error fetching past events:", error);
        setPastEvents([]);
      }
    };

    fetchPastEvents();
  }, [selectedCity]);

  if (pastEvents.length === 0) {
    return null; // Nichts anzeigen, wenn keine vergangenen Events vorhanden sind
  }

  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">Past Events in {selectedCity}</h3>
      <ul className="space-y-2">
        {pastEvents.map(ev => (
          <li key={ev.id} className="border rounded p-2 bg-gray-50 hover:bg-gray-100">
            <a href={`/archive#event-${ev.id}`} className="text-blue-600 hover:underline">
              {ev.name} ({ev.starts_at ? new Date(ev.starts_at).toLocaleDateString() : 'Datum unbekannt'}) {/* KORREKTUR: Prüfung auf gültiges Datum */}
            </a>
            <div className="text-xs text-gray-600">{ev.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
