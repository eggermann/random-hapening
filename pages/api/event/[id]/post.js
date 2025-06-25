// pages/api/event/[id]/post.js
import { supabase } from '../../../../lib/supabase';

export default async function handler(req, res) {
  const { id } = req.query; // eventId
  const { type, url } = req.body;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!id || !type || !url) {
    return res.status(400).json({ message: 'Event ID, type, and URL are required.' });
  }

  try {
    const { data, error } = await supabase
      .from('content')
      .insert([
        {
          event_id: id, // Ensure this matches your Supabase column name
          type: type,
          url: url,
          timestamp: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ message: 'Error adding media content', error: error.message });
    }

    res.status(201).json({ message: 'Media content added successfully', data });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
