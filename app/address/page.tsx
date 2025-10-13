"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import PageHeader from "@/app/components/PageHeader";

type Address = {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
};

export default function AddressPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  // ✅ Fetch addresses
  const fetchAddresses = async () => {
    const res = await axios.get("/api/address");
    setAddresses(res.data);
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Submit add/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editId) {
      await axios.put(`/api/address/${editId}`, formData);
    } else {
      await axios.post("/api/address", formData);
    }

    setFormData({
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      phone: "",
    });
    setFormOpen(false);
    setEditId(null);
    fetchAddresses();
  };

  // ✅ Delete address
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      await axios.delete(`/api/address/${id}`);
      fetchAddresses();
    }
  };

  // ✅ Edit address (load into form)
  const handleEdit = (addr: Address) => {
    setFormData({
      street: addr.street,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      phone: addr.phone || "",
    });
    setEditId(addr.id);
    setFormOpen(true);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PageHeader title="My Addresses" subtitle="Manage your saved delivery locations" />

      {/* Address List */}
      {addresses.length === 0 ? (
        <p className="text-gray-500">No addresses added yet.</p>
      ) : (
        <ul className="space-y-4">
          {addresses.map((addr) => (
            <li
              key={addr.id}
              className="p-4 border border-surface-200 rounded-2xl shadow-card hover:shadow-lg transition bg-white flex justify-between items-start"
            >
              <div>
                <p className="font-semibold text-ink-900">{addr.street}</p>
                <p className="text-ink-700">
                  {addr.city}, {addr.state}, {addr.postalCode}
                </p>
                <p className="text-ink-700">{addr.country}</p>
                {addr.phone && <p className="text-ink-500 text-sm">📞 {addr.phone}</p>}
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleEdit(addr)}
                  className="px-3 py-1 rounded-lg border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="px-3 py-1 rounded-lg border border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add/Edit Button */}
      <button
        onClick={() => {
          setFormOpen(!formOpen);
          setEditId(null);
          setFormData({
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
            phone: "",
          });
        }}
        className="mt-6 px-4 py-2 btn-primary"
      >
        {formOpen ? "Cancel" : "Add New Address"}
      </button>

      {/* Form */}
      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 p-4 border border-surface-200 rounded-2xl shadow-card space-y-4 bg-white"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              name="street"
              placeholder="Street"
              value={formData.street}
              onChange={handleChange}
              className="w-full border border-surface-200 p-3 rounded-lg"
              required
            />
            <input
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              className="w-full border border-surface-200 p-3 rounded-lg"
              required
            />
            <input
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
              className="w-full border border-surface-200 p-3 rounded-lg"
              required
            />
            <input
              name="postalCode"
              placeholder="Postal Code"
              value={formData.postalCode}
              onChange={handleChange}
              className="w-full border border-surface-200 p-3 rounded-lg"
              required
            />
            <input
              name="country"
              placeholder="Country"
              value={formData.country}
              onChange={handleChange}
              className="w-full border border-surface-200 p-3 rounded-lg"
              required
            />
            <input
              name="phone"
              placeholder="Phone (optional)"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-surface-200 p-3 rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full btn-primary py-3"
          >
            {editId ? "Update Address" : "Save Address"}
          </button>
        </form>
      )}
    </div>
  );
}
