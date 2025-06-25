// pages/api/location-meta.js
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { lat, lng, address } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: 'Latitude and longitude are required.' });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  console.log('GEMINI_API_KEY----> :', geminiApiKey ? 'Loaded' : 'Not Found'); // Safer debugging

  if (!geminiApiKey) {
    console.error('GEMINI_API_KEY is not set in environment variables. Please check your .env.local file.');
    return res.status(500).json({ message: 'Server configuration error: Gemini API key missing.' });
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey);
  
  // --- FIX: Use a current and valid model name ---
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  try {
    const locationContext = address || `Coordinates: ${lat}, ${lng}`;
    const prompt = `Generate a short, mysterious "codeword" (1-2 words) and a concise, fascinating "teaser" (1-2 sentences) that alludes to the essence of the place "${locationContext}" without revealing it directly. The teaser should create an atmosphere. Return the output in JSON format with the keys "codeWord" and "teaser". Example: {"codeWord": "Hidden Path", "teaser": "Where old stories whisper in the wind and new secrets await."}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // The response from newer models with JSON instructions is generally more reliable.
    // This robust parsing is still a good practice.
    let jsonMatch = text.match(/\{[^]*\}/);
    let parsedData;

    if (jsonMatch) {
      try {
        parsedData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('Failed to parse Gemini JSON response:', parseError, 'Raw text:', text);
        parsedData = {
          codeWord: "Mystery",
          teaser: "A place of undiscovered wonders."
        };
      }
    } else {
      console.warn('No JSON found in Gemini response, providing fallback. Raw text:', text);
      parsedData = {
        codeWord: "Secret",
        teaser: "A location holding untold stories."
      };
    }

    res.status(200).json({
      codeWord: parsedData.codeWord,
      teaser: parsedData.teaser
    });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ message: 'Error generating location meta data', error: error.message });
  }
}