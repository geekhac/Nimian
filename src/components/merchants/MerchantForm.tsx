"use client";

import { useState, useEffect } from "react";
import { Merchant } from "@/types/merchant";

interface MerchantFormProps {
  merchant?: Merchant | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MerchantForm({
  merchant,
  onSuccess,
  onCancel,
}: MerchantFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nickname: "",
    contact: "",
    total_orders: 0,
    total_amount: 0,
    problematic_orders: 0,
    problematic_amount: 0,
    joined_at: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (merchant) {
      setFormData({
        nickname: merchant.nickname,
        contact: merchant.contact,
        total_orders: merchant.total_orders,
        total_amount: merchant.total_amount,
        problematic_orders: merchant.problematic_orders,
        problematic_amount: merchant.problematic_amount,
        joined_at: new Date(merchant.joined_at).toISOString().split("T")[0],
      });
    }
  }, [merchant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = merchant
        ? `/api/merchants?id=${merchant.id}`
        : "/api/merchants";
      const method = merchant ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error("保存失败:", error);
    }

    setLoading(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name.includes("amount") || name.includes("orders")
          ? Number(value) || 0
          : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {merchant ? "编辑商家" : "添加商家"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                商家昵称 *
              </label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                联系方式 *
              </label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  总成交单量
                </label>
                <input
                  type="number"
                  name="total_orders"
                  value={formData.total_orders}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  总成交金额
                </label>
                <input
                  type="number"
                  name="total_amount"
                  value={formData.total_amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  问题单量
                </label>
                <input
                  type="number"
                  name="problematic_orders"
                  value={formData.problematic_orders}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  问题金额
                </label>
                <input
                  type="number"
                  name="problematic_amount"
                  value={formData.problematic_amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                加入日期 *
              </label>
              <input
                type="date"
                name="joined_at"
                value={formData.joined_at}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "处理中..." : merchant ? "更新" : "添加"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
