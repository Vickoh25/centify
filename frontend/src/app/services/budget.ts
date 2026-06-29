import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
export interface Budget {
  id?: number;
  user?: any;
  category: string;
  limitAmount: number;
  spentAmount: number;
  month: string;
}

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private apiUrl = `${environment.apiUrl}/budgets`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Budget[]> {
    return this.http.get<Budget[]>(this.apiUrl);
  }

  getByUser(userId: number): Observable<Budget[]> {
    return this.http.get<Budget[]>(`${this.apiUrl}/user/${userId}`);
  }

  getByMonth(userId: number, month: string): Observable<Budget[]> {
    return this.http.get<Budget[]>(`${this.apiUrl}/user/${userId}/month/${month}`);
  }

  create(budget: Budget): Observable<Budget> {
    return this.http.post<Budget>(this.apiUrl, budget);
  }

  update(id: number, budget: Budget): Observable<Budget> {
    return this.http.put<Budget>(`${this.apiUrl}/${id}`, budget);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
