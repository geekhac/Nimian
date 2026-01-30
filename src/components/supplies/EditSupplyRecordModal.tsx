"use client";

import { useState } from "react";
import SupplyRecordForm from "./SupplyRecordForm";

interface EditSupplyRecordModalProps {
  record: {
    id: string;
    product_id: string;
    supplier_id: number;
    price: number;
    moq: number;
    has_authorization?: boolean;
    has_certification?: boolean;
    is_active?: boolean;
    delivery_days?: number;
    valid_from?: string;
    valid_until?: string;
    notes?: string;
  };
  products: Array<{ id: string; product_name: string }>;
  suppliers: Array<{ id: number; supplier_name: string }>;
  onSuccess?: () => void;
}

export default function EditSupplyRecordModal({
  record,
  products,
  suppliers,
  onSuccess,
}: EditSupplyRecordModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    onSuccess?.();
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 transition"
      >
        编辑
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow max-w-lg w-full p-6 mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">编辑供应链</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                ×
              </button>
            </div>
            <SupplyRecordForm
              products={products}
              suppliers={suppliers}
              initial={record}
              recordId={record.id}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}
