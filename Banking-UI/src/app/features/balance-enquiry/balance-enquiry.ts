import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BankingService } from '../../core/banking.service';
import { Account, BalanceResponse, TransactionResponse } from '../../core/models';
import { money, maskNumber } from '../../core/format';

type Tab = 'All' | 'Completed' | 'Pending' | 'Failed';

@Component({
  selector: 'app-balance-enquiry',
  imports: [FormsModule],
  template: `
    <div class="breadcrumb"><b>Home</b> / <b>Accounts</b> / Balance Enquiry</div>
    <h1 class="page-title">Balance Enquiry</h1>
    <p class="page-sub">View your account balance and recent transaction history.</p>

    @if (loading) {
      <div class="card spinner-row" style="margin-top:16px">Loading…</div>
    } @else if (error) {
      <div class="card" style="margin-top:16px"><div class="warn-banner">{{ error }}</div></div>
    } @else if (accounts.length === 0) {
      <div class="card spinner-row" style="margin-top:16px">No accounts to display.</div>
    } @else {
      <!-- account header + selector -->
      <div class="card acc-head">
        <div class="acc-id">
          <div class="chip-avatar">{{ selected!.accountType.charAt(0).toUpperCase() }}</div>
          <div>
            <strong>{{ selected!.accountType }} Account</strong>
            <span class="badge" style="margin-left:8px"><span class="dot"></span>{{ selected!.status || 'Active' }}</span>
            <div class="acc-num">{{ mask(selected!.accountNumber) }}</div>
          </div>
        </div>
        <div class="selector">
          <div class="label">Select Account</div>
          <select class="select" [(ngModel)]="selectedNumber" (ngModelChange)="onSelect()">
            @for (a of accounts; track a.accountId) {
              <option [value]="a.accountNumber">{{ a.accountType }} ****{{ a.accountNumber.slice(-4) }}</option>
            }
          </select>
        </div>
      </div>

      <!-- balance summary -->
      <div class="card summary-card">
        <div class="label">Balance Summary</div>
        <div class="summary-grid">
          <div class="sum-box">
            <div class="label">Available Balance</div>
            <div class="big">{{ money(balance?.availableBalance ?? selected!.availableBalance, currency) }}</div>
            <div class="muted">What you can spend right now</div>
          </div>
          <div class="sum-box">
            <div class="label">Current Balance</div>
            <div class="big">{{ money(balance?.balance ?? selected!.balance, currency) }}</div>
            <div class="muted">Includes pending transactions</div>
          </div>
        </div>
        @if (pendingCount > 0) {
          <div class="warn-banner">Available is {{ money(pendingDiff, currency) }} lower than current due to {{ pendingCount }} pending transaction(s).</div>
        }
      </div>

      <!-- transaction history -->
      <div class="card history">
        <div class="hist-head">
          <div class="label">Transaction History</div>
          <span class="badge muted">Last 5 days · older records are in the statement</span>
        </div>
        <div class="tabs">
          @for (t of tabs; track t) {
            <button class="tab" [class.active]="tab === t" (click)="tab = t">{{ t }}</button>
          }
        </div>

        @if (filtered().length === 0) {
          <div class="spinner-row">No {{ tab === 'All' ? '' : tab.toLowerCase() + ' ' }}transactions in the last 5 days.</div>
        } @else {
          <table>
            <thead>
              <tr><th>Date</th><th>Description</th><th class="right">Amount</th><th class="right">Balance After</th><th>Status</th></tr>
            </thead>
            <tbody>
              @for (t of filtered(); track t.transactionId) {
                <tr>
                  <td class="mono">{{ t.dateTime || t.transactionDate }}</td>
                  <td>{{ t.description || t.merchantId || '—' }}</td>
                  <td class="right mono" [class.pos]="isCredit(t)" [class.neg]="!isCredit(t)">
                    {{ isCredit(t) ? '+ ' : '- ' }}{{ money(t.amount, t.currency || currency) }}
                  </td>
                  <td class="right mono muted">—</td>
                  <td>
                    <span class="badge" [class.muted]="isPending(t)">{{ t.status }}</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
          <div class="hint">Showing {{ filtered().length }} of {{ transactions.length }} transactions — records older than 5 days are automatically removed.</div>
        }
      </div>
    }
  `,
  styles: [`
    .acc-head { display:flex; justify-content:space-between; align-items:center; padding:18px 20px; margin-top:16px; }
    .acc-id { display:flex; gap:12px; align-items:center; }
    .acc-num { color:var(--muted); font-family:ui-monospace,monospace; font-size:12.5px; margin-top:3px; }
    .selector { min-width: 260px; }
    .selector .label { margin-bottom: 6px; text-align:right; }
    .summary-card { padding:18px 20px; margin-top:16px; }
    .summary-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin:12px 0; }
    .sum-box { background:var(--bg); border-radius:10px; padding:16px; }
    .sum-box .big { font-size:24px; font-weight:700; margin:6px 0 4px; color:var(--text); }
    .history { padding:18px 20px; margin-top:16px; }
    .hist-head { display:flex; justify-content:space-between; align-items:center; }
    .tabs { display:flex; gap:18px; border-bottom:1px solid var(--border); margin:14px 0 4px; }
    .tab { background:none; border:none; padding:8px 2px; cursor:pointer; color:var(--muted); font-size:14px; border-bottom:2px solid transparent; }
    .tab.active { color:var(--teal-active); border-bottom-color:var(--teal-active); font-weight:600; }
    table { width:100%; border-collapse:collapse; }
    th { text-align:left; color:var(--muted-2); font-size:11px; text-transform:uppercase; letter-spacing:.4px; padding:12px 8px; border-bottom:1px solid var(--border); }
    th.right, td.right { text-align:right; }
    td { padding:14px 8px; border-bottom:1px solid var(--border); font-size:13.5px; }
    .mono { font-family:ui-monospace,monospace; }
  `],
})
export class BalanceEnquiry implements OnInit {
  private api = inject(BankingService);
  private cdr = inject(ChangeDetectorRef);

