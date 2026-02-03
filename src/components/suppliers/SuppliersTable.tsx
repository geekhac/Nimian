"use client";

import { useState, useMemo } from "react";
import { Truck, MapPin, Copy, Check } from "lucide-react";
import EditSupplierModal from "./EditSupplierModal";
import DeleteSupplierModal from "./DeleteSupplierModal";

interface Supplier {
  id: number;
  supplier_name: string;
  registered_capital?: number;
  product_categories?: string[];
  qualification_type?: string;
  supply_channel?: string;
  delivery_speed?: string;
  product_quality?: number;
  packaging?: number;
  total_orders?: number;
  problem_orders?: number;
  region?: string;
  supplier_link?: string | null;
  created_at?: string;
}

interface SuppliersTableProps {
  suppliers: Supplier[];
  onRefresh?: () => void;
}

export default function SuppliersTable({
  suppliers,
  onRefresh,
}: SuppliersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedSupplier, setCopiedSupplier] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      // 优先使用现代 clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // 降级到传统方法
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedSupplier(text);
      setTimeout(() => setCopiedSupplier(null), 2000);
    } catch (err) {
      console.error("复制失败:", err);
      // 最后的降级方案：显示文本让用户手动复制
      alert(`复制失败，请手动复制：${text}`);
    }
  };

  const filteredSuppliers = useMemo(() => {
    if (!searchTerm) return suppliers;
    return suppliers.filter((s) =>
      s.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [suppliers, searchTerm]);

  const handleRefresh = () => {
    onRefresh?.();
  };

  if (suppliers.length === 0) {
    return (
      <div className="text-center py-12">
        <Truck className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无供应商</h3>
        <p className="text-gray-600">点击"新增供应商"创建第一个供应商</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 搜索栏 */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="搜索供应商名称..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
        />
      </div>

      {/* 供应商列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                  <Truck className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {supplier.supplier_link ? (
                      <a
                        href={supplier.supplier_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-green-600 hover:text-green-800 hover:underline truncate cursor-pointer hover:pointer transition"
                        title={supplier.supplier_name}
                      >
                        {supplier.supplier_name}
                      </a>
                    ) : (
                      <h3 className="font-semibold text-gray-900 truncate">
                        {supplier.supplier_name}
                      </h3>
                    )}
                    <button
                      onClick={() => copyToClipboard(supplier.supplier_name)}
                      className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer hover:pointer transition flex-shrink-0"
                      title="复制供应商名称"
                    >
                      {copiedSupplier === supplier.supplier_name ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {supplier.supply_channel || "未指定"}
                  </p>
                </div>
              </div>
            </div>

            {/* 详情信息 */}
            <div className="space-y-2 mb-4">
              {supplier.region && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{supplier.region}</span>
                </div>
              )}
              {(() => {
                const validQualifications = [
                  "优质供应商",
                  "合规供应商",
                  "一般供应商",
                ];
                const qualification = supplier.qualification_type;
                const isValidQualification =
                  qualification && validQualifications.includes(qualification);

                if (isValidQualification) {
                  return (
                    <div className="text-xs text-gray-600">
                      <strong>资质：</strong> {qualification}
                    </div>
                  );
                } else if (qualification) {
                  // 如果有值但不在有效列表中，显示为未设置
                  return (
                    <div className="text-xs text-gray-600">
                      <strong>资质：</strong> 未设置
                    </div>
                  );
                }
                return null;
              })()}
              {supplier.delivery_speed && (
                <div className="text-xs text-gray-600">
                  <strong>送货：</strong> {supplier.delivery_speed}
                </div>
              )}
              {supplier.product_quality !== undefined && (
                <div className="text-xs text-gray-600">
                  <strong>商品：</strong>
                  <span className="ml-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < Number(supplier.product_quality)
                            ? "text-orange-400"
                            : "text-gray-300"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </span>
                </div>
              )}
              {supplier.packaging !== undefined && (
                <div className="text-xs text-gray-600">
                  <strong>包装：</strong>
                  <span className="ml-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < Number(supplier.packaging)
                            ? "text-orange-400"
                            : "text-gray-300"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </span>
                </div>
              )}
              {supplier.total_orders !== undefined && (
                <div className="text-xs text-gray-600">
                  <strong>订单数：</strong> {supplier.total_orders}
                </div>
              )}
            </div>

            {supplier.product_categories &&
              supplier.product_categories.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1">
                  {supplier.product_categories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs bg-orange-50 text-orange-700 rounded"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}

            {/* 操作按钮 */}
            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <EditSupplierModal
                supplier={supplier}
                onSuccess={handleRefresh}
              />
              <DeleteSupplierModal
                supplier={supplier}
                onSuccess={handleRefresh}
              />
            </div>
          </div>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          没有找到匹配的供应商
        </div>
      )}
    </div>
  );
}
