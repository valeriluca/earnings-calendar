import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButtons,
  IonRefresher,
  IonRefresherContent,
  IonModal,
  IonButton
} from '@ionic/angular/standalone';
import { PorscheDesignSystemModule } from '@porsche-design-system/components-angular';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EarningsService } from '../../services/earnings.service';
import { StorageService } from '../../services/storage.service';
import { EarningsEvent, EARNINGS_TIME_MAP } from '../../models/earnings-event.model';
import { addIcons } from 'ionicons';
import { refreshOutline, settingsOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButtons,
    IonRefresher,
    IonRefresherContent,
    IonModal,
    IonButton,
    FullCalendarModule,
    PorscheDesignSystemModule
  ]
})
export class CalendarPage implements OnInit, OnDestroy {
  @ViewChild('calendar') calendarComponent?: FullCalendarComponent;
  
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    height: 'auto',
    events: [],
    eventClick: this.handleEventClick.bind(this),
    eventContent: this.renderEventContent.bind(this)
  };

  loading = false;
  error: string | null = null;
  isModalOpen = false;
  selectedEvent: any = null;
  private watchlistSubscription?: Subscription;

  constructor(
    private earningsService: EarningsService,
    private storageService: StorageService,
    private router: Router
  ) {
    addIcons({ refreshOutline, settingsOutline });
  }

  ionViewDidEnter() {
    // Delay is needed so Ionic finishes its page transition before resize
    requestAnimationFrame(() => {
      const calendarApi = this.calendarComponent?.getApi();
      if (calendarApi) {
        calendarApi.updateSize();
        calendarApi.render();
      }
    });
  }

  ngOnInit() {
    this.loadEarnings();
    // Subscribe to watchlist changes
    this.watchlistSubscription = this.storageService.watchlist$.subscribe(() => {
      this.loadEarnings();
    });
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.watchlistSubscription) {
      this.watchlistSubscription.unsubscribe();
    }
  }

  async loadEarnings() {
    this.loading = true;
    this.error = null;

    try {
      const watchlist = await this.storageService.getWatchlist();
      const symbols = watchlist.map(s => s.symbol);

      if (symbols.length === 0) {
        this.error = 'No stocks in watchlist. Add stocks in Settings.';
        this.loading = false;
        return;
      }

      const today = new Date();
      const futureDate = this.addDays(today, 60);

      this.earningsService.getEarningsBySymbols(symbols, today, futureDate).subscribe({
        next: (events) => {
          // Add company names from watchlist to earnings events
          const eventsWithNames = events.map(event => {
            const stock = watchlist.find(s => s.symbol === event.symbol);
            return {
              ...event,
              name: stock?.name || event.symbol
            };
          });
          this.calendarOptions.events = this.transformToCalendarEvents(eventsWithNames);
          // Force calendar to re-render with new events
          if (this.calendarComponent) {
            const calendarApi = this.calendarComponent.getApi();
            calendarApi.refetchEvents();
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load earnings data. Please try again.';
          this.loading = false;
          console.error(err);
        }
      });
    } catch (err) {
      this.error = 'Error loading watchlist.';
      this.loading = false;
      console.error(err);
    }
  }

  transformToCalendarEvents(earnings: EarningsEvent[]): EventInput[] {
    return earnings.map(event => {
      const timeInfo = EARNINGS_TIME_MAP[event.time || 'null'];
      const logoUrl = this.getLogoUrl(event.symbol);
      return {
        id: `${event.symbol}-${event.date}`,
        title: event.name || event.symbol,
        start: event.date,
        extendedProps: {
          symbol: event.symbol,
          name: event.name,
          time: event.time,
          timeLabel: timeInfo.label,
          eps: event.eps,
          epsEstimated: event.epsEstimated,
          logoUrl: logoUrl
        },
        backgroundColor: this.getColorForTime(event.time),
        borderColor: this.getColorForTime(event.time)
      };
    });
  }

  getColorForTime(time: string | null): string {
    switch (time) {
      case 'bmo': return '#A31E39';      // Bright bordeaux red
      case 'amc': return '#6B7280';      // Medium grey
      case 'dmt': return '#D94A6A';      // Light rose/pink
      default: return '#4B5563';         // Dark grey
    }
  }

  getLogoUrl(symbol: string): string {
    // Use Yahoo Finance logo API
    return `https://logo.clearbit.com/${this.getCompanyDomain(symbol)}`;
  }

  getCompanyDomain(symbol: string): string {
    // Map common symbols to their domains
    const domainMap: Record<string, string> = {
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
      'ABNB': 'airbnb.com',
      'UBER': 'uber.com',
      'COIN': 'coinbase.com',
      'SQ': 'squareup.com',
      'SPOT': 'spotify.com',
      'SNOW': 'snowflake.com',
      'NET': 'cloudflare.com',
      'BABA': 'alibabagroup.com',
      'JD': 'jd.com',
      'BIDU': 'baidu.com',
      'NIO': 'nio.com',
      'XPEV': 'xpeng.com',
      'SAP': 'sap.com',
      'NKE': 'nike.com',
      'SBUX': 'starbucks.com',
      'KO': 'coca-cola.com',
      'PM': 'pmi.com',
      'CAT': 'caterpillar.com',
      'UNH': 'unitedhealthgroup.com',
      'BLK': 'blackrock.com',
      'QCOM': 'qualcomm.com',
      'AVGO': 'broadcom.com',
      'MRVL': 'marvell.com'
    };
    
    return domainMap[symbol] || `${symbol.toLowerCase()}.com`;
  }

  renderEventContent(arg: any) {
    const logoUrl = arg.event.extendedProps.logoUrl;
    const title = arg.event.title;
    
    return { 
      html: `
        <div style="display: flex; align-items: center; gap: 4px; font-size: 11px; padding: 2px;">
          <img 
            src="${logoUrl}" 
            alt="${title}" 
            style="width: 14px; height: 14px; border-radius: 2px; object-fit: contain; background: white; padding: 1px;"
            onerror="this.style.display='none'"
          />
          <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</span>
        </div>
      ` 
    };
  }

  handleEventClick(info: any) {
    const props = info.event.extendedProps;
    this.selectedEvent = {
      title: info.event.title,
      symbol: props.symbol,
      date: info.event.start,
      time: props.time,
      timeLabel: props.timeLabel,
      eps: props.eps,
      epsEstimated: props.epsEstimated,
      berlinTime: this.getBerlinTime(props.time),
      logoUrl: props.logoUrl
    };
    this.isModalOpen = true;
  }

  getBerlinTime(earningsTime: string | null): string {
    if (!earningsTime) return 'Time TBD';
    
    switch (earningsTime) {
      case 'bmo': // Before Market Open - US markets open at 9:30 AM ET = 3:30 PM Berlin
        return '~15:30 CET/CEST';
      case 'amc': // After Market Close - US markets close at 4:00 PM ET = 10:00 PM Berlin
        return '~22:00 CET/CEST';
      case 'dmt': // During Market Time
        return '15:30 - 22:00 CET/CEST';
      default:
        return 'Time TBD';
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedEvent = null;
  }

  formatModalDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  async handleRefresh(event: any) {
    await this.loadEarnings();
    event.target.complete();
  }

  navigateToSettings() {
    this.router.navigate(['/settings']);
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}
