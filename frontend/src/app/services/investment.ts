import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
export interface Investment {
  id?: number;
  user?: any;
  symbol: string;
  name: string;
  assetType: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  purchaseDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvestmentService {
  private apiUrl = `${environment.apiUrl}/investments`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Investment[]> {
    return this.http.get<Investment[]>(this.apiUrl);
  }

  getByUser(userId: number): Observable<Investment[]> {
    return this.http.get<Investment[]>(`${this.apiUrl}/user/${userId}`);
  }

  getByAssetType(userId: number, assetType: string): Observable<Investment[]> {
    return this.http.get<Investment[]>(`${this.apiUrl}/user/${userId}/type/${assetType}`);
  }

  create(investment: Investment): Observable<Investment> {
    return this.http.post<Investment>(this.apiUrl, investment);
  }

  update(id: number, investment: Investment): Observable<Investment> {
    return this.http.put<Investment>(`${this.apiUrl}/${id}`, investment);
  }

  refreshPrice(id: number): Observable<Investment> {
    return this.http.put<Investment>(`${this.apiUrl}/${id}/refresh-price`, {});
  }

  refreshPrices(): Observable<Investment[]> {
    return this.http.put<Investment[]>(`${this.apiUrl}/refresh-prices`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
