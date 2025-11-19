import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { StorageService } from './storage.service';
import { EarningsService } from './earnings.service';
import { EarningsEvent } from '../models/earnings-event.model';

@Injectable({
  providedIn: 'root'
})
export class WebPushService {
  private readonly CHANGE_DETECTION_INTERVAL = 1000 * 60 * 60 * 6; // Check every 6 hours
  private changeDetectionTimer: any;
  private dailyNotificationTimer: any;

  constructor(
    private swPush: SwPush,
    private storageService: StorageService,
    private earningsService: EarningsService
  ) {}

  async initialize(): Promise<void> {
    if (!this.isSupported()) {
      console.log('Push notifications not supported in this browser');
      return;
    }

    try {
      const settings = await this.storageService.getNotificationSettings();
      
      if (settings.enabled) {
        const hasPermission = await this.requestPermission();
        if (hasPermission) {
          if (settings.dailyEarningsEnabled) {
            await this.scheduleDailyNotification(settings.notificationTime);
          }
          
          if (settings.changeDetectionEnabled) {
            await this.startChangeDetection();
          }
        }
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  hasPermission(): boolean {
    if (!this.isSupported()) {
      return false;
    }
    return Notification.permission === 'granted';
  }

  /**
   * Schedule daily notification at specified time
   */
  async scheduleDailyNotification(time: string): Promise<void> {
    // Clear existing timer
    if (this.dailyNotificationTimer) {
      clearTimeout(this.dailyNotificationTimer);
    }

    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If scheduled time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilNotification = scheduledTime.getTime() - now.getTime();

    this.dailyNotificationTimer = setTimeout(async () => {
      await this.sendDailyEarningsNotification();
      // Reschedule for next day
      await this.scheduleDailyNotification(time);
    }, timeUntilNotification);

    console.log(`Daily notification scheduled for ${scheduledTime.toLocaleString()}`);
  }

  async cancelDailyNotification(): Promise<void> {
    if (this.dailyNotificationTimer) {
      clearTimeout(this.dailyNotificationTimer);
      this.dailyNotificationTimer = null;
      console.log('Daily notification cancelled');
    }
  }

  /**
   * Send daily earnings notification
   */
  private async sendDailyEarningsNotification(): Promise<void> {
    try {
      const watchlist = await this.storageService.getWatchlist();
      const symbols = watchlist.map(s => s.symbol);
      
      if (symbols.length === 0) {
        return;
      }

      this.earningsService.getTodayEarnings(symbols).subscribe({
        next: async (events) => {
          if (events.length === 0) {
            await this.showNotification('No Earnings Today', {
              body: 'No earnings scheduled for your watchlist today',
              icon: '/assets/icon/favicon.png',
              badge: '/assets/icon/favicon.png',
              tag: 'daily-earnings'
            });
          } else {
            const symbols = events.map(e => e.symbol).slice(0, 5).join(', ');
            const count = events.length;
            const body = count > 5 
              ? `${symbols} and ${count - 5} more`
              : symbols;

            await this.showNotification(`${count} Earnings Today`, {
              body: body,
              icon: '/assets/icon/favicon.png',
              badge: '/assets/icon/favicon.png',
              tag: 'daily-earnings',
              requireInteraction: true
            });
          }
        },
        error: (error) => {
          console.error('Error fetching today earnings:', error);
        }
      });
    } catch (error) {
      console.error('Error sending daily notification:', error);
    }
  }

  /**
   * Start background change detection
   */
  async startChangeDetection(): Promise<void> {
    // Clear any existing timer
    if (this.changeDetectionTimer) {
      clearInterval(this.changeDetectionTimer);
    }

    // Check immediately on start
    await this.checkForEarningsChanges();

    // Then check every 6 hours
    this.changeDetectionTimer = setInterval(async () => {
      await this.checkForEarningsChanges();
    }, this.CHANGE_DETECTION_INTERVAL);

    console.log('Change detection started (checking every 6 hours)');
  }

  /**
   * Stop background change detection
   */
  stopChangeDetection(): void {
    if (this.changeDetectionTimer) {
      clearInterval(this.changeDetectionTimer);
      this.changeDetectionTimer = null;
      console.log('Change detection stopped');
    }
  }

  /**
   * Check for changes in earnings for next 7 days
   */
  private async checkForEarningsChanges(): Promise<void> {
    try {
      const watchlist = await this.storageService.getWatchlist();
      const symbols = watchlist.map(s => s.symbol);
      
      if (symbols.length === 0) {
        return;
      }

      const today = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(today.getDate() + 7);

      this.earningsService.getEarningsBySymbols(symbols, today, sevenDaysLater).subscribe({
        next: async (events) => {
          const currentHash = this.generateEarningsHash(events);
          const lastHash = await this.storageService.getLastKnownEarnings();

          if (lastHash && lastHash !== currentHash) {
            // Changes detected!
            await this.sendChangeNotification(events);
          }

          // Save current state
          await this.storageService.saveLastKnownEarnings(currentHash);
        },
        error: (error) => {
          console.error('Error checking for earnings changes:', error);
        }
      });
    } catch (error) {
      console.error('Error in checkForEarningsChanges:', error);
    }
  }

  /**
   * Generate a hash of earnings events for comparison
   */
  private generateEarningsHash(events: EarningsEvent[]): string {
    // Sort by date and symbol for consistent hashing
    const sorted = [...events].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.symbol.localeCompare(b.symbol);
    });

    // Create a simple hash from key properties
    const hashData = sorted.map(e => 
      `${e.symbol}|${e.date}|${e.time || 'null'}`
    ).join('::');

    return hashData;
  }

  /**
   * Send notification about earnings changes
   */
  private async sendChangeNotification(events: EarningsEvent[]): Promise<void> {
    try {
      const count = events.length;
      const symbols = events.slice(0, 3).map(e => e.symbol).join(', ');
      
      const body = count <= 3 
        ? `Changes detected for ${symbols}`
        : `Changes detected for ${symbols} and ${count - 3} more`;

      await this.showNotification('📊 Earnings Calendar Update', {
        body: body,
        icon: '/assets/icon/favicon.png',
        badge: '/assets/icon/favicon.png',
        tag: 'earnings-change',
        requireInteraction: true
      });

      console.log('Change notification sent');
    } catch (error) {
      console.error('Error sending change notification:', error);
    }
  }

  /**
   * Show a notification using Web Notifications API
   */
  private async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.hasPermission()) {
      console.warn('No notification permission');
      return;
    }

    try {
      // Try using service worker first if available
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.showNotification(title, options);
          console.log('Notification sent via service worker');
          return;
        }
      }
      
      // Fallback to basic Notification API
      const notification = new Notification(title, options);
      console.log('Notification sent via Notification API');
      
      // Auto-close after 5 seconds if requireInteraction is false
      if (!options?.requireInteraction) {
        setTimeout(() => notification.close(), 5000);
      }
    } catch (error) {
      console.error('Error showing notification:', error);
      throw error;
    }
  }

  /**
   * Test notification
   */
  async testNotification(): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported in this browser');
    }

    if (!this.hasPermission()) {
      const granted = await this.requestPermission();
      if (!granted) {
        throw new Error('Notification permission denied');
      }
    }

    await this.showNotification('Test Notification', {
      body: 'Web push notifications are working! 🎉',
      icon: '/assets/icon/favicon.png',
      badge: '/assets/icon/favicon.png',
      tag: 'test',
      requireInteraction: false
    });
  }
}
