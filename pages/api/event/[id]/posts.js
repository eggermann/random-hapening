// pages/api/event/[id]/posts.js
import { supabase } from '../../../../lib/supabase';

export default async function handler(req, res) {
  const { id: eventId } = req.query; // eventId

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!eventId) {
    return res.status(400).json({ message: 'Event ID is required.' });
  }

  try {
    // NEU: Posts abrufen
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true }); // ÄNDERUNG: created_at

    if (postsError && postsError.code !== 'PGRST116') throw postsError;

    // NEU: Chats abrufen
    const { data: chatsData, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true }); // Use created_at if sent_at does not exist

    if (chatsError && chatsError.code !== 'PGRST116') throw chatsError;

    // NEU: Inhalte kombinieren und sortieren
    const combinedContent = [
      ...(postsData || []).map(p => ({
        id: p.id,
        event_id: p.event_id,
        user_id: p.user_id,
        type: p.type,
        url: p.content_url, // ÄNDERUNG: content_url zu url mappen für Frontend-Kompatibilität
        text: p.text_content, // ÄNDERUNG: text_content zu text mappen
        timestamp: p.created_at, // ÄNDERUNG: created_at
      })),
      ...(chatsData || []).map(c => ({
        id: c.id,
        event_id: c.event_id,
        user_id: c.user_id,
        type: 'chat', // Explizit als Chat markieren
        text: c.message, // ÄNDERUNG: message zu text mappen
        timestamp: c.created_at, // Use created_at if sent_at does not exist
      })),
    ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    res.status(200).json({ posts: combinedContent }); // 'posts' als generischer Name für den Feed
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
}
