import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvestmentService, Investment } from '../../services/investment';

@Component({
  selector: 'app-investments',
  imports: [CommonModule, CurrencyPipe, DecimalPipe, FormsModule],
  templateUrl: './investments.html',
  styleUrl: './investments.scss'
})
export class InvestmentsComponent implements OnInit {
  investments: Investment[] = [];
  filtered: Investment[] = [];
  showForm = false;
  activeTab = 'all';
  error = '';
  refreshing = false;

  newInvestment: Investment = {
    symbol: '',
    name: '',
    assetType: 'stock',
    quantity: 0,
    buyPrice: 0,
    currentPrice: 0
  };

  constructor(
    private investmentService: InvestmentService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadInvestments();
  }

  loadInvestments() {
    this.investmentService.getAll().subscribe(data => {
      this.investments = data;
      this.applyTab();
      this.changeDetector.detectChanges();
    });
  }

  applyTab() {
    if (this.activeTab === 'all') {
      this.filtered = this.investments;
    } else {
      this.filtered = this.investments.filter(i => i.assetType === this.activeTab);
    }
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.applyTab();
  }

  saveInvestment() {
    this.error = '';
    if (!this.isInvestmentValid()) {
      return;
    }

    this.investmentService.create(this.newInvestment).subscribe(() => {
      this.loadInvestments();
      this.showForm = false;
      this.resetForm();
    }, err => {
      this.error = this.errorMessage(err, 'Could not save investment.');
    });
  }

  refreshPrices() {
    this.refreshing = true;
    this.error = '';
    this.investmentService.refreshPrices().subscribe({
      next: investments => {
        this.refreshing = false;
        this.investments = investments;
        this.applyTab();
        this.changeDetector.detectChanges();
      },
      error: err => {
        this.refreshing = false;
        this.error = this.errorMessage(err, 'Could not refresh live prices.');
      }
    });
  }

  deleteInvestment(id: number) {
    this.investmentService.delete(id).subscribe(() => {
      this.loadInvestments();
    });
  }

  resetForm() {
    this.newInvestment = {
      symbol: '',
      name: '',
      assetType: 'stock',
      quantity: 0,
      buyPrice: 0,
      currentPrice: 0
    };
  }

  getValue(inv: Investment): number {
    return inv.currentPrice * inv.quantity;
  }

  getGainLoss(inv: Investment): number {
    return (inv.currentPrice - inv.buyPrice) * inv.quantity;
  }

  getGainLossPct(inv: Investment): number {
    if (inv.buyPrice === 0) return 0;
    return ((inv.currentPrice - inv.buyPrice) / inv.buyPrice) * 100;
  }

  get totalValue(): number {
    return this.investments.reduce((s, i) => s + this.getValue(i), 0);
  }

  get totalGainLoss(): number {
    return this.investments.reduce((s, i) => s + this.getGainLoss(i), 0);
  }

  private isInvestmentValid(): boolean {
    if (!this.newInvestment.symbol.trim() || !this.newInvestment.name.trim()) {
      this.error = 'Symbol and name are required.';
      return false;
    }
    if (this.newInvestment.quantity <= 0) {
      this.error = 'Quantity must be greater than 0.';
      return false;
    }
    if (this.newInvestment.buyPrice < 0 || this.newInvestment.currentPrice < 0) {
      this.error = 'Prices cannot be negative.';
      return false;
    }
    return true;
  }

  private errorMessage(err: any, fallback: string): string {
    if (err?.error?.message) {
      return err.error.message;
    }
    if (err?.error && typeof err.error === 'object') {
      return Object.values(err.error).join(' ');
    }
    return fallback;
  }
}
