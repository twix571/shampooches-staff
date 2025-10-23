/**
 * Square Terminal API Configuration for Staff App
 * Server-side terminal checkout for final payment collection
 */

'use client';

/**
 * Create terminal checkout for final payment
 * Called by staff after service completion
 */
export async function createTerminalCheckout(
  bookingId: string,
  remainingBalance: number,
  deviceId: string
): Promise<{ checkoutId: string; status: string }> {
  try {
    const response = await fetch('/api/payments/terminal-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingId,
        amount: remainingBalance,
        deviceId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create terminal checkout');
    }

    const data = await response.json();
    return {
      checkoutId: data.checkoutId,
      status: data.status,
    };
  } catch (error) {
    console.error('Terminal checkout error:', error);
    throw error;
  }
}

/**
 * Poll terminal checkout status
 * Terminal checkouts are asynchronous, so we need to poll for completion
 */
export async function pollTerminalCheckoutStatus(
  checkoutId: string,
  onStatusUpdate: (status: string) => void
): Promise<string> {
  const maxAttempts = 60; // 5 minutes max (5 seconds * 60)
  let attempts = 0;

  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        attempts++;

        const response = await fetch(`/api/payments/terminal-checkout/${checkoutId}`);
        
        if (!response.ok) {
          throw new Error('Failed to get checkout status');
        }

        const data = await response.json();
        const status = data.status;

        onStatusUpdate(status);

        if (status === 'COMPLETED') {
          clearInterval(interval);
          resolve(status);
        } else if (status === 'CANCELED' || status === 'FAILED') {
          clearInterval(interval);
          reject(new Error(`Terminal checkout ${status.toLowerCase()}`));
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          reject(new Error('Terminal checkout timeout'));
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 5000); // Poll every 5 seconds
  });
}

/**
 * Cancel terminal checkout
 * Called if customer or staff cancels the payment
 */
export async function cancelTerminalCheckout(checkoutId: string): Promise<void> {
  try {
    const response = await fetch(`/api/payments/terminal-checkout/${checkoutId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel terminal checkout');
    }
  } catch (error) {
    console.error('Cancel terminal checkout error:', error);
    throw error;
  }
}

/**
 * Request refund for deposit
 * Staff discretionary refund for exceptional cases
 */
export async function requestDepositRefund(
  bookingId: string,
  reason: string
): Promise<void> {
  try {
    const response = await fetch('/api/payments/refund', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingId,
        reason,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to process refund');
    }
  } catch (error) {
    console.error('Refund request error:', error);
    throw error;
  }
}

/**
 * Get list of available terminal devices
 */
export async function getTerminalDevices(): Promise<Array<{ id: string; name: string }>> {
  try {
    const response = await fetch('/api/payments/terminal-devices');

    if (!response.ok) {
      throw new Error('Failed to get terminal devices');
    }

    const data = await response.json();
    return data.devices;
  } catch (error) {
    console.error('Get terminal devices error:', error);
    return [];
  }
}
