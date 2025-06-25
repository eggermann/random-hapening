// pages/api/event/active.js
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ message: 'City parameter is required.' });
  }

  const now = new Date();
  const nowISO = now.toISOString();

  let activeEvent = null;
  let nextUpcomingEvent = null;

  try {
    // 1. Suche nach einem aktuell aktiven Event für die angegebene Stadt
    const { data: activeEvents, error: activeError } = await supabase
      .from('events')
      .select('*')
      .eq('city', city)
      .lte('starts_at', nowISO) // starts_at ist in der Vergangenheit oder jetzt
      .gte('ends_at', nowISO)   // ends_at ist in der Zukunft oder jetzt
      .limit(1);

    if (activeError) {
      console.error('Supabase active event error:', activeError);
      return res.status(500).json({ message: 'Error fetching active event', error: activeError.message });
    }

    if (activeEvents && activeEvents.length > 0) {
      const eventData = activeEvents[0];
      // SICHERHEITSCHECK: Prüfen, ob location und coordinates existieren und korrekt sind
      if (eventData.location && eventData.location.coordinates && eventData.location.coordinates.length === 2) {
        activeEvent = {
          ...eventData,
          latitude: eventData.location.coordinates[1], // GeoJSON ist [lng, lat]
          longitude: eventData.location.coordinates[0],
        };
      } else {
        console.warn(`Active event ${eventData.id} has missing or malformed location data. Skipping this event.`);
        // Das Event wird nicht als activeEvent gesetzt, um den Fehler zu vermeiden.
      }
    }

    // 2. Suche nach dem nächsten bevorstehenden Event für die angegebene Stadt
    const { data: upcomingEvents, error: upcomingError } = await supabase
      .from('events')
      .select('*')
      .eq('city', city)
      .gt('starts_at', activeEvent ? activeEvent.ends_at : nowISO) // Startet nach dem aktiven Event oder nach jetzt
      .order('starts_at', { ascending: true }) // Das früheste zukünftige Event
      .limit(1);

    if (upcomingError) {
      console.error('Supabase upcoming event error:', upcomingError);
      return res.status(500).json({ message: 'Error fetching upcoming event', error: upcomingError.message });
    }

    if (upcomingEvents && upcomingEvents.length > 0) {
      const eventData = upcomingEvents[0];
      // SICHERHEITSCHECK: Prüfen, ob location und coordinates existieren und korrekt sind
      if (eventData.location && eventData.location.coordinates && eventData.location.coordinates.length === 2) {
        nextUpcomingEvent = {
          ...eventData,
          latitude: eventData.location.coordinates[1],
          longitude: eventData.location.coordinates[0],
        };
      } else {
        console.warn(`Upcoming event ${eventData.id} has missing or malformed location data. Skipping this event.`);
        // Das Event wird nicht als nextUpcomingEvent gesetzt, um den Fehler zu vermeiden.
      }
    }

    // Gib beide Events zurück
    res.status(200).json({ activeEvent, nextUpcomingEvent });

  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
