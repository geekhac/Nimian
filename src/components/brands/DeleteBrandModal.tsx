// components/brands/DeleteBrandModal.tsx
"use client";

import { useState } from "react";
import { X, Loader2, AlertTriangle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

interface Brand {
  id: string;
  brand_name: string;
}

interface DeleteBrandModalProps {
  brand: Brand;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteBrandModal({
  brand,
  isOpen,
  onClose,
  onSuccess,
}: DeleteBrandModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmText !== brand.brand_name) {
      setError("请输入品牌名称以确认删除");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();

      // 先检查是否有商品关联
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id")
        .eq("brand_id", brand.id)
        .limit(1);

      if (productsError) throw productsError;

      if (products && products.length > 0) {
        throw new Error("该品牌下有关联商品，请先删除或转移商品后再删除品牌");
      }

      // 删除品牌
      const { error } = await supabase
        .from("brands")
        .delete()
        .eq("id", brand.id);

      if (error) throw error;

      onSuccess();
    } catch (err: any) {
      console.error("删除品牌失败:", err);
      setError(err.message || "删除品牌失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">删除品牌</h2>
              <p className="text-sm text-gray-500 mt-1">此操作不可逆</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 警告内容 */}
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700 font-medium mb-2">
              警告：您将要删除以下品牌
            </p>
            <p className="text-lg font-bold text-red-800">{brand.brand_name}</p>
            <p className="text-sm text-red-600 mt-2">
              删除后，所有与该品牌相关的数据将无法恢复。
            </p>
          </div>

          {/* 确认输入 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              请输入品牌名称{" "}
              <span className="font-medium">{brand.brand_name}</span> 以确认删除
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setError(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder={`输入 "${brand.brand_name}"`}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={loading}
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading || confirmText !== brand.brand_name}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  删除中...
                </>
              ) : (
                "确认删除"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
