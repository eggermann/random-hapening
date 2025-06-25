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

  // NEU: Logik, um das aktuelle Event zu finden, das über Mitternacht gehen kann
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay(); // 0 = Sonntag, 5 = Freitag, 6 = Samstag

  let targetDateStart;
  let targetDateEnd;

  // Wenn es Freitag ist (Tag 5) und nach 15:00 Uhr ODER Samstag ist (Tag 6) und vor 04:00 Uhr
  if ((currentDay === 5 && currentHour >= 15) || (currentDay === 6 && currentHour < 4)) {
    // Das Event ist das vom aktuellen Freitag
    targetDateStart = new Date(now);
    targetDateStart.setDate(now.getDate() - (currentDay - 5)); // Setze auf den aktuellen Freitag
    targetDateStart.setHours(15, 0, 0, 0);

    targetDateEnd = new Date(targetDateStart);
    targetDateEnd.setDate(targetDateEnd.getDate() + 1); // Nächster Tag
    targetDateEnd.setHours(4, 0, 0, 0);
  } else {
    // Kein aktives Event für heute/jetzt, oder es ist ein anderer Tag
    return res.status(200).json({ event: null });
  }

  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('city', city)
      .gte('starts_at', targetDateStart.toISOString()) // ÄNDERUNG: starts_at verwenden
      .lte('ends_at', targetDateEnd.toISOString())     // ÄNDERUNG: ends_at verwenden
      .order('starts_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ message: 'Error fetching event', error: error.message });
    }

    if (events && events.length > 0) {
      const event = {
        ...events[0],
        // Die API gibt bereits ISO-Strings zurück, keine weitere Konvertierung nötig
        // aber wir müssen die GeoJSON-Location für den Client aufbereiten
        latitude: events[0].location.coordinates[1], // GeoJSON ist [lng, lat]
        longitude: events[0].location.coordinates[0],
        // starts_at und ends_at sind bereits ISO-Strings
      };
      res.status(200).json({ event });
    } else {
      res.status(200).json({ event: null });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
