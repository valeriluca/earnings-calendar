import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonInput,
  IonSearchbar,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { PorscheDesignSystemModule } from '@porsche-design-system/components-angular';
import { StorageService } from '../../services/storage.service';
import { WebPushService } from '../../services/web-push.service';
import { Stock, DEFAULT_STOCKS } from '../../models/stock.model';
import { NotificationSettings } from '../../models/notification-settings.model';
import { addIcons } from 'ionicons';
import { addOutline, closeOutline, notificationsOutline, listOutline, gridOutline, reorderFourOutline, cameraOutline } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';

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
    IonInput,
    IonSearchbar,
    PorscheDesignSystemModule
  ]
})
export class SettingsPage implements OnInit {
  @ViewChild('logoFileInput') logoFileInput!: ElementRef<HTMLInputElement>;
  
  watchlist: Stock[] = [];
  notificationSettings: NotificationSettings = {
    enabled: true,
    notificationTime: '06:00',
    changeDetectionEnabled: true,
    dailyEarningsEnabled: true
  };
  newSymbol = '';
  searchTerm = '';
  viewMode: 'card' | 'table' = 'card';
  loadingStockDetails = false;
  selectedStockForLogo: Stock | null = null;

  constructor(
    private storageService: StorageService,
    private webPushService: WebPushService,
    private alertController: AlertController,
    private toastController: ToastController,
    private http: HttpClient
  ) {
    addIcons({ addOutline, closeOutline, notificationsOutline, listOutline, gridOutline, reorderFourOutline, cameraOutline });
  }

  async ngOnInit() {
    await this.loadSettings();
  }

  async loadSettings() {
    this.watchlist = await this.storageService.getWatchlist();
    this.notificationSettings = await this.storageService.getNotificationSettings();
    
    // Set logos immediately for all stocks
    this.watchlist.forEach(stock => {
      if (!stock.logo) {
        this.setStockLogo(stock);
      }
    });
    
    // Then enrich with additional data
    await this.enrichStockData();
  }

  async enrichStockData() {
    if (this.watchlist.length === 0) return;
    
    this.loadingStockDetails = true;
    
    // Enrich stocks with additional data from API
    for (let stock of this.watchlist) {
      try {
        await this.fetchStockDetails(stock);
      } catch (error) {
        console.error(`Error fetching details for ${stock.symbol}:`, error);
        // Ensure logo is set even if fetch fails
        if (!stock.logo) {
          this.setStockLogo(stock);
        }
      }
    }
    
    this.loadingStockDetails = false;
  }

  async fetchStockDetails(stock: Stock) {
    try {
      // Use Yahoo Finance API via our backend
      const response: any = await firstValueFrom(
        this.http.get(`https://query1.finance.yahoo.com/v8/finance/chart/${stock.symbol}`)
      );
      
      if (response?.chart?.result?.[0]) {
        const result = response.chart.result[0];
        const meta = result.meta;
        
        stock.price = meta.regularMarketPrice;
        stock.change = meta.regularMarketPrice - meta.previousClose;
        stock.changePercent = ((stock.change / meta.previousClose) * 100);
        stock.marketCap = meta.marketCap;
      }
    } catch (error) {
      console.error(`Error fetching details for ${stock.symbol}:`, error);
    }
    
    // Always set logo (after trying to fetch details)
    this.setStockLogo(stock);
  }

  setStockLogo(stock: Stock) {
    // Don't override custom logos
    if (stock.customLogo) {
      return;
    }
    
    // Try to get logo from Financial Modeling Prep API or use letter-based logo
    const domain = this.getCompanyDomain(stock.symbol);
    
    if (domain) {
      // Use Clearbit logo with fallback
      stock.logo = `https://logo.clearbit.com/${domain}`;
    } else {
      // Use letter-based logo directly for unknown companies
      const letter = stock.symbol.charAt(0);
      const color = this.getColorForLetter(letter);
      stock.logo = `https://ui-avatars.com/api/?name=${letter}&size=128&background=${color}&color=fff&bold=true`;
    }
  }

  getColorForLetter(letter: string): string {
    // Generate consistent color for each letter
    const colors = ['1abc9c', '2ecc71', '3498db', '9b59b6', 'e74c3c', 'f39c12', '16a085', '27ae60', '2980b9', '8e44ad', 'c0392b', 'd35400'];
    const index = letter.charCodeAt(0) % colors.length;
    return colors[index];
  }

