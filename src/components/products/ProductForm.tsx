"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Brand, Product } from "@/types";

interface ProductFormProps {
  brands: Brand[];
  initial?: Partial<Product>;
  productId?: string | null;
  onSuccess?: () => void;
}

export default function ProductForm({
  brands,
  initial = {},
  productId,
  onSuccess,
}: ProductFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initial.product_name || "");
  const [spec, setSpec] = useState(initial.specification || "");
  const [desc, setDesc] = useState(initial.description || "");
  const [brandId, setBrandId] = useState<string>(
    initial.brand_id || brands[0]?.id || "",
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        product_name: name,
        specification: spec || null,
        description: desc || null,
        brand_id: brandId || null,
      };

      const url = `/api/products${productId ? `?id=${productId}` : ""}`;
      const method = productId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("请求失败");
      if (onSuccess) onSuccess();
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("操作失败，请检查控制台");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">名称</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">规格</label>
        <input
          value={spec}
          onChange={(e) => setSpec(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">描述</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">品牌</label>
        <select
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-200"
        >
          <option value="">无</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.brand_name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? "保存中..." : "保存"}
        </button>
      </div>
    </form>
  );
}
