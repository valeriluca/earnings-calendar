/**
 * Simple Express server to test yahoo-finance2 API locally
 */
import express from 'express';
import cors from 'cors';
import YahooFinance from 'yahoo-finance2';

const app = express();
const PORT = 3001;

// Initialize yahoo-finance2 (required for v3+)
const yf = new YahooFinance();

// Enable CORS
app.use(cors());

// API endpoint
app.get('/api/yahoo-earnings', async (req, res) => {
  try {
    const { symbols, from, to } = req.query;
    
    if (!symbols) {
      return res.status(400).json({ error: 'Missing required parameter: symbols' });
    }

    const symbolList = symbols.split(',');
    const fromDate = from ? new Date(from) : new Date();
    const toDate = to ? new Date(to) : addDays(fromDate, 60);
    
    console.log(`Fetching earnings for ${symbolList.length} symbols from ${fromDate.toISOString()} to ${toDate.toISOString()}`);
    
    const earningsPromises = symbolList.map(symbol => 
      fetchSymbolEarnings(symbol.trim(), fromDate, toDate)
    );
    
    const results = await Promise.all(earningsPromises);
    const earningsEvents = results.filter(event => event !== null);
    
    console.log(`Found ${earningsEvents.length} earnings events`);
    res.json(earningsEvents);
    
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({ 
      error: 'Failed to fetch earnings data',
      message: error.message 
    });
  }
});

async function fetchSymbolEarnings(symbol, fromDate, toDate) {
  try {
    const result = await yf.quoteSummary(symbol, {
      modules: ['calendarEvents', 'earningsHistory']
    });
    
    if (!result.calendarEvents?.earnings?.earningsDate?.[0]) {
      return null;
    }
    
    const earningsDateRaw = result.calendarEvents.earnings.earningsDate[0];
    let earningsDate;
    
    if (earningsDateRaw instanceof Date) {
      earningsDate = earningsDateRaw;
    } else if (typeof earningsDateRaw === 'object' && earningsDateRaw.raw) {
      earningsDate = new Date(earningsDateRaw.raw * 1000);
    } else {
      earningsDate = new Date(earningsDateRaw);
    }
    
    if (earningsDate < fromDate || earningsDate > toDate) {
      return null;
    }
    
    let epsEstimated;
    if (result.earningsHistory?.history && result.earningsHistory.history.length > 0) {
      const latestHistory = result.earningsHistory.history[0];
      if (latestHistory.epsEstimate) {
        epsEstimated = typeof latestHistory.epsEstimate === 'object' 
          ? latestHistory.epsEstimate.raw 
          : latestHistory.epsEstimate;
      }
    }
    
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
    console.error(`Error fetching earnings for ${symbol}:`, error.message);
    return null;
  }
}

function guessEarningsTime(date) {
  const hour = date.getHours();
  if (hour < 9 || (hour === 9 && date.getMinutes() < 30)) return 'bmo';
  if (hour >= 16) return 'amc';
  if (hour >= 9 && hour < 16) return 'dmt';
  return 'amc';
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

app.listen(PORT, () => {
  console.log(`\n✓ API server running at http://localhost:${PORT}`);
  console.log(`\nTest with: http://localhost:${PORT}/api/yahoo-earnings?symbols=AAPL,MSFT&from=2025-11-18&to=2025-12-18\n`);
});
