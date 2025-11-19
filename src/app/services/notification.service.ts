import { Injectable } from '@angular/core';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { StorageService } from './storage.service';
import { EarningsService } from './earnings.service';
import { EarningsEvent } from '../models/earnings-event.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly NOTIFICATION_CHANNEL_ID = 'earnings-notifications';
  private readonly DAILY_NOTIFICATION_ID = 1000;
  private readonly CHANGE_DETECTION_INTERVAL = 1000 * 60 * 60 * 6; // Check every 6 hours
  private changeDetectionTimer: any;

  constructor(
    private storageService: StorageService,
    private earningsService: EarningsService
  ) {}

  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Notifications not supported on web platform');
      return;
    }

    try {
      const settings = await this.storageService.getNotificationSettings();
      
      if (settings.enabled) {
        const hasPermission = await this.requestPermissions();
        if (hasPermission) {
          await this.createNotificationChannel();
          
          if (settings.dailyEarningsEnabled) {
            await this.scheduleDailyNotification(settings.notificationTime);
          }
          
          if (settings.changeDetectionEnabled) {
            await this.startChangeDetection();
          }
        }
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  async checkPermissions(): Promise<boolean> {
    try {
      const result = await LocalNotifications.checkPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  async scheduleDailyNotification(time: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      await this.cancelDailyNotification();
      const [hours, minutes] = time.split(':').map(Number);
      
      // Instead of a static message, we'll use a repeating schedule
      // The actual content will be populated when the notification fires
      const schedule: ScheduleOptions = {
        notifications: [
          {
            id: this.DAILY_NOTIFICATION_ID,
            title: 'Earnings Today',
            body: 'Loading today\'s earnings...',
            schedule: {
              every: 'day',
              on: {
                hour: hours,
                minute: minutes
              },
              allowWhileIdle: true
            },
            channelId: this.NOTIFICATION_CHANNEL_ID
          }
        ]
      };

      await LocalNotifications.schedule(schedule);
      console.log(`Daily notification scheduled for ${time}`);
      
      // Immediately fetch and update with today's earnings
      await this.updateDailyNotificationWithEarnings(hours, minutes);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  /**
   * Update the daily notification with actual earnings data
   */
  private async updateDailyNotificationWithEarnings(hours: number, minutes: number): Promise<void> {
    try {
      const watchlist = await this.storageService.getWatchlist();
      const symbols = watchlist.map(s => s.symbol);
      
      this.earningsService.getTodayEarnings(symbols).subscribe({
        next: async (events) => {
          if (events.length === 0) {
            return; // Keep default message if no earnings
          }

          // Cancel and reschedule with actual data
          await this.cancelDailyNotification();
          
          const symbols = events.map(e => e.symbol).slice(0, 5).join(', ');
          const count = events.length;
          const body = count > 5 
            ? `${symbols} and ${count - 5} more`
            : count > 0 ? symbols : 'No earnings scheduled';

          const schedule: ScheduleOptions = {
            notifications: [
              {
                id: this.DAILY_NOTIFICATION_ID,
                title: `${count} Earnings Today`,
                body: body,
                schedule: {
                  every: 'day',
                  on: {
                    hour: hours,
                    minute: minutes
                  },
                  allowWhileIdle: true
                },
                channelId: this.NOTIFICATION_CHANNEL_ID
              }
            ]
          };

          await LocalNotifications.schedule(schedule);
        },
        error: (error) => {
          console.error('Error fetching today earnings for notification:', error);
        }
      });
    } catch (error) {
      console.error('Error updating daily notification:', error);
    }
  }

  async cancelDailyNotification(): Promise<void> {
    try {
      await LocalNotifications.cancel({
        notifications: [{ id: this.DAILY_NOTIFICATION_ID }]
      });
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  async sendEarningsNotification(events: EarningsEvent[]): Promise<void> {
    if (!Capacitor.isNativePlatform() || events.length === 0) {
      return;
    }

    try {
      const symbols = events.map(e => e.symbol).slice(0, 5).join(', ');
      const count = events.length;
      const body = count > 5 
        ? `${symbols} and ${count - 5} more`
        : symbols;

      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title: `${count} Earnings Today`,
            body: body,
            channelId: this.NOTIFICATION_CHANNEL_ID
          }
        ]
      });
    } catch (error) {
      console.error('Error sending earnings notification:', error);
    }
  }

  async fetchAndNotifyTodayEarnings(): Promise<void> {
    try {
      const watchlist = await this.storageService.getWatchlist();
      const symbols = watchlist.map(s => s.symbol);
      
      this.earningsService.getTodayEarnings(symbols).subscribe({
        next: (events) => {
          this.sendEarningsNotification(events);
        },
        error: (error) => {
          console.error('Error fetching today earnings:', error);
        }
      });
    } catch (error) {
      console.error('Error in fetchAndNotifyTodayEarnings:', error);
    }
  }

  async createNotificationChannel(): Promise<void> {
    if (Capacitor.getPlatform() === 'android') {
      try {
        await LocalNotifications.createChannel({
          id: this.NOTIFICATION_CHANNEL_ID,
          name: 'Earnings Notifications',
          description: 'Daily earnings calendar notifications',
          importance: 4,
          visibility: 1
        });
      } catch (error) {
        console.error('Error creating notification channel:', error);
      }
    }
  }

  /**
   * Start background change detection for next 7 days
   */
  async startChangeDetection(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

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

    console.log('Change detection started');
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
            await this.sendChangeNotification(events, lastHash);
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
  private async sendChangeNotification(events: EarningsEvent[], oldHash: string): Promise<void> {
    try {
      const count = events.length;
      const symbols = events.slice(0, 3).map(e => e.symbol).join(', ');
      
      let body = count <= 3 
        ? `Changes detected for ${symbols}`
        : `Changes detected for ${symbols} and ${count - 3} more`;

      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title: '📊 Earnings Calendar Update',
            body: body,
            channelId: this.NOTIFICATION_CHANNEL_ID
          }
        ]
      });

      console.log('Change notification sent');
    } catch (error) {
      console.error('Error sending change notification:', error);
    }
  }
}
