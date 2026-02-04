"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import SuppliersTable from "@/components/suppliers/SuppliersTable";
import CreateSupplierModal from "@/components/suppliers/CreateSupplierModal";
import { Truck } from "lucide-react";
import Navigation from "@/components/shared/Navigation";

interface Supplier {
  id: number;
  supplier_name: string;
  registered_capital?: number;
  product_categories?: string[];
  qualification_type?: string;
  supply_channel?: string;
  channel_explanation?: string;
  total_orders?: number;
  total_amount?: number;
  problem_orders?: number;
  problem_amount?: number;
  delivery_speed?: string;
  product_quality?: number;
  packaging?: number;
  region?: string;
  supplier_link?: string | null;
  created_at?: string;
}

async function getSuppliers() {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("supplier_assessment")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("获取供应商数据失败:", error);
    return [];
  }

  // 调试：打印第一个供应商的数据结构
  if (data && data.length > 0) {
    console.log("第一个供应商数据:", data[0]);
    console.log("qualification_type:", data[0].qualification_type);
  }

  return data || [];
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSuppliers = async () => {
    setLoading(true);
    // 强制清除可能的缓存
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("supplier_assessment")
      .select("count", { count: "exact", head: true });

    // 添加小延迟确保数据保存完成
    await new Promise((resolve) => setTimeout(resolve, 300));

    const data = await getSuppliers();
    setSuppliers(data);
    setLoading(false);
  };

  // 初始加载数据
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      const data = await getSuppliers();
      if (isMounted) {
        setSuppliers(data);
        setLoading(false);
      }
    };
    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <Navigation />

      {/* 头部 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Truck className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">供应商管理</h1>
                <p className="mt-1 text-gray-600">
                  共 {suppliers.length} 家供应商
                </p>
              </div>
            </div>
            <CreateSupplierModal onSuccess={loadSuppliers} />
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div key={suppliers.length} className="bg-white rounded-lg shadow p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <p className="mt-2 text-gray-600">加载中...</p>
            </div>
          ) : (
            <SuppliersTable
              suppliers={suppliers as Supplier[]}
              onRefresh={loadSuppliers}
            />
          )}
        </div>
      </div>
    </div>
  );
}
