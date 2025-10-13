"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { SafeReservation } from "@/app/types";
import Container from "@/app/components/Container";
import PageHeader from "@/app/components/PageHeader";
import ListingCard from "@/app/components/listings/ListingCard";

const BookingHistoryPage = () => {
  const [reservations, setReservations] = useState<SafeReservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await axios.get("/api/reservations");
        setReservations(response.data);
      } catch (err) {
        toast.error("Failed to load booking history");
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  return (
    <Container>
      <PageHeader title="Booking History" subtitle="Your past rentals and returns" />
      {loading && <p>Loading...</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {reservations.map((res) => (
          <ListingCard key={res.id} data={res.listing} userData={res.user} reservation={res} />
        ))}
      </div>
    </Container>
  );
};

export default BookingHistoryPage;
