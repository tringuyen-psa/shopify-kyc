export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'refunded' | 'disputed';
  from: string;
  date: string;
}

export interface PaymentStats {
  title: string;
  amount: number;
  change: number;
  chartData?: number[];
}