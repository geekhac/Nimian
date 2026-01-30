"use client";

import { useState } from "react";
import ProductForm from "./ProductForm";
import { Brand } from "@/types";

interface Props {
  brands: Brand[];
}

export default function CreateProductModal({ brands }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        新建商品
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">创建商品</h3>
              <button onClick={() => setOpen(false)}>关闭</button>
            </div>

            <ProductForm brands={brands} onSuccess={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
