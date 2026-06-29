import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BudgetService, Budget } from '../../services/budget';

@Component({
  selector: 'app-budgets',
  imports: [CurrencyPipe, FormsModule],
  templateUrl: './budgets.html',
  styleUrl: './budgets.scss'
})
export class BudgetsComponent implements OnInit {
  budgets: Budget[] = [];
  showForm = false;
  error = '';

  newBudget: Budget = {
    category: 'food',
    limitAmount: 0,
    spentAmount: 0,
    month: new Date().toISOString().slice(0, 7)
  };

  constructor(
    private budgetService: BudgetService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadBudgets();
  }

  loadBudgets() {
    this.budgetService.getAll().subscribe(data => {
      this.budgets = data;
      this.changeDetector.detectChanges();
    });
  }

  saveBudget() {
    this.error = '';
    if (!this.isBudgetValid()) {
      return;
    }

    this.budgetService.create(this.newBudget).subscribe(() => {
      this.loadBudgets();
      this.showForm = false;
      this.resetForm();
    }, err => {
      this.error = this.errorMessage(err, 'Could not save budget.');
    });
  }

  deleteBudget(id: number) {
    this.budgetService.delete(id).subscribe(() => {
      this.loadBudgets();
    });
  }

  resetForm() {
    this.newBudget = {
      category: 'food',
      limitAmount: 0,
      spentAmount: 0,
      month: new Date().toISOString().slice(0, 7)
    };
  }

  getProgress(budget: Budget): number {
    if (budget.limitAmount === 0) return 0;
    return Math.min(100, Math.round((budget.spentAmount / budget.limitAmount) * 100));
  }

  getProgressColor(budget: Budget): string {
    return '#6366f1';
  }

  get totalBudgeted(): number {
    return this.budgets.reduce((s, b) => s + b.limitAmount, 0);
  }

  get totalSpent(): number {
    return this.budgets.reduce((s, b) => s + b.spentAmount, 0);
  }

  private isBudgetValid(): boolean {
    if (!this.newBudget.category) {
      this.error = 'Category is required.';
      return false;
    }
    if (this.newBudget.limitAmount <= 0) {
      this.error = 'Budget limit must be greater than 0.';
      return false;
    }
    if (this.newBudget.spentAmount < 0) {
      this.error = 'Spent amount cannot be negative.';
      return false;
    }
    if (!/^\d{4}-\d{2}$/.test(this.newBudget.month)) {
      this.error = 'Choose a valid budget month.';
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
