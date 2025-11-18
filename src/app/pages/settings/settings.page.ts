import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonButton,
  IonIcon,
  IonInput,
  IonChip,
  IonSearchbar,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { StorageService } from '../../services/storage.service';
import { NotificationService } from '../../services/notification.service';
import { Stock, DEFAULT_STOCKS } from '../../models/stock.model';
import { NotificationSettings } from '../../models/notification-settings.model';
import { addIcons } from 'ionicons';
import { addOutline, closeOutline, notificationsOutline, listOutline } from 'ionicons/icons';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonToggle,
    IonButton,
    IonIcon,
    IonInput,
    IonChip,
    IonSearchbar
  ]
})
export class SettingsPage implements OnInit {
  watchlist: Stock[] = [];
  notificationSettings: NotificationSettings = {
    enabled: true,
    notificationTime: '08:00'
  };
  newSymbol = '';
  searchTerm = '';

  constructor(
    private storageService: StorageService,
    private notificationService: NotificationService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ addOutline, closeOutline, notificationsOutline, listOutline });
  }

  async ngOnInit() {
    await this.loadSettings();
  }

  async loadSettings() {
    this.watchlist = await this.storageService.getWatchlist();
    this.notificationSettings = await this.storageService.getNotificationSettings();
  }

  async addStock() {
    const symbol = this.newSymbol.trim().toUpperCase();
    
    if (!symbol) {
      await this.showToast('Please enter a stock symbol', 'warning');
      return;
    }

    if (this.watchlist.find(s => s.symbol === symbol)) {
      await this.showToast('Stock already in watchlist', 'warning');
      return;
    }

    const stock: Stock = {
      symbol: symbol,
      addedAt: Date.now()
    };

    await this.storageService.addStock(stock);
    this.watchlist = await this.storageService.getWatchlist();
    this.newSymbol = '';
    await this.showToast(`${symbol} added to watchlist`, 'success');
  }

  async removeStock(symbol: string) {
    const alert = await this.alertController.create({
      header: 'Remove Stock',
      message: `Remove ${symbol} from watchlist?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Remove',
          role: 'confirm',
          handler: async () => {
            await this.storageService.removeStock(symbol);
            this.watchlist = await this.storageService.getWatchlist();
            await this.showToast(`${symbol} removed`, 'success');
          }
        }
      ]
    });

    await alert.present();
  }

  async resetWatchlist() {
    const alert = await this.alertController.create({
      header: 'Reset Watchlist',
      message: 'Reset to default stocks? This will remove all your custom stocks.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Reset',
          role: 'confirm',
          handler: async () => {
            await this.storageService.resetWatchlist();
            this.watchlist = await this.storageService.getWatchlist();
            await this.showToast('Watchlist reset to defaults', 'success');
          }
        }
      ]
    });

    await alert.present();
  }

  async toggleNotifications(event: any) {
    this.notificationSettings.enabled = event.detail.checked;
    await this.storageService.saveNotificationSettings(this.notificationSettings);

    if (this.notificationSettings.enabled) {
      const hasPermission = await this.notificationService.requestPermissions();
      if (hasPermission) {
        await this.notificationService.scheduleDailyNotification(this.notificationSettings.notificationTime);
        await this.showToast('Notifications enabled', 'success');
      } else {
        this.notificationSettings.enabled = false;
        await this.storageService.saveNotificationSettings(this.notificationSettings);
        await this.showToast('Notification permission denied', 'danger');
      }
    } else {
      await this.notificationService.cancelDailyNotification();
      await this.showToast('Notifications disabled', 'success');
    }
  }

  async updateNotificationTime(event: any) {
    this.notificationSettings.notificationTime = event.detail.value;
    await this.storageService.saveNotificationSettings(this.notificationSettings);
    
    if (this.notificationSettings.enabled) {
      await this.notificationService.scheduleDailyNotification(this.notificationSettings.notificationTime);
      await this.showToast('Notification time updated', 'success');
    }
  }

  async testNotification() {
    const watchlist = await this.storageService.getWatchlist();
    if (watchlist.length === 0) {
      await this.showToast('Add stocks to watchlist first', 'warning');
      return;
    }

    await this.notificationService.fetchAndNotifyTodayEarnings();
    await this.showToast('Test notification sent', 'success');
  }

  filteredWatchlist() {
    if (!this.searchTerm) {
      return this.watchlist;
    }
    const term = this.searchTerm.toLowerCase();
    return this.watchlist.filter(stock => 
      stock.symbol.toLowerCase().includes(term) ||
      (stock.name && stock.name.toLowerCase().includes(term))
    );
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}
