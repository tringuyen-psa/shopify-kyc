"use client";

import { AccountType, StoredAccount } from "@/types/account";

const STORAGE_KEY = "furever_account";

// Check if we're on the client side
const isClient = typeof window !== 'undefined';

export const accountManager = {
  // Save account
  save: (accountId: string, type: AccountType) => {
    if (!isClient) return;
    const data: StoredAccount = {
      accountId,
      accountType: type,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  // Get current account
  get: (): StoredAccount | null => {
    if (!isClient) return null;
    const data = localStorage.getItem(STORAGE_KEY);
    try {
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  // Get account ID
  getAccountId: (): string | null => {
    const account = accountManager.get();
    return account?.accountId || null;
  },

  // Get account type
  getType: (): AccountType | null => {
    const account = accountManager.get();
    return account?.accountType || null;
  },

  // Alias for getType (for backward compatibility)
  getAccountType: (): AccountType | null => {
    return accountManager.getType();
  },

  // Check if demo
  isDemo: (): boolean => {
    return accountManager.getType() === "demo";
  },

  // Clear account
  clear: () => {
    if (!isClient) return;
    localStorage.removeItem(STORAGE_KEY);
  },

  // Has account
  hasAccount: (): boolean => {
    return !!accountManager.get();
  },
};