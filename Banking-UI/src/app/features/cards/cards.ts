import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs';
import { BankingService } from '../../core/banking.service';
import { Account, Card } from '../../core/models';
import { maskNumber } from '../../core/format';

@Component({
  selector: 'app-cards',
  template: `
    <div class="breadcrumb"><b>Home</b> / Cards</div>
    <h1 class="page-title">My Card</h1>
    <p class="page-sub">The card linked to your account.</p>

    @if (loading) {
      <div class="card spinner-row" style="margin-top:16px">Loading card…</div>
    } @else if (error) {
      <div class="card" style="margin-top:16px"><div class="warn-banner">{{ error }}</div></div>
    } @else if (!card) {
      <div class="card spinner-row" style="margin-top:16px">No card is linked to this account yet — it's issued automatically when the account is created.</div>
    } @else {
      <div class="layout">
        <!-- visual card + actions -->
        <div>
          <div class="bankcard" [class.frozen]="frozen">
            <div class="bc-top">
              <span class="bc-name">{{ card.cardType || 'Aspire' }} {{ card.cardBrand ? '' : 'Credit' }}</span>
            </div>
            <div class="bc-chip"><span class="wifi">))))</span><span class="chip"></span></div>
            <div class="bc-number">{{ revealed ? group(card.cardNumber) : '**** **** **** ' + last4(card.cardNumber) }}</div>
            <div class="bc-bottom">
              <div><div class="bc-label">CARD HOLDER</div><div class="bc-holder">{{ holder }}</div></div>
              <div class="bc-brand">{{ (card.cardBrand || 'VISA').toUpperCase() }}</div>
            </div>
          </div>

          <button class="btn full" (click)="revealed = !revealed">
            {{ revealed ? 'Hide card details' : 'Reveal card details' }}
          </button>
          <button class="btn full freeze" (click)="frozen = !frozen">
            {{ frozen ? 'Unfreeze card' : 'Freeze card' }}
          </button>
        </div>

        <!-- details panel -->
        <div class="card details">
          <h3>Card details</h3>
          <div class="grid">
            <div><div class="label">Card number</div><div class="val mono">{{ revealed ? group(card.cardNumber) : '**** **** **** ' + last4(card.cardNumber) }}</div></div>
            <div><div class="label">Status</div><div class="val"><span class="badge" [class.muted]="frozen"><span class="dot"></span>{{ frozen ? 'Frozen' : (card.cardOnDarkWeb ? 'At risk' : 'Active') }}</span></div></div>

            <div><div class="label">Card type</div><div class="val">{{ card.cardType || 'Debit' }}</div></div>
            <div><div class="label">Card brand</div><div class="val">{{ card.cardBrand || 'Visa' }}</div></div>

            <div><div class="label">Expiry</div><div class="val mono">{{ revealed ? expiry(card.expires) : '••/••' }}</div></div>
            <div><div class="label">CVV</div><div class="val mono">{{ revealed ? (card.cvv || '•••') : '•••' }}</div></div>

            <div><div class="label">Chip enabled</div><div class="val">Yes</div></div>
            <div><div class="label">Linked account</div><div class="val mono">{{ linkedAccount }}</div></div>
          </div>

          <div class="hint">Full number, expiry and CVV are hidden until you tap “Reveal card details”.</div>
          <div class="info-banner" style="margin-top:12px">This card was issued automatically when your account was created.</div>
        </div>
      </div>
    }
  `,
  styles: [`
    .layout { display:grid; grid-template-columns: 340px 1fr; gap:20px; margin-top:16px; align-items:start; }
    .bankcard {
      background: linear-gradient(135deg, #0f3b39 0%, #16a39c 100%);
      color:#fff; border-radius:14px; padding:20px; height:210px;
      display:flex; flex-direction:column; justify-content:space-between;
      box-shadow: 0 10px 24px rgba(15,59,57,.25);
    }
    .bankcard.frozen { filter: grayscale(.7) brightness(.9); }
    .bc-name { font-weight:700; }
    .bc-chip { display:flex; align-items:center; gap:10px; }
    .bc-chip .wifi { transform: rotate(90deg); opacity:.85; font-size:12px; }
    .bc-chip .chip { width:34px; height:24px; border-radius:5px; background:#e8e2c8; display:inline-block; }
    .bc-number { font-size:20px; letter-spacing:2px; font-family:ui-monospace,monospace; }
    .bc-bottom { display:flex; justify-content:space-between; align-items:flex-end; }
    .bc-label { font-size:9px; letter-spacing:1px; opacity:.8; }
    .bc-holder { font-weight:600; letter-spacing:.5px; }
    .bc-brand { font-style:italic; font-weight:800; font-size:18px; }
    .btn.full { width:100%; margin-top:12px; }
    .freeze { color: var(--orange-dark); background: var(--bg); border-color: var(--border); }
    .details { padding:22px 24px; }
    .grid { display:grid; grid-template-columns:1fr 1fr; gap:18px 24px; margin-top:16px; }
    .val { font-weight:600; margin-top:4px; }
    .mono { font-family:ui-monospace,monospace; }
    .details .hint { margin-top:16px; }
  `],
})
export class CardsPage implements OnInit {
  private api = inject(BankingService);
  private cdr = inject(ChangeDetectorRef);

  card: Card | null = null;
  accounts: Account[] = [];
  loading = true;
  error = '';
  revealed = false;
  frozen = false;
  holder = 'CUSTOMER NAME';

  ngOnInit(): void {
    this.api.myAccounts().pipe(finalize(() => this.cdr.markForCheck())).subscribe({
      next: (accs) => {
        this.accounts = accs ?? [];
        if (this.accounts.length) {
          this.api.cardsForAccount(this.accounts[0].accountId).pipe(finalize(() => this.cdr.markForCheck())).subscribe({
            next: (cards) => { this.card = cards?.[0] ?? null; this.loading = false; if (!this.card) this.fallback(); },
            error: (e) => { this.error = this.friendly(e); this.loading = false; },
          });
        } else {
          this.loading = false; // no accounts → nothing to show
        }
      },
      error: (e) => { this.error = this.friendly(e); this.loading = false; },
    });
  }

  private friendly(e: any): string {
    if (e?.status === 0) return 'Cannot reach the Banking API. Is it running on :8081 (proxy)?';
    if (e?.status === 401 || e?.status === 403) return 'Not authorised — check the dev token in environment.ts.';
    return 'Could not load your card.';
  }

  private fallback(): void {
    // If no card is linked to the account, show any card so the screen is demonstrable.
    this.api.allCards().pipe(finalize(() => this.cdr.markForCheck())).subscribe({
      next: (cards) => { this.card = this.card ?? (cards?.[0] ?? null); this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  get linkedAccount(): string {
    return this.accounts.length ? maskNumber(this.accounts[0].accountNumber) : maskNumber(this.card?.cardNumber ?? '');
  }

  last4(n: string | null | undefined): string { return (n ?? '0000').slice(-4); }
  group(n: string | null | undefined): string {
    const s = (n ?? '').replace(/\s+/g, '');
    return s.replace(/(.{4})/g, '$1 ').trim() || '**** **** **** ****';
  }
  expiry(d: string | null | undefined): string {
    if (!d) return '••/••';
    const parts = d.split('-'); // yyyy-MM-dd
    return parts.length >= 2 ? `${parts[1]}/${parts[0].slice(-2)}` : d;
  }
}
