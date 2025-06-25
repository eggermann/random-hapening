// pages/api/event/[id]/posts.js
import { supabase } from '../../../../lib/supabase';

export default async function handler(req, res) {
  const { id } = req.query; // eventId

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!id) {
    return res.status(400).json({ message: 'Event ID is required.' });
  }

  try {
    const { data: posts, error } = await supabase
      .from('content')
      .select('*')
      .eq('event_id', id) // Ensure this matches your Supabase column name
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }

    // Convert Supabase timestamp strings to a format consumable by client
    const formattedPosts = posts.map(post => ({
      ...post,
      timestamp: new Date(post.timestamp).toISOString(),
    }));

    res.status(200).json({ posts: formattedPosts });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
