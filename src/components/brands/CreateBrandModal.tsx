// components/brands/CreateBrandModal.tsx
"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

interface CreateBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// 品类选项
const CATEGORY_OPTIONS = [
  "护肤",
  "彩妆",
  "头发护理",
  "口腔护理",
  "身体护理",
  "母婴护理",
  "女性护理",
  "男士护理",
  "防晒",
  "香水",
];

export default function CreateBrandModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateBrandModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    brand_name: "",
    registered_location: "",
    core_category_focus: [] as string[],
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase
        .from("brands")
        .insert([
          {
            brand_name: formData.brand_name.trim(),
            registered_location: formData.registered_location.trim() || null,
            core_category_focus: formData.core_category_focus,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      onSuccess();
    } catch (err: any) {
      console.error("创建品牌失败:", err);
      setError(err.message || "创建品牌失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      core_category_focus: prev.core_category_focus.includes(category)
        ? prev.core_category_focus.filter((c) => c !== category)
        : [...prev.core_category_focus, category],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">新建品牌</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* 品牌名称 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              品牌名称 *
            </label>
            <input
              type="text"
              required
              value={formData.brand_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, brand_name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入品牌名称"
              disabled={loading}
            />
          </div>

          {/* 注册地区 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              注册地区
            </label>
            <input
              type="text"
              value={formData.registered_location}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  registered_location: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如：中国、美国、日本"
              disabled={loading}
            />
          </div>

          {/* 核心品类 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              核心品类
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    formData.core_category_focus.includes(category)
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                  }`}
                  disabled={loading}
                >
                  {category}
                </button>
              ))}
            </div>
            {formData.core_category_focus.length > 0 && (
              <div className="mt-3">
                <span className="text-sm text-gray-600">已选择: </span>
                <span className="text-sm font-medium text-blue-600">
                  {formData.core_category_focus.join(", ")}
                </span>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading || !formData.brand_name.trim()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  创建中...
                </>
              ) : (
                "创建品牌"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
