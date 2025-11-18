export interface EarningsEvent {
  symbol: string;
  name?: string; // Company name
  date: string; // YYYY-MM-DD
  time: EarningsTime; // 'bmo' | 'amc' | 'dmt' | null
  eps?: number;
  epsEstimated?: number;
  revenue?: number;
  revenueEstimated?: number;
  fiscalDateEnding?: string;
  fullDate?: Date; // Parsed datetime for calendar
}

export type EarningsTime = 'bmo' | 'amc' | 'dmt' | null;

export interface EarningsTimeDisplay {
  label: string;
  color: string;
}

export const EARNINGS_TIME_MAP: Record<string, EarningsTimeDisplay> = {
  'bmo': { label: 'Before Open', color: 'primary' },
  'amc': { label: 'After Close', color: 'success' },
  'dmt': { label: 'During Market', color: 'warning' },
  'null': { label: 'Time TBD', color: 'medium' }
};
