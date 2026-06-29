import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.scss'
})
export class AuthComponent {
  mode: 'login' | 'register' = 'login';
  loading = false;
  error = '';

  form = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    currency: 'USD'
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.mode = this.router.url === '/register' ? 'register' : 'login';
  }

  submit() {
    this.error = '';

    if (!this.isFormValid()) {
      return;
    }

    this.loading = true;

    const action = this.mode === 'login'
      ? this.authService.login({ email: this.form.email, password: this.form.password })
      : this.authService.register(this.form);

    action.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.error?.error || 'Authentication failed. Please try again.';
      }
    });
  }

  switchMode(mode: 'login' | 'register') {
    this.mode = mode;
    this.error = '';
  }

  private isFormValid(): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.form.email.trim())) {
      this.error = 'Enter a valid email address.';
      return false;
    }

    if (this.form.password.length < 8) {
      this.error = 'Password must be at least 8 characters.';
      return false;
    }

    if (this.mode === 'register' && (!this.form.firstName.trim() || !this.form.lastName.trim())) {
      this.error = 'First name and last name are required.';
      return false;
    }

    return true;
  }
}
