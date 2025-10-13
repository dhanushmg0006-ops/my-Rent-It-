"use client";

import { useState } from "react";

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export default function AddressPicker({
  addresses,
  onSelect,
}: {
  addresses: Address[];
  onSelect: (address: Address) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (address: Address) => {
    setSelectedId(address.id);
    onSelect(address); // send full object up
  };

  if (addresses.length === 0) {
    return <p className="text-gray-600">No addresses found. Please add one.</p>;
  }

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-lg">Select Delivery Address</h2>
      {addresses.map((addr) => (
        <div
          key={addr.id}
          className={`p-4 border rounded-lg cursor-pointer transition ${
            selectedId === addr.id ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onClick={() => handleSelect(addr)}
        >
          <p className="font-medium">{addr.street}</p>
          <p className="text-sm text-gray-600">
            {addr.city}, {addr.state} - {addr.postalCode}
          </p>
          <p className="text-sm text-gray-600">{addr.country}</p>
          {addr.phone && <p className="text-sm">📞 {addr.phone}</p>}
        </div>
      ))}
    </div>
  );
}
