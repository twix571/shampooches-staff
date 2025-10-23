/**
 * Square Payments Utility Functions
 * Server-side payment processing for deposits and final payments
 */

import { SQUARE_CONFIG } from '../config/square';
import type {
  SquarePaymentRequest,
  SquarePaymentResponse,
  SquareRefundRequest,
  SquareTerminalCheckoutRequest,
} from '../types/square';

/**
 * Process a deposit payment ($25)
 * Used during online booking to secure appointment
 */
export async function processDepositPayment(
  request: SquarePaymentRequest
): Promise<SquarePaymentResponse> {
  try {
    // Call Square API to create payment
    const response = await fetch('https://connect.squareup.com/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SQUARE_CONFIG.accessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2024-10-23',
      },
      body: JSON.stringify({
        source_id: request.sourceId,
        idempotency_key: `${request.referenceId}-deposit-${Date.now()}`,
        amount_money: {
          amount: SQUARE_CONFIG.deposit.amount,
          currency: SQUARE_CONFIG.deposit.currency,
        },
        location_id: request.locationId,
        reference_id: request.referenceId,
        note: request.note || SQUARE_CONFIG.deposit.description,
        autocomplete: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json() as any;
      throw new Error(error.errors?.[0]?.detail || 'Payment processing failed');
    }

    const data = await response.json() as any;
    return data.payment as SquarePaymentResponse;
  } catch (error: unknown) {
    console.error('Square deposit payment error:', error);
    throw new Error('Failed to process deposit payment');
  }
}

/**
 * Create a Terminal checkout for final payment
 * Used by staff to collect remaining balance after service completion
 */
export async function createTerminalCheckout(
  request: SquareTerminalCheckoutRequest
): Promise<any> {
  try {
    const response = await fetch('https://connect.squareup.com/v2/terminals/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SQUARE_CONFIG.accessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2024-10-23',
      },
      body: JSON.stringify({
        idempotency_key: `${request.referenceId}-final-${Date.now()}`,
        checkout: {
          amount_money: {
            amount: request.amount,
            currency: request.currency,
          },
          device_options: {
            device_id: request.deviceId,
            skip_receipt_screen: false,
            collect_signature: true,
          },
          reference_id: request.referenceId,
          note: request.note || 'Final payment (deposit already applied)',
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create terminal checkout');
    }

    const data = await response.json() as any;
    return data.checkout;
  } catch (error: unknown) {
    console.error('Square terminal checkout error:', error);
    throw new Error('Failed to create terminal checkout');
  }
}

/**
 * Get Terminal checkout status
 */
export async function getTerminalCheckoutStatus(checkoutId: string): Promise<any> {
  try {
    const response = await fetch(`https://connect.squareup.com/v2/terminals/checkouts/${checkoutId}`, {
      headers: {
        'Authorization': `Bearer ${SQUARE_CONFIG.accessToken}`,
        'Square-Version': '2024-10-23',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get terminal checkout status');
    }

    const data = await response.json() as any;
    return data.checkout;
  } catch (error: unknown) {
    console.error('Square get terminal checkout error:', error);
    throw new Error('Failed to get terminal checkout status');
  }
}

/**
 * Process a refund (staff discretionary)
 * Used when staff manually approves a deposit refund
 */
export async function processRefund(
  request: SquareRefundRequest
): Promise<any> {
  try {
    const response = await fetch('https://connect.squareup.com/v2/refunds', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SQUARE_CONFIG.accessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2024-10-23',
      },
      body: JSON.stringify({
        idempotency_key: `${request.paymentId}-refund-${Date.now()}`,
        payment_id: request.paymentId,
        amount_money: {
          amount: request.amount,
          currency: request.currency,
        },
        reason: request.reason || 'Staff discretionary refund',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to process refund');
    }

    const data = await response.json() as any;
    return data.refund;
  } catch (error: unknown) {
    console.error('Square refund error:', error);
    throw new Error('Failed to process refund');
  }
}

/**
 * Get payment details
 */
export async function getPayment(paymentId: string): Promise<any> {
  try {
    const response = await fetch(`https://connect.squareup.com/v2/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${SQUARE_CONFIG.accessToken}`,
        'Square-Version': '2024-10-23',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get payment details');
    }

    const data = await response.json() as any;
    return data.payment;
  } catch (error: unknown) {
    console.error('Square get payment error:', error);
    throw new Error('Failed to get payment details');
  }
}

/**
 * List payments for a location
 */
export async function listPayments(
  locationId: string,
  beginTime?: string,
  endTime?: string
): Promise<any> {
  try {
    const params = new URLSearchParams();
    params.append('location_id', locationId);
    if (beginTime) params.append('begin_time', beginTime);
    if (endTime) params.append('end_time', endTime);
    params.append('sort_order', 'DESC');

    const response = await fetch(`https://connect.squareup.com/v2/payments?${params}`, {
      headers: {
        'Authorization': `Bearer ${SQUARE_CONFIG.accessToken}`,
        'Square-Version': '2024-10-23',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to list payments');
    }

    const data = await response.json() as any;
    return data.payments;
  } catch (error: unknown) {
    console.error('Square list payments error:', error);
    throw new Error('Failed to list payments');
  }
}

/**
 * Calculate remaining balance after deposit
 */
export function calculateRemainingBalance(totalServiceCost: number): number {
  return Math.max(0, totalServiceCost - SQUARE_CONFIG.deposit.amount);
}

/**
 * Validate payment amount
 */
export function validatePaymentAmount(amount: number): boolean {
  return amount > 0 && Number.isInteger(amount);
}
