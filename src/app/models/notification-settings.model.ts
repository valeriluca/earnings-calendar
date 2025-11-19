export interface NotificationSettings {
  enabled: boolean;
  notificationTime: string; // HH:mm format (e.g., "08:00")
  timezone?: string;
  changeDetectionEnabled: boolean; // Enable/disable change detection for next 7 days
  dailyEarningsEnabled: boolean; // Enable/disable daily earnings at 6am
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  notificationTime: '06:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  changeDetectionEnabled: true,
  dailyEarningsEnabled: true
};
