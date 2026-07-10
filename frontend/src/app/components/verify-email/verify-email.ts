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

  /**
   * Returns the email address to show in the subtitle.
   * Falls back to stored user email, or empty string if neither is available.
   */
  get emailDisplay(): string {
    const currentUserEmail = this.user()?.email;
    if (currentUserEmail) {
      return currentUserEmail;
    }
    try {
      const raw = localStorage.getItem('centify_user');
      if (raw) {
        const storedUser: any = JSON.parse(raw);
        return storedUser.email || '';
      }
    } catch {
      // ignore
    }
    return '';
  }

  verify() {
    this.error = '';
    this.success = '';

    if (!/^\d{6}$/.test(this.code)) {
      this.error = 'Enter the 6-digit code sent to your email.';
      return;
    }

    this.loading = true;

    // Determine which endpoint to use based on whether the user has a JWT token
    const hasToken = !!this.authService.getToken();
    const email = this.emailDisplay;

    const verifyObs = hasToken
      ? this.authService.verifyEmail(this.code)
      : this.authService.verifyEmailByEmail(email, this.code);

    verifyObs.subscribe({
      next: () => {
        this.loading = false;
        // Re-login to get a full JWT token now that email is verified
        // We need to redirect to login for the user to re-enter credentials,
        // OR we can try to re-login with stored credentials. Since we don't store password,
        // we'll redirect to login with a success message.
        // Actually, after verification the /verify-email endpoint returns the updated User.
        // But without a token, we can't access protected routes. Let's redirect to login
        // with a query param to show success.
        // Better approach: after verify, the user is verified but still needs a token.
        // We redirect to login page where they can sign in with their credentials.
        this.router.navigate(['/login'], { queryParams: { verified: 'true' } });
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

    const email = this.emailDisplay;
    const hasToken = !!this.authService.getToken();

    const resendObs = hasToken
      ? this.authService.resendOtp()
      : this.authService.resendOtpByEmail(email);

    resendObs.subscribe({
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
