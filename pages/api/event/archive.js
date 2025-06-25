// pages/api/event/archive.js
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today

  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .lt('date', today.toISOString()) // Events before today
      .order('date', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ message: 'Error fetching archived events', error: error.message });
    }

    // Convert Supabase date string to a format consumable by client
    const formattedEvents = events.map(event => ({
      ...event,
      date: new Date(event.date).toISOString(),
    }));

    res.status(200).json({ events: formattedEvents });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
