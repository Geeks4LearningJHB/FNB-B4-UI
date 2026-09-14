import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { BankingService } from '../../core/banking.service';
import { Account, TransactionResponse } from '../../core/models';
import { money } from '../../core/format';

interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
  time: string;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './ai-chat.html',
  styleUrl: './ai-chat.scss',
})
export class AiChat {
  private api = inject(BankingService);

  open = signal(false);
  greeted = false;
  messages = signal<ChatMessage[]>([]);
  inputText = '';
  typing = signal(false);

  private accounts: Account[] = [];
  private transactions: TransactionResponse[] = [];
  private loaded = false;

  chips = [
    { label: 'My balance',    prompt: 'What is my balance?' },
    { label: 'Transactions',  prompt: 'Show my recent transactions' },
    { label: 'Make payment',  prompt: 'How do I make a payment?' },
    { label: 'Help',          prompt: 'What can you help me with?' },
  ];

  toggle() {
    this.open.update(v => !v);
    if (this.open() && !this.greeted) {
      this.greeted = true;
      this.addBot(`Hi! 👋 I'm your IBS Smart Assistant. Ask me about your balance, transactions, or anything else.`);
      this.loadData();
    }
  }

  sendChip(prompt: string) { this.handleQuery(prompt); }

  send() {
    if (!this.inputText.trim()) return;
    this.handleQuery(this.inputText.trim());
    this.inputText = '';
  }

  private loadData() {
    forkJoin({ accounts: this.api.myAccounts(), history: this.api.history() }).subscribe({
      next: ({ accounts, history }) => {
        this.accounts = accounts ?? [];
        this.transactions = history ?? [];
        this.loaded = true;
      },
      error: () => { this.loaded = true; }, // fall back to "not sure" answers below
    });
  }

  private handleQuery(text: string) {
    this.messages.update(m => [...m, { role: 'user', text, time: this.now() }]);
    this.typing.set(true);
    setTimeout(() => {
      this.typing.set(false);
      this.addBot(this.respond(text));
    }, 500);
  }

  private addBot(text: string) {
    this.messages.update(m => [...m, { role: 'bot', text, time: this.now() }]);
  }

  private respond(q: string): string {
    const lq = q.toLowerCase();

    if (!this.loaded) {
      return "I'm still loading your account data — ask again in a moment.";
    }

    if (/balance|how much|funds/.test(lq)) {
      if (this.accounts.length === 0) return "You don't have any accounts yet.";
      const total = this.accounts.reduce((s, a) => s + (a.availableBalance ?? a.balance ?? 0), 0);
      const currency = this.accounts[0]?.currency ?? 'ZAR';
      return this.accounts.length === 1
        ? `Your available balance is <strong>${money(total, currency)}</strong> on your ${this.accounts[0].accountType} account.`
        : `Your total available balance across ${this.accounts.length} accounts is <strong>${money(total, currency)}</strong>.`;
    }

    if (/transaction|recent|history|spent/.test(lq)) {
      if (this.transactions.length === 0) return "You don't have any recent transactions.";
      const rows = this.transactions.slice(0, 5)
        .map(t => {
          const sign = (t.type ?? '').toUpperCase() === 'CREDIT' ? '+' : '-';
          return `• ${t.description || t.type} — <strong>${sign}${money(Math.abs(t.amount), t.currency)}</strong>`;
        }).join('<br>');
      return `Last transactions:<br><br>${rows}`;
    }

    if (/payment|pay bill/.test(lq))
      return 'Payments aren’t available in this version yet — check back soon.';

    if (/transfer|send money/.test(lq))
      return 'Transfers aren’t available in this version yet — check back soon.';

    if (/help|what can/.test(lq))
      return 'I can help with: <strong>balance</strong> and <strong>recent transactions</strong>. Just ask!';

    return `I'm not sure about that. Try asking about your <strong>balance</strong> or <strong>recent transactions</strong>. 😊`;
  }

  private now(): string {
    return new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  }
}
