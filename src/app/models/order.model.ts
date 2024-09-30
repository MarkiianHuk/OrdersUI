export interface Order {
  id: number;
  quantity: number;
  price: number;
  unitCurrency: Currency;
  outputCurrency: Currency;
}

export enum Currency {
  UAH = 'UAH',
  USD = 'USD',
  EUR = 'EUR'
}
