import { NextRequest } from "next/server";

/**
 * Extract Stripe Account ID from request with fallbacks for authentication bypass
 */
export function getStripeAccountId(request: NextRequest): string | null {
  // Try to get from header first
  const accountId = request.headers.get("x-stripe-account");

  if (accountId) {
    return accountId;
  }

  // Fallback: try to get from URL query params (for URL-based auth)
  const { searchParams } = new URL(request.url);
  const queryAccountId = searchParams.get("accountId");

  if (queryAccountId) {
    return queryAccountId;
  }

  // No fallback - accountId must be provided
  console.error('No account ID found in request');
  return null;
}

/**
 * Create response with proper error handling for Stripe API errors
 */
export function createStripeErrorResponse(error: any, timestamp: number = Date.now()) {
  let errorMessage = 'Failed to fetch Stripe information';
  let statusCode = 500;

  if (error.type === 'StripeInvalidRequestError') {
    errorMessage = 'Account not found or access denied';
    statusCode = 404;
  } else if (error.type === 'StripePermissionError') {
    errorMessage = 'Insufficient permissions to access this account';
    statusCode = 403;
  } else if (error.type === 'StripeAPIError') {
    errorMessage = 'Stripe API temporarily unavailable';
    statusCode = 503;
  } else if (error.type === 'StripeConnectionError') {
    errorMessage = 'Network error - please try again';
    statusCode = 503;
  } else if (error.type === 'StripeRateLimitError') {
    errorMessage = 'Too many requests - please try again later';
    statusCode = 429;
  }

  return {
    error: errorMessage,
    type: error.type || 'api_error',
    timestamp,
    statusCode
  };
}