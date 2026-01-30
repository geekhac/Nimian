import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import SuppliersTable from "@/components/suppliers/SuppliersTable";
import CreateSupplierModal from "@/components/suppliers/CreateSupplierModal";
import { Truck } from "lucide-react";

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
  created_at?: string;
}

async function getSuppliers() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("supplier_assessment")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("获取供应商数据失败:", error);
    return [];
  }

  return data || [];
}

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航面包屑 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
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
            <CreateSupplierModal />
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div key={suppliers.length} className="bg-white rounded-lg shadow p-6">
          <SuppliersTable suppliers={suppliers as Supplier[]} />
        </div>
      </div>
    </div>
  );
}
