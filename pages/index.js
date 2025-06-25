// pages/index.js
import dynamic from 'next/dynamic';
import { useState, useEffect, useRef, useCallback } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import Masonry from 'react-masonry-css';
import { useIsInsideGeofence } from '../lib/useIsInside'; // Import the new hook

// Dynamischer Import für MapComponent, da Leaflet nur im Browser läuft
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

  // Use the new geofence hook
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
        setCurrentEvent(data.event || null);
      } catch (error) {
        console.error("Error fetching current event:", error);
        setCurrentEvent(null);
      }
    };

    fetchCurrentEvent();
    // Optional: Polling für Event-Updates, falls Events sich tagsüber ändern könnten
    // const interval = setInterval(fetchCurrentEvent, 60000); // Alle 60 Sekunden
    // return () => clearInterval(interval);
  }, [selectedCity]);

  // Effekt zum Abrufen von Live-Inhalten für das aktuelle Event über API
  useEffect(() => {
    if (currentEvent) {
      const fetchLiveContent = async () => {
        try {
          const response = await fetch(`/api/event/${currentEvent.id}/posts`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setLiveContent(data.posts || []);
          // Scrollen zum neuesten Inhalt
          if (contentEndRef.current) {
            contentEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        } catch (error) {
          console.error("Error fetching live content:", error);
          setLiveContent([]);
        }
      };

      fetchLiveContent();
      // Polling für Live-Inhalte
      const interval = setInterval(fetchLiveContent, 5000); // Alle 5 Sekunden
      return () => clearInterval(interval);
    } else {
      setLiveContent([]);
    }
  }, [currentEvent]);

  // Chat-Nachricht senden
  const handleSendChat = async () => {
    if (chatInput.trim() === '' || !currentEvent) return;
    if (!isInside) {
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
      // Inhalte werden durch Polling aktualisiert
    } catch (e) {
      console.error("Error sending chat message: ", e);
      alert("Fehler beim Senden der Nachricht.");
    }
  };

  // Callback nach erfolgreichem Cloudinary-Upload
  const handleUploadSuccess = useCallback(async (result) => {
    if (result.event === 'success' && currentEvent) {
      if (!isInside) {
        alert('Sie sind nicht im Event-Bereich und können keine Medien hochladen!');
        return;
      }

      const { secure_url, resource_type } = result.info;
      try {
        const response = await fetch(`/api/event/${currentEvent.id}/post`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: resource_type === 'image' ? 'image' : 'video',
            url: secure_url,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Inhalte werden durch Polling aktualisiert
      } catch (e) {
        console.error("Error adding media content: ", e);
        alert("Fehler beim Hochladen der Medien.");
      }
    }
  }, [currentEvent, isInside]);

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
                **Date:** {new Date(currentEvent.date).toLocaleDateString()}
              </p>
              <p className="mb-4">
                **Time:** {currentEvent.startTime} - {currentEvent.endTime}
              </p>
              <div className="h-96 w-full rounded-md overflow-hidden">
                <MapComponent
                  center={[currentEvent.latitude, currentEvent.longitude]}
                  radius={currentEvent.radius}
                  userLocation={userLocation}
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
                  {item.type === 'image' && <img src={item.url} alt="Content" className="w-full h-auto rounded-md" />}
                  {item.type === 'video' && <video src={item.url} controls className="w-full h-auto rounded-md" />}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
              <div ref={contentEndRef} />
            </Masonry>
          </div>

          {currentEvent && isInside && ( // Nur anzeigen, wenn im Geofence
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
              <CldUploadWidget
                uploadPreset="happening_roulette_preset" // Ihr Cloudinary Upload Preset
                onSuccess={handleUploadSuccess}
                options={{
                  sources: ['local', 'url', 'camera'],
                  multiple: false,
                  resourceType: 'auto', // Erlaubt Bilder und Videos
                }}
              >
                {({ open }) => {
                  return (
                    <button
                      onClick={() => open()}
                      className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 text-sm"
                    >
                      Upload Photo/Video
                    </button>
                  );
                }}
              </CldUploadWidget>
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
