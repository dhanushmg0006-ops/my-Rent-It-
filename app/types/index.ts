import { Listing, Reservation, User, Payment, Refund } from "@prisma/client";

// Listing without Date objects
export type SafeListing = Omit<Listing, "createdAt"> & {
  createdAt: string;
};

// Payment without Date objects
export type SafePayment = Omit<Payment, "createdAt"> & {
  createdAt: string;
};

// Refund without Date objects
export type SafeRefund = Omit<Refund, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

// User without Date objects
export type SafeUser = Omit<User, "createdAt" | "updatedAt" | "isVerified"> & {
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean | null;  // Changed to match isVerified field
  role: string;                  // "user", "admin", "delivery"
  isVerified?: boolean;          // Keep for backward compatibility
};

// Reservation with related payments, refunds, user, and listing
export type SafeReservation = Omit<
  Reservation,
  "createdAt" | "startDate" | "endDate" | "listing" | "user" | "payments" | "refunds"
> & {
  createdAt: string;
  startDate: string;
  endDate: string;
  listing: SafeListing;
  user: SafeUser;
  payments?: SafePayment[];
  refunds?: SafeRefund[];
};
