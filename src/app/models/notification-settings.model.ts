export interface NotificationSettings {
  enabled: boolean;
  notificationTime: string; // HH:mm format (e.g., "08:00")
  timezone?: string;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  notificationTime: '08:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
};
