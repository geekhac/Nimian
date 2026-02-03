"use client";

import { useState } from "react";
import SupplyRecordForm from "./SupplyRecordForm";

interface CreateSupplyRecordModalProps {
  products: Array<{ id: string; product_name: string }>;
  suppliers: Array<{ id: number; supplier_name: string }>;
  onSuccess?: () => void;
}

export default function CreateSupplyRecordModal({
  products,
  suppliers,
  onSuccess,
}: CreateSupplyRecordModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    onSuccess?.();
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer hover:pointer transition"
      >
        + 新增供应链
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow max-w-lg w-full p-6 mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-black">新增供应链</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-sm text-black hover:bg-gray-100 cursor-pointer hover:pointer font-semibold rounded"
              >
                ×
              </button>
            </div>
            <SupplyRecordForm
              products={products}
              suppliers={suppliers}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}
