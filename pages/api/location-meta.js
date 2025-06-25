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

  if (!geminiApiKey) {
    console.error('GEMINI_API_KEY is not set in environment variables.');
    return res.status(500).json({ message: 'Server configuration error: Gemini API key missing.' });
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  try {
    const locationContext = address || `Koordinaten: ${lat}, ${lng}`;
    const prompt = `Generiere ein kurzes, mysteriöses "Codewort" (1-2 Wörter) und einen prägnanten, faszinierenden "Teaser" (1-2 Sätze), der auf die Essenz des Ortes "${locationContext}" anspielt, ohne ihn direkt zu verraten. Der Teaser sollte eine Atmosphäre schaffen. Gib die Ausgabe im JSON-Format mit den Schlüsseln "codeWord" und "teaser" zurück. Beispiel: {"codeWord": "Verborgener Pfad", "teaser": "Wo alte Geschichten im Wind flüstern und neue Geheimnisse warten."}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Versuche, den JSON-String zu parsen. Manchmal gibt Gemini zusätzlichen Text zurück.
    let jsonMatch = text.match(/\{[^]*\}/);
    let parsedData;

    if (jsonMatch) {
      try {
        parsedData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('Failed to parse Gemini JSON response:', parseError, 'Raw text:', text);
        // Fallback, wenn JSON nicht geparst werden kann
        parsedData = {
          codeWord: "Geheimnisvoll",
          teaser: "Ein Ort voller unentdeckter Wunder."
        };
      }
    } else {
      console.warn('No JSON found in Gemini response, attempting to extract from raw text:', text);
      // Fallback, wenn kein JSON gefunden wird
      parsedData = {
        codeWord: text.split(' ')[0] || "Geheimnis",
        teaser: text.split('. ')[0] + '.' || "Ein Ort voller unentdeckter Wunder."
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
