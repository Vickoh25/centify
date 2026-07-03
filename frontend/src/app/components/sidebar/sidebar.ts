import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent {
  private authService = inject(AuthService);

  navItems = [
    { label: 'Dashboard', icon: 'fa-chart-pie', route: '/dashboard' },
    { label: 'Transactions', icon: 'fa-arrow-right-arrow-left', route: '/transactions' },
    { label: 'Budgets', icon: 'fa-wallet', route: '/budgets' },
    { label: 'Accounts', icon: 'fa-building-columns', route: '/accounts' },
    { label: 'Investments', icon: 'fa-chart-line', route: '/investments' },
    { label: 'Profile', icon: 'fa-user', route: '/profile' },
  ];

  user = this.authService.currentUser;

  displayName = computed(() => {
    const u = this.authService.currentUser();
    if (!u) return 'Guest';
    return `${u.firstName || ''} ${u.lastName || ''}`.trim();
  });

  initials = computed(() => {
    return this.displayName()
      .split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  });

  email = computed(() => {
    return this.authService.currentUser()?.email || '';
  });
}
