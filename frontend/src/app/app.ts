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
    return this.router.url === '/login' || this.router.url === '/register' || this.router.url === '/verify-email';
  }

  get isLandingPage(): boolean {
    return this.router.url === '/' || this.router.url === '';
  }

  get showSidebar(): boolean {
    return !this.isAuthPage && !this.isLandingPage;
  }
}
