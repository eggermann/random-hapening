// lib/hooks/useLiveContent.js
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase'; // Stellen Sie sicher, dass der Pfad korrekt ist

export function useLiveContent(currentEvent) {
  const [liveContent, setLiveContent] = useState([]);
  const contentEndRef = useRef(null);

  useEffect(() => {
    setLiveContent([]); // Always clear live feed when event changes
    if (!currentEvent) {
      return;
    }

    const fetchInitialContent = async () => {
      const response = await fetch(`/api/event/${currentEvent.id}/posts`);
      if (!response.ok) {
        console.error("Error fetching initial live content:", await response.text());
        return;
      }
      const data = await response.json();
      setLiveContent(data.posts || []);
      if (contentEndRef.current) {
        contentEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };

    fetchInitialContent();

    // Realtime-Abonnement für Posts
    const postsChannel = supabase
      .channel(`posts:${currentEvent.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts', filter: `event_id=eq.${currentEvent.id}` }, payload => {
        const newPost = {
          id: payload.new.id,
          event_id: payload.new.event_id,
          user_id: payload.new.user_id,
          type: payload.new.type,
          url: payload.new.content_url,
          text: payload.new.text_content,
          timestamp: payload.new.created_at,
        };
        setLiveContent(prev => [...prev, newPost].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
        if (contentEndRef.current) {
          contentEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      })
      .subscribe();

    // Realtime-Abonnement für Chats
    const chatsChannel = supabase
      .channel(`chats:${currentEvent.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chats', filter: `event_id=eq.${currentEvent.id}` }, payload => {
        const newChat = {
          id: payload.new.id,
          event_id: payload.new.event_id,
          user_id: payload.new.user_id,
          type: 'chat',
          text: payload.new.message,
          timestamp: payload.new.sent_at,
        };
        setLiveContent(prev => [...prev, newChat].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
        if (contentEndRef.current) {
          contentEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(chatsChannel);
    };
  }, [currentEvent]);

  return { liveContent, contentEndRef };
}
