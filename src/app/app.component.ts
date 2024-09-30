import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Order } from './models/order.model';
import { OrderListComponent } from './components/order-list/order-list.component';
import { OrderFormComponent } from './components/order-form/order-form.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, OrderListComponent, OrderFormComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'OrdersUI';

  constructor() {}

  selectedOrder!: Order;

  onOrderSelected(order: Order): void {
    this.selectedOrder = order;
  }
}
