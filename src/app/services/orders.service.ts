import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private apiUrl = 'http://localhost:5092/api/orders';
  updateOrderList: Subject<boolean> = new Subject();

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  createOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  updateOrder(order: Order): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}`, order);
  }
}
