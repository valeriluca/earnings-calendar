import { Injectable } from '@angular/core';
import { MarketHoliday, MarketCode, MARKET_INFO } from '../models/market-holiday.model';

@Injectable({
  providedIn: 'root'
})
export class MarketHolidaysService {
  
  /**
   * Comprehensive list of market holidays for major global exchanges.
   * Covers 2024-2026 for all major markets.
   */
  private holidays: MarketHoliday[] = [
    // ==================== 2024 HOLIDAYS ====================
    
    // January 2024
    { date: '2024-01-01', name: "New Year's Day", markets: ['NYSE', 'NASDAQ', 'LSE', 'XETRA', 'TSE', 'HKEX', 'SSE', 'SZSE', 'TSX', 'ASX', 'NSE', 'BSE', 'EURONEXT'] },
    { date: '2024-01-02', name: 'Bank Holiday', markets: ['TSE', 'SSE', 'SZSE'] },
    { date: '2024-01-03', name: 'Bank Holiday', markets: ['TSE', 'SSE', 'SZSE'] },
    { date: '2024-01-08', name: 'Coming of Age Day', markets: ['TSE'] },
    { date: '2024-01-15', name: 'Martin Luther King Jr. Day', markets: ['NYSE', 'NASDAQ'] },
    { date: '2024-01-26', name: 'Republic Day', markets: ['NSE', 'BSE'] },
    
    // February 2024
    { date: '2024-02-09', name: 'Chinese New Year Eve', markets: ['HKEX', 'SSE', 'SZSE'] },
    { date: '2024-02-10', name: 'Chinese New Year', markets: ['HKEX', 'SSE', 'SZSE'] },
    { date: '2024-02-11', name: 'Chinese New Year', markets: ['HKEX', 'SSE', 'SZSE'] },
    { date: '2024-02-12', name: 'Chinese New Year', markets: ['HKEX', 'SSE', 'SZSE'] },
    { date: '2024-02-13', name: 'Chinese New Year', markets: ['HKEX', 'SSE', 'SZSE'] },
    { date: '2024-02-14', name: 'Chinese New Year', markets: ['SSE', 'SZSE'] },
    { date: '2024-02-15', name: 'Chinese New Year', markets: ['SSE', 'SZSE'] },
    { date: '2024-02-16', name: 'Chinese New Year', markets: ['SSE', 'SZSE'] },
    { date: '2024-02-19', name: "Presidents' Day", markets: ['NYSE', 'NASDAQ'] },
    { date: '2024-02-19', name: 'Family Day', markets: ['TSX'] },
    { date: '2024-02-23', name: "Emperor's Birthday", markets: ['TSE'] },

    // March 2024
    { date: '2024-03-08', name: 'Maha Shivaratri', markets: ['NSE', 'BSE'] },
    { date: '2024-03-20', name: 'Vernal Equinox Day', markets: ['TSE'] },
    { date: '2024-03-25', name: 'Holi', markets: ['NSE', 'BSE'] },
    { date: '2024-03-29', name: 'Good Friday', markets: ['NYSE', 'NASDAQ', 'LSE', 'XETRA', 'HKEX', 'TSX', 'ASX', 'NSE', 'BSE', 'EURONEXT'] },

    // April 2024
    { date: '2024-04-01', name: 'Easter Monday', markets: ['LSE', 'XETRA', 'HKEX', 'ASX', 'EURONEXT'] },
    { date: '2024-04-04', name: 'Qingming Festival', markets: ['SSE', 'SZSE', 'HKEX'] },
    { date: '2024-04-05', name: 'Qingming Festival', markets: ['SSE', 'SZSE'] },
    { date: '2024-04-11', name: 'Eid ul-Fitr', markets: ['NSE', 'BSE'] },
    { date: '2024-04-14', name: 'Ambedkar Jayanti', markets: ['NSE', 'BSE'] },
    { date: '2024-04-17', name: 'Ram Navami', markets: ['NSE', 'BSE'] },
    { date: '2024-04-21', name: 'Mahavir Jayanti', markets: ['NSE', 'BSE'] },
    { date: '2024-04-25', name: 'Anzac Day', markets: ['ASX'] },
    { date: '2024-04-29', name: 'Showa Day', markets: ['TSE'] },

    // May 2024
    { date: '2024-05-01', name: 'Labour Day', markets: ['SSE', 'SZSE', 'HKEX', 'XETRA', 'EURONEXT'] },
    { date: '2024-05-02', name: 'Labour Day Holiday', markets: ['SSE', 'SZSE'] },
    { date: '2024-05-03', name: 'Constitution Memorial Day', markets: ['TSE', 'SSE', 'SZSE'] },
    { date: '2024-05-04', name: 'Greenery Day', markets: ['TSE'] },
    { date: '2024-05-06', name: "Children's Day (observed)", markets: ['TSE'] },
    { date: '2024-05-06', name: 'Early May Bank Holiday', markets: ['LSE'] },
    { date: '2024-05-15', name: 'Buddha Purnima', markets: ['HKEX'] },
    { date: '2024-05-20', name: 'Victoria Day', markets: ['TSX'] },
    { date: '2024-05-23', name: 'Buddha Purnima', markets: ['NSE', 'BSE'] },
    { date: '2024-05-27', name: 'Memorial Day', markets: ['NYSE', 'NASDAQ'] },
    { date: '2024-05-27', name: 'Spring Bank Holiday', markets: ['LSE'] },

    // June 2024
    { date: '2024-06-10', name: 'Dragon Boat Festival', markets: ['SSE', 'SZSE', 'HKEX'] },
    { date: '2024-06-10', name: "King's Birthday", markets: ['ASX'] },
    { date: '2024-06-17', name: 'Eid ul-Adha', markets: ['NSE', 'BSE'] },
    { date: '2024-06-19', name: 'Juneteenth', markets: ['NYSE', 'NASDAQ'] },

    // July 2024
    { date: '2024-07-01', name: 'Canada Day', markets: ['TSX'] },
    { date: '2024-07-01', name: 'HKSAR Establishment Day', markets: ['HKEX'] },
    { date: '2024-07-04', name: 'Independence Day', markets: ['NYSE', 'NASDAQ'] },
    { date: '2024-07-15', name: 'Marine Day', markets: ['TSE'] },
    { date: '2024-07-17', name: 'Muharram', markets: ['NSE', 'BSE'] },

    // August 2024
    { date: '2024-08-05', name: 'Civic Holiday', markets: ['TSX'] },
    { date: '2024-08-11', name: 'Mountain Day', markets: ['TSE'] },
    { date: '2024-08-12', name: 'Mountain Day (observed)', markets: ['TSE'] },
    { date: '2024-08-15', name: 'Independence Day', markets: ['NSE', 'BSE'] },
    { date: '2024-08-26', name: 'Summer Bank Holiday', markets: ['LSE'] },

    // September 2024
    { date: '2024-09-02', name: 'Labor Day', markets: ['NYSE', 'NASDAQ', 'TSX'] },
    { date: '2024-09-16', name: "Respect for the Aged Day", markets: ['TSE'] },
    { date: '2024-09-16', name: 'Milad un-Nabi', markets: ['NSE', 'BSE'] },
    { date: '2024-09-17', name: 'Mid-Autumn Festival', markets: ['SSE', 'SZSE', 'HKEX'] },
    { date: '2024-09-22', name: 'Autumnal Equinox Day', markets: ['TSE'] },
    { date: '2024-09-23', name: 'Autumnal Equinox Day (observed)', markets: ['TSE'] },

    // October 2024
    { date: '2024-10-01', name: 'National Day', markets: ['SSE', 'SZSE', 'HKEX'] },
    { date: '2024-10-02', name: 'Gandhi Jayanti', markets: ['NSE', 'BSE'] },
    { date: '2024-10-02', name: 'National Day', markets: ['SSE', 'SZSE'] },
    { date: '2024-10-03', name: 'German Unity Day', markets: ['XETRA'] },
    { date: '2024-10-03', name: 'National Day', markets: ['SSE', 'SZSE'] },
    { date: '2024-10-04', name: 'National Day', markets: ['SSE', 'SZSE'] },
    { date: '2024-10-07', name: 'National Day', markets: ['SSE', 'SZSE'] },
    { date: '2024-10-11', name: 'Chung Yeung Festival', markets: ['HKEX'] },
    { date: '2024-10-14', name: 'Sports Day', markets: ['TSE'] },
    { date: '2024-10-14', name: 'Thanksgiving Day', markets: ['TSX'] },
    { date: '2024-10-24', name: 'Dussehra', markets: ['NSE', 'BSE'] },

    // November 2024
    { date: '2024-11-01', name: 'Diwali', markets: ['NSE', 'BSE'] },
    { date: '2024-11-03', name: 'Culture Day', markets: ['TSE'] },
    { date: '2024-11-04', name: 'Culture Day (observed)', markets: ['TSE'] },
    { date: '2024-11-11', name: 'Veterans Day', markets: ['NYSE', 'NASDAQ'] },
    { date: '2024-11-11', name: 'Remembrance Day', markets: ['TSX'] },
    { date: '2024-11-15', name: 'Guru Nanak Jayanti', markets: ['NSE', 'BSE'] },
    { date: '2024-11-23', name: 'Labor Thanksgiving Day', markets: ['TSE'] },
    { date: '2024-11-28', name: 'Thanksgiving Day', markets: ['NYSE', 'NASDAQ'] },

    // December 2024
    { date: '2024-12-24', name: 'Christmas Eve', markets: ['XETRA', 'EURONEXT'] },
    { date: '2024-12-25', name: 'Christmas Day', markets: ['NYSE', 'NASDAQ', 'LSE', 'XETRA', 'HKEX', 'TSX', 'ASX', 'NSE', 'BSE', 'EURONEXT'] },
    { date: '2024-12-26', name: 'Boxing Day', markets: ['LSE', 'XETRA', 'HKEX', 'TSX', 'ASX', 'EURONEXT'] },
    { date: '2024-12-31', name: "New Year's Eve", markets: ['XETRA', 'EURONEXT'] },

    // ==================== 2025 HOLIDAYS ====================
    
    // January 2025
    { date: '2025-01-01', name: "New Year's Day", markets: ['NYSE', 'NASDAQ', 'LSE', 'XETRA', 'TSE', 'HKEX', 'SSE', 'SZSE', 'TSX', 'ASX', 'NSE', 'BSE', 'EURONEXT'] },
    { date: '2025-01-02', name: 'Bank Holiday', markets: ['TSE', 'SSE', 'SZSE'] },
    { date: '2025-01-03', name: 'Bank Holiday', markets: ['TSE', 'SSE', 'SZSE'] },
    { date: '2025-01-13', name: 'Coming of Age Day', markets: ['TSE'] },
    { date: '2025-01-20', name: 'Martin Luther King Jr. Day', markets: ['NYSE', 'NASDAQ'] },
    { date: '2025-01-26', name: 'Republic Day', markets: ['NSE', 'BSE'] },
    { date: '2025-01-27', name: 'Australia Day (observed)', markets: ['ASX'] },
    { date: '2025-01-28', name: 'Chinese New Year Eve', markets: ['HKEX', 'SSE', 'SZSE'] },
    { date: '2025-01-29', name: 'Chinese New Year', markets: ['HKEX', 'SSE', 'SZSE'] },
    { date: '2025-01-30', name: 'Chinese New Year', markets: ['HKEX', 'SSE', 'SZSE'] },
    { date: '2025-01-31', name: 'Chinese New Year', markets: ['HKEX', 'SSE', 'SZSE'] },

    // February 2025
    { date: '2025-02-03', name: 'Chinese New Year', markets: ['SSE', 'SZSE'] },
    { date: '2025-02-04', name: 'Chinese New Year', markets: ['SSE', 'SZSE'] },
    { date: '2025-02-11', name: 'National Foundation Day', markets: ['TSE'] },
    { date: '2025-02-17', name: "Presidents' Day", markets: ['NYSE', 'NASDAQ'] },
    { date: '2025-02-17', name: 'Family Day', markets: ['TSX'] },
    { date: '2025-02-23', name: "Emperor's Birthday", markets: ['TSE'] },
    { date: '2025-02-24', name: "Emperor's Birthday (observed)", markets: ['TSE'] },
    { date: '2025-02-26', name: 'Maha Shivaratri', markets: ['NSE', 'BSE'] },

    // March 2025
    { date: '2025-03-14', name: 'Holi', markets: ['NSE', 'BSE'] },
    { date: '2025-03-20', name: 'Vernal Equinox Day', markets: ['TSE'] },
    { date: '2025-03-21', name: 'Vernal Equinox Day (observed)', markets: ['TSE'] },
    { date: '2025-03-31', name: 'Eid ul-Fitr', markets: ['NSE', 'BSE'] },

    // April 2025
    { date: '2025-04-04', name: 'Qingming Festival', markets: ['SSE', 'SZSE', 'HKEX'] },
    { date: '2025-04-06', name: 'Mahavir Jayanti', markets: ['NSE', 'BSE'] },
    { date: '2025-04-10', name: 'Ram Navami', markets: ['NSE', 'BSE'] },
    { date: '2025-04-14', name: 'Ambedkar Jayanti', markets: ['NSE', 'BSE'] },
    { date: '2025-04-18', name: 'Good Friday', markets: ['NYSE', 'NASDAQ', 'LSE', 'XETRA', 'HKEX', 'TSX', 'ASX', 'NSE', 'BSE', 'EURONEXT'] },
    { date: '2025-04-21', name: 'Easter Monday', markets: ['LSE', 'XETRA', 'HKEX', 'ASX', 'EURONEXT'] },
    { date: '2025-04-25', name: 'Anzac Day', markets: ['ASX'] },
    { date: '2025-04-29', name: 'Showa Day', markets: ['TSE'] },

    // May 2025
    { date: '2025-05-01', name: 'Labour Day', markets: ['SSE', 'SZSE', 'HKEX', 'XETRA', 'EURONEXT'] },
    { date: '2025-05-02', name: 'Labour Day Holiday', markets: ['SSE', 'SZSE'] },
    { date: '2025-05-03', name: 'Constitution Memorial Day', markets: ['TSE'] },
    { date: '2025-05-04', name: 'Greenery Day', markets: ['TSE'] },
    { date: '2025-05-05', name: "Children's Day", markets: ['TSE', 'HKEX'] },
    { date: '2025-05-05', name: 'Early May Bank Holiday', markets: ['LSE'] },
    { date: '2025-05-06', name: 'Children\'s Day (observed)', markets: ['TSE'] },
    { date: '2025-05-12', name: 'Buddha Purnima', markets: ['NSE', 'BSE', 'HKEX'] },
    { date: '2025-05-19', name: 'Victoria Day', markets: ['TSX'] },
    { date: '2025-05-26', name: 'Memorial Day', markets: ['NYSE', 'NASDAQ'] },
    { date: '2025-05-26', name: 'Spring Bank Holiday', markets: ['LSE'] },
    { date: '2025-05-31', name: 'Dragon Boat Festival', markets: ['SSE', 'SZSE', 'HKEX'] },

    // June 2025
    { date: '2025-06-02', name: 'Dragon Boat Festival (observed)', markets: ['SSE', 'SZSE'] },
    { date: '2025-06-06', name: 'Eid ul-Adha', markets: ['NSE', 'BSE'] },
    { date: '2025-06-09', name: "King's Birthday", markets: ['ASX'] },
    { date: '2025-06-19', name: 'Juneteenth', markets: ['NYSE', 'NASDAQ'] },

    // July 2025
    { date: '2025-07-01', name: 'Canada Day', markets: ['TSX'] },
    { date: '2025-07-01', name: 'HKSAR Establishment Day', markets: ['HKEX'] },
    { date: '2025-07-04', name: 'Independence Day', markets: ['NYSE', 'NASDAQ'] },
    { date: '2025-07-06', name: 'Muharram', markets: ['NSE', 'BSE'] },
    { date: '2025-07-21', name: 'Marine Day', markets: ['TSE'] },

    // August 2025
    { date: '2025-08-04', name: 'Civic Holiday', markets: ['TSX'] },
    { date: '2025-08-11', name: 'Mountain Day', markets: ['TSE'] },
    { date: '2025-08-15', name: 'Independence Day', markets: ['NSE', 'BSE'] },
    { date: '2025-08-16', name: 'Janmashtami', markets: ['NSE', 'BSE'] },
    { date: '2025-08-25', name: 'Summer Bank Holiday', markets: ['LSE'] },

    // September 2025
    { date: '2025-09-01', name: 'Labor Day', markets: ['NYSE', 'NASDAQ', 'TSX'] },
    { date: '2025-09-05', name: 'Milad un-Nabi', markets: ['NSE', 'BSE'] },
    { date: '2025-09-15', name: 'Respect for the Aged Day', markets: ['TSE'] },
    { date: '2025-09-23', name: 'Autumnal Equinox Day', markets: ['TSE'] },

    // October 2025
    { date: '2025-10-01', name: 'National Day', markets: ['SSE', 'SZSE', 'HKEX'] },
    { date: '2025-10-02', name: 'Gandhi Jayanti', markets: ['NSE', 'BSE'] },
    { date: '2025-10-02', name: 'National Day', markets: ['SSE', 'SZSE'] },
    { date: '2025-10-03', name: 'German Unity Day', markets: ['XETRA'] },
    { date: '2025-10-03', name: 'National Day', markets: ['SSE', 'SZSE'] },
    { date: '2025-10-06', name: 'Mid-Autumn Festival', markets: ['SSE', 'SZSE', 'HKEX'] },
    { date: '2025-10-07', name: 'National Day/Mid-Autumn', markets: ['SSE', 'SZSE'] },
    { date: '2025-10-13', name: 'Sports Day', markets: ['TSE'] },
    { date: '2025-10-13', name: 'Thanksgiving Day', markets: ['TSX'] },
    { date: '2025-10-20', name: 'Dussehra', markets: ['NSE', 'BSE'] },
    { date: '2025-10-29', name: 'Chung Yeung Festival', markets: ['HKEX'] },

    // November 2025
    { date: '2025-11-01', name: 'Diwali', markets: ['NSE', 'BSE'] },
    { date: '2025-11-03', name: 'Culture Day', markets: ['TSE'] },
    { date: '2025-11-05', name: 'Guru Nanak Jayanti', markets: ['NSE', 'BSE'] },
    { date: '2025-11-11', name: 'Veterans Day', markets: ['NYSE', 'NASDAQ'] },
    { date: '2025-11-11', name: 'Remembrance Day', markets: ['TSX'] },
    { date: '2025-11-23', name: 'Labor Thanksgiving Day', markets: ['TSE'] },
    { date: '2025-11-24', name: 'Labor Thanksgiving Day (observed)', markets: ['TSE'] },
    { date: '2025-11-27', name: 'Thanksgiving Day', markets: ['NYSE', 'NASDAQ'] },

    // December 2025
    { date: '2025-12-24', name: 'Christmas Eve', markets: ['XETRA', 'EURONEXT'] },
    { date: '2025-12-25', name: 'Christmas Day', markets: ['NYSE', 'NASDAQ', 'LSE', 'XETRA', 'HKEX', 'TSX', 'ASX', 'NSE', 'BSE', 'EURONEXT'] },
    { date: '2025-12-26', name: 'Boxing Day', markets: ['LSE', 'XETRA', 'HKEX', 'TSX', 'ASX', 'EURONEXT'] },
    { date: '2025-12-31', name: "New Year's Eve", markets: ['XETRA', 'EURONEXT'] },

    // ==================== 2026 HOLIDAYS (partial) ====================
    
    // January 2026
    { date: '2026-01-01', name: "New Year's Day", markets: ['NYSE', 'NASDAQ', 'LSE', 'XETRA', 'TSE', 'HKEX', 'SSE', 'SZSE', 'TSX', 'ASX', 'NSE', 'BSE', 'EURONEXT'] },
    { date: '2026-01-02', name: 'Bank Holiday', markets: ['TSE', 'SSE', 'SZSE'] },
    { date: '2026-01-12', name: 'Coming of Age Day', markets: ['TSE'] },
    { date: '2026-01-19', name: 'Martin Luther King Jr. Day', markets: ['NYSE', 'NASDAQ'] },
    { date: '2026-01-26', name: 'Australia Day', markets: ['ASX'] },
    { date: '2026-01-26', name: 'Republic Day', markets: ['NSE', 'BSE'] },

    // February 2026
    { date: '2026-02-11', name: 'National Foundation Day', markets: ['TSE'] },
    { date: '2026-02-16', name: "Presidents' Day", markets: ['NYSE', 'NASDAQ'] },
    { date: '2026-02-16', name: 'Family Day', markets: ['TSX'] },
    { date: '2026-02-17', name: 'Chinese New Year', markets: ['HKEX', 'SSE', 'SZSE'] },
    { date: '2026-02-18', name: 'Chinese New Year', markets: ['HKEX', 'SSE', 'SZSE'] },
    { date: '2026-02-19', name: 'Chinese New Year', markets: ['HKEX', 'SSE', 'SZSE'] },
    { date: '2026-02-20', name: 'Chinese New Year', markets: ['SSE', 'SZSE'] },
    { date: '2026-02-23', name: "Emperor's Birthday", markets: ['TSE'] },
  ];

