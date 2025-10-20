"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

interface Delivery {
  id: string;
  status: string;
  reservation: {
    id: string;
    listing: {
      id: string;
      title: string;
    };
    user: {
      id: string;
      name?: string;
      email?: string;
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
  deliveryPerson?: {
    id: string;
    user: {
      id: string;
      name?: string;
      email?: string;
    };
  };
}

export default function DeliveryDashboard() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [scope, setScope] = useState<'my' | 'all'>('my');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      console.log("Fetching current user...");
      const res = await axios.get("/api/currentUser");
      console.log("Current user response:", res.data);
      setUser(res.data);
      return res.data;
    } catch (error: any) {
      console.error("Failed to fetch current user:", error);
      return null;
    }
  };

  const fetchDeliveries = async () => {
    try {
      console.log("Fetching deliveries...");
      const res = await axios.get("/api/delivery/get");
      console.log("Delivery response:", res.data);

      // Handle different response formats
      if (res.data.deliveries) {
        setDeliveries(res.data.deliveries);
      } else if (Array.isArray(res.data)) {
        setDeliveries(res.data);
      } else {
        setDeliveries([]);
      }

      // Show error message if present
      if (res.data.error && res.data.error !== 'Not authenticated') {
        toast.error(res.data.message || 'Error loading deliveries');
      }
    } catch (error: any) {
      console.error("Failed to load deliveries:", error);
      toast.error(`Failed to load deliveries: ${error.response?.status || error.message}`);
      setDeliveries([]);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([fetchCurrentUser(), fetchDeliveries()]);
      setLoading(false);
    };

    initializeData();

    const interval = setInterval(() => {
      fetchDeliveries(); // refresh every 30 seconds
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.post("/api/delivery/update", { deliveryId: id, newStatus: status });
      toast.success("Delivery status updated!");
      fetchDeliveries(); // refresh after update
    } catch {
      toast.error("Failed to update status");
    }
  };

  const visibleDeliveries = useMemo(() => {
    if (scope === 'all') return deliveries;
    // For 'my' scope, filter deliveries assigned to current user
    // The API should already handle this based on user's role and DeliveryPerson record
    return deliveries;
  }, [deliveries, scope]);

  if (loading) {
    return (
      <div className="p-6 space-y-4 max-w-screen-lg mx-auto">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 max-w-screen-lg mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Delivery Dashboard</h1>
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value as any)}
          className="border border-surface-200 rounded-lg px-3 py-2 text-sm"
        >
          <option value="my">My assignments</option>
          <option value="all">All deliveries</option>
        </select>
      </div>

      {/* Debug Information */}
      <div className="bg-gray-100 p-4 rounded-lg text-sm">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <p><strong>User:</strong> {user ? `${user.name || user.email} (${user.role})` : 'Not logged in'}</p>
        <p><strong>Deliveries:</strong> {deliveries.length} found</p>
        <p><strong>Scope:</strong> {scope}</p>
        <p><strong>Environment:</strong> {process.env.NODE_ENV || 'production'}</p>
      </div>
      {visibleDeliveries.length === 0 && (
        <p className="text-sm text-ink-500">No deliveries to show.</p>
      )}
      {visibleDeliveries.map((d) => (
        <div
          key={d.id}
          className="border p-4 rounded shadow flex justify-between items-center"
        >
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold">{d.reservation.listing.title}</h2>
                <p className="text-sm text-gray-600">Customer: {d.reservation.user.name || d.reservation.user.email}</p>
                <p className="text-sm text-gray-600">Address: {d.address.street}, {d.address.city}</p>
                {d.deliveryPerson && (
                  <p className="text-sm text-gray-600">Assigned to: {d.deliveryPerson.user.name || d.deliveryPerson.user.email}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Status: {d.status}</p>
                <p className="text-xs text-gray-500">#{d.id.slice(0, 8)}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            {d.status !== "delivered" && (
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() =>
                  updateStatus(
                    d.id,
                    d.status === "pending"
                      ? "dispatched"
                      : d.status === "dispatched"
                      ? "out-for-delivery"
                      : "delivered"
                  )
                }
              >
                Update Status
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
