import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
export interface Account {
  id?: number;
  user?: any;
  name: string;
  type: string;
  bankName: string;
  accountNumber: string;
  balance: number;
  currency: string;
  isLinked: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = `${environment.apiUrl}/accounts`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Account[]> {
    return this.http.get<Account[]>(this.apiUrl);
  }

  getByUser(userId: number): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.apiUrl}/user/${userId}`);
  }

  create(account: Account): Observable<Account> {
    return this.http.post<Account>(this.apiUrl, account);
  }

  update(id: number, account: Account): Observable<Account> {
    return this.http.put<Account>(`${this.apiUrl}/${id}`, account);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
