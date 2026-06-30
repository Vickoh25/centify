import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  saving = false;
  success = '';
  error = '';

  form = {
    firstName: '',
    lastName: '',
    email: '',
    currency: 'USD',
    currentPassword: '',
    newPassword: ''
  };

  ngOnInit() {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.form.firstName = currentUser.firstName || '';
      this.form.lastName = currentUser.lastName || '';
      this.form.email = currentUser.email || '';
      this.form.currency = currentUser.currency || 'USD';
    }
  }

  saveProfile() {
    this.success = '';
    this.error = '';

    if (!this.isProfileValid()) {
      return;
    }

    this.saving = true;

    this.authService.updateProfile({
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      email: this.form.email,
      currency: this.form.currency,
      currentPassword: this.form.currentPassword,
      newPassword: this.form.newPassword
    }).subscribe({
      next: () => {
        this.saving = false;
        this.success = 'Profile updated successfully.';
        this.form.currentPassword = '';
        this.form.newPassword = '';
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || err?.error?.error || 'Could not update profile.';
      }
    });
  }

  logout() {
    this.authService.logout();
  }

  private isProfileValid(): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.form.firstName.trim() || !this.form.lastName.trim()) {
      this.error = 'First name and last name are required.';
      return false;
    }
    if (!emailPattern.test(this.form.email.trim())) {
      this.error = 'Enter a valid email address.';
      return false;
    }
    if (this.form.newPassword && this.form.newPassword.length < 8) {
      this.error = 'New password must be at least 8 characters.';
      return false;
    }
    if (this.form.newPassword && !this.form.currentPassword) {
      this.error = 'Current password is required to change your password.';
      return false;
    }
    return true;
  }
}