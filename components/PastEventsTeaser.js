// components/PastEventsTeaser.js
import React, { useState, useEffect } from 'react';

export default function PastEventsTeaser({ selectedCity }) {
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true); // Ladezustand hinzufügen

  useEffect(() => {
    const fetchPastEvents = async () => {
      setLoading(true); // Ladezustand auf true setzen
      try {
        // 1. Vergangene Events abrufen
        const response = await fetch('/api/event/archive');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // 2. Events nach Stadt filtern
        const filteredEvents = data.events
          .filter(event => event.city === selectedCity);

        // 3. Für jedes gefilterte Event die Anzahl der Posts/Chats abrufen
        const eventsWithCounts = await Promise.all(
          filteredEvents.map(async (event) => {
            try {
              const postsResponse = await fetch(`/api/event/${event.id}/posts`);
              if (!postsResponse.ok) {
                console.warn(`Failed to fetch posts for event ${event.id}: ${postsResponse.status}`);
                return { ...event, postCount: 0 }; // 0 Beiträge bei Fehler
              }
              const postsData = await postsResponse.json();
              // postsData.posts sollte ein Array von Posts und Chats enthalten
              return { ...event, postCount: (postsData.posts ? postsData.posts.length : 0) };
            } catch (postError) {
              console.error(`Error fetching posts for event ${event.id}:`, postError);
              return { ...event, postCount: 0 }; // 0 Beiträge bei Fehler
            }
          })
        );

        // 4. Nach Datum sortieren (neueste zuerst) und die ersten 3 nehmen
        const sortedAndLimitedEvents = eventsWithCounts
          .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime())
          .slice(0, 3);

        setPastEvents(sortedAndLimitedEvents);
      } catch (error) {
        console.error("Error fetching past events:", error);
        setPastEvents([]);
      } finally {
        setLoading(false); // Ladezustand auf false setzen
      }
    };

    fetchPastEvents();
  }, [selectedCity]);

  if (loading) {
    return <div className="mb-4 text-gray-500">Loading past events...</div>;
  }

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
              {ev.name} ({ev.starts_at && !isNaN(new Date(ev.starts_at)) ? new Date(ev.starts_at).toLocaleDateString() : 'Datum unbekannt'})
            </a>
            {/* Anzeige der Beitragsanzahl */}
            {ev.postCount !== undefined && (
              <div className="text-xs text-gray-600">
                {ev.description} <br/>
                {ev.postCount} Beiträge
              </div>
            )}
            {/* Fallback, falls postCount nicht verfügbar ist (sollte nicht passieren, aber zur Sicherheit) */}
            {ev.postCount === undefined && (
              <div className="text-xs text-gray-600">
                {ev.description}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
