"use client";

import { useState } from "react";
import Link from "next/link";
import ProductImage from "@/components/ui/ProductImage";

interface Product {
  id: string;
  product_name: string;
  specification: string | null;
  description: string | null;
  brand_id: string;
  image_url?: string | null;
  brands: {
    brand_name: string;
  };
}

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export default function ProductCard({
  product,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const rawId = product?.id;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isValidId = typeof rawId === "string" && uuidRegex.test(rawId);

  if (!isValidId) {
    console.error(
      "ProductCard: invalid product id, will not link to detail page:",
      rawId,
      product,
    );
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden h-full border border-gray-200 p-6">
        <div className="text-sm text-red-600">无效商品ID，无法跳转详情</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 h-14">
          {product.product_name || "未知商品"}
        </h3>
      </div>
    );
  }

  const href = `/products/${rawId}`;

  return (
    <Link href={href}>
      <div
        className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 overflow-hidden h-full border border-gray-200 hover:border-blue-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="w-full h-36 bg-gray-100 overflow-hidden">
          <ProductImage
            src={product.image_url}
            alt={product.product_name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-3">
          {/* 品牌 + 商品名称 - 同一行，高亮显示 */}
          <div className="mb-3">
            <p className="text-xs font-bold text-gray-900">
              <span className="text-purple-600 font-bold">
                {product.brands?.brand_name || "未分类"}
              </span>
              <span className="font-bold text-gray-900">
                {product.product_name}
              </span>
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-1">
            <button
              className="flex-1 px-2 py-1.5 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 hover:pointer transition"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof onEdit === "function") onEdit(product);
              }}
            >
              编辑
            </button>
            <button
              className="flex-1 px-2 py-1.5 text-xs rounded bg-red-50 text-red-600 hover:bg-red-100 hover:pointer transition"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof onDelete === "function") onDelete(product);
              }}
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
