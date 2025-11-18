/**
 * Vercel Serverless Function to proxy FMP API requests
 * This secures the API key on the server side
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { from, to } = req.query;
    
    // Validate query parameters
    if (!from || !to) {
      return res.status(400).json({ error: 'Missing required parameters: from, to' });
    }

    // Get API key from environment variable
    const apiKey = process.env.FMP_API_KEY;
    
    if (!apiKey) {
      console.error('FMP_API_KEY environment variable not set');
      return res.status(500).json({ error: 'API configuration error' });
    }

    // Build FMP API URL
    const fmpUrl = `https://financialmodelingprep.com/api/v3/earning_calendar?from=${from}&to=${to}&apikey=${apiKey}`;
    
    // Fetch from FMP API
    const response = await fetch(fmpUrl);
    
    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Return data to client
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Error proxying earnings request:', error);
    res.status(500).json({ 
      error: 'Failed to fetch earnings data',
      message: error.message 
    });
  }
}
