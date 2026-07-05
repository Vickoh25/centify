import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { AccountsComponent } from './components/accounts/accounts';
import { TransactionsComponent } from './components/transactions/transactions';
import { BudgetsComponent } from './components/budgets/budgets';
import { InvestmentsComponent } from './components/investments/investments';
import { ProfileComponent } from './components/profile/profile';
import { LandingComponent } from './components/landing/landing';
import { AuthComponent } from './components/auth/auth';
import { VerifyEmailComponent } from './components/verify-email/verify-email';
import { authGuard, guestGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: AuthComponent, canActivate: [guestGuard] },
  { path: 'register', component: AuthComponent, canActivate: [guestGuard] },
  { path: 'verify-email', component: VerifyEmailComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'accounts', component: AccountsComponent, canActivate: [authGuard] },
  { path: 'transactions', component: TransactionsComponent, canActivate: [authGuard] },
  { path: 'budgets', component: BudgetsComponent, canActivate: [authGuard] },
  { path: 'investments', component: InvestmentsComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
