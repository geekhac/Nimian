"use client";

import { useState } from "react";
import MerchantForm from "./MerchantForm";
import { Merchant } from "@/types/merchant";

interface MerchantTableProps {
  initialMerchants: Merchant[];
}

export default function MerchantTable({
  initialMerchants,
}: MerchantTableProps) {
  const [merchants, setMerchants] = useState(initialMerchants);
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 刷新数据
  const refreshData = async () => {
    setLoading(true);
    const res = await fetch("/api/merchants");
    const data = await res.json();
    setMerchants(data);
    setLoading(false);
  };

  // 删除商家
  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个商家吗？")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/merchants?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error("删除失败:", error);
    }
    setLoading(false);
  };

  // 编辑商家
  const handleEdit = (merchant: Merchant) => {
    setEditingMerchant(merchant);
    setIsFormOpen(true);
  };

  // 添加商家
  const handleAdd = () => {
    setEditingMerchant(null);
    setIsFormOpen(true);
  };

  // 表单提交成功回调
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingMerchant(null);
    refreshData();
  };

  return (
    <div className="space-y-6">
      {/* 顶部工具栏 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">商家信息管理</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          添加商家
        </button>
      </div>

      {/* 商家表单弹窗 */}
      {isFormOpen && (
        <MerchantForm
          merchant={editingMerchant}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingMerchant(null);
          }}
        />
      )}

      {/* 数据表格 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    商家昵称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    联系方式
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    总成交单量
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    总成交金额
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    问题单量
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    加入时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {merchants.map((merchant) => (
                  <tr key={merchant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {merchant.nickname}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {merchant.contact}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {merchant.total_orders}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      ¥{merchant.total_amount.toLocaleString("zh-CN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                        {merchant.problematic_orders}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(merchant.joined_at).toLocaleDateString("zh-CN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(merchant)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(merchant.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 统计数据 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">商家总数</h3>
          <p className="text-2xl font-bold mt-2">{merchants.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">总成交金额</h3>
          <p className="text-2xl font-bold mt-2">
            ¥
            {merchants
              .reduce((sum, m) => sum + m.total_amount, 0)
              .toLocaleString("zh-CN")}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">总成交单量</h3>
          <p className="text-2xl font-bold mt-2">
            {merchants.reduce((sum, m) => sum + m.total_orders, 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">总问题单量</h3>
          <p className="text-2xl font-bold mt-2 text-orange-600">
            {merchants.reduce((sum, m) => sum + m.problematic_orders, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
