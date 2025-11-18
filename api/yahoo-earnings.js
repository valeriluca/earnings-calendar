/**
 * Vercel Serverless Function to fetch earnings data using yahoo-finance2
 * This eliminates CORS issues by proxying requests through the backend
 */
import YahooFinance from 'yahoo-finance2';

// Initialize yahoo-finance2 (required for v3+)
const yf = new YahooFinance();

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
    const { symbols, from, to } = req.query;
    
    // Validate query parameters
    if (!symbols) {
      return res.status(400).json({ error: 'Missing required parameter: symbols' });
    }

    // Parse symbols (can be comma-separated)
    const symbolList = Array.isArray(symbols) ? symbols : symbols.split(',');
    
    // Parse date range
    const fromDate = from ? new Date(from) : new Date();
    const toDate = to ? new Date(to) : addDays(fromDate, 60);
    
    console.log(`Fetching earnings for ${symbolList.length} symbols from ${fromDate.toISOString()} to ${toDate.toISOString()}`);
    
    // Fetch earnings for all symbols
    const earningsPromises = symbolList.map(symbol => 
      fetchSymbolEarnings(symbol.trim(), fromDate, toDate)
    );
    
    const results = await Promise.all(earningsPromises);
    
    // Filter out null results (symbols without earnings data)
    const earningsEvents = results.filter(event => event !== null);
    
    console.log(`Found ${earningsEvents.length} earnings events`);
    
    // Return earnings events
    res.status(200).json(earningsEvents);
    
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({ 
      error: 'Failed to fetch earnings data',
      message: error.message 
    });
  }
}

/**
 * Fetch earnings for a single symbol
 */
async function fetchSymbolEarnings(symbol, fromDate, toDate) {
  try {
    // Fetch quoteSummary with calendarEvents and earningsHistory modules
    const result = await yf.quoteSummary(symbol, {
      modules: ['calendarEvents', 'earningsHistory']
    });
    
    if (!result.calendarEvents?.earnings?.earningsDate?.[0]) {
      return null;
    }
    
    // Get earnings date (Yahoo returns Date object or can be in different formats)
    const earningsDateRaw = result.calendarEvents.earnings.earningsDate[0];
    let earningsDate;
    
    if (earningsDateRaw instanceof Date) {
      earningsDate = earningsDateRaw;
    } else if (typeof earningsDateRaw === 'object' && earningsDateRaw.raw) {
      // Handle Yahoo's {raw: timestamp, fmt: string} format
      earningsDate = new Date(earningsDateRaw.raw * 1000);
    } else {
      earningsDate = new Date(earningsDateRaw);
    }
    
    // Check if within date range
    if (earningsDate < fromDate || earningsDate > toDate) {
      return null;
    }
    
    // Get latest EPS estimate from earnings history
    let epsEstimated;
    if (result.earningsHistory?.history && result.earningsHistory.history.length > 0) {
      const latestHistory = result.earningsHistory.history[0];
      if (latestHistory.epsEstimate) {
        epsEstimated = typeof latestHistory.epsEstimate === 'object' 
          ? latestHistory.epsEstimate.raw 
          : latestHistory.epsEstimate;
      }
    }
    
    // Format the earnings event
    const event = {
      symbol: symbol,
      date: formatDate(earningsDate),
      time: guessEarningsTime(earningsDate),
      epsEstimated: epsEstimated,
      fullDate: earningsDate.toISOString()
    };
    
    console.log(`✓ ${symbol}: ${event.date} ${event.time || ''}`);
    return event;
    
  } catch (error) {
    // Log error but don't fail the entire request
    console.error(`Error fetching earnings for ${symbol}:`, error.message);
    return null;
  }
}

/**
 * Guess earnings time based on hour
 */
function guessEarningsTime(date) {
  const hour = date.getHours();
  
  // Before 9:30 AM - likely before market open
  if (hour < 9 || (hour === 9 && date.getMinutes() < 30)) {
    return 'bmo';
  }
  // After 4 PM - likely after market close
  if (hour >= 16) {
    return 'amc';
  }
  // During market hours
  if (hour >= 9 && hour < 16) {
    return 'dmt';
  }
  
  // Default to after market close if no specific time
  return 'amc';
}

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add days to date
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
