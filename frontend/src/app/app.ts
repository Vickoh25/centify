import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'frontend';

  constructor(private router: Router) {}

  get isAuthPage(): boolean {
    const url = this.router.url.split('?')[0];
    return url === '/login' || url === '/register' || url === '/verify-email';
  }

  get isLandingPage(): boolean {
    const url = this.router.url.split('?')[0];
    return url === '/' || url === '';
  }

  get showSidebar(): boolean {
    return !this.isAuthPage && !this.isLandingPage;
  }
}
