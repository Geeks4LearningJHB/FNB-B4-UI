import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Account, BalanceResponse, Card, TransactionResponse } from './models';

@Injectable({ providedIn: 'root' })
export class BankingService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  /** All accounts for the authenticated customer (JWT subject). */
  myAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.base}/accounts/mine`);
  }

  /** Balance summary for one account (by account number). */
  balance(accountNumber: string): Observable<BalanceResponse> {
    return this.http.get<BalanceResponse>(`${this.base}/balance/${accountNumber}`);
  }

  /** Cards linked to an account (by account UUID). */
  cardsForAccount(accountId: string): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.base}/cards/by-account/${accountId}`);
  }

  /** All cards (fallback when no account is selected yet). */
  allCards(): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.base}/cards`);
  }

  /** Recent transaction history for the authenticated customer (last 5 days by default). */
  history(fromDate?: string): Observable<TransactionResponse[]> {
    const q = fromDate ? `?fromDate=${encodeURIComponent(fromDate)}` : '';
    return this.http.get<TransactionResponse[]>(`${this.base}/transactions/history${q}`);
  }
}
