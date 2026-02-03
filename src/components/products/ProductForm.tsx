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
  const initialBrandName =
    brands.find((b) => b.id === initial.brand_id)?.brand_name ||
    brands[0]?.brand_name ||
    "";
  const [brandName, setBrandName] = useState<string>(initialBrandName);
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

      // 尝试解析服务器返回的内容以便显示更精确的错误信息
      let bodyText = "";
      try {
        bodyText = await res.text();
      } catch (e) {
        console.error("读取响应体失败", e);
      }

      let parsed: any = null;
      try {
        parsed = bodyText ? JSON.parse(bodyText) : null;
      } catch (e) {
        // 非 JSON 响应，保留原始文本
        parsed = null;
      }

      if (!res.ok) {
        const serverMessage =
          parsed?.message ||
          parsed?.error ||
          bodyText ||
          `请求失败 (status=${res.status})`;
        console.error("提交商品失败:", {
          status: res.status,
          serverMessage,
          parsed,
        });
        alert(`操作失败：${serverMessage}`);
        throw new Error(serverMessage);
      }

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
          className="mt-1 block w-full rounded-md border-gray-200 text-gray-800 placeholder-gray-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">规格</label>
        <input
          value={spec}
          onChange={(e) => setSpec(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-200 text-gray-800 placeholder-gray-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">描述</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-200 text-gray-800 placeholder-gray-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">品牌</label>
        <input
          list="brands-list"
          value={brandName}
          onChange={(e) => {
            const val = e.target.value;
            setBrandName(val);
            const matched = brands.find((b) => b.brand_name === val);
            setBrandId(matched ? matched.id : "");
          }}
          placeholder="输入品牌名称可快速筛选"
          className="mt-1 block w-full rounded-md border-gray-200 text-gray-800 placeholder-gray-400"
        />
        <datalist id="brands-list">
          <option value="">无</option>
          {brands.map((b) => (
            <option key={b.id} value={b.brand_name} />
          ))}
        </datalist>
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
