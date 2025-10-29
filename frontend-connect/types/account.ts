export type AccountType = "demo" | "live" | "express" | "custom";

export interface AccountInfo {
  id: string;
  type: AccountType;
  email?: string;
  name?: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  created: number;
}

export interface StoredAccount {
  accountId: string;
  accountType: AccountType;
  timestamp: string;
}