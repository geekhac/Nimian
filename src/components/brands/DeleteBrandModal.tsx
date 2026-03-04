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

  // 重置状态当弹框关闭时
  const handleClose = () => {
    if (!loading) {
      setError(null);
      setConfirmText("");
      onClose();
    }
  };

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

      // 检查是否有商品关联
      console.log("检查品牌关联商品，品牌ID:", brand.id);
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, product_name")
        .eq("brand_id", brand.id);

      if (productsError) {
        console.error("查询关联商品失败:", productsError);
        throw new Error(`查询关联商品失败: ${productsError.message}`);
      }

      console.log("查询到的关联商品:", products);

      // 如果有关联商品，先将其归类为无品牌
      if (products && products.length > 0) {
        console.log(`发现 ${products.length} 个关联商品，正在转移为无品牌...`);
        console.log("商品列表:", products);

        // 查找或创建"无品牌"品牌记录
        const { data: noBrandData, error: noBrandError } = await supabase
          .from("brands")
          .select("id")
          .eq("brand_name", "无品牌")
          .single();

        let noBrandId: string;

        if (noBrandError || !noBrandData) {
          console.log("未找到'无品牌'记录，正在创建...");
          // 如果没有"无品牌"记录，创建一个
          const { data: newBrandData, error: createError } = await supabase
            .from("brands")
            .insert([{ brand_name: "无品牌" }])
            .select("id")
            .single();

          if (createError || !newBrandData) {
            console.error("创建'无品牌'记录失败:", createError);
            throw new Error("无法创建'无品牌'记录，请重试");
          }

          noBrandId = newBrandData.id;
          console.log("成功创建'无品牌'记录，ID:", noBrandId);
        } else {
          noBrandId = noBrandData.id;
          console.log("找到'无品牌'记录，ID:", noBrandId);
        }

        // 将关联商品转移到"无品牌"
        const { error: updateError } = await supabase
          .from("products")
          .update({ brand_id: noBrandId })
          .eq("brand_id", brand.id);

        if (updateError) {
          console.error("转移商品失败，详细信息:", {
            error: updateError,
            brandId: brand.id,
            brandName: brand.brand_name,
            productsFound: products.length,
            products: products,
            noBrandId: noBrandId,
          });
          throw new Error(
            `转移关联商品失败: ${updateError.message || "未知错误"}`,
          );
        }

        console.log("关联商品已成功转移为无品牌");

        // 显示商品转移成功信息
        if (window.toast) {
          window.toast.success(
            `品牌"${brand.brand_name}"删除成功，关联商品已归类为"无品牌"`,
          );
        }
      } else {
        // 显示普通删除成功信息
        if (window.toast) {
          window.toast.success(`品牌"${brand.brand_name}"删除成功`);
        }
      }

      // 删除品牌
      const { error } = await supabase
        .from("brands")
        .delete()
        .eq("id", brand.id);

      if (error) throw error;

      // 成功删除后重置状态并关闭
      setError(null);
      setConfirmText("");
      onSuccess();
    } catch (err: any) {
      console.error("删除品牌失败，详细信息:", {
        error: err,
        brandId: brand.id,
        brandName: brand.brand_name,
        errorMessage: err.message,
        errorStack: err.stack,
      });
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
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 警告内容 */}
        <div className="p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-700 font-medium mb-2">
              注意：您将要删除以下品牌
            </p>
            <p className="text-lg font-bold text-amber-800">
              {brand.brand_name}
            </p>
            <p className="text-sm text-amber-600 mt-2">
              如果该品牌下有关联商品，它们将自动归类为"无品牌"。
            </p>
            <p className="text-sm text-amber-600 mt-1">
              删除后，品牌信息将无法恢复。
            </p>
          </div>

          {/* 确认输入 */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              请输入品牌名称{" "}
              <span className="font-bold text-red-600">{brand.brand_name}</span>{" "}
              以确认删除
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setError(null);
              }}
              className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-700 font-medium text-base shadow-sm"
              placeholder={`请准确输入 "${brand.brand_name}"`}
              disabled={loading}
            />
            <p className="text-sm text-gray-800 mt-3 font-medium bg-gray-50 p-2 rounded">
              ⚠️ 请准确输入品牌名称以确认删除操作
            </p>
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
              onClick={handleClose}
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
