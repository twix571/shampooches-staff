/**
 * TypeScript type definitions for Square Payment Integration
 */

export type SquareEnvironment = 'sandbox' | 'production';

export type PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded';

export type PaymentType = 'deposit' | 'final_payment' | 'refund';

export type DepositStatus = 'pending' | 'applied' | 'forfeited' | 'refunded';

export interface SquarePaymentRequest {
  sourceId: string;
  amount: number; // Amount in cents
  currency: string;
  locationId: string;
  referenceId: string; // booking_id
  note?: string;
}

export interface SquarePaymentResponse {
  payment: {
    id: string;
    created_at: string;
    updated_at: string;
    amount_money: {
      amount: number;
      currency: string;
    };
    status: string;
    source_type: string;
    card_details?: {
      card: {
        card_brand: string;
        last_4: string;
        exp_month: number;
        exp_year: number;
      };
    };
    receipt_url?: string;
    reference_id?: string;
  };
}

export interface SquareRefundRequest {
  paymentId: string;
  amount: number;
  currency: string;
  reason?: string;
}

export interface SquareTerminalCheckoutRequest {
  deviceId: string;
  amount: number;
  currency: string;
  referenceId: string;
  note?: string;
}

export interface PaymentRecord {
  payment_id: string;
  booking_id: string;
  square_payment_id: string;
  payment_type: PaymentType;
  amount: number;
  payment_method: string;
  status: PaymentStatus;
  processed_at: string;
  processed_by: string;
}

export interface BookingPaymentInfo {
  deposit_payment_id: string | null;
  deposit_amount: number;
  deposit_status: DepositStatus;
  reschedule_count: number;
  original_appointment_date: string | null;
  final_payment_id: string | null;
  total_service_cost: number;
  remaining_balance: number;
}

export interface SquareWebhookEvent {
  merchant_id: string;
  type: string;
  event_id: string;
  created_at: string;
  data: {
    type: string;
    id: string;
    object: Record<string, any>;
  };
}

export type SquareWebhookEventType =
  | 'payment.created'
  | 'payment.updated'
  | 'terminal.checkout.updated'
  | 'refund.created';
