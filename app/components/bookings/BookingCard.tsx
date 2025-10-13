"use client";

import Image from "next/image";
import { useMemo, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import jsPDF from "jspdf";

import { SafeReservation, SafeUser } from "@/app/types";
import StatusBadge from "@/app/components/StatusBadge";
import Modal from "@/app/components/modals/Modal";

interface BookingCardProps {
  reservation: SafeReservation;
  currentUser?: SafeUser | null;
  onCancel?: (reservation: SafeReservation) => void; // optional; handled internally
  deleting?: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({ reservation, currentUser, onCancel, deleting }) => {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { listing, user } = reservation;

  const dateRange = useMemo(() => {
    const start = new Date(reservation.startDate);
    const end = new Date(reservation.endDate);
    return `${format(start, "PP")} · ${format(end, "PP")}`;
  }, [reservation.startDate, reservation.endDate]);

  const downloadInvoice = useCallback(() => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Booking Invoice", 20, 20);
    doc.setFontSize(12);
    doc.text(`Booking ID: ${reservation.id}`, 20, 40);
    doc.text(`Listing: ${listing.title}`, 20, 50);
    doc.text(`Guest: ${user?.name || currentUser?.name || "N/A"}`, 20, 60);
    doc.text(`Total Amount: ₹${reservation.totalPrice}`, 20, 70);
    doc.text(`Start: ${format(new Date(reservation.startDate), "PPpp")}`, 20, 80);
    doc.text(`End: ${format(new Date(reservation.endDate), "PPpp")}`, 20, 90);
    doc.save(`Booking_${reservation.id}.pdf`);
  }, [reservation, listing.title, user?.name, currentUser?.name]);

  const toggleReason = useCallback((reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  }, []);

  const submitCancellation = useCallback(async () => {
    const reasonText = `${selectedReasons.join(", ")}${note ? (selectedReasons.length ? "; " : "") + note : ""}`.trim();
    if (!reasonText) {
      toast.error("Please select or enter a reason");
      return;
    }
    const paymentId = reservation.payments?.[0]?.paymentId;
    if (!paymentId) {
      toast.error("Payment ID not found for this booking");
      return;
    }
    try {
      setSubmitting(true);
      const response = await axios.post("/api/refunds", {
        reservationId: reservation.id,
        reason: reasonText,
        paymentId,
      });
      if (response.data?.error) {
        throw new Error(response.data.error);
      }
      toast.success("Reservation cancelled & refund processed!");
      setCancelOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }, [note, reservation.id, reservation.payments, router, selectedReasons]);

  return (
    <div
      className="group bg-white border border-surface-200 rounded-2xl shadow-card hover:shadow-2xl hover:-translate-y-1 transition p-4"
      aria-label={`Booking for ${listing.title}`}
    >
      <Modal
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onSubmit={submitCancellation}
        title="Cancel booking"
        actionLabel={submitting ? "Cancelling..." : "Confirm cancellation"}
        disabled={submitting}
        secondaryAction={() => setCancelOpen(false)}
        secondaryActionLabel="Close"
        body={(
          <div className="space-y-4">
            <div className="text-sm text-ink-700">Select the reason(s) for cancellation:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {[
                "Change of plans",
                "Found a better option",
                "Host unresponsive",
                "Dates incorrect",
                "Price concerns",
                "Other",
              ].map((r) => (
                <label key={r} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedReasons.includes(r)}
                    onChange={() => toggleReason(r)}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
            <div className="space-y-1">
              <label className="text-sm text-ink-700">Additional details (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a short note for the refund"
                className="w-full border border-surface-200 rounded-lg p-2 text-sm min-h-[80px]"
              />
            </div>
            <div className="text-xs text-ink-500">Refunds are subject to policy. Processing may take 5-7 days.</div>
          </div>
        )}
      />
      <div className="flex gap-4">
        <div className="relative h-28 w-28 sm:h-32 sm:w-32 flex-shrink-0 rounded-xl overflow-hidden border">
          <Image
            src={listing.imageSrc}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition"
            onLoadingComplete={() => setImageLoaded(true)}
          />
          {!imageLoaded && <div className="absolute inset-0 bg-surface-200 animate-pulse" />}
          <div className="absolute inset-0 pointer-events-none sheen" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-ink-900 font-semibold truncate">{listing.title}</div>
              <div className="mt-1"><StatusBadge status={reservation.status || "confirmed"} /></div>
            </div>
            <div className="text-xs text-ink-500">#{reservation.id.slice(0, 6)}</div>
          </div>

          <div className="mt-2 text-sm text-ink-700 line-clamp-2">
            {dateRange} · ₹ {reservation.totalPrice}
          </div>
          {listing.locationValue && (
            <div className="mt-1 text-xs text-ink-500">{listing.locationValue}</div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={downloadInvoice}
              className="px-3 py-1.5 rounded-lg border border-surface-200 text-sm hover:bg-surface-100"
            >
              Download Invoice
            </button>
            <button
              disabled={deleting}
              onClick={() => setCancelOpen(true)}
              className={`px-3 py-1.5 rounded-lg text-sm text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-50`}
            >
              {deleting ? "Cancelling..." : "Cancel Booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;


