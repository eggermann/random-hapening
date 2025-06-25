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
      activeEvent = {
        ...activeEvents[0],
        latitude: activeEvents[0].location.coordinates[1], // GeoJSON ist [lng, lat]
        longitude: activeEvents[0].location.coordinates[0],
      };
    }

    // 2. Suche nach dem nächsten bevorstehenden Event für die angegebene Stadt
    // Dies ist entweder das nächste Event nach jetzt, wenn kein Event aktiv ist,
    // oder das nächste Event nach dem Ende des aktiven Events.
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
      nextUpcomingEvent = {
        ...upcomingEvents[0],
        latitude: upcomingEvents[0].location.coordinates[1],
        longitude: upcomingEvents[0].location.coordinates[0],
      };
    }

    // Gib beide Events zurück
    res.status(200).json({ activeEvent, nextUpcomingEvent });

  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
