"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import Heading from "@/app/components/Heading";
import PageHeader from "@/app/components/PageHeader";
import AdminStatCard from "@/app/components/admin/AdminStatCard";
import AdminSection from "@/app/components/admin/AdminSection";
import ScrollRail from "@/app/components/admin/ScrollRail";

interface User { id: string; name?: string; email?: string; role: string }
interface Listing { id: string; title: string; price: number; category: string; userId: string }
interface Reservation { id: string; totalPrice: number; status: string; userId: string; listingId: string }
interface Refund { id: string; amount: number; status: string; reason?: string; userId: string; reservationId: string }

const AdminDashboard = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "users" | "delivery" | "listings" | "reservations" | "refunds">("overview");
  const [unassigned, setUnassigned] = useState<any[]>([]);
  const [deliveryPeople, setDeliveryPeople] = useState<any[]>([]);
  const [deliveredItems, setDeliveredItems] = useState<number>(0);
  const [assignment, setAssignment] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Check current session
        const sessionRes = await axios.get("/api/auth/session");
        const currentUser = sessionRes.data?.user;
        if (!currentUser || currentUser.role !== "admin") {
          toast.error("Access Denied");
          router.push("/");
          return;
        }

        // Fetch all admin data
        const [usersRes, listingsRes, reservationsRes, refundsRes, deliveryAdminRes] = await Promise.all([
          axios.get("/api/admin/users"),
          axios.get("/api/admin/listings"),
          axios.get("/api/admin/reservations"),
          axios.get("/api/admin/refunds"),
          axios.get("/api/admin/deliveries"),
        ]);

        setUsers(usersRes.data);
        setListings(listingsRes.data);
        setReservations(reservationsRes.data);
        setRefunds(refundsRes.data);
        setUnassigned(deliveryAdminRes.data.unassignedDeliveries || []);
        setDeliveryPeople(deliveryAdminRes.data.deliveryUsers || []);

        // Calculate delivered items count
        const deliveredCount = deliveryAdminRes.data.allDeliveries?.filter((d: any) => d.status === 'delivered').length || 0;
        setDeliveredItems(deliveredCount);

        console.log('Delivery data:', {
          allDeliveries: deliveryAdminRes.data.allDeliveries?.length || 0,
          deliveredCount: deliveredCount,
          sampleDelivery: deliveryAdminRes.data.allDeliveries?.[0]
        });

        console.log('Admin data loaded:', {
          users: usersRes.data.length,
          listings: listingsRes.data.length,
          reservations: reservationsRes.data.length,
          refunds: refundsRes.data.length,
          unassigned: deliveryAdminRes.data.unassignedDeliveries?.length || 0,
          totalDeliveries: deliveryAdminRes.data.allDeliveries?.length || 0,
          delivered: deliveredCount,
          deliveryUsers: deliveryAdminRes.data.deliveryUsers?.length || 0
        });
      } catch (err: any) {
        console.error('Admin data fetch error:', err);
        const errorMessage = err?.response?.data?.error || err?.message || "Failed to fetch admin data";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [router]);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-6 md:p-8">
      <PageHeader title="Admin Dashboard" subtitle="Manage users, listings, reservations and refunds" />

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {([
          { key: 'overview', label: 'Overview' },
          { key: 'users', label: `Users (${users.length})` },
          { key: 'delivery', label: `Delivery (${users.filter(u=>u.role==='delivery').length})` },
          { key: 'listings', label: `Listings (${listings.length})` },
          { key: 'reservations', label: `Reservations (${reservations.length})` },
          { key: 'refunds', label: `Refunds (${refunds.length})` },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`chip ${tab === t.key ? 'bg-brand text-white border-brand' : 'bg-white'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <AdminStatCard title="Users" value={users.length} />
          <AdminStatCard title="Listings" value={listings.length} />
          <AdminStatCard title="Reservations" value={reservations.length} />
          <AdminStatCard title="Delivered" value={deliveredItems} />
          <AdminStatCard title="Refunds" value={refunds.length} />
        </div>
      )}

      {tab === 'users' && (
        <AdminSection title="All Users">
          <ScrollRail>
            {users.map(u => (
              <div key={u.id} className="min-w-[300px] p-4 border border-surface-200 rounded-2xl shadow-card">
                <div className="font-semibold text-ink-900">{u.name || 'N/A'}</div>
                <div className="text-sm text-ink-500">{u.email}</div>
                <div className="mt-3 flex items-center gap-2">
                  <label className="text-sm text-ink-700">Role</label>
                  <select
                    className="border border-surface-200 rounded-lg px-2 py-1 text-sm"
                    value={u.role}
                    onChange={async (e) => {
                      const role = e.target.value;
                      try {
                        await axios.patch('/api/admin/users', { userId: u.id, role });
                        toast.success('Role updated');
                        const res = await axios.get('/api/admin/users');
                        setUsers(res.data);
                      } catch (err: any) {
                        toast.error(err?.response?.data?.error || 'Failed to update role');
                      }
                    }}
                  >
                    {['user','admin','delivery'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </ScrollRail>
        </AdminSection>
      )}

      {tab === 'delivery' && (
        <AdminSection title="Assign Deliveries">
          <div className="mb-4 flex gap-2">
            <button
              className="btn-primary px-4 py-2 text-sm"
              onClick={async () => {
                try {
                  const res = await axios.post('/api/admin/deliveries', { deliveryId: 'reset-all' });
                  toast.success(res.data.message || 'Deliveries reset');
                  const { data } = await axios.get('/api/admin/deliveries');
                  setUnassigned(data.unassignedDeliveries || []);
                  setDeliveryPeople(data.deliveryUsers || []);
                } catch (e: any) {
                  toast.error(e?.response?.data?.error || 'Reset failed');
                }
              }}
            >Reset All to Unassigned</button>
            <button
              className="btn-secondary px-4 py-2 text-sm"
              onClick={async () => {
                try {
                  const res = await axios.post('/api/admin/deliveries', { deliveryId: 'test-create' });
                  toast.success('Test delivery created');
                  const { data } = await axios.get('/api/admin/deliveries');
                  setUnassigned(data.unassignedDeliveries || []);
                  setDeliveryPeople(data.deliveryUsers || []);
                } catch (e: any) {
                  toast.error(e?.response?.data?.error || 'Test creation failed');
                }
              }}
            >Create Test Delivery</button>
          </div>

          <div className="mb-4 text-sm text-gray-600">
            Unassigned: {unassigned.length} |
            Delivery Users: {deliveryPeople.length}
          </div>
          {unassigned.length === 0 && (
            <div className="text-sm text-ink-500">No unassigned deliveries.</div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {unassigned.map((d) => (
              <div key={d.id} className="p-4 border border-surface-200 rounded-2xl shadow-card">
                <div className="font-semibold text-ink-900 truncate">#{d.id.slice(0,6)} • Delivery</div>
                <div className="text-xs text-ink-500 mt-1">Status: {d.status}</div>
                <div className="text-xs text-ink-500">Created: {new Date(d.createdAt).toLocaleDateString()}</div>
                {d.status === 'address_required' && (
                  <div className="text-xs text-amber-600 mt-1">⚠️ Requires address setup</div>
                )}
                <div className="mt-3 space-y-2">
                  <div className="text-sm font-medium">Delivery person</div>
                  <select
                    value={assignment[d.id] || ''}
                    onChange={(e) => setAssignment((prev) => ({ ...prev, [d.id]: e.target.value }))}
                    className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Select person</option>
                    {deliveryPeople.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name || 'Unnamed'} ({p.email})
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn-primary px-4 py-2 text-sm"
                    onClick={async () => {
                      const deliveryPersonId = assignment[d.id];
                      if (!deliveryPersonId) {
                        toast.error('Select a delivery person');
                        return;
                      }
                      try {
                        await axios.post('/api/admin/deliveries', {
                          deliveryId: d.id,
                          userId: deliveryPersonId,
                        });
                        toast.success('Assigned successfully');
                        const { data } = await axios.get('/api/admin/deliveries');
                        setUnassigned(data.unassignedDeliveries || []);
                        setDeliveryPeople(data.deliveryUsers || []);
                        setAssignment((prev) => ({ ...prev, [d.id]: '' }));
                      } catch (e: any) {
                        toast.error(e?.response?.data?.error || 'Failed to assign');
                      }
                    }}
                  >Assign</button>
                </div>
              </div>
            ))}
          </div>
        </AdminSection>
      )}

      {tab === 'listings' && (
        <AdminSection title="All Listings">
          <ScrollRail>
            {listings.map(l => (
              <div key={l.id} className="min-w-[260px] p-4 border border-surface-200 rounded-2xl shadow-card">
                <div className="font-semibold text-ink-900 truncate">{l.title}</div>
                <div className="text-sm text-ink-500">Category: {l.category}</div>
                <div className="text-sm text-ink-700 mt-1">Price: ₹{l.price}</div>
                <div className="text-xs text-ink-500 mt-1">User: {l.userId}</div>
              </div>
            ))}
          </ScrollRail>
        </AdminSection>
      )}

      {tab === 'reservations' && (
        <AdminSection title="All Reservations">
          <ScrollRail>
            {reservations.map(r => (
              <div key={r.id} className="min-w-[260px] p-4 border border-surface-200 rounded-2xl shadow-card">
                <div className="font-semibold text-ink-900">₹{r.totalPrice}</div>
                <div className="text-sm text-ink-500">Status: {r.status}</div>
                <div className="text-xs text-ink-500 mt-1">User: {r.userId}</div>
                <div className="text-xs text-ink-500">Listing: {r.listingId}</div>
              </div>
            ))}
          </ScrollRail>
        </AdminSection>
      )}

      {tab === 'refunds' && (
        <AdminSection title="All Refunds">
          <ScrollRail>
            {refunds.map(r => (
              <div key={r.id} className="min-w-[260px] p-4 border border-surface-200 rounded-2xl shadow-card">
                <div className="font-semibold text-ink-900">₹{r.amount}</div>
                <div className="text-sm text-ink-500">Status: {r.status}</div>
                <div className="text-xs text-ink-500">Reason: {r.reason || 'N/A'}</div>
                <div className="text-xs text-ink-500 mt-1">User: {r.userId}</div>
                <div className="text-xs text-ink-500">Reservation: {r.reservationId}</div>
              </div>
            ))}
          </ScrollRail>
        </AdminSection>
      )}
    </div>
  );
};

export default AdminDashboard;
