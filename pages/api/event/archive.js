// pages/api/event/archive.js
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const now = new Date();
  // NEU: Wir suchen Events, deren ends_at in der Vergangenheit liegt
  const nowISO = now.toISOString();

  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .lt('end_time', nowISO) // end_time statt ends_at
      .order('end_time', { ascending: false }); // Nach end_time sortieren

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ message: 'Error fetching archived events', error: error.message });
    }

    const formattedEvents = events.map(event => ({
      ...event,
      // Die API gibt bereits ISO-Strings zurück, keine weitere Konvertierung nötig
      // aber wir müssen die GeoJSON-Location für den Client aufbereiten
      latitude: event.latitude ?? (event.location?.coordinates?.[1] ?? null),
      longitude: event.longitude ?? (event.location?.coordinates?.[0] ?? null),
      // starts_at und ends_at sind bereits ISO-Strings
    }));

    res.status(200).json({ events: formattedEvents });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
