import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.scss'
})
export class AuthComponent implements OnInit {
  mode: 'login' | 'register' | '2fa' = 'login';
  loading = false;
  error = '';
  showVerificationNotice = false;
  twoFactorCode = '';

  form = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    currency: 'USD'
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.mode = this.router.url === '/register' ? 'register' : 'login';

    this.route.queryParams.subscribe(params => {
      if (params['verified'] === 'true') {
        this.showVerificationNotice = false;
        this.error = '';
      }
    });
  }

  submit() {
    this.error = '';
    this.showVerificationNotice = false;

    if (!this.isFormValid()) {
      return;
    }

    this.loading = true;

    const action = this.mode === 'login'
      ? this.authService.login({ email: this.form.email, password: this.form.password })
      : this.authService.register(this.form);

    action.subscribe({
      next: (response) => {
        this.loading = false;

        if (this.mode === 'login' && !response?.token) {
          const msg = response?.message || '';
          if (msg.includes('2FA')) {
            this.mode = '2fa';
            this.twoFactorCode = '';
            return;
          }
          this.router.navigate(['/verify-email']);
          return;
        }

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message || err?.error?.error || '';
        if (msg.toLowerCase().includes('verification') || msg.toLowerCase().includes('verify')) {
          this.router.navigate(['/verify-email']);
          return;
        }
        this.error = msg || 'Authentication failed. Please try again.';
      }
    });
  }

  submit2FA() {
    this.error = '';

    if (!this.twoFactorCode.trim()) {
      this.error = 'Enter the 2FA code sent to your email.';
      return;
    }

    this.loading = true;
    this.authService.verifyTwoFactor(this.twoFactorCode).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Invalid 2FA code. Please try again.';
      }
    });
  }

  switchMode(mode: 'login' | 'register') {
    this.mode = mode;
    this.error = '';
    this.showVerificationNotice = false;
    this.twoFactorCode = '';
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
