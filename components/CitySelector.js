// components/CitySelector.js
import React from 'react';

export default function CitySelector({ selectedCity, setSelectedCity, cities }) {
  return (
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
  );
}
