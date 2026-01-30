"use client";

import { useState } from "react";
import SupplierForm from "./SupplierForm";

interface CreateSupplierModalProps {
  onSuccess?: () => void;
}

export default function CreateSupplierModal({
  onSuccess,
}: CreateSupplierModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    onSuccess?.();
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        + 新增供应商
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow max-w-lg w-full p-6 mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">新增供应商</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                ×
              </button>
            </div>
            <SupplierForm onSuccess={handleSuccess} />
          </div>
        </div>
      )}
    </div>
  );
}
