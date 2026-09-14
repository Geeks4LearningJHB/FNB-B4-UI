import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { BankingService } from '../../core/banking.service';
import { Account, TransactionResponse } from '../../core/models';
import { UiSettingsService } from '../../core/ui-settings.service';
import { money, maskNumber } from '../../core/format';
import { QuickActions } from '../../shared/quick-actions/quick-actions';
import { TransactionsList } from '../../shared/transactions-list/transactions-list';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, QuickActions, TransactionsList],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private api = inject(BankingService);
  private cdr = inject(ChangeDetectorRef);
  ui = inject(UiSettingsService);

  accounts: Account[] = [];
  transactions: TransactionResponse[] = [];
  loading = true;
  error = '';

  money = money;
  mask = maskNumber;

  get totalBalance(): number {
    return this.accounts.reduce((s, a) => s + (a.availableBalance ?? a.balance ?? 0), 0);
  }

  get currency(): string {
    return this.accounts[0]?.currency ?? 'ZAR';
  }

  get activeCount(): number {
    return this.accounts.filter(a => (a.status ?? 'ACTIVE').toUpperCase() === 'ACTIVE').length;
  }

  get accountTypesSummary(): string {
    return [...new Set(this.accounts.map(a => a.accountType))].join(' + ') || '—';
  }

  /** Purely a visual cue: how much of the ledger balance is currently available. */
  progressPct(a: Account): number {
    const balance = a.balance ?? 0;
    if (balance <= 0) return 100;
    const pct = ((a.availableBalance ?? balance) / balance) * 100;
    return Math.max(6, Math.min(100, Math.round(pct)));
  }

  ngOnInit(): void {
    forkJoin({ accounts: this.api.myAccounts(), history: this.api.history() })
      .pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: ({ accounts, history }) => {
          this.accounts = accounts ?? [];
          this.transactions = history ?? [];
        },
        error: (e) => { this.error = this.friendly(e); },
      });
  }

  private friendly(e: any): string {
    if (e?.status === 0) return 'Cannot reach the Banking API.';
    if (e?.status === 401 || e?.status === 403) return 'Not authorised — check the dev token in environment.ts.';
    return 'Could not load your accounts.';
  }
}
