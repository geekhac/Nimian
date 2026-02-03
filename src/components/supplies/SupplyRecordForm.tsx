"use client";

import { useState, useEffect, useRef } from "react";

interface PriceTier {
  min_qty: number | string;
  max_qty: number | null | string;
  price: number | string;
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
    price: initial?.price?.toString() || "0",
    moq: initial?.moq?.toString() || "1",
    has_authorization: initial?.has_authorization || false,
    has_certification: initial?.has_certification || false,
    is_active: initial?.is_active !== undefined ? initial.is_active : true,
    delivery_days: initial?.delivery_days?.toString() || "3",
    valid_from: initial?.valid_from || new Date().toISOString().split("T")[0],
    valid_until:
      initial?.valid_until ||
      new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    notes: initial?.notes || "",
  });

  const [priceTiers, setPriceTiers] = useState<PriceTier[]>(
    initial?.price_tiers || [],
  );
  const [showTierEditor, setShowTierEditor] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 搜索状态
  const [productSearch, setProductSearch] = useState(() => {
    const selectedProduct = products.find((p) => p.id === initial?.product_id);
    return selectedProduct?.product_name || "";
  });
  const [supplierSearch, setSupplierSearch] = useState(() => {
    const selectedSupplier = suppliers.find(
      (s) => s.id === initial?.supplier_id,
    );
    return selectedSupplier?.supplier_name || "";
  });

  // 下拉框显示状态
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);

  // 过滤逻辑
  const filteredProducts =
    productSearch === ""
      ? products
      : products.filter((p) =>
          p.product_name.toLowerCase().includes(productSearch.toLowerCase()),
        );

  const filteredSuppliers =
    supplierSearch === ""
      ? suppliers
      : suppliers.filter((s) =>
          s.supplier_name.toLowerCase().includes(supplierSearch.toLowerCase()),
        );

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".search-dropdown")) {
        setShowProductDropdown(false);
        setShowSupplierDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        [name]: value === "" ? "" : Number(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addPriceTier = () => {
    const sortedTiers = [...priceTiers].sort(
      (a, b) => Number(a.min_qty) - Number(b.min_qty),
    );
    let newMinQty: number;

    if (sortedTiers.length === 0) {
      newMinQty = 1;
    } else {
      const lastTier = sortedTiers[sortedTiers.length - 1];
      newMinQty = lastTier.max_qty
        ? Number(lastTier.max_qty) + 1
        : Number(lastTier.min_qty) + 1;
    }

    const newTier: PriceTier = {
      min_qty: String(newMinQty),
      max_qty: null,
      price: "0",
    };
    setPriceTiers([...priceTiers, newTier]);
  };

  const removePriceTier = (index: number) => {
    // 允许删除所有阶梯，因为有基础价格兜底
    setPriceTiers(priceTiers.filter((_, i) => i !== index));
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
      const sortedTiers = [...priceTiers].sort(
        (a, b) => Number(a.min_qty) - Number(b.min_qty),
      );

      // 检查每个阶梯的起始数量是否为前一个阶梯结束数量+1
      for (let i = 0; i < sortedTiers.length; i++) {
        const currentTier = sortedTiers[i];

        // 检查最小数量必须大于0
        if (Number(currentTier.min_qty) <= 0) {
          throw new Error(`第 ${i + 1} 个阶梯的最小数量必须大于0`);
        }

        // 检查价格必须大于0
        if (Number(currentTier.price) <= 0) {
          throw new Error(`第 ${i + 1} 个阶梯的价格必须大于0`);
        }

        // 检查阶梯连续性
        if (i > 0) {
          const prevTier = sortedTiers[i - 1];
          const expectedMinQty = prevTier.max_qty
            ? Number(prevTier.max_qty) + 1
            : Number(prevTier.min_qty) + 1;

          if (Number(currentTier.min_qty) !== expectedMinQty) {
            throw new Error(
              `第 ${i + 1} 个阶梯的起始数量必须为 ${expectedMinQty}（上一个阶梯结束数量+1），当前为 ${Number(currentTier.min_qty)}`,
            );
          }
        }

        // 检查阶梯重叠
        if (
          currentTier.max_qty &&
          Number(currentTier.max_qty) < Number(currentTier.min_qty)
        ) {
          throw new Error(`第 ${i + 1} 个阶梯的最大数量不能小于最小数量`);
        }
      }

      // 处理阶梯价格中的空值
      const processedPriceTiers = priceTiers
        .map((tier) => ({
          ...tier,
          min_qty: tier.min_qty === "" ? 0 : Number(tier.min_qty),
          max_qty: tier.max_qty === "" ? null : tier.max_qty,
          price: tier.price === "" ? 0 : Number(tier.price),
        }))
        .filter((tier) => tier.min_qty > 0 && tier.price > 0);

      const submitData = {
        ...formData,
        product_id: formData.product_id,
        supplier_id: Number(formData.supplier_id),
        price: formData.price === "" ? 0 : Number(formData.price),
        moq: formData.moq === "" ? 1 : Number(formData.moq),
        delivery_days:
          formData.delivery_days === "" ? null : Number(formData.delivery_days),
        price_tiers:
          processedPriceTiers.length > 0 ? processedPriceTiers : null,
        valid_from: formData.valid_from || null,
        valid_until: formData.valid_until || null,
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
          <label className="block text-sm font-medium mb-1 text-gray-900">
            商品 *
          </label>
          <div className="relative search-dropdown">
            <input
              type="text"
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setShowProductDropdown(true);
              }}
              onFocus={() => {
                setShowProductDropdown(true);
              }}
              placeholder="搜索商品..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            />
            {showProductDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, product_id: p.id }));
                        setProductSearch(p.product_name);
                        setShowProductDropdown(false);
                      }}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-900"
                    >
                      {p.product_name}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500">
                    未找到匹配的商品
                  </div>
                )}
              </div>
            )}
          </div>
          {/* 隐藏的输入框用于表单提交 */}
          <input
            type="hidden"
            name="product_id"
            value={formData.product_id}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900">
            供应商 *
          </label>
          <div className="relative search-dropdown">
            <input
              type="text"
              value={supplierSearch}
              onChange={(e) => {
                setSupplierSearch(e.target.value);
                setShowSupplierDropdown(true);
              }}
              onFocus={() => {
                setShowSupplierDropdown(true);
              }}
              placeholder="搜索供应商..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            />
            {showSupplierDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, supplier_id: s.id }));
                        setSupplierSearch(s.supplier_name);
                        setShowSupplierDropdown(false);
                      }}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-900"
                    >
                      {s.supplier_name}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500">
                    未找到匹配的供应商
                  </div>
                )}
              </div>
            )}
          </div>
          {/* 隐藏的输入框用于表单提交 */}
          <input
            type="hidden"
            name="supplier_id"
            value={formData.supplier_id}
            required
          />
        </div>
      </div>

      {/* 价格设置 */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="block text-sm font-medium mb-1 text-sm font-medium mb-1 text-gray-900">
              阶梯价格配置
            </label>
            <p className="text-xs text-gray-500">
              可选设置，根据订购数量提供不同价格（如：5起28，10起26）
            </p>
            <p className="text-xs text-blue-600 mt-1">
              💡 提示：阶梯价格必须连续，下一个阶梯的起始数量 =
              上一个阶梯结束数量 + 1。可以删除所有阶梯，使用基础价格兜底。
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowTierEditor(!showTierEditor)}
            className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 hover:pointer transition"
          >
            {showTierEditor ? "隐藏编辑" : "编辑阶梯"}
          </button>
        </div>

        {!showTierEditor ? (
          <div className="bg-gray-50 rounded p-3">
            {priceTiers.length > 0 ? (
              <div className="space-y-2">
                {priceTiers.map((tier, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-700">
                      {tier.min_qty}-{tier.max_qty ? `${tier.max_qty}` : "∞"} 件
                    </span>
                    <span className="font-semibold text-blue-600">
                      ¥{Number(tier.price).toFixed(2)}/件
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 text-sm py-2">
                未设置阶梯价格，所有订单使用基础价格
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 bg-gray-50 rounded p-3">
            {priceTiers.map((tier, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-2 items-end">
                <div>
                  <label className="text-xs text-sm font-medium mb-1 text-gray-900">
                    最小数量
                  </label>
                  <input
                    type="number"
                    value={tier.min_qty}
                    onChange={(e) =>
                      updatePriceTier(
                        idx,
                        "min_qty",
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    min="1"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-sm font-medium mb-1 text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-sm font-medium mb-1 text-gray-900">
                    最大数量
                  </label>
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
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-sm font-medium mb-1 text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-sm font-medium mb-1 text-gray-900">
                    价格
                  </label>
                  <input
                    type="number"
                    value={tier.price}
                    onChange={(e) =>
                      updatePriceTier(
                        idx,
                        "price",
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    min="0"
                    step="0.01"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-sm font-medium mb-1 text-gray-900 placeholder-gray-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removePriceTier(idx)}
                  className="px-3 py-1 text-xs bg-red-100 text-red-600 hover:bg-red-200 rounded hover:pointer"
                >
                  删除
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addPriceTier}
              className="w-full px-3 py-1 text-xs bg-blue-100 text-blue-600 hover:bg-blue-200 rounded transition hover:pointer"
            >
              + 添加阶梯
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900">
            最小订购量
          </label>
          <input
            type="number"
            name="moq"
            value={formData.moq}
            onChange={handleChange}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium mb-1 text-gray-900 placeholder-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900">
            交付天数
          </label>
          <input
            type="number"
            name="delivery_days"
            value={formData.delivery_days || ""}
            onChange={handleChange}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium mb-1 text-gray-900 placeholder-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900">
            价格（默认单价）*
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            未达到阶梯价格时的默认单价
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900">
            有效期开始
          </label>
          <input
            type="date"
            name="valid_from"
            value={formData.valid_from}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium mb-1 text-gray-900 placeholder-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900">
            有效期结束
          </label>
          <input
            type="date"
            name="valid_until"
            value={formData.valid_until}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium mb-1 text-gray-900 placeholder-gray-500"
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
          <span className="text-sm font-medium text-gray-900">有授权证书</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="has_certification"
            checked={formData.has_certification}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm font-medium text-gray-900">有认证证书</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm font-medium text-gray-900">
            启用此供应链
          </span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-900">
          备注
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium mb-1 text-gray-900 placeholder-gray-500"
          placeholder="输入备注信息"
        />
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="flex justify-end gap-2 pt-4 sticky bottom-0 bg-white">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 hover:pointer disabled:cursor-not-allowed"
        >
          {isLoading ? "提交中..." : recordId ? "保存" : "新增"}
        </button>
      </div>
    </form>
  );
}
