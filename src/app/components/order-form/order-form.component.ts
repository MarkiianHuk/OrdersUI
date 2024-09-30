import {
  Component,
  OnInit,
  Input,
  DestroyRef,
  OnDestroy,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  Validators,
  FormControl,
  AbstractControl,
} from '@angular/forms';
import { Order, Currency } from '../../models/order.model';
import { OrdersService } from '../../services/orders.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { combineLatest, debounceTime, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.css',
})
export class OrderFormComponent implements OnInit, OnDestroy {
  @Input() order?: Order;
  orderForm!: FormGroup;
  currencies: string[] = Object.values(Currency);
  isEditMode: boolean = false;

  constructor(private orderService: OrdersService, private df: DestroyRef) {}

  ngOnInit(): void {
    this.initializeForm();
    this.insertOrderValueInForm();
    this.subscribeToValueChanges();
    this.subscribeToTotalChanges();
  }

  ngOnChanges(): void {
    if (this.order && this.orderForm) this.insertOrderValueInForm();
    this.isEditMode = this.order?.id !== 0;
  }

  initializeForm(): void {
    this.orderForm = new FormGroup({
      id: new FormControl<number>({
        value: 0,
        disabled: true,
      }),
      quantity: new FormControl<number>(0, [
        Validators.required,
        Validators.min(0),
      ]),
      price: new FormControl<number>(0, [
        Validators.required,
        Validators.min(0.01),
      ]),
      unitCurrency: new FormControl<string>(Currency.UAH, [
        Validators.required,
      ]),
      outputCurrency: new FormControl<string>(Currency.UAH, [
        Validators.required,
      ]),
      totalPrice: new FormControl<string>('0'),
      convertedTotalPrice: new FormControl<string>('0'),
    });
  }

  insertOrderValueInForm() {
    this.orderForm.patchValue({
      ...this.order!,
      totalPrice: `${this.order?.unitCurrency} 0`,
      convertedTotalPrice: `${this.order?.outputCurrency} 0`,
    });
  }

  subscribeToValueChanges() {
    combineLatest([
      this.getFormControl('quantity').valueChanges.pipe(
        startWith(this.getFormControl('quantity').value)
      ),
      this.getFormControl('price').valueChanges.pipe(
        startWith(this.getFormControl('price').value)
      ),
      this.getFormControl('unitCurrency').valueChanges.pipe(
        startWith(this.getFormControl('unitCurrency').value)
      ),
    ])
      .pipe(debounceTime(300), takeUntilDestroyed(this.df))
      .subscribe(() => {
        this.calculateTotalPrice();
      });
  }

  subscribeToTotalChanges() {
    combineLatest([
      this.getFormControl('totalPrice').valueChanges.pipe(
        startWith(this.getFormControl('price').value)
      ),
      this.getFormControl('outputCurrency').valueChanges.pipe(
        startWith(this.getFormControl('outputCurrency').value)
      ),
    ])
      .pipe(debounceTime(300), takeUntilDestroyed(this.df))
      .subscribe(() => {
        this.calculateConvertedTotalPrice();
      });
  }

  getFormControl(control: string): AbstractControl {
    return this.orderForm.get(control)!;
  }

  calculateTotalPrice(): void {
    const { quantity, price, unitCurrency } = this.orderForm.value;
    this.getFormControl('totalPrice').setValue(
      `${unitCurrency} ${(quantity * price).toFixed(2)}`,
    );
  }

  calculateConvertedTotalPrice(): void {
    const { outputCurrency, totalPrice, unitCurrency } = this.orderForm.value;
    const conversionRate = this.getConversionRate(unitCurrency, outputCurrency);
    this.getFormControl('convertedTotalPrice').setValue(
      `${outputCurrency} ${(Number(totalPrice.slice(4)) * conversionRate).toFixed(2)}`
    );
  }

  getConversionRate(unitCurrency: Currency, outputCurrency: Currency): number {
    const exchangeRates = {
      [Currency.UAH]: 1,   // Base currency
      [Currency.USD]: 10,  // 1 USD = 10 UAH
      [Currency.EUR]: 15   // 1 EUR = 15 UAH
    };

    if (unitCurrency === outputCurrency) {
      return 1; // No conversion needed if the currencies are the same
    }

    return exchangeRates[unitCurrency] / exchangeRates[outputCurrency];
  }

  submitForm(): void {
    if (this.orderForm.invalid) return this.orderForm.markAllAsTouched();
    const orderDataBody = this.orderForm.getRawValue();
    if (this.isEditMode) {
      this.orderService
        .updateOrder(orderDataBody)
        .subscribe(() => this.orderService.updateOrderList.next(true));
    } else {
      this.orderService.createOrder(orderDataBody).subscribe(() => {
        this.orderService.updateOrderList.next(true);
      });
    }
  }

  ngOnDestroy(): void {}
}
