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
import { MarketHolidaysService } from '../../services/market-holidays.service';
import { EarningsEvent, EARNINGS_TIME_MAP } from '../../models/earnings-event.model';
import { MarketHoliday, MARKET_INFO } from '../../models/market-holiday.model';
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
    private marketHolidaysService: MarketHolidaysService,
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

      const today = new Date();
      const futureDate = this.addDays(today, 60);

      // Load market holidays for the date range
      const holidays = this.marketHolidaysService.getHolidaysInRange(today, futureDate);
      const holidayEvents = this.transformHolidaysToCalendarEvents(holidays);

      if (symbols.length === 0) {
        // Still show holidays even if no stocks in watchlist
        this.calendarOptions.events = holidayEvents;
        if (this.calendarComponent) {
          const calendarApi = this.calendarComponent.getApi();
          calendarApi.refetchEvents();
        }
        this.loading = false;
        return;
      }

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
          const earningsEvents = this.transformToCalendarEvents(eventsWithNames);
          // Combine earnings and holiday events
          this.calendarOptions.events = [...earningsEvents, ...holidayEvents];
          // Force calendar to re-render with new events
          if (this.calendarComponent) {
            const calendarApi = this.calendarComponent.getApi();
            calendarApi.refetchEvents();
          }
          this.loading = false;
        },
        error: (err) => {
          // Still show holidays even if earnings fail
          this.calendarOptions.events = holidayEvents;
          if (this.calendarComponent) {
            const calendarApi = this.calendarComponent.getApi();
            calendarApi.refetchEvents();
          }
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
          type: 'earnings',
          symbol: event.symbol,
          name: event.name,
          time: event.time,
          timeLabel: timeInfo.label,
          exactTime: event.exactTime,
          eps: event.eps,
          epsEstimated: event.epsEstimated,
          logoUrl: logoUrl,
          fullDate: event.fullDate
        },
        backgroundColor: this.getColorForTime(event.time),
        borderColor: this.getColorForTime(event.time)
      };
    });
  }

  transformHolidaysToCalendarEvents(holidays: MarketHoliday[]): EventInput[] {
    // Group holidays by date to consolidate multiple holidays on the same day
    const holidaysByDate = new Map<string, MarketHoliday[]>();
    
    holidays.forEach(holiday => {
      if (!holidaysByDate.has(holiday.date)) {
        holidaysByDate.set(holiday.date, []);
      }
      holidaysByDate.get(holiday.date)!.push(holiday);
    });

    const events: EventInput[] = [];
    
    holidaysByDate.forEach((dayHolidays: MarketHoliday[], date: string) => {
      // Consolidate all markets closed on this date
      const allMarketsSet = new Set<string>();
      dayHolidays.forEach((h: MarketHoliday) => {
        h.markets.forEach((m: string) => allMarketsSet.add(m));
      });
      const allMarkets = Array.from(allMarketsSet);
      
      // Use the first holiday name (typically the main holiday for that day)
      const primaryHoliday = dayHolidays[0];
      
      // Format markets with flags for display
      const marketsDisplay = allMarkets.map((m: string) => {
        const info = MARKET_INFO[m as keyof typeof MARKET_INFO];
        return `${info.flag} ${m}`;
      }).join(' • ');

      events.push({
        id: `holiday-${date}`,
        title: `🏛️ ${primaryHoliday.name}`,
        start: date,
        allDay: true,
        extendedProps: {
          type: 'holiday',
          holidayName: primaryHoliday.name,
          markets: allMarkets,
          marketsDisplay: marketsDisplay,
          allHolidays: dayHolidays
        },
        backgroundColor: '#1E3A5F',    // Deep blue for holidays
        borderColor: '#2563EB',         // Brighter blue border
        display: 'block'
      });
    });

    return events;
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
    const props = arg.event.extendedProps;
    const title = arg.event.title;
    
    // Check if this is a holiday event
    if (props.type === 'holiday') {
      return { 
        html: `
          <div style="display: flex; align-items: center; gap: 4px; font-size: 10px; padding: 2px 4px; line-height: 1.2;">
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500;">${title}</span>
          </div>
        ` 
      };
    }
    
    // Earnings event
    const logoUrl = props.logoUrl;
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
    
    // Check if this is a holiday event
    if (props.type === 'holiday') {
      this.selectedEvent = {
        type: 'holiday',
        title: props.holidayName,
        date: info.event.start,
        markets: props.markets,
        marketsDisplay: props.marketsDisplay,
        allHolidays: props.allHolidays
      };
      this.isModalOpen = true;
      return;
    }
    
    // Earnings event
    this.selectedEvent = {
      type: 'earnings',
      title: info.event.title,
      symbol: props.symbol,
      date: info.event.start,
      time: props.time,
      timeLabel: props.timeLabel,
      exactTime: props.exactTime,
      eps: props.eps,
      epsEstimated: props.epsEstimated,
      berlinTime: this.getBerlinTime(props.time, props.exactTime),
      exactBerlinTime: this.getExactBerlinTime(props.exactTime),
      logoUrl: props.logoUrl
    };
    this.isModalOpen = true;
  }

  getMarketInfo(marketCode: string) {
    return MARKET_INFO[marketCode as keyof typeof MARKET_INFO];
  }

  getBerlinTime(earningsTime: string | null, exactTime?: string): string {
    // If we have exact time, convert it to Berlin time
    if (exactTime) {
      return this.getExactBerlinTime(exactTime) || this.getApproximateBerlinTime(earningsTime);
    }
    return this.getApproximateBerlinTime(earningsTime);
  }

  getApproximateBerlinTime(earningsTime: string | null): string {
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

  getExactBerlinTime(exactTime: string | null | undefined): string | null {
    if (!exactTime) return null;
    
    // Parse ET time (HH:MM format)
    const [hours, minutes] = exactTime.split(':').map(Number);
    
    // Convert ET to Berlin time (add 6 hours for CET, 5 for CEST during summer)
    // Using 6 hours as default (CET = ET + 6)
    const berlinHours = (hours + 6) % 24;
    
    return `${String(berlinHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} CET`;
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
