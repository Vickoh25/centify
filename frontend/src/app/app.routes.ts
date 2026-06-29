import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { AccountsComponent } from './components/accounts/accounts';
import { TransactionsComponent } from './components/transactions/transactions';
import { BudgetsComponent } from './components/budgets/budgets';
import { InvestmentsComponent } from './components/investments/investments';
import { AuthComponent } from './components/auth/auth';
import { authGuard, guestGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: AuthComponent, canActivate: [guestGuard] },
  { path: 'register', component: AuthComponent, canActivate: [guestGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'accounts', component: AccountsComponent, canActivate: [authGuard] },
  { path: 'transactions', component: TransactionsComponent, canActivate: [authGuard] },
  { path: 'budgets', component: BudgetsComponent, canActivate: [authGuard] },
  { path: 'investments', component: InvestmentsComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'dashboard' }
];