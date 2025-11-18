import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButtons,
  IonRefresher,
  IonRefresherContent
} from '@ionic/angular/standalone';
import { PorscheDesignSystemModule } from '@porsche-design-system/components-angular';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EarningsService } from '../../services/earnings.service';
import { StorageService } from '../../services/storage.service';
import { EarningsEvent, EARNINGS_TIME_MAP } from '../../models/earnings-event.model';
import { addIcons } from 'ionicons';
import { refreshOutline, settingsOutline } from 'ionicons/icons';
import { Router } from '@angular/router';

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
    FullCalendarModule,
    PorscheDesignSystemModule
  ]
})
export class CalendarPage implements OnInit {
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

  constructor(
    private earningsService: EarningsService,
    private storageService: StorageService,
    private router: Router
  ) {
    addIcons({ refreshOutline, settingsOutline });
  }

  ngOnInit() {
    this.loadEarnings();
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
          this.calendarOptions.events = this.transformToCalendarEvents(events);
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
      return {
        id: `${event.symbol}-${event.date}`,
        title: event.symbol,
        start: event.date,
        extendedProps: {
          symbol: event.symbol,
          time: event.time,
          timeLabel: timeInfo.label,
          eps: event.eps,
          epsEstimated: event.epsEstimated
        },
        backgroundColor: this.getColorForTime(event.time),
        borderColor: this.getColorForTime(event.time)
      };
    });
  }

  getColorForTime(time: string | null): string {
    switch (time) {
      case 'bmo': return '#3880ff';
      case 'amc': return '#2dd36f';
      case 'dmt': return '#ffc409';
      default: return '#92949c';
    }
  }

  renderEventContent(arg: any) {
    return { html: `<div style="font-size: 11px; padding: 2px;">${arg.event.title}</div>` };
  }

  handleEventClick(info: any) {
    const props = info.event.extendedProps;
    const epsInfo = props.epsEstimated ? `\nEPS Est: ${props.epsEstimated}` : '';
    const message = `${info.event.title}\n${props.timeLabel}${epsInfo}`;
    alert(message);
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
