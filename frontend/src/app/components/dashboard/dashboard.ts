import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService, Transaction } from '../../services/transaction';
import { AccountService, Account } from '../../services/account';
import { InvestmentService, Investment } from '../../services/investment';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  transactions: Transaction[] = [];
  allTransactions: Transaction[] = [];
  accounts: Account[] = [];
  investments: Investment[] = [];
  usagePeriod: 'month' | 'year' = 'month';
  usageRows: UsageRow[] = [];

  totalBalance: number = 0;
  totalIncome: number = 0;
  totalExpenses: number = 0;
  portfolioValue: number = 0;

  constructor(
    private transactionService: TransactionService,
    private accountService: AccountService,
    private investmentService: InvestmentService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.accountService.getAll().subscribe(accounts => {
      this.accounts = accounts;
      this.totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
      this.changeDetector.detectChanges();
    });

    this.transactionService.getAll().subscribe(transactions => {
      this.allTransactions = transactions;
      this.transactions = [...transactions]
        .sort((a, b) => this.getTransactionTime(b) - this.getTransactionTime(a))
        .slice(0, 6);
      this.totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      this.totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      this.buildUsageRows();
      this.changeDetector.detectChanges();
    });

    this.investmentService.getAll().subscribe(investments => {
      this.investments = investments;
      this.portfolioValue = investments
        .reduce((sum, i) => sum + (i.currentPrice * i.quantity), 0);
      this.changeDetector.detectChanges();
    });
  }

  setUsagePeriod(period: 'month' | 'year') {
    this.usagePeriod = period;
    this.buildUsageRows();
  }

  getUsageWidth(value: number): number {
    const max = Math.max(...this.usageRows.map(row => Math.max(row.income, row.expenses)), 1);
    return Math.round((value / max) * 100);
  }

  private buildUsageRows() {
    const grouped = new Map<string, UsageRow>();

    for (const transaction of this.allTransactions) {
      const date = transaction.date ? new Date(transaction.date) : new Date();
      const key = this.usagePeriod === 'month'
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        : `${date.getFullYear()}`;
      const label = this.usagePeriod === 'month'
        ? date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
        : String(date.getFullYear());
      const row = grouped.get(key) || { key, label, income: 0, expenses: 0, net: 0 };

      if (transaction.type === 'income') {
        row.income += transaction.amount;
      } else {
        row.expenses += transaction.amount;
      }
      row.net = row.income - row.expenses;
      grouped.set(key, row);
    }

    this.usageRows = Array.from(grouped.values()).sort((a, b) => b.key.localeCompare(a.key));
  }

  private getTransactionTime(transaction: Transaction): number {
    return transaction.date ? new Date(transaction.date).getTime() : 0;
  }
}

interface UsageRow {
  key: string;
  label: string;
  income: number;
  expenses: number;
  net: number;
}
