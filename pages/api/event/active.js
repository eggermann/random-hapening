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

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1); // Start of tomorrow

  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('city', city)
      .gte('date', today.toISOString())
      .lt('date', tomorrow.toISOString())
      .order('date', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ message: 'Error fetching event', error: error.message });
    }

    if (events && events.length > 0) {
      // Convert Supabase date string to a format consumable by client (e.g., ISO string)
      const event = {
        ...events[0],
        date: new Date(events[0].date).toISOString(),
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
