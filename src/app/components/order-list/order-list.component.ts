import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  DestroyRef,
  OnDestroy,
} from '@angular/core';
import { Order, Currency } from '../../models/order.model';
import { OrdersService } from '../../services/orders.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatButtonModule,
    FormsModule,
    MatIconModule,
  ],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css',
})

export class OrderListComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  @Output() orderSelected = new EventEmitter<Order>();

  constructor(private ordersService: OrdersService, private df: DestroyRef) {}

  ngOnInit() {
    this.loadOrders();
    this.subscribeToUpdateOrder();
  }

  subscribeToUpdateOrder() {
    this.ordersService.updateOrderList
      .pipe(
        takeUntilDestroyed(this.df),
        filter((res) => !!res)
      )
      .subscribe(() => {
        this.loadOrders();
      });
  }

  loadOrders(): void {
    this.ordersService
      .getOrders()
      .pipe(takeUntilDestroyed(this.df))
      .subscribe((orders: Order[]) => {
        this.orders = orders;
      });
  }

  selectOrder(order: Order): void {
    this.orderSelected.emit(order);
  }

  addNewOrder(): void {
    const newOrder: Order = {
      id: 0,
      quantity: 0,
      price: 0,
      unitCurrency: Currency.UAH,
      outputCurrency: Currency.UAH,
    };
    this.orders.push(newOrder);
    this.selectOrder(newOrder);
  }

  isOrderInCreation(): boolean {
    return this.orders.some((res) => res.id === 0);
  }

  ngOnDestroy(): void {}
}
