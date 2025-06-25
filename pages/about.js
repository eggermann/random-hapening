// pages/about.js
export default function AboutPage() {
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

      <main className="flex-grow container mx-auto p-8 text-center">
        <h2 className="text-4xl font-bold mb-6 text-gray-800">About HappeningRoulette.com</h2>
        <p className="text-lg text-gray-700 mb-4">
          HappeningRoulette.com is your gateway to spontaneous and engaging art events around the globe.
          Every Friday, we reveal a new location where art comes alive.
        </p>
        <p className="text-lg text-gray-700 mb-4">
          Our mission is to connect people through shared artistic experiences, fostering creativity and community
          in real-time. Join the geofan, contribute your unique perspective, and be part of the unfolding art narrative.
        </p>
        <p className="text-lg text-gray-700 font-semibold mt-8">
          :art for ever
        </p>
      </main>

      <footer className="bg-gray-800 text-white p-4 text-center mt-8">
        <p>&copy; {new Date().getFullYear()} HappeningRoulette.com. All rights reserved.</p>
      </footer>
    </div>
  );
}
