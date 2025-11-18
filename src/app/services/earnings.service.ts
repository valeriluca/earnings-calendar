import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { EarningsEvent } from '../models/earnings-event.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EarningsService {
  private readonly API_BASE = '/api';
  
  constructor(private http: HttpClient) {}

  /**
   * Fetch earnings by symbols using our backend API (yahoo-finance2)
   */
  getEarningsBySymbols(symbols: string[], from?: Date, to?: Date): Observable<EarningsEvent[]> {
    console.log('Fetching earnings for symbols:', symbols);
    
    const fromDate = from || new Date();
    const toDate = to || this.addDays(fromDate, 60);
    
    // Format dates as YYYY-MM-DD
    const fromStr = this.formatDate(fromDate);
    const toStr = this.formatDate(toDate);
    
    // Call our backend API which uses yahoo-finance2
    const params = new HttpParams()
      .set('symbols', symbols.join(','))
      .set('from', fromStr)
      .set('to', toStr);
    
    return this.http.get<EarningsEvent[]>(`${this.API_BASE}/yahoo-earnings`, { params }).pipe(
      map(events => {
        // Parse fullDate string back to Date object for calendar compatibility
        return events.map(event => ({
          ...event,
          fullDate: event.fullDate ? new Date(event.fullDate) : undefined
        }));
      }),
      catchError(error => {
        console.error('Error fetching earnings:', error);
        return of([]);
      })
    );
  }

  /**
   * Get today's earnings
   */
  getTodayEarnings(symbols: string[]): Observable<EarningsEvent[]> {
    const today = new Date();
    const tomorrow = this.addDays(today, 1);
    return this.getEarningsBySymbols(symbols, today, tomorrow);
  }

  /**
   * Format date to YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Add days to date
   */
  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}
