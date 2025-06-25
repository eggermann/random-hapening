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
      .lt('ends_at', nowISO) // ÄNDERUNG: ends_at verwenden
      .order('ends_at', { ascending: false }); // ÄNDERUNG: Nach ends_at sortieren

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ message: 'Error fetching archived events', error: error.message });
    }

    const formattedEvents = events.map(event => ({
      ...event,
      // Die API gibt bereits ISO-Strings zurück, keine weitere Konvertierung nötig
      // aber wir müssen die GeoJSON-Location für den Client aufbereiten
      latitude: event.location.coordinates[1], // GeoJSON ist [lng, lat]
      longitude: event.location.coordinates[0],
      // starts_at und ends_at sind bereits ISO-Strings
    }));

    res.status(200).json({ events: formattedEvents });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
