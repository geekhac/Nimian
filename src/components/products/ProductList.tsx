"use client";

import { useState } from "react";
import ProductCard from "@/components/products/ProductCard";
import Pagination from "../shared/Pagination";
import CreateProductModal from "./CreateProductModal";
import ProductForm from "./ProductForm";

interface ProductListProps {
  products: Array<{
    id: string;
    product_name: string;
    specification: string | null;
    description: string | null;
    brand_id: string;
    brands: {
      brand_name: string;
    };
  }>;
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | string[] | undefined>; // ✅ 添加 undefined
  brands: Array<{ id: string; brand_name: string }>;
}

export default function ProductList({
  products,
  currentPage,
  totalPages,
  searchParams,
  brands,
}: ProductListProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<null | any>(null);
  const [deleting, setDeleting] = useState<null | any>(null);
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No products found
        </h3>
        <p className="text-gray-600">
          Try adjusting your search or filter to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div />
        <div className="flex items-center gap-2">
          <CreateProductModal brands={brands} />
        </div>
      </div>

      {/* 商品网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={(p) => setEditing(p)}
            onDelete={(p) => setDeleting(p)}
          />
        ))}
      </div>

      {/* 编辑模态 */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">编辑商品</h3>
              <button onClick={() => setEditing(null)}>关闭</button>
            </div>
            <ProductForm
              brands={brands}
              initial={{
                product_name: editing.product_name,
                specification: editing.specification,
                description: editing.description,
                brand_id: editing.brand_id,
              }}
              productId={editing.id}
              onSuccess={() => setEditing(null)}
            />
          </div>
        </div>
      )}

      {/* 删除模态 */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-4">确认删除</h3>
            <p className="text-sm text-gray-600 mb-4">
              确定要删除「{deleting.product_name}」吗？此操作不可恢复。
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleting(null)}
                className="px-3 py-1 rounded border"
              >
                取消
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/products?id=${deleting.id}`, {
                      method: "DELETE",
                    });
                    if (!res.ok) throw new Error("删除失败");
                    setDeleting(null);
                    // refresh page
                    location.reload();
                  } catch (err) {
                    console.error(err);
                    alert("删除失败，请查看控制台");
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 分页组件 */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            searchParams={searchParams}
          />
        </div>
      )}
    </div>
  );
}