  getCompanyDomain(symbol: string): string | null {
    // Map common symbols to domains
    const domainMap: { [key: string]: string } = {
      'AAPL': 'apple.com',
      'MSFT': 'microsoft.com',
      'GOOGL': 'google.com',
      'GOOG': 'google.com',
      'AMZN': 'amazon.com',
      'META': 'meta.com',
      'TSLA': 'tesla.com',
      'NVDA': 'nvidia.com',
      'AMD': 'amd.com',
      'INTC': 'intel.com',
      'NFLX': 'netflix.com',
      'DIS': 'disney.com',
      'PYPL': 'paypal.com',
      'COIN': 'coinbase.com',
      'UBER': 'uber.com',
      'ABNB': 'airbnb.com',
      'SPOT': 'spotify.com',
      'SNOW': 'snowflake.com',
      'NET': 'cloudflare.com',
      'SQ': 'block.xyz',
      'BABA': 'alibaba.com',
      'JD': 'jd.com',
      'NIO': 'nio.com',
      'XPEV': 'xpeng.com',
      'SAP': 'sap.com',
      'EBAY': 'ebay.com',
      'NKE': 'nike.com',
      'SBUX': 'starbucks.com',
      'KO': 'coca-cola.com',
      'BA': 'boeing.com',
      'GE': 'ge.com',
      'IBM': 'ibm.com',
      'JPM': 'jpmorganChase.com',
      'V': 'visa.com',
      'MA': 'mastercard.com',
      'WMT': 'walmart.com',
      'HD': 'homedepot.com',
      'CSCO': 'cisco.com',
      'ORCL': 'oracle.com',
      'ADBE': 'adobe.com',
      'CRM': 'salesforce.com',
      'PEP': 'pepsi.com',
      'MCD': 'mcdonalds.com',
      'COST': 'costco.com',
      'ACB': 'auroramj.com',
      'BIDU': 'baidu.com',
      'BASFY': 'basf.com',
      'BLK': 'blackrock.com',
      'AVGO': 'broadcom.com',
      'AI': 'c3.ai',
      'CGC': 'canopygrowth.com',
      'CAT': 'caterpillar.com',
      'FI': 'fiserv.com',
      'ILMN': 'illumina.com',
      'JAZZ': 'jazzpharma.com',
      'LUMN': 'lumen.com',
      'MRVL': 'marvell.com',
      'NVO': 'novonordisk.com',
      'OCGN': 'ocugen.com',
      'QCOM': 'qualcomm.com',
      'PM': 'pmi.com',
      'TDOC': 'teladoc.com',
      'TME': 'tencentmusic.com',
      'UAA': 'underarmour.com',
      'UNH': 'unitedhealthgroup.com',
      'WBD': 'wbd.com',
      'SMSI': 'suss.com',
      'RHM.DE': 'rheinmetall.com',
      '1810.HK': 'mi.com'
    };
    
    return domainMap[symbol] || null;
  }

  getDefaultLogo(symbol: string): string {
    const letter = symbol.charAt(0);
    const color = this.getColorForLetter(letter);
    return `https://ui-avatars.com/api/?name=${letter}&size=128&background=${color}&color=fff&bold=true`;
  }

  handleLogoError(event: any, stock: Stock) {
    // If logo fails to load, use letter-based avatar
    const target = event.target as HTMLImageElement;
    const letter = stock.symbol.charAt(0);
    const color = this.getColorForLetter(letter);
    target.src = `https://ui-avatars.com/api/?name=${letter}&size=128&background=${color}&color=fff&bold=true`;
  }

