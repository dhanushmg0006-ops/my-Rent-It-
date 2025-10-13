"use client";

import { toast } from "react-hot-toast";
import axios from "axios";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { SafeReservation, SafeUser } from "@/app/types";
import Heading from "@/app/components/Heading";
import Container from "@/app/components/Container";
import BookingCard from "@/app/components/bookings/BookingCard";
import PageHeader from "@/app/components/PageHeader";

interface BookingsClientProps {
  reservations: SafeReservation[];
  currentUser?: SafeUser | null;
}

const BookingsClient: React.FC<BookingsClientProps> = ({ reservations, currentUser }) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [sortKey, setSortKey] = useState<string>("start");

  const onCancel = useCallback(
    async (reservation: SafeReservation) => {
      const reason = prompt("Please enter the reason for cancellation:");
      if (!reason) return toast.error("Cancellation reason is required");

      if (!reservation.payments || reservation.payments.length === 0) {
        return toast.error("Payment not found");
      }

      const paymentId = reservation.payments[0].paymentId;
      if (!paymentId) return toast.error("Payment ID not found");

      setDeletingId(reservation.id);

      try {
        const response = await axios.post("/api/refunds", {
          reservationId: reservation.id,
          reason,
          paymentId,
        });

        if (response.data?.error) {
          throw new Error(response.data.error);
        }

        toast.success("Reservation cancelled & refund processed!");
        router.refresh();
      } catch (err: any) {
        toast.error(err?.response?.data?.error || err.message || "Something went wrong");
      } finally {
        setDeletingId("");
      }
    },
    [router]
  );

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = reservations.filter((r) => {
      if (statusFilter === "active" && r.status === "cancelled") return false;
      if (statusFilter === "cancelled" && r.status !== "cancelled") return false;
      if (q.length === 0) return true;
      return (
        r.listing.title.toLowerCase().includes(q) ||
        (r.listing.description?.toLowerCase().includes(q) ?? false) ||
        r.listing.locationValue?.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    });
    const sorted = [...base].sort((a, b) => {
      if (sortKey === "price") return (b.totalPrice ?? 0) - (a.totalPrice ?? 0);
      // default: start date desc (upcoming first)
      const ad = new Date(a.startDate).getTime();
      const bd = new Date(b.startDate).getTime();
      return bd - ad;
    });
    return sorted;
  }, [reservations, query, statusFilter, sortKey]);

  return (
    <Container>
      <PageHeader title="Bookings" subtitle="All of your bookings" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-6">
        <div className="text-sm text-ink-700">
          Showing <span className="font-semibold">{filteredSorted.length}</span> of {reservations.length}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-surface-200 rounded-lg px-3 py-2 text-sm w-full sm:w-auto"
          >
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="border border-surface-200 rounded-lg px-3 py-2 text-sm w-full sm:w-auto"
          >
            <option value="start">Sort by Start date</option>
            <option value="price">Sort by Price</option>
          </select>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or ID"
            className="border border-surface-200 rounded-lg px-3 py-2 text-sm w-full sm:w-64"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSorted.map((reservation) => (
          <BookingCard
            key={reservation.id}
            reservation={reservation}
            currentUser={currentUser}
            onCancel={onCancel}
            deleting={deletingId === reservation.id}
          />
        ))}
      </div>
    </Container>
  );
};

export default BookingsClient;