  accounts: Account[] = [];
  selected: Account | null = null;
  selectedNumber = '';
  balance: BalanceResponse | null = null;
  transactions: TransactionResponse[] = [];
  currency = 'ZAR';

  tabs: Tab[] = ['All', 'Completed', 'Pending','Failed'];
  tab: Tab = 'All';

  loading = true;
  error = '';

  money = money;
  mask = maskNumber;

  get pendingCount(): number {
    return this.balance?.pendingTransactionCount
      ?? this.transactions.filter(t => this.isPending(t)).length;
  }
  get pendingDiff(): number {
    const cur = this.balance?.balance ?? this.selected?.balance ?? 0;
    const avail = this.balance?.availableBalance ?? this.selected?.availableBalance ?? 0;
    return Math.abs(cur - avail);
  }

  ngOnInit(): void {
    this.api.myAccounts().pipe(finalize(() => this.cdr.markForCheck())).subscribe({
      next: (accs) => {
        this.accounts = accs ?? [];
        this.loading = false;
        if (this.accounts.length) {
          this.selected = this.accounts[0];
          this.selectedNumber = this.selected.accountNumber;
          this.currency = this.selected.currency || 'ZAR';
          this.loadBalance();
        }
        this.loadHistory();
      },
      error: (e) => { this.error = this.friendly(e); this.loading = false; },
    });
  }

  onSelect(): void {
    this.selected = this.accounts.find(a => a.accountNumber === this.selectedNumber) ?? this.selected;
    this.currency = this.selected?.currency || 'ZAR';
    this.loadBalance();
  }

  private loadBalance(): void {
    if (!this.selected) return;
    this.api.balance(this.selected.accountNumber).pipe(finalize(() => this.cdr.markForCheck())).subscribe({
      next: (b) => { this.balance = b; },
      error: () => { this.balance = null; },
    });
  }

  private loadHistory(): void {
    this.api.history().pipe(finalize(() => this.cdr.markForCheck())).subscribe({
      next: (txns) => { this.transactions = Array.isArray(txns) ? txns : []; },
      error: () => { this.transactions = []; },
    });
  }

  filtered(): TransactionResponse[] {
    if (this.tab === 'All') return this.transactions;
    if (this.tab === 'Completed') return this.transactions.filter(t => (t.status || '').toUpperCase() === 'COMPLETED');
    if (this.tab === 'Failed') return this.transactions.filter(t => (t.status || '').toUpperCase() === 'FAILED');
    return this.transactions.filter(t => this.isPending(t));
  }

  isCredit(t: TransactionResponse): boolean { return (t.type || '').toUpperCase() === 'CREDIT'; }
  isPending(t: TransactionResponse): boolean { return (t.status || '').toUpperCase() === 'PENDING'; }

  private friendly(e: any): string {
    if (e?.status === 0) return 'Cannot reach the Banking API. Is it running on :8081 (proxy)?';
    if (e?.status === 401 || e?.status === 403) return 'Not authorised — check the dev token in environment.ts.';
    return 'Could not load balance data.';
  }
}
