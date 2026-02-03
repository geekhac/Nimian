"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  productId: string;
  productName?: string;
}

export default function DeleteProductButton({ productId, productName }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?id=${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("删除失败");
      setOpen(false);
      router.push("/products");
    } catch (err) {
      console.error(err);
      alert("删除失败，请查看控制台");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 hover:pointer"
      >
        删除
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-4">确认删除</h3>
            <p className="text-sm text-gray-600 mb-4">
              确定要删除「{productName}」吗？此操作不可恢复。
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1 rounded border hover:pointer hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 hover:pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "删除中..." : "删除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
