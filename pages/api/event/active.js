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
      .lte('start_time', nowISO) // start_time ist in der Vergangenheit oder jetzt
      .gte('end_time', nowISO)   // end_time ist in der Zukunft oder jetzt
      .limit(1);

    if (activeError) {
      console.error('Supabase active event query failed:', activeError); // Verbessertes Logging
      return res.status(500).json({ message: 'Error fetching active event from database', error: activeError.message });
    }

    if (activeEvents && activeEvents.length > 0) {
      const eventData = activeEvents[0];
      // Fallback: Nutze latitude/longitude falls location fehlt
      activeEvent = {
        ...eventData,
        latitude: eventData.latitude ?? (eventData.location?.coordinates?.[1] ?? null),
        longitude: eventData.longitude ?? (eventData.location?.coordinates?.[0] ?? null),
      };
    }

    // 2. Suche nach dem nächsten bevorstehenden Event für die angegebene Stadt
    const { data: upcomingEvents, error: upcomingError } = await supabase
      .from('events')
      .select('*')
      .eq('city', city)
      .gt('start_time', activeEvent ? activeEvent.end_time : nowISO) // Startet nach dem aktiven Event oder nach jetzt
      .order('start_time', { ascending: true }) // Das früheste zukünftige Event
      .limit(1);

    if (upcomingError) {
      console.error('Supabase upcoming event query failed:', upcomingError); // Verbessertes Logging
      return res.status(500).json({ message: 'Error fetching upcoming event from database', error: upcomingError.message });
    }

    if (upcomingEvents && upcomingEvents.length > 0) {
      const eventData = upcomingEvents[0];
      // Fallback: Nutze latitude/longitude falls location fehlt
      nextUpcomingEvent = {
        ...eventData,
        latitude: eventData.latitude ?? (eventData.location?.coordinates?.[1] ?? null),
        longitude: eventData.longitude ?? (eventData.location?.coordinates?.[0] ?? null),
      };
    }

    res.status(200).json({ activeEvent, nextUpcomingEvent });

  } catch (error) {
    console.error('Unhandled API error in /api/event/active.js:', error); // Verbessertes Logging
    res.status(500).json({ message: 'Internal server error in API route', error: error.message });
  }
}
