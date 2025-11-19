import { Injectable } from '@angular/core';
import { Stock, DEFAULT_STOCKS } from '../models/stock.model';
import { NotificationSettings, DEFAULT_NOTIFICATION_SETTINGS } from '../models/notification-settings.model';
import { BehaviorSubject, Observable } from 'rxjs';

const STORAGE_KEYS = {
  WATCHLIST: 'watchlist',
  NOTIFICATION_SETTINGS: 'notification_settings',
  LAST_SYNC: 'last_sync',
  LAST_KNOWN_EARNINGS: 'last_known_earnings'
};

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private watchlistSubject = new BehaviorSubject<Stock[]>([]);
  public watchlist$: Observable<Stock[]> = this.watchlistSubject.asObservable();

  constructor() {
    this.initializeWatchlist();
  }

  private async initializeWatchlist() {
    const watchlist = await this.getWatchlist();
    this.watchlistSubject.next(watchlist);
  }

  // Helper methods for localStorage
  private getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  private setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  private removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  // Watchlist methods
  async getWatchlist(): Promise<Stock[]> {
    try {
      const value = this.getItem(STORAGE_KEYS.WATCHLIST);
      if (value) {
        return JSON.parse(value);
      }
      // Return default stocks if no watchlist exists
      await this.saveWatchlist(DEFAULT_STOCKS);
      return DEFAULT_STOCKS;
    } catch (error) {
      console.error('Error getting watchlist:', error);
      return DEFAULT_STOCKS;
    }
  }

  async saveWatchlist(stocks: Stock[]): Promise<void> {
    try {
      this.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(stocks));
      this.watchlistSubject.next(stocks);
    } catch (error) {
      console.error('Error saving watchlist:', error);
    }
  }

  async addStock(stock: Stock): Promise<void> {
    const watchlist = await this.getWatchlist();
    // Check if stock already exists
    if (!watchlist.find(s => s.symbol === stock.symbol)) {
      stock.addedAt = Date.now();
      watchlist.push(stock);
      await this.saveWatchlist(watchlist);
    }
  }

  async removeStock(symbol: string): Promise<void> {
    const watchlist = await this.getWatchlist();
    const updatedList = watchlist.filter(s => s.symbol !== symbol);
    await this.saveWatchlist(updatedList);
  }

  async updateStock(stock: Stock): Promise<void> {
    const watchlist = await this.getWatchlist();
    const index = watchlist.findIndex(s => s.symbol === stock.symbol);
    if (index !== -1) {
      watchlist[index] = { ...watchlist[index], ...stock };
      await this.saveWatchlist(watchlist);
    }
  }

  async resetWatchlist(): Promise<void> {
    await this.saveWatchlist(DEFAULT_STOCKS);
  }

  // Notification settings
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const value = this.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
      if (value) {
        return JSON.parse(value);
      }
      return DEFAULT_NOTIFICATION_SETTINGS;
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return DEFAULT_NOTIFICATION_SETTINGS;
    }
  }

  async saveNotificationSettings(settings: NotificationSettings): Promise<void> {
    try {
      this.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  // Last sync timestamp
  async getLastSync(): Promise<number | null> {
    try {
      const value = this.getItem(STORAGE_KEYS.LAST_SYNC);
      return value ? parseInt(value, 10) : null;
    } catch (error) {
      console.error('Error getting last sync:', error);
      return null;
    }
  }

  async setLastSync(timestamp: number): Promise<void> {
    try {
      this.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toString());
    } catch (error) {
      console.error('Error setting last sync:', error);
    }
  }

  // Clear all data
  async clearAll(): Promise<void> {
    try {
      localStorage.clear();
      this.watchlistSubject.next([]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  // Last known earnings for change detection
  async getLastKnownEarnings(): Promise<string | null> {
    try {
      return this.getItem(STORAGE_KEYS.LAST_KNOWN_EARNINGS);
    } catch (error) {
      console.error('Error getting last known earnings:', error);
      return null;
    }
  }

  async saveLastKnownEarnings(earningsHash: string): Promise<void> {
    try {
      this.setItem(STORAGE_KEYS.LAST_KNOWN_EARNINGS, earningsHash);
    } catch (error) {
      console.error('Error saving last known earnings:', error);
    }
  }
}
