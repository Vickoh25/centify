import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  currency: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  currency: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ProfileUpdateRequest {
  firstName: string;
  lastName: string;
  email: string;
  currency: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  create(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request);
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request);
  }

  update(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  updateProfile(id: number, request: ProfileUpdateRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/profile`, request);
  }

  verifyEmail(code: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/verify-email`, { code });
  }

  /**
   * Verify email by providing email address and code (for unverified users without a JWT).
   */
  verifyEmailByEmail(email: string, code: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/verify-email/by-email`, { email, code });
  }

  resendOtp(): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/resend-otp`, {});
  }

  /**
   * Resend OTP by providing email address (for unverified users without a JWT).
   */
  resendOtpByEmail(email: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/resend-otp/by-email`, { email });
  }

  verifyTwoFactor(userId: number, code: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${userId}/verify-2fa`, { code });
  }

  enableTwoFactor(userId: number): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${userId}/enable-2fa`, {});
  }

  disableTwoFactor(userId: number): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${userId}/disable-2fa`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
