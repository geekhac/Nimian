"use client";

import { useState } from "react";

interface PriceTier {
  min_qty: number;
  max_qty: number | null;
  price: number;
}

interface SupplyRecordFormProps {
  products: Array<{ id: string; product_name: string }>;
  suppliers: Array<{ id: number; supplier_name: string }>;
  initial?: {
    id?: string;
    product_id?: string;
    supplier_id?: number;
    price?: number;
    moq?: number;
    price_tiers?: PriceTier[] | null;
    has_authorization?: boolean;
    has_certification?: boolean;
    is_active?: boolean;
    delivery_days?: number;
    valid_from?: string;
    valid_until?: string;
    notes?: string;
  };
  recordId?: string;
  onSuccess?: () => void;
}

export default function SupplyRecordForm({
  products,
  suppliers,
  initial,
  recordId,
  onSuccess,
}: SupplyRecordFormProps) {
  const [formData, setFormData] = useState({
    product_id: initial?.product_id || "",
    supplier_id: initial?.supplier_id || "",
    price: initial?.price || 0,
    moq: initial?.moq || 1,
    has_authorization: initial?.has_authorization || false,
    has_certification: initial?.has_certification || false,
    is_active: initial?.is_active !== undefined ? initial.is_active : true,
    delivery_days: initial?.delivery_days || undefined,
    valid_from: initial?.valid_from || "",
    valid_until: initial?.valid_until || "",
    notes: initial?.notes || "",
  });

  const [priceTiers, setPriceTiers] = useState<PriceTier[]>(
    initial?.price_tiers || [
      { min_qty: initial?.moq || 1, max_qty: null, price: initial?.price || 0 },
    ],
  );
  const [showTierEditor, setShowTierEditor] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement;
    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: target.checked }));
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : Number(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addPriceTier = () => {
    const newTier: PriceTier = {
      min_qty: Math.max(...priceTiers.map((t) => t.min_qty)) + 1,
      max_qty: null,
      price: 0,
    };
    setPriceTiers([...priceTiers, newTier]);
  };

  const removePriceTier = (index: number) => {
    if (priceTiers.length > 1) {
      setPriceTiers(priceTiers.filter((_, i) => i !== index));
    }
  };

  const updatePriceTier = (
    index: number,
    field: keyof PriceTier,
    value: any,
  ) => {
    const updated = [...priceTiers];
    updated[index] = { ...updated[index], [field]: value };
    setPriceTiers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 验证价格阶梯
      const sortedTiers = [...priceTiers].sort((a, b) => a.min_qty - b.min_qty);
      for (let i = 0; i < sortedTiers.length - 1; i++) {
        if (
          sortedTiers[i].max_qty &&
          sortedTiers[i].max_qty! >= sortedTiers[i + 1].min_qty
        ) {
          throw new Error("价格阶梯重叠或不连续，请检查");
        }
      }

      const submitData = {
        ...formData,
        product_id: formData.product_id,
        supplier_id: Number(formData.supplier_id),
        price: Number(formData.price),
        moq: Number(formData.moq),
        price_tiers: priceTiers,
      };

      const method = recordId ? "PUT" : "POST";
      const url = recordId
        ? `/api/supply-records?id=${recordId}`
        : "/api/supply-records";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "操作失败");
      }

      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "操作失败，请重试");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">商品 *</label>
          <select
            name="product_id"
            value={formData.product_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">选择商品</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.product_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">供应商 *</label>
          <select
            name="supplier_id"
            value={formData.supplier_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">选择供应商</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.supplier_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 价格设置 */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium">价格阶梯 *</label>
          <button
            type="button"
            onClick={() => setShowTierEditor(!showTierEditor)}
            className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition"
          >
            {showTierEditor ? "隐藏编辑" : "编辑阶梯"}
          </button>
        </div>

        {!showTierEditor ? (
          <div className="bg-gray-50 rounded p-3 space-y-2">
            {priceTiers.map((tier, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-700">
                  {tier.min_qty}-{tier.max_qty ? `${tier.max_qty}` : "∞"} 件
                </span>
                <span className="font-semibold text-blue-600">
                  ¥{tier.price.toFixed(2)}/件
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 bg-gray-50 rounded p-3">
            {priceTiers.map((tier, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-2 items-end">
                <div>
                  <label className="text-xs text-gray-600">最小数量</label>
                  <input
                    type="number"
                    value={tier.min_qty}
                    onChange={(e) =>
                      updatePriceTier(idx, "min_qty", Number(e.target.value))
                    }
                    min="1"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">最大数量</label>
                  <input
                    type="number"
                    value={tier.max_qty || ""}
                    onChange={(e) =>
                      updatePriceTier(
                        idx,
                        "max_qty",
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                    min="1"
                    placeholder="不限"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">价格</label>
                  <input
                    type="number"
                    value={tier.price}
                    onChange={(e) =>
                      updatePriceTier(idx, "price", Number(e.target.value))
                    }
                    min="0"
                    step="0.01"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removePriceTier(idx)}
                  disabled={priceTiers.length === 1}
                  className="px-3 py-1 text-xs bg-red-100 text-red-600 hover:bg-red-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  删除
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addPriceTier}
              className="w-full px-3 py-1 text-xs bg-blue-100 text-blue-600 hover:bg-blue-200 rounded transition"
            >
              + 添加阶梯
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">最小订购量</label>
          <input
            type="number"
            name="moq"
            value={formData.moq}
            onChange={handleChange}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">交付天数</label>
          <input
            type="number"
            name="delivery_days"
            value={formData.delivery_days || ""}
            onChange={handleChange}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            默认价格（用于快速查询）
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">有效期开始</label>
          <input
            type="date"
            name="valid_from"
            value={formData.valid_from}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">有效期结束</label>
          <input
            type="date"
            name="valid_until"
            value={formData.valid_until}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="has_authorization"
            checked={formData.has_authorization}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm font-medium">有授权证书</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="has_certification"
            checked={formData.has_certification}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm font-medium">有认证证书</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm font-medium">启用此供应链</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">备注</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="输入备注信息"
        />
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="flex justify-end gap-2 pt-4 sticky bottom-0 bg-white">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isLoading ? "提交中..." : recordId ? "保存" : "新增"}
        </button>
      </div>
    </form>
  );
}
