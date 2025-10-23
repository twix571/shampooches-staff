/**
 * Square Payment Integration Configuration
 * Centralized configuration for Square Sandbox and Production environments
 */

export const SQUARE_CONFIG = {
  // Environment configuration
  environment: process.env.SQUARE_ENVIRONMENT || 'sandbox',
  
  // Application ID (public, used in Web Payments SDK)
  appId: process.env.NEXT_PUBLIC_SQUARE_APP_ID || '',
  
  // Location ID (public, identifies the business location)
  locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || '',
  
  // Access Token (private, server-side only)
  accessToken: process.env.SQUARE_ACCESS_TOKEN || '',
  
  // API Base URLs
  apiBaseUrl: process.env.SQUARE_ENVIRONMENT === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com',
  
  // Payment configuration
  deposit: {
    amount: 2500, // $25.00 in cents
    currency: 'USD',
    description: 'Grooming appointment deposit - non-refundable',
  },
  
  // Booking policy
  policy: {
    maxReschedules: 1,
    depositRefundable: false,
  },
} as const;

/**
 * Validate that all required Square configuration is present
 */
export function validateSquareConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!SQUARE_CONFIG.appId) {
    errors.push('Missing NEXT_PUBLIC_SQUARE_APP_ID');
  }
  
  if (!SQUARE_CONFIG.locationId) {
    errors.push('Missing NEXT_PUBLIC_SQUARE_LOCATION_ID');
  }
  
  if (!SQUARE_CONFIG.accessToken) {
    errors.push('Missing SQUARE_ACCESS_TOKEN');
  }
  
  if (!['sandbox', 'production'].includes(SQUARE_CONFIG.environment)) {
    errors.push('SQUARE_ENVIRONMENT must be "sandbox" or "production"');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Square API endpoint helpers
 */
export const SQUARE_ENDPOINTS = {
  payments: `${SQUARE_CONFIG.apiBaseUrl}/v2/payments`,
  refunds: `${SQUARE_CONFIG.apiBaseUrl}/v2/refunds`,
  terminals: `${SQUARE_CONFIG.apiBaseUrl}/v2/terminals/checkouts`,
  customers: `${SQUARE_CONFIG.apiBaseUrl}/v2/customers`,
  orders: `${SQUARE_CONFIG.apiBaseUrl}/v2/orders`,
} as const;
