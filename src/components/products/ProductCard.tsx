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
  supply_records?: Array<{
    id: string;
    supplier_id: number;
    supplier: {
      id: number;
      supplier_name: string;
    };
    price: number;
    moq: number;
    price_tiers: Array<{
      min_qty: number;
      max_qty: number | null;
      price: number;
    }> | null;
    is_active: boolean;
  }>;
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
          {product.specification && (
            <span className="text-gray-600 font-normal ml-1">
              {product.specification}
            </span>
          )}
        </h3>
      </div>
    );
  }

  const href = `/products/${rawId}`;

  return (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 overflow-hidden h-full border border-gray-200 hover:border-blue-300">
        <div className="w-full h-36 bg-gray-100 overflow-hidden">
          <ProductImage
            src={product.image_url}
            alt={product.product_name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-3">
          {/* 品牌 + 商品名称 + 规格 - 同一行，高亮显示 */}
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-900 flex-1 mr-2">
                <span className="text-purple-600 font-bold">
                  {product.brands?.brand_name || "未分类"}
                </span>
                <span className="font-bold text-gray-900">
                  {product.product_name}
                </span>
                {product.specification && (
                  <span className="text-gray-600 font-normal ml-1">
                    {product.specification}
                  </span>
                )}
              </p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const fullProductName = `${product.brands?.brand_name || "未分类"}${product.product_name}${product.specification ? ` ${product.specification}` : ""}`;
                  copyToClipboard(fullProductName);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer hover:pointer transition flex-shrink-0"
                title="复制商品名称和规格"
              >
                {copiedProduct ===
                `${product.brands?.brand_name || "未分类"}${product.product_name}${product.specification ? ` ${product.specification}` : ""}` ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>

          {/* 价格信息 */}
          <div className="mb-3">
            {product.supply_records &&
            Array.isArray(product.supply_records) &&
            product.supply_records.length > 0 ? (
              <div className="space-y-1">
                {product.supply_records
                  .filter((record) => record.is_active)
                  .slice(0, 3) // 最多显示3个价格
                  .map((record) => (
                    <div key={record.id} className="text-xs">
                      {record.price_tiers &&
                      Array.isArray(record.price_tiers) &&
                      record.price_tiers.length > 0 ? (
                        // 显示阶梯价
                        <div className="text-green-600 font-medium">
                          ¥{record.price_tiers[0].price}
                          {record.price_tiers.length > 1 && (
                            <span className="text-gray-500 font-normal">
                              -¥
                              {Math.max(
                                ...record.price_tiers.map((t) => t.price),
                              )}
                            </span>
                          )}
                          <span className="text-gray-400 text-xs ml-1">
                            ({record.price_tiers.length}阶梯)
                          </span>
                        </div>
                      ) : (
                        // 显示单一价格
                        <div className="text-green-600 font-medium">
                          ¥{record.price}
                          <span className="text-gray-400 text-xs ml-1">
                            起订{record.moq}
                          </span>
                        </div>
                      )}
                      <div className="text-gray-500 truncate">
                        {record.supplier?.supplier_name || "未知供应商"}
                      </div>
                    </div>
                  ))}
                {product.supply_records.filter((r) => r.is_active).length >
                  3 && (
                  <div className="text-xs text-gray-400">
                    +
                    {product.supply_records.filter((r) => r.is_active).length -
                      3}
                    个更多价格
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-400">暂无供应信息</div>
            )}
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
