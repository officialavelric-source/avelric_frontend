import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { CustomerAuthService } from "../services/shopify/customerAuthService";
import type { CustomerAuthContextValue, CustomerProfile, AuthStatus } from "../types/customer";

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check stored session on mount & fetch profile if valid session exists
  const refreshCustomerState = useCallback(async () => {
    setStatus("loading");
    setError(null);

    const token = await CustomerAuthService.getValidAccessToken();
    if (!token) {
      setCustomer(null);
      setStatus("unauthenticated");
      return;
    }

    try {
      const profile = await CustomerAuthService.getCustomerProfile();
      setCustomer(profile);
      setStatus("authenticated");
    } catch (err) {
      console.warn("[CustomerAuthContext] Failed to fetch customer profile:", err);
      // Token might be invalid or revoked
      CustomerAuthService.clearSession();
      setCustomer(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    refreshCustomerState();
  }, [refreshCustomerState]);

  const login = useCallback(async () => {
    try {
      await CustomerAuthService.login();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate login");
    }
  }, []);

  const logout = useCallback(() => {
    setCustomer(null);
    setStatus("unauthenticated");
    // logout() is async (needs OIDC discovery for end_session_endpoint)
    // We call without awaiting so the UI updates immediately before redirect
    CustomerAuthService.logout().catch(() => {
      window.location.href = `${window.location.origin}/account`;
    });
  }, []);

  const customerFetch = useCallback(async <T,>(query: string, variables?: Record<string, unknown>): Promise<T> => {
    return CustomerAuthService.customerFetch<T>(query, variables);
  }, []);

  const value: CustomerAuthContextValue = {
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    customer,
    error,
    login,
    logout,
    customerFetch,
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export function useCustomerAuth(): CustomerAuthContextValue {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return ctx;
}
