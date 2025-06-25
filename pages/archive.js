// pages/archive.js
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ArchivePage() {
  const [archivedEvents, setArchivedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArchivedEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/event/archive'); // New API endpoint for archive
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setArchivedEvents(data.events || []);
      } catch (err) {
        console.error("Error fetching archived events:", err);
        setError("Failed to load archived events.");
      } finally {
        setLoading(false);
      }
    };

    fetchArchivedEvents();
  }, []);

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

      <main className="flex-grow container mx-auto p-4">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Archive of Past Happenings</h2>

        {loading && <p className="text-center text-gray-600">Loading archived events...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!loading && archivedEvents.length === 0 && (
          <p className="text-center text-gray-600">No past events found.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archivedEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.city} Happening</h3>
              <p className="text-gray-700 mb-1">
                **Date:** {new Date(event.date).toLocaleDateString()}
              </p>
              <p className="text-gray-700 mb-1">
                **Time:** {event.startTime} - {event.endTime}
              </p>
              <p className="text-gray-700 mb-4">
                **Location:** Lat: {event.latitude.toFixed(4)}, Lng: {event.longitude.toFixed(4)}
              </p>
              {/* Optional: Link zu einer Detailseite für das Event, um dessen Inhalte anzuzeigen */}
              {/* <Link href={`/archive/${event.id}`} className="text-blue-600 hover:underline">
                View Event Details
              </Link> */}
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-gray-800 text-white p-4 text-center mt-8">
        <p>&copy; {new Date().getFullYear()} HappeningRoulette.com. All rights reserved.</p>
      </footer>
    </div>
  );
}
