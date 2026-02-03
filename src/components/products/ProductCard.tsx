"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check } from "lucide-react";
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
  const [copiedProduct, setCopiedProduct] = useState<string | null>(null);

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
      setCopiedProduct(text);
      setTimeout(() => setCopiedProduct(null), 2000);
    } catch (err) {
      console.error("复制失败:", err);
      // 最后的降级方案：显示文本让用户手动复制
      alert(`复制失败，请手动复制：${text}`);
    }
  };

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
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-900 flex-1 mr-2">
                <span className="text-purple-600 font-bold">
                  {product.brands?.brand_name || "未分类"}
                </span>
                <span className="font-bold text-gray-900">
                  {product.product_name}
                </span>
              </p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const fullProductName = `${product.brands?.brand_name || "未分类"}${product.product_name}`;
                  copyToClipboard(fullProductName);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer hover:pointer transition flex-shrink-0"
                title="复制商品名称"
              >
                {copiedProduct ===
                `${product.brands?.brand_name || "未分类"}${product.product_name}` ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
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
