"use client";

import React from "react";
import Link from "next/link";
import { Copy, Check } from "lucide-react";
import { PerformanceMonitor } from "@/lib/performance";
import ProductImage from "@/components/ui/ProductImage";

interface Product {
  id: string;
  product_name: string;
  specification: string | null;
  image_url?: string | null;
  brands?: { brand_name: string };
  supply_records?: Array<{
    price: number;
    suppliers?: { supplier_name: string };
  }>;
}

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export default function ProductCardWithTracking({
  product,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const [copiedProduct, setCopiedProduct] = React.useState<string | null>(null);

  // 追踪商品卡片曝光
  React.useEffect(() => {
    PerformanceMonitor.trackUserInteraction("product_impression", {
      product_id: product.id,
      product_name: product.product_name,
      brand_name: product.brands?.brand_name,
      has_specification: !!product.specification,
      has_image: !!product.image_url,
      price_range: product.supply_records?.length
        ? `${Math.min(...product.supply_records.map((r) => r.price))}-${Math.max(...product.supply_records.map((r) => r.price))}`
        : null,
    });
  }, [product]);

  const copyToClipboard = async (text: string) => {
    const startTime = Date.now();

    try {
      await navigator.clipboard.writeText(text);
      const duration = Date.now() - startTime;

      // 追踪复制操作成功
      PerformanceMonitor.trackUserInteraction("copy_product_info", {
        product_id: product.id,
        copied_text: text,
        duration,
        method: "clipboard_api",
      });

      setCopiedProduct(text);
      setTimeout(() => setCopiedProduct(null), 2000);
    } catch (err) {
      const duration = Date.now() - startTime;

      // 追踪复制操作失败
      PerformanceMonitor.trackError(err as Error, {
        action: "copy_product_info",
        product_id: product.id,
        attempted_text: text,
        duration,
        method: "clipboard_api",
      });

      // 降级方案
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        const fallbackDuration = Date.now() - startTime;
        PerformanceMonitor.trackUserInteraction("copy_product_info", {
          product_id: product.id,
          copied_text: text,
          duration: fallbackDuration,
          method: "fallback_execCommand",
        });

        setCopiedProduct(text);
        setTimeout(() => setCopiedProduct(null), 2000);
      } catch (fallbackErr) {
        PerformanceMonitor.trackError(fallbackErr as Error, {
          action: "copy_product_info_fallback",
          product_id: product.id,
          attempted_text: text,
        });

        alert(`复制失败，请手动复制：${text}`);
      }
    }
  };

  const handleCardClick = () => {
    // 追踪商品卡片点击
    PerformanceMonitor.trackUserInteraction("product_card_click", {
      product_id: product.id,
      product_name: product.product_name,
      brand_name: product.brands?.brand_name,
      destination: `/products/${product.id}`,
    });
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 追踪编辑操作
    PerformanceMonitor.trackUserInteraction("edit_product_start", {
      product_id: product.id,
      product_name: product.product_name,
      trigger: "card_button",
    });

    onEdit?.(product);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 追踪删除操作开始
    PerformanceMonitor.trackUserInteraction("delete_product_start", {
      product_id: product.id,
      product_name: product.product_name,
      trigger: "card_button",
    });

    onDelete?.(product);
  };

  const handleCopyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const fullProductName = `${product.brands?.brand_name || "未分类"} ${product.product_name}${product.specification ? ` ${product.specification}` : ""}`;
    copyToClipboard(fullProductName);
  };

  const brandName = product.brands?.brand_name || "未分类";
  const fullProductName = `${brandName} ${product.product_name}${product.specification ? ` ${product.specification}` : ""}`;
  const minPrice =
    product.supply_records && product.supply_records.length > 0
      ? Math.min(...product.supply_records.map((r) => r.price))
      : null;

  return (
    <Link href={`/products/${product.id}`} onClick={handleCardClick}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 overflow-hidden h-full border border-gray-200 hover:border-blue-300">
        {/* 商品图片 */}
        <div className="w-full h-36 bg-gray-100 overflow-hidden">
          <ProductImage
            src={product.image_url}
            alt={product.product_name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-3">
          {/* 商品名称和复制按钮 */}
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-900 flex-1 mr-2 line-clamp-2">
                <span className="text-purple-600 font-bold">{brandName}</span>
                <span className="font-bold text-gray-900">
                  {product.product_name}
                </span>
                {product.specification && (
                  <span className="text-gray-600">
                    {" "}
                    {product.specification}
                  </span>
                )}
              </p>
              <button
                onClick={handleCopyClick}
                className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer hover:pointer transition flex-shrink-0"
                title="复制商品信息"
              >
                {copiedProduct === fullProductName ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>

          {/* 价格信息 */}
          <div className="mb-3">
            {minPrice ? (
              <div className="text-sm font-semibold text-green-600">
                ¥{minPrice.toFixed(2)} 起
              </div>
            ) : (
              <div className="text-sm text-gray-400">暂无报价</div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <button
              onClick={handleEditClick}
              className="flex-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 hover:pointer transition-colors"
            >
              编辑
            </button>
            <button
              onClick={handleDeleteClick}
              className="flex-1 px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 hover:pointer transition-colors"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
