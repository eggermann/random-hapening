// lib/hooks/useEventData.js
import { useState, useEffect } from 'react';

const citiesData = [
  { name: 'Berlin', coords: [52.5200, 13.4050] },
  { name: 'Los Angeles', coords: [34.0522, -118.2437] },
  { name: 'Hong Kong', coords: [22.3193, 114.1694] },
  { name: 'Singapore', coords: [1.3521, 103.8198] },
  { name: 'Forlì', coords: [44.2225, 12.0408] },
  { name: 'Basel', coords: [47.5596, 7.5886] },
];

export function useEventData() {
  const [selectedCity, setSelectedCity] = useState('Berlin');
  const [currentEvent, setCurrentEvent] = useState(null);
  const [nextEvent, setNextEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/event/active?city=${selectedCity}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.activeEvent) {
          setCurrentEvent({
            id: data.activeEvent.id,
            city: data.activeEvent.city,
            latitude: data.activeEvent.latitude,
            longitude: data.activeEvent.longitude,
            radius: data.activeEvent.radius,
            date: new Date(data.activeEvent.starts_at),
            startTime: new Date(data.activeEvent.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: new Date(data.activeEvent.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
          setNextEvent(null);
        } else {
          setCurrentEvent(null);
          if (data.nextUpcomingEvent) {
            setNextEvent({
              id: data.nextUpcomingEvent.id,
              city: data.nextUpcomingEvent.city,
              latitude: data.nextUpcomingEvent.latitude,
              longitude: data.nextUpcomingEvent.longitude,
              radius: data.nextUpcomingEvent.radius,
              date: data.nextUpcomingEvent.starts_at, // Keep as string for countdown hook
              startTime: new Date(data.nextUpcomingEvent.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              endTime: new Date(data.nextUpcomingEvent.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
          } else {
            // Kein aktives oder zukünftiges Event: Generiere ein zufälliges Event für die nächste Woche
            const cityObj = citiesData.find(c => c.name === selectedCity);
            const baseLat = cityObj?.coords[0] || 52.5200;
            const baseLng = cityObj?.coords[1] || 13.4050;
            const randomOffset = () => (Math.random() - 0.5) * 0.02; // ~2km Radius

            const randomLat = baseLat + randomOffset();
            const randomLng = baseLng + randomOffset();

            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            nextWeek.setHours(18, 0, 0, 0); // 18:00 Uhr nächste Woche

            setNextEvent({
              id: 'random',
              city: selectedCity,
              latitude: randomLat,
              longitude: randomLng,
              radius: 50,
              date: nextWeek.toISOString(), // Keep as string for countdown hook
              startTime: nextWeek.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              endTime: new Date(nextWeek.getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
          }
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setCurrentEvent(null);
        setNextEvent(null);
      }
    };

    fetchEvents();
  }, [selectedCity]);

  return { selectedCity, setSelectedCity, currentEvent, nextEvent, cities: citiesData };
}
