"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { toast } from "react-hot-toast";
import PageHeader from "@/app/components/PageHeader";
import StatusBadge from "@/app/components/StatusBadge";
import DeliveryStepper from "@/app/components/delivery/DeliveryStepper";
import DeliveryCard from "@/app/components/delivery/DeliveryCard";

interface Delivery {
  id: string;
  status: string;
  reservation: {
    id: string;
    listing: {
      id: string;
      title: string;
      imageSrc: string;
    };
  };
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
}

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const fetchDeliveries = async () => {
    try {
      const res = await axios.get("/api/delivery");
      setDeliveries(res.data);
    } catch {
      toast.error("Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries(); // initial fetch

    const interval = setInterval(fetchDeliveries, 5000); // refresh every 5 sec

    return () => clearInterval(interval); // cleanup
  }, []);

  const filteredDeliveries = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sf = statusFilter.toLowerCase();
    return deliveries.filter((d) => {
      const matchesStatus = sf === "all" || d.status.toLowerCase().includes(sf);
      const matchesQuery =
        q.length === 0 ||
        d.reservation.listing.title.toLowerCase().includes(q) ||
        d.address.city.toLowerCase().includes(q) ||
        d.address.state.toLowerCase().includes(q) ||
        d.address.country.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [deliveries, query, statusFilter]);

  if (loading) return <div className="max-w-screen-lg mx-auto p-6"><PageHeader title="My Deliveries" subtitle="Track your orders in real-time" /><p>Loading deliveries...</p></div>;
  if (deliveries.length === 0) return <div className="max-w-screen-lg mx-auto p-6"><PageHeader title="My Deliveries" subtitle="Track your orders in real-time" /><p>No deliveries yet.</p></div>;

  return (
    <div className="max-w-screen-lg mx-auto p-6 space-y-6">
      <PageHeader title="My Deliveries" subtitle="Track your orders in real-time" />
      {/* Summary + Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-sm text-ink-700">
          Showing <span className="font-semibold">{filteredDeliveries.length}</span> of {deliveries.length}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-surface-200 rounded-lg px-3 py-2 text-sm w-full sm:w-auto"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="dispatched">Dispatched</option>
            <option value="out-for-delivery">Out for delivery</option>
            <option value="delivered">Delivered</option>
          </select>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, city, or ID"
            className="border border-surface-200 rounded-lg px-3 py-2 text-sm w-full sm:w-64"
          />
        </div>
      </div>
      {filteredDeliveries.length === 0 && (
        <div className="text-sm text-ink-500">No deliveries match your filters.</div>
      )}
      {filteredDeliveries.map((delivery) => (
        <DeliveryCard
          key={delivery.id}
          id={delivery.id}
          title={delivery.reservation.listing.title}
          imageSrc={delivery.reservation.listing.imageSrc}
          status={delivery.status}
          address={`${delivery.address.street}, ${delivery.address.city}, ${delivery.address.state} - ${delivery.address.postalCode}, ${delivery.address.country}`}
          phone={delivery.address.phone}
        />
      ))}
    </div>
  );
}
