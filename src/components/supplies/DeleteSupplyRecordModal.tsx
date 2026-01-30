"use client";

import { useState } from "react";

interface DeleteSupplyRecordModalProps {
  record: {
    id: string;
    products?: { product_name: string };
    supplier_assessment?: { supplier_name: string };
  };
  onSuccess?: () => void;
}

export default function DeleteSupplyRecordModal({
  record,
  onSuccess,
}: DeleteSupplyRecordModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/supply-records?id=${record.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("删除失败");
      setIsOpen(false);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert("删除失败，请查看控制台");
    } finally {
      setIsLoading(false);
    }
  };

  const productName = (record.products as any)?.product_name || "未知商品";
  const supplierName =
    (record.supplier_assessment as any)?.supplier_name || "未知供应商";

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1 text-sm rounded bg-red-50 text-red-600 hover:bg-red-100 transition"
      >
        删除
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow max-w-md w-full p-6 mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">确认删除</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              确定要删除「{productName}」由「{supplierName}
              」供应的供应链吗？此操作不可恢复。
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 transition"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
              >
                {isLoading ? "删除中..." : "删除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
