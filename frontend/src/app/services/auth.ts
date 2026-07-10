import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import {
  AuthResponse,
  LoginRequest,
  ProfileUpdateRequest,
  RegisterRequest,
  User,
  UserService
} from './user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userStorageKey = 'centify_user';
  private tokenStorageKey = 'centify_token';
  currentUser = signal<User | null>(this.readStoredUser());

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  register(request: RegisterRequest) {
    return this.userService.register(request).pipe(tap(response => this.setSession(response)));
  }

  login(request: LoginRequest) {
    return this.userService.login(request).pipe(tap(response => {
      if (response.token) {
        this.setSession(response);
      } else {
        // No token — email not verified. Store user only (for email display) and redirect to verify-email.
        this.storeUser(response.user);
      }
    }));
  }

  verifyEmail(code: string) {
    return this.userService.verifyEmail(code).pipe(
      tap(user => {
        const response: AuthResponse = {
          user,
          token: this.getToken() || '',
          message: 'Email verified'
        };
        this.setSession(response);
      })
    );
  }

  verifyEmailByEmail(email: string, code: string) {
    return this.userService.verifyEmailByEmail(email, code).pipe(
      tap(user => {
        // After verification, update the stored user with emailVerified = true
        this.storeUser(user);
      })
    );
  }

  resendOtp() {
    return this.userService.resendOtp();
  }

  resendOtpByEmail(email: string) {
    return this.userService.resendOtpByEmail(email);
  }

  updateProfile(request: ProfileUpdateRequest) {
    const user = this.currentUser();
    if (!user?.id) {
      throw new Error('No signed-in user');
    }

    return this.userService.updateProfile(user.id, request).pipe(tap(updated => this.storeUser(updated, true)));
  }

  logout() {
    localStorage.removeItem(this.userStorageKey);
    localStorage.removeItem(this.tokenStorageKey);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null && this.getToken() !== null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenStorageKey);
  }

  private setSession(response: AuthResponse) {
    localStorage.setItem(this.tokenStorageKey, response.token);
    this.storeUser(response.user);
  }

  private storeUser(user: User, deferSignalUpdate = false) {
    localStorage.setItem(this.userStorageKey, JSON.stringify(user));

    if (deferSignalUpdate) {
      queueMicrotask(() => this.currentUser.set(user));
      return;
    }

    this.currentUser.set(user);
  }

  private readStoredUser(): User | null {
    const raw = localStorage.getItem(this.userStorageKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem(this.userStorageKey);
      return null;
    }
  }
}
