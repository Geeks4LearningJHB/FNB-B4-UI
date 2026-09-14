import { Component, Input, signal } from '@angular/core';
import { money } from '../../core/format';

@Component({
  selector: 'app-balance-card',
  standalone: true,
  imports: [],
  templateUrl: './balance-card.html',
  styleUrl: './balance-card.scss',
})
export class BalanceCard {
  @Input() accountLabel = 'Account';
  @Input() balance = 0;
  @Input() currency = 'ZAR';
  @Input() hideBalance = false;

  /** Per-card override (the eye icon), independent of the global Settings toggle. */
  localHide = signal(false);

  get isHidden(): boolean {
    return this.hideBalance || this.localHide();
  }

  get displayBalance(): string {
    return this.isHidden ? 'R ••• •••' : money(this.balance, this.currency);
  }

  toggle() {
    this.localHide.update(v => !v);
  }
}
