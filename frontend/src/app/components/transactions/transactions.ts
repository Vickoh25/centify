import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService, Transaction } from '../../services/transaction';

@Component({
  selector: 'app-transactions',
  imports: [CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss'
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  filtered: Transaction[] = [];
  showForm = false;
  searchQuery = '';
  activeFilter = 'all';
  transactionDate = this.today();
  error = '';

  newTransaction: Transaction = {
    description: '',
    amount: 0,
    type: 'expense',
    category: 'food',
    tag: '',
    date: `${this.today()}T12:00:00`
  };

  constructor(
    private transactionService: TransactionService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.transactionService.getAll().subscribe(data => {
      this.transactions = data;
      this.applyFilter();
      this.changeDetector.detectChanges();
    });
  }

  applyFilter() {
    let result = [...this.transactions];
    if (this.activeFilter !== 'all') {
      result = result.filter(t =>
        t.type === this.activeFilter || t.category === this.activeFilter
      );
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(t =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    this.filtered = result;
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.applyFilter();
  }

  saveTransaction() {
    this.error = '';
    if (!this.isTransactionValid()) {
      return;
    }

    this.newTransaction.date = `${this.transactionDate}T12:00:00`;
    this.transactionService.create(this.newTransaction).subscribe(() => {
      this.loadTransactions();
      this.showForm = false;
      this.resetForm();
    }, err => {
      this.error = this.errorMessage(err, 'Could not save transaction.');
    });
  }

  deleteTransaction(id: number) {
    this.transactionService.delete(id).subscribe(() => {
      this.loadTransactions();
    });
  }

  resetForm() {
    this.newTransaction = {
      description: '',
      amount: 0,
      type: 'expense',
      category: 'food',
      tag: '',
      date: `${this.today()}T12:00:00`
    };
    this.transactionDate = this.today();
  }

  get totalIncome(): number {
    return this.transactions
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
  }

  get totalExpenses(): number {
    return this.transactions
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
  }

  get netAmount(): number {
    return this.totalIncome - this.totalExpenses;
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private isTransactionValid(): boolean {
    if (!this.newTransaction.description.trim()) {
      this.error = 'Description is required.';
      return false;
    }
    if (this.newTransaction.amount <= 0) {
      this.error = 'Amount must be greater than 0.';
      return false;
    }
    if (!this.transactionDate) {
      this.error = 'Date is required.';
      return false;
    }
    return true;
  }

  private errorMessage(err: any, fallback: string): string {
    if (err?.error?.message) return err.error.message;
    if (err?.error && typeof err.error === 'object') return Object.values(err.error).join(' ');
    return fallback;
  }
}
