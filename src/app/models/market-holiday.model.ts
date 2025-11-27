export interface MarketHoliday {
  date: string; // YYYY-MM-DD format
  name: string;
  markets: MarketCode[];
}

export type MarketCode = 
  | 'NYSE'    // New York Stock Exchange (USA)
  | 'NASDAQ'  // NASDAQ (USA)
  | 'LSE'     // London Stock Exchange (UK)
  | 'XETRA'   // Frankfurt Stock Exchange (Germany)
  | 'TSE'     // Tokyo Stock Exchange (Japan)
  | 'HKEX'    // Hong Kong Stock Exchange
  | 'SSE'     // Shanghai Stock Exchange (China)
  | 'SZSE'    // Shenzhen Stock Exchange (China)
  | 'TSX'     // Toronto Stock Exchange (Canada)
  | 'ASX'     // Australian Securities Exchange
  | 'NSE'     // National Stock Exchange (India)
  | 'BSE'     // Bombay Stock Exchange (India)
  | 'EURONEXT'; // Euronext (France, Netherlands, Belgium, Portugal)

export interface MarketInfo {
  code: MarketCode;
  name: string;
  country: string;
  flag: string;
}

export const MARKET_INFO: Record<MarketCode, MarketInfo> = {
  'NYSE': { code: 'NYSE', name: 'New York Stock Exchange', country: 'USA', flag: '🇺🇸' },
  'NASDAQ': { code: 'NASDAQ', name: 'NASDAQ', country: 'USA', flag: '🇺🇸' },
  'LSE': { code: 'LSE', name: 'London Stock Exchange', country: 'UK', flag: '🇬🇧' },
  'XETRA': { code: 'XETRA', name: 'Frankfurt Stock Exchange', country: 'Germany', flag: '🇩🇪' },
  'TSE': { code: 'TSE', name: 'Tokyo Stock Exchange', country: 'Japan', flag: '🇯🇵' },
  'HKEX': { code: 'HKEX', name: 'Hong Kong Stock Exchange', country: 'Hong Kong', flag: '🇭🇰' },
  'SSE': { code: 'SSE', name: 'Shanghai Stock Exchange', country: 'China', flag: '🇨🇳' },
  'SZSE': { code: 'SZSE', name: 'Shenzhen Stock Exchange', country: 'China', flag: '🇨🇳' },
  'TSX': { code: 'TSX', name: 'Toronto Stock Exchange', country: 'Canada', flag: '🇨🇦' },
  'ASX': { code: 'ASX', name: 'Australian Securities Exchange', country: 'Australia', flag: '🇦🇺' },
  'NSE': { code: 'NSE', name: 'National Stock Exchange', country: 'India', flag: '🇮🇳' },
  'BSE': { code: 'BSE', name: 'Bombay Stock Exchange', country: 'India', flag: '🇮🇳' },
  'EURONEXT': { code: 'EURONEXT', name: 'Euronext', country: 'Europe', flag: '🇪🇺' }
};
