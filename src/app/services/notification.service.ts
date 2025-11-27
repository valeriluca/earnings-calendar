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
          await this.scheduleDailyNotification(settings.notificationTime);
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
      
      const schedule: ScheduleOptions = {
        notifications: [
          {
            id: this.DAILY_NOTIFICATION_ID,
            title: 'Today Earnings',
            body: 'Check your earnings calendar for today',
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
    } catch (error) {
      console.error('Error scheduling notification:', error);
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
}
