// TypeScript mirrors of the Banking API DTOs/entities.

export interface Account {
  accountId: string;         // UUID
  accountNumber: string;
  customerId: string;
  createdAt: string;
  accountType: string;
  balance: number;
  availableBalance: number;
  currency: string;
  status: string;
}

export interface BalanceResponse {
  balance: number;
  isConsistent: boolean;
  pendingTransactionCount: number;
  fraudAlertActive: boolean;
  accountActive: boolean;
  checkedAt: string;
  accountStatus: string;
  currency: string;
  availableBalance: number;
  updatedAt: string;
}

export interface TransactionResponse {
  transactionId: string;
  customerId: string;
  dateTime: string;
  description: string;
  type: string;            // DEBIT | CREDIT
  amount: number;
  currency: string;
  merchantId: string;
  transactionDate: string;
  status: string;          // COMPLETED | PENDING | ...
  isFraud: boolean;
}

export interface Card {
  cardId: string;
  accountId: string;
  cardCreatedAt: string;
  expires: string;
  cardBrand: string;
  cardNumber: string;
  cardOnDarkWeb: boolean;
  cardType: string;
  creditLimit: number;
  cvv: string;
  numCardsIssued: number;
  yearPinLastChanged: number;
}
