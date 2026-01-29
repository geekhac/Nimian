// components/brands/ViewBrandModal.tsx
"use client";

import { X, Globe, Calendar, Tag, Package, Edit } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface Brand {
  id: string;
  brand_name: string;
  registered_location: string | null;
  core_category_focus: string[];
  created_at: string;
  updated_at: string;
}

interface ViewBrandModalProps {
  brand: Brand;
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewBrandModal({
  brand,
  isOpen,
  onClose,
}: ViewBrandModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy年MM月dd日 HH:mm", {
        locale: zhCN,
      });
    } catch {
      return dateString;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "今天";
    if (diffDays === 1) return "昨天";
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;
    return `${Math.floor(diffDays / 365)}年前`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {brand.brand_name}
              </h2>
              <p className="text-sm text-gray-500 mt-1">品牌详情</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          {/* 基本信息卡片 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">品牌ID</span>
                </div>
                <p className="font-mono text-sm text-gray-800 bg-white px-2 py-1 rounded border border-gray-200">
                  {brand.id}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">注册地区</span>
                </div>
                <p className="text-gray-900 font-medium">
                  {brand.registered_location || "未设置"}
                </p>
              </div>
            </div>
          </div>

          {/* 核心品类 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">核心品类</h3>
            <div className="flex flex-wrap gap-2">
              {brand.core_category_focus &&
              brand.core_category_focus.length > 0 ? (
                brand.core_category_focus.map((category, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                  >
                    <Tag className="w-3 h-3" />
                    {category}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-sm">暂无品类信息</p>
              )}
            </div>
            {brand.core_category_focus &&
              brand.core_category_focus.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  共 {brand.core_category_focus.length} 个核心品类
                </p>
              )}
          </div>

          {/* 时间信息 */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">时间信息</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">创建时间</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">
                    {formatDate(brand.created_at)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getTimeAgo(brand.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">最后更新</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">
                    {formatDate(brand.updated_at)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getTimeAgo(brand.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 统计信息（可选） */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">关联信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">0</p>
                <p className="text-xs text-gray-600 mt-1">关联商品</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">0</p>
                <p className="text-xs text-gray-600 mt-1">活跃供应商</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              数据统计功能需要数据库关联查询
            </p>
          </div>
        </div>

        {/* 底部操作按钮 */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
