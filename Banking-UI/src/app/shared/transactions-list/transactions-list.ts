import { Component, Input } from '@angular/core';
import { TransactionResponse } from '../../core/models';
import { money } from '../../core/format';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [],
  templateUrl: './transactions-list.html',
  styleUrl: './transactions-list.scss',
})
export class TransactionsList {
  @Input() transactions: TransactionResponse[] = [];

  isCredit(t: TransactionResponse): boolean {
    return (t.type ?? '').toUpperCase() === 'CREDIT';
  }

  formatAmount(t: TransactionResponse): string {
    const sign = this.isCredit(t) ? '+' : '-';
    return sign + money(Math.abs(t.amount), t.currency);
  }

  formatDate(t: TransactionResponse): string {
    const raw = t.dateTime || t.transactionDate;
    if (!raw) return '';
    return new Date(raw).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
