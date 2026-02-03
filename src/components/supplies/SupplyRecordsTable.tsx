"use client";

import { useState, useMemo } from "react";
import { Package, Truck } from "lucide-react";
import EditSupplyRecordModal from "./EditSupplyRecordModal";
import DeleteSupplyRecordModal from "./DeleteSupplyRecordModal";

interface SupplyRecord {
  id: string;
  product_id: string;
  supplier_id: number;
  price: number;
  moq: number;
  price_tiers?: Array<{
    min_qty: number;
    max_qty: number | null;
    price: number;
  }> | null;
  has_authorization?: boolean;
  has_certification?: boolean;
  is_active?: boolean;
  delivery_days?: number;
  valid_from?: string;
  valid_until?: string;
  notes?: string;
  products?: { id: string; product_name: string };
  supplier_assessment?: { id: number; supplier_name: string };
}

interface SupplyRecordsTableProps {
  records: SupplyRecord[];
  products: Array<{ id: string; product_name: string }>;
  suppliers: Array<{ id: number; supplier_name: string }>;
  onRefresh?: () => void;
}

export default function SupplyRecordsTable({
  records,
  products,
  suppliers,
  onRefresh,
}: SupplyRecordsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "product" | "supplier">(
    "all",
  );

  const filteredRecords = useMemo(() => {
    let result = records;

    if (searchTerm) {
      result = result.filter((r) => {
        const product = r.products as any;
        const brand = product?.brands?.brand_name;
        const productName = product?.product_name || "";
        const displayName = brand ? `${brand} ${productName}` : productName;
        const supplierName =
          (r.supplier_assessment as any)?.supplier_name || "";
        return (
          displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplierName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    return result;
  }, [records, searchTerm]);

  // 按商品分组，显示每个商品的所有供应商
  const groupedRecords = useMemo(() => {
    const groups: { [key: string]: typeof records } = {};

    filteredRecords.forEach((record) => {
      const product = record.products as any;
      const brand = product?.brands?.brand_name;
      const productName = product?.product_name || "";
      const displayName = brand ? `${brand} ${productName}` : productName;
      const key = `${record.product_id}_${displayName}`;

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(record);
    });

    return groups;
  }, [filteredRecords]);

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无供应链</h3>
        <p className="text-gray-600">点击"新增供应链"创建第一个供应链</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 搜索栏 */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="搜索商品名称或供应商..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
        />
      </div>

      {/* 供应链列表 - 分组显示 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                商品
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                供应商
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                价格
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                最小订购量
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                交付天数
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                授权
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                资质证书
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                状态
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedRecords).map(
              ([productKey, productRecords]) => {
                const product = productRecords[0].products as any;
                const brand = product?.brands?.brand_name;
                const productName = product?.product_name || "未知";
                const displayName = brand
                  ? `${brand} ${productName}`
                  : productName;
                const supplierCount = productRecords.length;

                return productRecords.map((record, idx) => (
                  <tr
                    key={record.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {idx === 0 && (
                        <div className="flex items-center gap-2">
                          <span>{displayName}</span>
                          {supplierCount > 1 && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                              {supplierCount}个供应商
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {(record.supplier_assessment as any)?.supplier_name ||
                        "未知"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {(() => {
                        // Debug: log the price data
                        console.log("Record price data:", {
                          id: record.id,
                          price: record.price,
                          price_tiers: record.price_tiers,
                          tiers_length: record.price_tiers?.length,
                          is_array: Array.isArray(record.price_tiers),
                        });

                        // Check if there are valid price tiers (price > 0)
                        const validPriceTiers =
                          record.price_tiers &&
                          Array.isArray(record.price_tiers)
                            ? record.price_tiers.filter(
                                (tier: any) => tier.price > 0,
                              )
                            : [];

                        if (validPriceTiers.length > 0) {
                          return (
                            <div className="space-y-1">
                              {validPriceTiers.map((tier: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="text-xs text-gray-600"
                                >
                                  {tier.min_qty}-
                                  {tier.max_qty ? `${tier.max_qty}` : "∞"} 件:{" "}
                                  <span className="font-semibold text-blue-600">
                                    ¥{Number(tier.price).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        } else {
                          return (
                            <span className="font-semibold text-blue-600">
                              ¥{record.price.toFixed(2)}
                            </span>
                          );
                        }
                      })()}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">
                      {record.moq}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">
                      {record.delivery_days || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {record.has_authorization ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                          有
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          无
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {record.has_certification ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                          有
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          无
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {record.is_active ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                          启用
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                          停用
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <div className="flex gap-2 justify-center">
                        <EditSupplyRecordModal
                          record={record}
                          products={products}
                          suppliers={suppliers}
                          onSuccess={onRefresh}
                        />
                        <DeleteSupplyRecordModal
                          record={record}
                          onSuccess={onRefresh}
                        />
                      </div>
                    </td>
                  </tr>
                ));
              },
            )}
          </tbody>
        </table>
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          没有找到匹配的供应链
        </div>
      )}
    </div>
  );
}
