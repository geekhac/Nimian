"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import SupplyRecordsTable from "@/components/supplies/SupplyRecordsTable";
import CreateSupplyRecordModal from "@/components/supplies/CreateSupplyRecordModal";
import { Layers } from "lucide-react";

async function getSupplyRecords() {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("supply_records")
    .select(
      `
      id,
      product_id,
      supplier_id,
      price,
      moq,
      price_tiers,
      has_authorization,
      has_certification,
      is_active,
      delivery_days,
      valid_from,
      valid_until,
      notes,
      created_at,
      updated_at,
      products (
        id,
        product_name,
        brand_id,
        brands (
          id,
          brand_name
        )
      ),
      supplier_assessment (
        id,
        supplier_name
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("获取供应链数据失败:", error);
    return [];
  }

  return data || [];
}

async function getProducts() {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, product_name")
    .order("product_name");

  if (error) {
    console.error("获取商品数据失败:", error);
    return [];
  }

  return data || [];
}

async function getSuppliers() {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("supplier_assessment")
    .select("id, supplier_name")
    .order("supplier_name");

  if (error) {
    console.error("获取供应商数据失败:", error);
    return [];
  }

  return data || [];
}

export default function SuppliesPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recordsData, productsData, suppliersData] = await Promise.all([
        getSupplyRecords(),
        getProducts(),
        getSuppliers(),
      ]);
      setRecords(recordsData);
      setProducts(productsData);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error("加载数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSuccess = async () => {
    // 强制清除可能的缓存
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("supply_records")
      .select("count", { count: "exact", head: true });

    // 添加小延迟确保数据保存完成
    await new Promise((resolve) => setTimeout(resolve, 300));

    await loadData();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航面包屑 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 hover:underline hover:pointer text-sm"
          >
            ← 返回首页
          </a>
        </div>
      </div>

      {/* 头部 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg hover:pointer cursor-pointer">
                <Layers className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">供应管理</h1>
                <p className="mt-1 text-gray-600">
                  共 {records.length} 条供应链记录
                </p>
              </div>
            </div>
            <CreateSupplyRecordModal
              products={products}
              suppliers={suppliers}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 text-center hover:pointer">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : (
          <div
            key={records.length}
            className="bg-white rounded-lg shadow p-6 hover:pointer"
          >
            <SupplyRecordsTable
              records={records as any}
              products={products}
              suppliers={suppliers}
              onRefresh={loadData}
            />
          </div>
        )}
      </div>
    </div>
  );
}
