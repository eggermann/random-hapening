// pages/api/location-meta.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { lat, lng, address, eventId } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: 'Latitude and longitude are required.' });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    return res.status(500).json({ message: 'Server configuration error: Gemini API key missing.' });
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  try {
    const locationContext = address || `Coordinates: ${lat}, ${lng}`;
    const prompt = `Generate a short, mysterious "codeword" (1-2 words) and a concise, fascinating "teaser" (1-2 sentences) that alludes to the essence of the place "${locationContext}" without revealing it directly. The teaser should create an atmosphere. Return the output in JSON format with the keys "codeWord" and "teaser". Example: {"codeWord": "Hidden Path", "teaser": "Where old stories whisper in the wind and new secrets await."}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let jsonMatch = text.match(/\{[^]*\}/);
    let parsedData;
    if (jsonMatch) {
      try {
        parsedData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        parsedData = {
          codeWord: "Mystery",
          teaser: "A place of undiscovered wonders."
        };
      }
    } else {
      parsedData = {
        codeWord: "Mystery",
        teaser: "A place of undiscovered wonders."
      };
    }

    // Fetch street address from Nominatim
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    const nominatimRes = await fetch(nominatimUrl, { headers: { 'User-Agent': 'HappeningRoulette/1.0' } });
    const nominatimData = await nominatimRes.json();
    const street = nominatimData.address?.road || nominatimData.display_name;

    // Optionally update event in Supabase
    if (eventId) {
      await supabase
        .from('events')
        .update({ street, codeword: parsedData.codeWord })
        .eq('id', eventId);
    }

    res.status(200).json({
      street,
      codeword: parsedData.codeWord,
      teaser: parsedData.teaser,
      nominatim: nominatimData
    });
  } catch (error) {
    res.status(500).json({ message: "Error generating location meta data", error: error.message });
  }
}