import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Stock, DEFAULT_STOCKS } from '../models/stock.model';
import { NotificationSettings, DEFAULT_NOTIFICATION_SETTINGS } from '../models/notification-settings.model';
import { BehaviorSubject, Observable } from 'rxjs';

const STORAGE_KEYS = {
  WATCHLIST: 'watchlist',
  NOTIFICATION_SETTINGS: 'notification_settings',
  LAST_SYNC: 'last_sync'
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

  // Watchlist methods
  async getWatchlist(): Promise<Stock[]> {
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEYS.WATCHLIST });
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
      await Preferences.set({
        key: STORAGE_KEYS.WATCHLIST,
        value: JSON.stringify(stocks)
      });
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

  async resetWatchlist(): Promise<void> {
    await this.saveWatchlist(DEFAULT_STOCKS);
  }

  // Notification settings
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEYS.NOTIFICATION_SETTINGS });
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
      await Preferences.set({
        key: STORAGE_KEYS.NOTIFICATION_SETTINGS,
        value: JSON.stringify(settings)
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  // Last sync timestamp
  async getLastSync(): Promise<number | null> {
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEYS.LAST_SYNC });
      return value ? parseInt(value, 10) : null;
    } catch (error) {
      console.error('Error getting last sync:', error);
      return null;
    }
  }

  async setLastSync(timestamp: number): Promise<void> {
    try {
      await Preferences.set({
        key: STORAGE_KEYS.LAST_SYNC,
        value: timestamp.toString()
      });
    } catch (error) {
      console.error('Error setting last sync:', error);
    }
  }

  // Clear all data
  async clearAll(): Promise<void> {
    try {
      await Preferences.clear();
      this.watchlistSubject.next([]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}
