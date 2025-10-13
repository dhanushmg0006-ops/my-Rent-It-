// app/listings/[listingId]/ListingClient.tsx
"use client";

import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Range } from "react-date-range";
import { differenceInDays, eachDayOfInterval } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import useLoginModal from "@/app/hooks/useLoginModal";
import { SafeListing, SafeReservation, SafeUser } from "@/app/types";

import Container from "@/app/components/Container";
import { categories } from "@/app/components/navbar/Categories";
import ListingHead from "@/app/components/listings/ListingHead";
import ListingInfo from "@/app/components/listings/ListingInfo";
import ListingReservation from "@/app/components/listings/ListingReservation";
import RazorpayCheckout from "@/app/components/payments/RazorpayCheckout";

const initialDateRange = {
  startDate: new Date(),
  endDate: new Date(),
  key: "selection",
};

interface Address {
  id?: string;
  _id?: string; // just in case you get raw mongo object somewhere
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

interface ListingClientProps {
  reservations?: SafeReservation[];
  listing: SafeListing & {
    user: SafeUser;
  };
  currentUser?: SafeUser | null;
}

const ListingClient: React.FC<ListingClientProps> = ({
  listing,
  reservations = [],
  currentUser,
}) => {
  const loginModal = useLoginModal();
  const router = useRouter();

  const disabledDates = useMemo(() => {
    let dates: Date[] = [];
    reservations.forEach((reservation: any) => {
      const range = eachDayOfInterval({
        start: new Date(reservation.startDate),
        end: new Date(reservation.endDate),
      });
      dates = [...dates, ...range];
    });
    return dates;
  }, [reservations]);

  const category = useMemo(() => {
    return categories.find((items) => items.label === listing.category);
  }, [listing.category]);

  const [isLoading, setIsLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(listing.price);
  const [dateRange, setDateRange] = useState<Range>(initialDateRange);

  // Address
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  useEffect(() => {
    if (!currentUser) return;
    axios
      .get("/api/address")
      .then((res) => {
        setAddresses(res.data || []);
        if (res.data?.length > 0) {
          setSelectedAddressId(res.data[0].id || res.data[0]._id);
        }
      })
      .catch(() => toast.error("Failed to load addresses"));
  }, [currentUser]);

  // total price
  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      const dayCount = differenceInDays(dateRange.endDate, dateRange.startDate);
      if (listing.price) {
        setTotalPrice((dayCount + 1) * listing.price);
      }
    }
  }, [dateRange, listing.price]);

  const onSubmit = useCallback(() => {
    if (!currentUser) {
      loginModal.onOpen();
      return;
    }
    if (!selectedAddressId) {
      toast.error("Please select a delivery address.");
      return;
    }
    // RazorpayCheckout handles payment
  }, [currentUser, loginModal, selectedAddressId]);

  return (
    <Container>
      <div className="max-w-screen-lg mx-auto">
        <div className="flex flex-col gap-6">
          <ListingHead
            title={listing.title}
            imageSrc={listing.imageSrc}
            locationValue={listing.locationValue}
            id={listing.id}
            currentUser={currentUser}
          />
          <div className="grid grid-cols-1 md:grid-cols-7 md:gap-10 mt-6">
            {/* Left Info Card */}
            <div className="md:col-span-4">
              <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-6 hover:shadow-lg transition">
                <ListingInfo
                  user={listing.user}
                  category={category}
                  description={listing.description}
                  itemCount={listing.itemCount}
                  locationValue={listing.locationValue}
                />
              </div>
            </div>

            {/* Right Reservation & Payment Card */}
            <div className="order-first mb-10 md:order-last md:col-span-3">
              <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-6 space-y-6 hover:shadow-lg transition">
                {/* Address Selector */}
                <div>
                  <h3 className="font-semibold mb-2">Select Delivery Address</h3>
                  {addresses.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No addresses found. Please add one in your profile.
                    </p>
                  ) : (
                    <select
                      value={selectedAddressId}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      className="w-full border rounded p-2"
                    >
                      {addresses.map((addr) => {
                        const value = addr.id || (addr as any)._id;
                        return (
                          <option key={value} value={value}>
                            {addr.street}, {addr.city}, {addr.state} - {addr.postalCode}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>

                {/* Reservation Box */}
                <ListingReservation
                  price={listing.price}
                  totalPrice={totalPrice}
                  onChangeDate={(value) => setDateRange(value)}
                  dateRange={dateRange}
                  onSubmit={onSubmit}
                  disabled={isLoading}
                  disabledDates={disabledDates}
                  currentUser={currentUser}
                  listing={listing}
                />

                {/* Pay Now Button */}
                <RazorpayCheckout
                  listing={listing}
                  currentUser={currentUser}
                  selectedAddress={selectedAddressId}
                  dateRange={{
                    startDate: dateRange.startDate as Date,
                    endDate: dateRange.endDate as Date,
                  }}
                  totalPrice={totalPrice}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ListingClient;
