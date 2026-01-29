// components/brands/BrandsTable.tsx
"use client";

import { useState } from "react";
import {
  Edit2,
  Trash2,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  Globe,
} from "lucide-react";
import EditBrandModal from "./EditBrandModal";
import DeleteBrandModal from "./DeleteBrandModal";
import ViewBrandModal from "./ViewBrandModal";

interface Brand {
  id: string;
  brand_name: string;
  registered_location: string | null;
  core_category_focus: string[];
  created_at: string;
  updated_at: string;
}

interface BrandsTableProps {
  brands: Brand[];
}

export default function BrandsTable({ brands }: BrandsTableProps) {
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setEditModalOpen(true);
    setActiveDropdown(null);
  };

  const handleDelete = (brand: Brand) => {
    setSelectedBrand(brand);
    setDeleteModalOpen(true);
    setActiveDropdown(null);
  };

  const handleView = (brand: Brand) => {
    setSelectedBrand(brand);
    setViewModalOpen(true);
    setActiveDropdown(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (brands.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-gray-400 mb-4">
          <Package className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无品牌数据</h3>
        <p className="text-gray-600 mb-6">
          点击右上角的"新建品牌"按钮添加第一个品牌
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  品牌名称
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  注册地区
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  核心品类
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  创建时间
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  状态
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {brands.map((brand) => (
                <tr key={brand.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-lg">
                          {brand.brand_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {brand.brand_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {brand.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {brand.registered_location || "未设置"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {brand.core_category_focus
                        ?.slice(0, 3)
                        .map((category, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {category}
                          </span>
                        ))}
                      {brand.core_category_focus?.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{brand.core_category_focus.length - 3}
                        </span>
                      )}
                      {(!brand.core_category_focus ||
                        brand.core_category_focus.length === 0) && (
                        <span className="text-sm text-gray-500">未设置</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(brand.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      正常
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === brand.id ? null : brand.id,
                          )
                        }
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>

                      {activeDropdown === brand.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                          <div className="py-1">
                            <button
                              onClick={() => handleView(brand)}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              查看详情
                            </button>
                            <button
                              onClick={() => handleEdit(brand)}
                              className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              编辑品牌
                            </button>
                            <button
                              onClick={() => handleDelete(brand)}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              删除品牌
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 模态框 */}
      {selectedBrand && (
        <>
          <ViewBrandModal
            brand={selectedBrand}
            isOpen={viewModalOpen}
            onClose={() => setViewModalOpen(false)}
          />
          <EditBrandModal
            brand={selectedBrand}
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSuccess={() => {
              setEditModalOpen(false);
              window.location.reload();
            }}
          />
          <DeleteBrandModal
            brand={selectedBrand}
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onSuccess={() => {
              setDeleteModalOpen(false);
              window.location.reload();
            }}
          />
        </>
      )}
    </>
  );
}
