import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface QuickAction {
  label: string;
  icon: 'send' | 'list' | 'briefcase' | 'repeat';
  routerLink?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './quick-actions.html',
  styleUrl: './quick-actions.scss',
})
export class QuickActions {
  // "Payment" and "Transfer" aren't backed by an endpoint yet, so they're shown
  // disabled rather than linking anywhere. Transactions/accounts both live on the
  // Balance Enquiry page (account selector + history), so both point there.
  actions: QuickAction[] = [
    { label: 'Payment',       icon: 'send',      disabled: true },
    { label: 'Transactions',  icon: 'list',      routerLink: '/balance' },
    { label: 'View Accounts', icon: 'briefcase', routerLink: '/balance' },
    { label: 'Transfer',      icon: 'repeat',    disabled: true },
  ];
}
