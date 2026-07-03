import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { UserService, User } from '../../services/user';
import { TransactionService, Transaction } from '../../services/transaction';
import { AccountService, Account } from '../../services/account';
import { BudgetService, Budget } from '../../services/budget';
import { InvestmentService } from '../../services/investment';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private transactionService = inject(TransactionService);
  private accountService = inject(AccountService);
  private budgetService = inject(BudgetService);
  private investmentService = inject(InvestmentService);
  private cdr = inject(ChangeDetectorRef);

  // UI state
  activeTab: 'info' | 'edit' | 'settings' | 'activity' = 'info';
  saving = false;
  success = '';
  error = '';
  showDeleteConfirm = false;
  deleting = false;

  // User data
  user: User | null = null;
  memberSince = '';

  // Edit form
  form = {
    firstName: '',
    lastName: '',
    email: '',
    currency: 'USD',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Account settings
  settingsForm = {
    newEmail: '',
    confirmEmail: ''
  };

  // Activity summary
  totalBalance = 0;
  totalIncome = 0;
  totalExpenses = 0;
  portfolioValue = 0;
  totalBudgets = 0;
  budgetSpent = 0;
  recentTransactions: Transaction[] = [];
  accountCount = 0;

  ngOnInit() {
    this.loadUserData();
    this.loadActivitySummary();
  }

  private loadUserData() {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.user = currentUser;
      this.form.firstName = currentUser.firstName || '';
      this.form.lastName = currentUser.lastName || '';
      this.form.email = currentUser.email || '';
      this.form.currency = currentUser.currency || 'USD';
      this.settingsForm.newEmail = currentUser.email || '';
    }
  }

  private loadActivitySummary() {
    this.accountService.getAll().subscribe(accounts => {
      this.accountCount = accounts.length;
      this.totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
      this.cdr.detectChanges();
    });

    this.transactionService.getAll().subscribe(transactions => {
      this.recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
        .slice(0, 5);
      this.totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      this.totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      this.cdr.detectChanges();
    });

    this.budgetService.getAll().subscribe(budgets => {
      this.totalBudgets = budgets.reduce((sum, b) => sum + b.limitAmount, 0);
      this.budgetSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
      this.cdr.detectChanges();
    });

    this.investmentService.getAll().subscribe(investments => {
      this.portfolioValue = investments.reduce((sum, i) => sum + (i.currentPrice * i.quantity), 0);
      this.cdr.detectChanges();
    });
  }

  setTab(tab: 'info' | 'edit' | 'settings' | 'activity') {
    this.activeTab = tab;
    this.success = '';
    this.error = '';
    this.showDeleteConfirm = false;
  }

  // --- Edit Profile ---
  saveProfile() {
    this.success = '';
    this.error = '';

    if (!this.isProfileValid()) {
      return;
    }

    this.saving = true;

    this.authService.updateProfile({
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      email: this.form.email,
      currency: this.form.currency,
      currentPassword: this.form.currentPassword || undefined,
      newPassword: this.form.newPassword || undefined
    }).subscribe({
      next: () => {
        this.saving = false;
        this.success = 'Profile updated successfully.';
        this.form.currentPassword = '';
        this.form.newPassword = '';
        this.form.confirmPassword = '';
        this.loadUserData();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || err?.error?.error || 'Could not update profile.';
        this.cdr.detectChanges();
      }
    });
  }

  // --- Account Settings ---
  changeEmail() {
    this.success = '';
    this.error = '';

    if (!this.settingsForm.newEmail.trim()) {
      this.error = 'Email address is required.';
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.settingsForm.newEmail.trim())) {
      this.error = 'Enter a valid email address.';
      return;
    }

    if (this.settingsForm.newEmail !== this.settingsForm.confirmEmail) {
      this.error = 'Email addresses do not match.';
      return;
    }

    this.saving = true;
    this.authService.updateProfile({
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      email: this.settingsForm.newEmail,
      currency: this.form.currency
    }).subscribe({
      next: () => {
        this.saving = false;
        this.success = 'Email updated successfully.';
        this.form.email = this.settingsForm.newEmail;
        this.loadUserData();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || err?.error?.error || 'Could not update email.';
        this.cdr.detectChanges();
      }
    });
  }

  confirmDeleteAccount() {
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
  }

  deleteAccount() {
    const user = this.authService.currentUser();
    if (!user?.id) return;

    this.deleting = true;
    this.userService.delete(user.id).subscribe({
      next: () => {
        this.deleting = false;
        this.authService.logout();
      },
      error: (err) => {
        this.deleting = false;
        this.error = err?.error?.message || 'Could not delete account.';
        this.showDeleteConfirm = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- Logout ---
  logout() {
    this.authService.logout();
  }

  // --- Helpers ---
  getInitials(): string {
    const first = this.user?.firstName?.[0] || '';
    const last = this.user?.lastName?.[0] || '';
    return (first + last).toUpperCase() || '?';
  }

  getFullName(): string {
    return `${this.user?.firstName || ''} ${this.user?.lastName || ''}`.trim() || 'User';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.user?.currency || 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatDate(date: string | undefined): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  private isProfileValid(): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.form.firstName.trim() || !this.form.lastName.trim()) {
      this.error = 'First name and last name are required.';
      return false;
    }
    if (!emailPattern.test(this.form.email.trim())) {
      this.error = 'Enter a valid email address.';
      return false;
    }
    if (this.form.newPassword && this.form.newPassword.length < 8) {
      this.error = 'New password must be at least 8 characters.';
      return false;
    }
    if (this.form.newPassword && !this.form.currentPassword) {
      this.error = 'Current password is required to change your password.';
      return false;
    }
    if (this.form.newPassword && this.form.newPassword !== this.form.confirmPassword) {
      this.error = 'New passwords do not match.';
      return false;
    }
    return true;
  }
}
