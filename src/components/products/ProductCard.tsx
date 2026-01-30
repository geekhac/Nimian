"use client";

import { useState } from "react";
import { Package, Tag, ShoppingCart, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  product_name: string;
  specification: string | null;
  description: string | null;
  brand_id: string;
  brands: {
    brand_name: string;
  };
  inventory?: {
    stock_quantity: number;
  };
  suppliers?: {
    count: number;
  };
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const stockQuantity = product.inventory?.stock_quantity || 0;
  const supplierCount = product.suppliers?.count || 0;

  const stockStatus =
    stockQuantity > 100
      ? "In Stock"
      : stockQuantity > 20
        ? "Limited Stock"
        : stockQuantity > 0
          ? "Low Stock"
          : "Out of Stock";

  const stockColor =
    stockQuantity > 100
      ? "text-green-600 bg-green-50"
      : stockQuantity > 20
        ? "text-yellow-600 bg-yellow-50"
        : stockQuantity > 0
          ? "text-orange-600 bg-orange-50"
          : "text-red-600 bg-red-50";

  return (
    <Link href={`/products/${product.id}`}>
      <div
        className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 overflow-hidden h-full border border-gray-200 hover:border-blue-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-6">
          {/* 品牌和库存状态 */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {product.brands?.brand_name || "No Brand"}
              </span>
            </div>
            <span
              className={`text-xs font-medium px-2 py-1 rounded ${stockColor}`}
            >
              {stockStatus}
            </span>
          </div>

          {/* 商品名称 */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 h-14">
            {product.product_name}
          </h3>

          {/* 规格 */}
          {product.specification && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <Tag className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{product.specification}</span>
            </div>
          )}

          {/* 描述 */}
          {product.description && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-4 h-10">
              {product.description}
            </p>
          )}

          {/* 统计信息 */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div>
              Stock: <span className="font-semibold">{stockQuantity}</span>
            </div>
            <div>
              Suppliers: <span className="font-semibold">{supplierCount}</span>
            </div>
          </div>

          {/* 底部操作区 */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <button
                className={`flex items-center gap-1 text-sm font-medium transition-all duration-200 ${
                  isHovered ? "text-blue-600 scale-105" : "text-blue-500"
                }`}
                onClick={(e) => e.preventDefault()}
              >
                View Details
                <ChevronRight
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isHovered ? "translate-x-1" : ""
                  }`}
                />
              </button>

              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isHovered
                    ? "bg-blue-600 text-white shadow-md scale-105"
                    : "bg-blue-500 text-white"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  // 添加到购物车逻辑
                }}
              >
                <ShoppingCart className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
