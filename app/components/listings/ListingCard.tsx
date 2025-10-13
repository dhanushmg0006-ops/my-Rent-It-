"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { format } from "date-fns";
import jsPDF from "jspdf";

import useCountries from "@/app/hooks/useCountries";
import { SafeListing, SafeReservation, SafeUser } from "@/app/types";

import HeartButton from "../HeartButton";
import Button from "../Button";
import Avatar from "../Avatar";

interface ListingCardProps {
  data: SafeListing;
  userData?: SafeUser | null;
  reservation?: SafeReservation;
  onAction?: (id: string) => void;
  disabled?: boolean;
  actionLabel?: string;
  actionId?: string;
  currentUser?: SafeUser | null;
}

const ListingCard: React.FC<ListingCardProps> = ({
  data,
  userData,
  reservation,
  onAction,
  disabled,
  actionLabel,
  actionId = "",
  currentUser,
}) => {
  const router = useRouter();
  const { getByValue } = useCountries();

  const location = getByValue(data.locationValue);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (disabled) return;
      onAction?.(actionId);
    },
    [disabled, onAction, actionId]
  );

  const price = useMemo(() => {
    if (reservation) return reservation.totalPrice;
    return data.price;
  }, [reservation, data.price]);

  const reservationDate = useMemo(() => {
    if (!reservation) return null;
    const start = new Date(reservation.startDate);
    const end = new Date(reservation.endDate);
    return `${format(start, "PP")} - ${format(end, "PP")}`;
  }, [reservation]);

  // ✅ PDF Download
  const downloadInvoice = useCallback(() => {
    if (!reservation) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Invoice", 20, 20);

    doc.setFontSize(12);
    doc.text(`Reservation ID: ${reservation.id}`, 20, 40);
    doc.text(`Listing: ${reservation.listing.title}`, 20, 50);
    doc.text(`User: ${userData?.name || "N/A"}`, 20, 60);
    doc.text(`Total Price: ₹${reservation.totalPrice}`, 20, 70);
    doc.text(
      `Booking Dates: ${reservation.startDate} - ${reservation.endDate}`,
      20,
      80
    );

    doc.save(`Invoice_${reservation.id}.pdf`);
  }, [reservation, userData]);

  return (
    <div
      onClick={() => router.push(`/listings/${data.id}`)}
      className="
        col-span-1 
        cursor-pointer 
        group 
        bg-white 
        border 
        border-surface-200 
        rounded-2xl 
        shadow-card 
        hover:shadow-2xl 
        hover:-translate-y-1
        transition 
        p-4
      "
    >
      <div className="flex flex-col gap-3 w-full">
        {/* Image Section */}
        <div className="aspect-square w-full relative overflow-hidden rounded-xl">
          <Image
            fill
            className="object-cover h-full w-full group-hover:scale-110 transition"
            src={data.imageSrc}
            alt="Listing"
            onLoadingComplete={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-surface-200 animate-pulse" />
          )}
          <div className="absolute top-3 right-3">
            <HeartButton listingId={data.id} currentUser={currentUser} />
          </div>
          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className="chip bg-white/90 backdrop-blur border-surface-200">{data.category}</span>
          </div>
          {/* Sheen effect */}
          <div className="sheen" />
          {/* Hover CTA */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={(e) => { e.stopPropagation(); router.push(`/listings/${data.id}`); }}
              className="px-3 py-1.5 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand/30"
              aria-label="Book now"
            >
              Book now
            </button>
          </div>
        </div>

        {/* Title + Location */}
        <div className="font-semibold text-lg text-ink-900">{data.title}</div>
        {data.description && (
          <div className="text-ink-500 text-sm line-clamp-1">{data.description}</div>
        )}
        <div className="font-light text-neutral-500">
          {reservationDate || (
            <>
              {location?.region}, {location?.label}
            </>
          )}
        </div>

        {/* Reservation Info */}
        {reservation && (
          <div className="flex flex-row items-center gap-2 text-neutral-500">
            <div>Booked by {userData?.name}</div>
            <Avatar src={userData?.image} />
          </div>
        )}

        {/* Price */}
        <div className="flex flex-row items-center gap-1">
          <div className="font-semibold text-ink-900">₹ {price}</div>
          {!reservation && <div className="font-light text-ink-500">/ day</div>}
        </div>

        {/* Action Button */}
        {onAction && actionLabel && (
          <Button
            disabled={disabled}
            small
            label={actionLabel}
            onClick={handleCancel}
          />
        )}

        {/* ✅ Download Invoice Button */}
        {reservation && (
          <Button
            small
            label="Download Invoice"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              downloadInvoice();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ListingCard;
