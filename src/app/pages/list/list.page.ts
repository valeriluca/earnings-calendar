import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonRefresher,
  IonRefresherContent,
  IonButtons
} from '@ionic/angular/standalone';
import { PorscheDesignSystemModule } from '@porsche-design-system/components-angular';
import { EarningsService } from '../../services/earnings.service';
import { StorageService } from '../../services/storage.service';
import { EarningsEvent, EARNINGS_TIME_MAP } from '../../models/earnings-event.model';
import { addIcons } from 'ionicons';
import { refreshOutline, settingsOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonRefresher,
    IonRefresherContent,
    IonButtons,
    PorscheDesignSystemModule
  ]
})
export class ListPage implements OnInit, OnDestroy {
  earnings: EarningsEvent[] = [];
  filteredEarnings: EarningsEvent[] = [];
  loading = false;
  error: string | null = null;
  selectedFilter = 'all';
  private watchlistSubscription?: Subscription;

  constructor(
    private earningsService: EarningsService,
    private storageService: StorageService,
    private router: Router
  ) {
    addIcons({ refreshOutline, settingsOutline });
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
      console.log('Watchlist loaded:', watchlist);
      const symbols = watchlist.map(s => s.symbol);

      if (symbols.length === 0) {
        this.error = 'No stocks in watchlist. Add stocks in Settings.';
        this.loading = false;
        return;
      }

      const today = new Date();
      const futureDate = this.addDays(today, 60);
      console.log('Fetching earnings from', today, 'to', futureDate);
      console.log('Symbols:', symbols);

      this.earningsService.getEarningsBySymbols(symbols, today, futureDate).subscribe({
        next: (events) => {
          console.log('Earnings events received:', events);
          // Add company names from watchlist to earnings events
          const eventsWithNames = events.map(event => {
            const stock = watchlist.find(s => s.symbol === event.symbol);
            return {
              ...event,
              name: stock?.name || event.symbol
            };
          });
          this.earnings = eventsWithNames.sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          this.filterEarnings();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading earnings:', err);
          this.error = 'Failed to load earnings data. Please try again.';
          this.loading = false;
        }
      });
    } catch (err) {
      console.error('Error loading watchlist:', err);
      this.error = 'Error loading watchlist.';
      this.loading = false;
    }
  }

  filterEarnings() {
    if (this.selectedFilter === 'all') {
      this.filteredEarnings = this.earnings;
    } else if (this.selectedFilter === 'today') {
      const today = this.formatDate(new Date());
      this.filteredEarnings = this.earnings.filter(e => e.date === today);
    } else if (this.selectedFilter === 'week') {
      const today = new Date();
      const weekFromNow = this.addDays(today, 7);
      this.filteredEarnings = this.earnings.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate >= today && eventDate <= weekFromNow;
      });
    }
  }

  onFilterChange(event: any) {
    this.selectedFilter = event.detail.value;
    this.filterEarnings();
  }

  getTimeInfo(event: EarningsEvent) {
    return EARNINGS_TIME_MAP[event.time || 'null'];
  }

  getTagColor(time: string | null): 'primary' | 'background-surface' | 'notification-info-soft' | 'notification-success-soft' | 'notification-warning-soft' | 'notification-neutral' {
    switch (time) {
      case 'bmo': return 'notification-info-soft';
      case 'amc': return 'notification-success-soft';
      case 'dmt': return 'notification-warning-soft';
      default: return 'notification-neutral';
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDisplayDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  isToday(dateStr: string): boolean {
    const today = this.formatDate(new Date());
    return dateStr === today;
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
