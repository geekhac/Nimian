"use client";

import { useState } from "react";
import SupplierForm from "./SupplierForm";

interface EditSupplierModalProps {
  supplier: {
    id: number;
    supplier_name: string;
    registered_capital?: number;
    product_categories?: string[];
    qualification_type?: string;
    supply_channel?: string;
    channel_explanation?: string;
    total_orders?: number;
    total_amount?: number;
    problem_orders?: number;
    problem_amount?: number;
    delivery_speed?: string;
    product_quality?: number;
    packaging?: number;
    region?: string;
  };
  onSuccess?: () => void;
}

export default function EditSupplierModal({
  supplier,
  onSuccess,
}: EditSupplierModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    onSuccess?.();
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 hover:pointer transition"
      >
        编辑
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow max-w-lg w-full p-6 mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-black">编辑供应商</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-sm text-black hover:bg-gray-100 hover:pointer font-semibold rounded"
              >
                ×
              </button>
            </div>
            <SupplierForm
              initial={supplier}
              supplierId={supplier.id}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}
