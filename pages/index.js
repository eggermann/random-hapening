// pages/index.js
import dynamic from 'next/dynamic';
import { useState, useEffect, useRef, useCallback } from 'react';
// import { CldUploadWidget } from 'next-cloudinary'; // ENTFERNT
import Masonry from 'react-masonry-css';
import { useIsInsideGeofence } from '../lib/useIsInside'; // Korrekter Importname
import { supabase } from '../lib/supabase'; // Supabase importieren

// Dynamischer Import für MapComponent
const MapComponent = dynamic(() => import('../components/MapComponent'), { ssr: false });

export default function HomePage() {
  const [selectedCity, setSelectedCity] = useState('Berlin');
  const [currentEvent, setCurrentEvent] = useState(null);
  const [liveContent, setLiveContent] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const contentEndRef = useRef(null);

  const cities = [
    { name: 'Berlin', coords: [52.5200, 13.4050] },
    { name: 'Los Angeles', coords: [34.0522, -118.2437] },
    { name: 'Hong Kong', coords: [22.3193, 114.1694] },
    { name: 'Singapore', coords: [1.3521, 103.8198] },
    { name: 'Forlì', coords: [44.2225, 12.0408] },
    { name: 'Basel', coords: [47.5596, 7.5886] },
  ];

  // NEU: useIsInsideGeofence Hook verwenden
  const { isInside, userLocation } = useIsInsideGeofence(
    currentEvent ? { latitude: currentEvent.latitude, longitude: currentEvent.longitude } : null,
    currentEvent ? currentEvent.radius : null
  );

  // Effekt zum Abrufen des aktuellen Events über API
  useEffect(() => {
    const fetchCurrentEvent = async () => {
      try {
        const response = await fetch(`/api/event/active?city=${selectedCity}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.event) {
          // ÄNDERUNG: Datenstruktur von der API anpassen
          setCurrentEvent({
            id: data.event.id,
            city: data.event.city,
            latitude: data.event.latitude, // API liefert bereits aufbereitet
            longitude: data.event.longitude, // API liefert bereits aufbereitet
            radius: data.event.radius,
            date: new Date(data.event.starts_at), // starts_at als Datum verwenden
            startTime: new Date(data.event.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: new Date(data.event.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        } else {
          setCurrentEvent(null);
        }
      } catch (error) {
        console.error("Error fetching current event:", error);
        setCurrentEvent(null);
      }
    };

    fetchCurrentEvent();
  }, [selectedCity]);

  // Effekt zum Abrufen von Live-Inhalten für das aktuelle Event über Supabase Realtime
  useEffect(() => {
    if (!currentEvent) {
      setLiveContent([]);
      return;
    }

    const fetchInitialContent = async () => {
      // Initial Posts und Chats über die API-Route abrufen
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

  // Chat-Nachricht senden
  const handleSendChat = async () => {
    if (chatInput.trim() === '' || !currentEvent) return;
    if (!isInside) { // isInside aus useIsInsideGeofence
      alert('Sie sind nicht im Event-Bereich und können keine Nachrichten senden!');
      return;
    }

    try {
      const response = await fetch(`/api/event/${currentEvent.id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: chatInput }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setChatInput('');
      // Inhalte werden durch Realtime-Abonnement aktualisiert
    } catch (e) {
      console.error("Error sending chat message: ", e);
      alert("Fehler beim Senden der Nachricht.");
    }
  };

  // Medien-Upload über Supabase Storage
  const handleUploadMedia = async (event) => {
    const file = event.target.files[0];
    if (!currentEvent || !file) return;
    if (!isInside) { // isInside aus useIsInsideGeofence
      alert('Sie sind nicht im Event-Bereich und können keine Medien hochladen!');
      return;
    }

    try {
      const fileExtension = file.name.split('.').pop();
      const filePath = `${currentEvent.id}/${Date.now()}.${fileExtension}`;
      const { data, error: uploadError } = await supabase.storage
        .from('event-media') // Stellen Sie sicher, dass dieser Bucket in Supabase Storage existiert
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('event-media')
        .getPublicUrl(filePath);

      const mediaType = file.type.startsWith('image/') ? 'photo' : 'video';

      const response = await fetch(`/api/event/${currentEvent.id}/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: mediaType,
          url: publicUrlData.publicUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create post: ${response.statusText}`);
      }
      // Inhalte werden durch Realtime-Abonnement aktualisiert
    } catch (e) {
      console.error("Error uploading media: ", e);
      alert("Failed to upload media. Please try again.");
    }
  };

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">HappeningRoulette.com</h1>
        <nav>
          <ul className="flex space-x-4">
            <li><a href="/" className="hover:text-gray-300">Home</a></li>
            <li><a href="/archive" className="hover:text-gray-300">Archive</a></li>
            <li><a href="/about" className="hover:text-gray-300">About</a></li>
          </ul>
        </nav>
      </header>

      <main className="flex-grow container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">Current Happening</h2>
          <div className="mb-4">
            <label htmlFor="city-select" className="block text-sm font-medium text-gray-700">Select City:</label>
            <select
              id="city-select"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              {cities.map((city) => (
                <option key={city.name} value={city.name}>{city.name}</option>
              ))}
            </select>
          </div>

          {currentEvent ? (
            <>
              <p className="mb-2">
                **Location:** {currentEvent.city} (Lat: {currentEvent.latitude.toFixed(4)}, Lng: {currentEvent.longitude.toFixed(4)})
              </p>
              <p className="mb-2">
                **Date:** {currentEvent.date.toLocaleDateString()}
              </p>
              <p className="mb-4">
                **Time:** {currentEvent.startTime} - {currentEvent.endTime}
              </p>
              <div className="h-96 w-full rounded-md overflow-hidden">
                <MapComponent
                  center={[currentEvent.latitude, currentEvent.longitude]}
                  radius={currentEvent.radius}
                  userLocation={userLocation}
                  isActive={isInside} {/* NEU: isInside an MapComponent weitergeben */}
                />
              </div>
              {userLocation && (
                <p className={`mt-2 text-sm ${isInside ? 'text-green-600' : 'text-red-600'}`}>
                  You are {isInside ? 'inside' : 'outside'} the geofence.
                </p>
              )}
            </>
          ) : (
            <p>No current happening found for {selectedCity}.</p>
          )}
        </div>

        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Live Feed</h2>
          <div className="flex-grow overflow-y-auto border rounded-md p-2 mb-4 h-96">
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="my-masonry-grid"
              columnClassName="my-masonry-grid_column"
            >
              {liveContent.map((item) => (
                <div key={item.id} className="p-2 border rounded-md mb-2 break-words">
                  {item.type === 'chat' && <p className="text-sm">{item.text}</p>}
                  {item.type === 'photo' && <img src={item.url} alt="Content" className="w-full h-auto rounded-md" />}
                  {item.type === 'video' && <video src={item.url} controls className="w-full h-auto rounded-md" />}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
              <div ref={contentEndRef} />
            </Masonry>
          </div>

          {currentEvent && isInside && ( // isInside aus useIsInsideGeofence
            <div className="mt-auto">
              <h3 className="text-lg font-semibold mb-2">Share Content / Chat</h3>
              <div className="flex mb-2">
                <input
                  type="text"
                  className="flex-grow border rounded-l-md p-2 text-sm"
                  placeholder="Type your message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter') handleSendChat(); }}
                />
                <button
                  onClick={handleSendChat}
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 text-sm"
                >
                  Send
                </button>
              </div>
              {/* ÄNDERUNG: Cloudinary Widget durch einfaches File-Input ersetzen */}
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleUploadMedia}
                className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 text-sm cursor-pointer"
              />
            </div>
          )}
          {!currentEvent && <p className="text-center text-gray-500">No active event to share content.</p>}
          {currentEvent && !isInside && <p className="text-center text-gray-500">Move closer to the event to share content!</p>}
        </div>
      </main>

      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>&copy; {new Date().getFullYear()} HappeningRoulette.com. All rights reserved.</p>
      </footer>
    </div>
  );
}
