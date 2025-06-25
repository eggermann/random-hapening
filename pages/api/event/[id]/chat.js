// pages/api/event/[id]/chat.js
import { supabase } from '../../../../lib/supabase';

export default async function handler(req, res) {
  const { id } = req.query; // eventId
  const { text } = req.body;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!id || !text) {
    return res.status(400).json({ message: 'Event ID and text are required.' });
  }

  try {
    const { data, error } = await supabase
      .from('content')
      .insert([
        {
          event_id: id, // Ensure this matches your Supabase column name
          type: 'chat',
          text: text,
          timestamp: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ message: 'Error adding chat message', error: error.message });
    }

    res.status(201).json({ message: 'Chat message added successfully', data });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