  /**
   * Get all holidays within a date range
   */
  getHolidaysInRange(startDate: Date, endDate: Date): MarketHoliday[] {
    const startStr = this.formatDate(startDate);
    const endStr = this.formatDate(endDate);
    
    return this.holidays.filter(holiday => 
      holiday.date >= startStr && holiday.date <= endStr
    );
  }

  /**
   * Get holidays for a specific date
   */
  getHolidaysForDate(date: Date): MarketHoliday[] {
    const dateStr = this.formatDate(date);
    return this.holidays.filter(holiday => holiday.date === dateStr);
  }

  /**
   * Check if a specific market is closed on a date
   */
  isMarketClosed(market: MarketCode, date: Date): boolean {
    const dateStr = this.formatDate(date);
    return this.holidays.some(holiday => 
      holiday.date === dateStr && holiday.markets.includes(market)
    );
  }

  /**
   * Get market info with flag and full name
   */
  getMarketInfo(market: MarketCode) {
    return MARKET_INFO[market];
  }

  /**
   * Format markets list for display
   */
  formatMarketsDisplay(markets: MarketCode[]): string {
    return markets.map(m => {
      const info = MARKET_INFO[m];
      return `${info.flag} ${m}`;
    }).join(', ');
  }

  /**
   * Get markets grouped by country for better display
   */
  getMarketsGroupedByCountry(markets: MarketCode[]): { country: string; flag: string; markets: string[] }[] {
    const grouped: Record<string, { flag: string; markets: string[] }> = {};
    
    markets.forEach(market => {
      const info = MARKET_INFO[market];
      if (!grouped[info.country]) {
        grouped[info.country] = { flag: info.flag, markets: [] };
      }
      grouped[info.country].markets.push(market);
    });

    return Object.entries(grouped).map(([country, data]) => ({
      country,
      flag: data.flag,
      markets: data.markets
    }));
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
