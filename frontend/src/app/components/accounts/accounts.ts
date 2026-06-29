import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService, Account } from '../../services/account';

@Component({
  selector: 'app-accounts',
  imports: [CurrencyPipe, FormsModule],
  templateUrl: './accounts.html',
  styleUrl: './accounts.scss'
})
export class AccountsComponent implements OnInit {
  accounts: Account[] = [];
  showForm = false;
  error = '';

  newAccount: Account = {
    name: '',
    type: 'checking',
    bankName: '',
    accountNumber: '',
    balance: 0,
    currency: 'USD',
    isLinked: true
  };

  constructor(
    private accountService: AccountService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.accountService.getAll().subscribe(data => {
      this.accounts = data;
      this.changeDetector.detectChanges();
    });
  }

  saveAccount() {
    this.error = '';
    if (!this.isAccountValid()) {
      return;
    }

    this.accountService.create(this.newAccount).subscribe({
      next: () => {
        this.loadAccounts();
        this.showForm = false;
        this.resetForm();
      },
      error: (err) => {
        console.error('Error saving account:', err);
        this.error = this.errorMessage(err, 'Error linking account.');
      }
    });
  }

  deleteAccount(id: number) {
    this.accountService.delete(id).subscribe(() => {
      this.loadAccounts();
    });
  }

  resetForm() {
    this.newAccount = {
      name: '',
      type: 'checking',
      bankName: '',
      accountNumber: '',
      balance: 0,
      currency: 'USD',
      isLinked: true
    };
  }

  get totalBalance(): number {
    return this.accounts.reduce((sum, a) => sum + a.balance, 0);
  }

  private isAccountValid(): boolean {
    if (!this.newAccount.name.trim()) {
      this.error = 'Account name is required.';
      return false;
    }
    if (!this.newAccount.type) {
      this.error = 'Choose an account type.';
      return false;
    }
    if (!this.newAccount.currency || this.newAccount.currency.length !== 3) {
      this.error = 'Choose a valid currency.';
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
