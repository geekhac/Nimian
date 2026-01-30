"use client";

import { useState } from "react";
import ProductForm from "./ProductForm";
import { Brand, Product } from "@/types";

interface Props {
  brands: Brand[];
  initial: Partial<Product>;
  productId: string;
}

export default function EditProductModal({
  brands,
  initial,
  productId,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
      >
        编辑
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">编辑商品</h3>
              <button onClick={() => setOpen(false)}>关闭</button>
            </div>

            <ProductForm
              brands={brands}
              initial={initial}
              productId={productId}
              onSuccess={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
