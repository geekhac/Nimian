"use client";

import { useState } from "react";

interface SupplierFormProps {
  initial?: {
    id?: number;
    supplier_name?: string;
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
  supplierId?: string | number;
  onSuccess?: () => void;
}

const QUALIFICATION_TYPES = ["优质供应商", "合规供应商", "一般供应商"];

const SUPPLY_CHANNELS = [
  "总代",
  "一级代理",
  "合规 CS 供应链",
  "化妆品批发市场",
  "B2B平台",
  "ODM/OEM 代工厂",
  "品牌展会",
  "电商平台",
  "社群团购供应链",
  "跨境供应链",
  "尾货清仓渠道",
  "厂商直供",
];

const DELIVERY_SPEEDS = [
  "24小时内发货",
  "48小时内发货",
  "3天内发货",
  "5天内发货",
  "大于5天发货",
];

export default function SupplierForm({
  initial,
  supplierId,
  onSuccess,
}: SupplierFormProps) {
  const [formData, setFormData] = useState({
    supplier_name: initial?.supplier_name || "",
    registered_capital: initial?.registered_capital || 0,
    product_categories: initial?.product_categories?.join(",") || "",
    qualification_type: initial?.qualification_type || "合规供应商",
    supply_channel: initial?.supply_channel || "总代",
    channel_explanation: initial?.channel_explanation || "",
    total_orders: initial?.total_orders || 0,
    total_amount: initial?.total_amount || 0,
    problem_orders: initial?.problem_orders || 0,
    problem_amount: initial?.problem_amount || 0,
    delivery_speed: initial?.delivery_speed || "48小时内发货",
    product_quality: initial?.product_quality || 3,
    packaging: initial?.packaging || 3,
    region: initial?.region || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? 0 : Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const submitData = {
        ...formData,
        product_categories: formData.product_categories
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        registered_capital: Number(formData.registered_capital),
        total_orders: Number(formData.total_orders),
        total_amount: Number(formData.total_amount),
        problem_orders: Number(formData.problem_orders),
        problem_amount: Number(formData.problem_amount),
        product_quality: Number(formData.product_quality),
        packaging: Number(formData.packaging),
      };

      const method = supplierId ? "PUT" : "POST";
      const url = supplierId
        ? `/api/suppliers?id=${supplierId}`
        : "/api/suppliers";

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
      <div>
        <label className="block text-sm font-medium mb-1">供应商名称 *</label>
        <input
          type="text"
          name="supplier_name"
          value={formData.supplier_name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="输入供应商名称"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">注册资本</label>
          <input
            type="number"
            name="registered_capital"
            value={formData.registered_capital}
            onChange={handleNumericChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">地区</label>
          <input
            type="text"
            name="region"
            value={formData.region}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入地区"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          产品分类（逗号分隔）
        </label>
        <input
          type="text"
          name="product_categories"
          value={formData.product_categories}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="如：面膜,护肤品,彩妆"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">资质类型</label>
          <select
            name="qualification_type"
            value={formData.qualification_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {QUALIFICATION_TYPES.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">供应渠道</label>
          <select
            name="supply_channel"
            value={formData.supply_channel}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SUPPLY_CHANNELS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">渠道说明</label>
        <textarea
          name="channel_explanation"
          value={formData.channel_explanation}
          onChange={handleChange}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="输入渠道说明"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">送货速度</label>
          <select
            name="delivery_speed"
            value={formData.delivery_speed}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {DELIVERY_SPEEDS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            产品质量（1-5）
          </label>
          <input
            type="number"
            name="product_quality"
            min="1"
            max="5"
            value={formData.product_quality}
            onChange={handleNumericChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            包装质量（1-5）
          </label>
          <input
            type="number"
            name="packaging"
            min="1"
            max="5"
            value={formData.packaging}
            onChange={handleNumericChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium mb-4">订单统计</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">总订单数</label>
            <input
              type="number"
              name="total_orders"
              value={formData.total_orders}
              onChange={handleNumericChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">总金额</label>
            <input
              type="number"
              name="total_amount"
              value={formData.total_amount}
              onChange={handleNumericChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">问题订单数</label>
            <input
              type="number"
              name="problem_orders"
              value={formData.problem_orders}
              onChange={handleNumericChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">问题金额</label>
            <input
              type="number"
              name="problem_amount"
              value={formData.problem_amount}
              onChange={handleNumericChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="flex justify-end gap-2 pt-4 sticky bottom-0 bg-white">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isLoading ? "提交中..." : supplierId ? "保存" : "新增"}
        </button>
      </div>
    </form>
  );
}