  async openLogoUpload(stock: Stock) {
    this.selectedStockForLogo = stock;
    
    const alert = await this.alertController.create({
      header: 'Update Logo',
      message: `Choose how to update the logo for ${stock.symbol}`,
      buttons: [
        {
          text: 'Upload Image',
          handler: () => {
            this.logoFileInput.nativeElement.click();
          }
        },
        {
          text: 'Enter URL',
          handler: async () => {
            await this.promptForLogoUrl(stock);
          }
        },
        {
          text: 'Reset to Default',
          handler: async () => {
            await this.resetStockLogo(stock);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  async onLogoFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file || !this.selectedStockForLogo) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      await this.showToast('Image too large. Please choose an image under 2MB', 'warning');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      await this.showToast('Please select a valid image file', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const base64Image = e.target.result;
      
      if (this.selectedStockForLogo) {
        this.selectedStockForLogo.logo = base64Image;
        this.selectedStockForLogo.customLogo = true;
        
        // Save to storage
        await this.storageService.updateStock(this.selectedStockForLogo);
        await this.showToast('Logo updated successfully', 'success');
      }
    };

    reader.readAsDataURL(file);
    
    // Reset file input
    event.target.value = '';
  }

  async promptForLogoUrl(stock: Stock) {
    const alert = await this.alertController.create({
      header: 'Enter Logo URL',
      message: `Enter the image URL for ${stock.symbol}`,
      inputs: [
        {
          name: 'url',
          type: 'url',
          placeholder: 'https://example.com/logo.png',
          value: stock.customLogo ? stock.logo : ''
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: async (data) => {
            if (data.url && data.url.trim()) {
              stock.logo = data.url.trim();
              stock.customLogo = true;
              await this.storageService.updateStock(stock);
              await this.showToast('Logo updated successfully', 'success');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async resetStockLogo(stock: Stock) {
    stock.customLogo = false;
    this.setStockLogo(stock);
    await this.storageService.updateStock(stock);
    await this.showToast('Logo reset to default', 'success');
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'card' ? 'table' : 'card';
  }

  formatMarketCap(marketCap?: number): string {
    if (!marketCap) return 'N/A';
    
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return `$${marketCap.toFixed(0)}`;
  }

  formatPrice(price?: number): string {
    if (!price) return 'N/A';
    return `$${price.toFixed(2)}`;
  }

  formatChange(change?: number, changePercent?: number): string {
    if (change === undefined || changePercent === undefined) return 'N/A';
    const sign = change >= 0 ? '+' : '';
    return `${sign}$${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  }

  getChangeClass(change?: number): string {
    if (!change) return '';
    return change >= 0 ? 'text-green-500' : 'text-red-500';
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

    // Look up the stock name from DEFAULT_STOCKS if it exists
    const defaultStock = DEFAULT_STOCKS.find(s => s.symbol === symbol);
    const stock: Stock = {
      symbol: symbol,
      name: defaultStock?.name,
      addedAt: Date.now()
    };

    // Set logo immediately
    this.setStockLogo(stock);

    // Fetch stock details before adding (including logo)
    try {
      await this.fetchStockDetails(stock);
    } catch (error) {
      console.error(`Error fetching details for ${stock.symbol}:`, error);
    }

    await this.storageService.addStock(stock);
    this.watchlist = await this.storageService.getWatchlist();
    
    // Ensure all stocks have logos after reload
    this.watchlist.forEach(s => {
      if (!s.logo) {
        this.setStockLogo(s);
      }
    });
    
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
            
            // Set logos for remaining stocks
            this.watchlist.forEach(stock => {
              if (!stock.logo) {
                this.setStockLogo(stock);
              }
            });
            
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
            await this.loadSettings();
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
      const hasPermission = await this.webPushService.requestPermission();
      if (hasPermission) {
        if (this.notificationSettings.dailyEarningsEnabled) {
          await this.webPushService.scheduleDailyNotification(this.notificationSettings.notificationTime);
        }
        if (this.notificationSettings.changeDetectionEnabled) {
          await this.webPushService.startChangeDetection();
        }
        await this.showToast('Notifications enabled', 'success');
      } else {
        this.notificationSettings.enabled = false;
        await this.storageService.saveNotificationSettings(this.notificationSettings);
        await this.showToast('Notification permission denied', 'danger');
      }
    } else {
      await this.webPushService.cancelDailyNotification();
      this.webPushService.stopChangeDetection();
      await this.showToast('Notifications disabled', 'success');
    }
  }

  async toggleDailyEarnings(event: any) {
    this.notificationSettings.dailyEarningsEnabled = event.detail.checked;
    await this.storageService.saveNotificationSettings(this.notificationSettings);

    if (this.notificationSettings.enabled) {
      if (this.notificationSettings.dailyEarningsEnabled) {
        await this.webPushService.scheduleDailyNotification(this.notificationSettings.notificationTime);
        await this.showToast('Daily earnings notifications enabled', 'success');
      } else {
        await this.webPushService.cancelDailyNotification();
        await this.showToast('Daily earnings notifications disabled', 'success');
      }
    }
  }

  async toggleChangeDetection(event: any) {
    this.notificationSettings.changeDetectionEnabled = event.detail.checked;
    await this.storageService.saveNotificationSettings(this.notificationSettings);

    if (this.notificationSettings.enabled) {
      if (this.notificationSettings.changeDetectionEnabled) {
        await this.webPushService.startChangeDetection();
        await this.showToast('Change detection enabled', 'success');
      } else {
        this.webPushService.stopChangeDetection();
        await this.showToast('Change detection disabled', 'success');
      }
    }
  }

  async updateNotificationTime(event: any) {
    this.notificationSettings.notificationTime = event.detail.value;
    await this.storageService.saveNotificationSettings(this.notificationSettings);
    
    if (this.notificationSettings.enabled && this.notificationSettings.dailyEarningsEnabled) {
      await this.webPushService.scheduleDailyNotification(this.notificationSettings.notificationTime);
      await this.showToast('Notification time updated', 'success');
    }
  }

  async testNotification() {
    try {
      console.log('Test notification button clicked');
      await this.webPushService.testNotification();
      await this.showToast('Test notification sent! Check your notifications.', 'success');
    } catch (error: any) {
      console.error('Test notification error:', error);
      await this.showToast(error.message || 'Failed to send notification. Check permissions.', 'danger');
    }
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
