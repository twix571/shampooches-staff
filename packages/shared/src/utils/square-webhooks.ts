/**
 * Square Webhooks Utility Functions
 * Handle webhook events from Square for payment status updates
 */

import crypto from 'crypto';
import type { SquareWebhookEvent, SquareWebhookEventType } from '../types/square';

const WEBHOOK_SIGNATURE_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || '';

/**
 * Verify Square webhook signature
 * Ensures the webhook request is authentic from Square
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  url: string
): boolean {
  if (!WEBHOOK_SIGNATURE_KEY) {
    console.error('Missing SQUARE_WEBHOOK_SIGNATURE_KEY');
    return false;
  }

  try {
    const hmac = crypto.createHmac('sha256', WEBHOOK_SIGNATURE_KEY);
    hmac.update(url + body);
    const hash = hmac.digest('base64');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(hash)
    );
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}

/**
 * Parse webhook event
 */
export function parseWebhookEvent(body: string): SquareWebhookEvent | null {
  try {
    return JSON.parse(body) as SquareWebhookEvent;
  } catch (error) {
    console.error('Failed to parse webhook event:', error);
    return null;
  }
}

/**
 * Handle payment.created event
 * Called when a deposit payment is successfully processed
 */
export async function handlePaymentCreated(
  event: SquareWebhookEvent,
  onPaymentCreated: (paymentId: string, referenceId: string) => Promise<void>
): Promise<void> {
  const payment = event.data.object;
  const paymentId = payment.id;
  const referenceId = payment.reference_id;

  if (!paymentId || !referenceId) {
    console.error('Missing payment ID or reference ID in webhook event');
    return;
  }

  await onPaymentCreated(paymentId, referenceId);
}

/**
 * Handle payment.updated event
 * Called when a payment status changes (e.g., completed, failed)
 */
export async function handlePaymentUpdated(
  event: SquareWebhookEvent,
  onPaymentUpdated: (paymentId: string, status: string) => Promise<void>
): Promise<void> {
  const payment = event.data.object;
  const paymentId = payment.id;
  const status = payment.status;

  if (!paymentId || !status) {
    console.error('Missing payment ID or status in webhook event');
    return;
  }

  await onPaymentUpdated(paymentId, status);
}

/**
 * Handle terminal.checkout.updated event
 * Called when a Terminal checkout status changes
 */
export async function handleTerminalCheckoutUpdated(
  event: SquareWebhookEvent,
  onCheckoutUpdated: (checkoutId: string, status: string, referenceId: string) => Promise<void>
): Promise<void> {
  const checkout = event.data.object;
  const checkoutId = checkout.id;
  const status = checkout.status;
  const referenceId = checkout.reference_id;

  if (!checkoutId || !status) {
    console.error('Missing checkout ID or status in webhook event');
    return;
  }

  await onCheckoutUpdated(checkoutId, status, referenceId);
}

/**
 * Handle refund.created event
 * Called when a refund is processed
 */
export async function handleRefundCreated(
  event: SquareWebhookEvent,
  onRefundCreated: (refundId: string, paymentId: string, amount: number) => Promise<void>
): Promise<void> {
  const refund = event.data.object;
  const refundId = refund.id;
  const paymentId = refund.payment_id;
  const amount = refund.amount_money?.amount;

  if (!refundId || !paymentId || !amount) {
    console.error('Missing refund ID, payment ID, or amount in webhook event');
    return;
  }

  await onRefundCreated(refundId, paymentId, Number(amount));
}

/**
 * Route webhook event to appropriate handler
 */
export async function routeWebhookEvent(
  event: SquareWebhookEvent,
  handlers: {
    onPaymentCreated?: (paymentId: string, referenceId: string) => Promise<void>;
    onPaymentUpdated?: (paymentId: string, status: string) => Promise<void>;
    onTerminalCheckoutUpdated?: (checkoutId: string, status: string, referenceId: string) => Promise<void>;
    onRefundCreated?: (refundId: string, paymentId: string, amount: number) => Promise<void>;
  }
): Promise<void> {
  const eventType = event.type as SquareWebhookEventType;

  switch (eventType) {
    case 'payment.created':
      if (handlers.onPaymentCreated) {
        await handlePaymentCreated(event, handlers.onPaymentCreated);
      }
      break;

    case 'payment.updated':
      if (handlers.onPaymentUpdated) {
        await handlePaymentUpdated(event, handlers.onPaymentUpdated);
      }
      break;

    case 'terminal.checkout.updated':
      if (handlers.onTerminalCheckoutUpdated) {
        await handleTerminalCheckoutUpdated(event, handlers.onTerminalCheckoutUpdated);
      }
      break;

    case 'refund.created':
      if (handlers.onRefundCreated) {
        await handleRefundCreated(event, handlers.onRefundCreated);
      }
      break;

    default:
      console.log(`Unhandled webhook event type: ${eventType}`);
  }
}
