export interface StripeAccount {
  id: string;
  type: 'express' | 'standard' | 'custom';
  country: string;
  email?: string;
  business_type?: 'individual' | 'company';
  capabilities: {
    card_payments: { requested: boolean; active?: boolean };
    transfers: { requested: boolean; active?: boolean };
  };
  charges_enabled: boolean;
  payouts_enabled: boolean;
  requirements?: {
    currently_due: string[];
    eventually_due: string[];
  };
  created: number;
}

export interface AccountLink {
  object: 'account_link';
  created: number;
  expires_at: number;
  url: string;
  refresh_url: string;
  return_url: string;
}