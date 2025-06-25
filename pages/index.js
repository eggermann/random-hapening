// pages/index.js
import dynamic from 'next/dynamic';
import React, { useState, useEffect, useMemo } from 'react';

// Importiere neue Komponenten
import CitySelector from '../components/CitySelector';
import EventDetails from '../components/EventDetails';
import LiveFeed from '../components/LiveFeed';
import ContentShareForm from '../components/ContentShareForm';
import PastEventsTeaser from '../components/PastEventsTeaser';

// Importiere neue Hooks
import { useEventData } from '../lib/hooks/useEventData';
import { useLiveContent } from '../lib/hooks/useLiveContent';
import { useCountdown } from '../lib/hooks/useCountdown';
import { useIsInsideGeofence } from '../lib/useIsInside';
import { supabase } from '../lib/supabase'; // Supabase weiterhin hier für Upload/Chat

// Dynamischer Import für MapComponent
const MapComponent = dynamic(() => import('../components/MapComponent'), { ssr: false });

export default function HomePage() {
  // Verwende den neuen Hook für Event-Daten
  const { selectedCity, setSelectedCity, currentEvent, nextEvent, cities } = useEventData();

  // Verwende den neuen Hook für Live-Inhalte
  const { liveContent, contentEndRef } = useLiveContent(currentEvent);

  // Verwende den neuen Hook für den Countdown
  const targetCountdownDate = currentEvent ? currentEvent.date : (nextEvent ? nextEvent.date : null);
  const timeRemaining = useCountdown(targetCountdownDate);

  // Geofence-Logik bleibt hier, da sie von currentEvent/nextEvent und userLocation abhängt
  const { isInside, userLocation } = useIsInsideGeofence(
    currentEvent
      ? { latitude: currentEvent.latitude, longitude: currentEvent.longitude }
      : nextEvent
        ? { latitude: nextEvent.latitude, longitude: nextEvent.longitude }
        : null,
    currentEvent
      ? currentEvent.radius
      : nextEvent
        ? nextEvent.radius
        : null
  );

  const [chatInput, setChatInput] = useState('');

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
      // Inhalte werden durch Realtime-Abonnement in useLiveContent aktualisiert
    } catch (e) {
      console.error("Error sending chat message: ", e);
      alert("Fehler beim Senden der Nachricht.");
    }
  };

  // Medien-Upload über Supabase Storage
  const handleUploadMedia = async (event) => {
    const file = event.target.files[0];
    if (!currentEvent || !file) return;
    if (!isInside) {
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
      // Inhalte werden durch Realtime-Abonnement in useLiveContent aktualisiert
    } catch (e) {
      console.error("Error uploading media: ", e);
      alert("Failed to upload media. Please try again.");
    }
  };

  // Bestimme die anzuzeigenden Kartenkoordinaten und den Radius
  const mapCenter = useMemo(() => {
    if (currentEvent) return [currentEvent.latitude, currentEvent.longitude];
    if (nextEvent) return [nextEvent.latitude, nextEvent.longitude];
    return cities.find(c => c.name === selectedCity)?.coords || [52.5200, 13.4050];
  }, [currentEvent, nextEvent, selectedCity, cities]);

  const mapRadius = currentEvent
    ? currentEvent.radius
    : nextEvent
      ? nextEvent.radius
      : 1000; // Standardradius (z.B. 1000 Meter), wenn kein Event

  // isActive für MapComponent (nur aktiv, wenn ein aktuelles Event und der Nutzer drin ist)
  const mapIsActive = currentEvent ? isInside : false;

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

      <div className="bg-green-500 text-white p-4">
        Tailwind funktioniert!
      </div>

      <main className="flex-grow container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">Current Happening</h2>

          <PastEventsTeaser selectedCity={selectedCity} />

          <CitySelector
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            cities={cities}
          />

          {/* Karte wird immer gerendert */}
          <div className="h-96 w-full rounded-md overflow-hidden mb-4">
            <MapComponent
              center={mapCenter}
              radius={mapRadius}
              userLocation={userLocation}
              isActive={mapIsActive}
            />
          </div>

          <EventDetails
            currentEvent={currentEvent}
            nextEvent={nextEvent}
            timeRemaining={timeRemaining}
            userLocation={userLocation}
            isInside={isInside}
          />
        </div>

        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Live Feed</h2>
          <LiveFeed liveContent={liveContent} contentEndRef={contentEndRef} />
          <ContentShareForm
            currentEvent={currentEvent}
            isInside={isInside}
            chatInput={chatInput}
            setChatInput={setChatInput}
            handleSendChat={handleSendChat}
            handleUploadMedia={handleUploadMedia}
          />
        </div>
      </main>

      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>&copy; {new Date().getFullYear()} HappeningRoulette.com. All rights reserved.</p>
      </footer>
    </div>
  );
}
