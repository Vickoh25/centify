import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-verify-email',
  imports: [CommonModule, FormsModule],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.scss'
})
export class VerifyEmailComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  user = this.authService.currentUser;
  code = '';
  loading = false;
  resending = false;
  error = '';
  success = '';

  verify() {
    this.error = '';
    this.success = '';

    if (!/^\d{6}$/.test(this.code)) {
      this.error = 'Enter the 6-digit code sent to your email.';
      return;
    }

    this.loading = true;
    this.authService.verifyEmail(this.code).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.loading = false;
        this.error = err?.error?.message || err?.error?.code || 'Could not verify that code.';
      }
    });
  }

  resend() {
    this.error = '';
    this.success = '';
    this.resending = true;

    this.authService.resendOtp().subscribe({
      next: () => {
        this.resending = false;
        this.success = 'A new verification code has been sent.';
      },
      error: err => {
        this.resending = false;
        this.error = err?.error?.message || 'Could not resend the code.';
      }
    });
  }
}
