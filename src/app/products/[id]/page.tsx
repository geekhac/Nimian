import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { notFound } from "next/navigation";
import EditProductModal from "@/components/products/EditProductModal";
import DeleteProductButton from "@/components/products/DeleteProductButton";

type ProductWithBrand = {
  id: string;
  product_name: string;
  specification: string | null;
  description: string | null;
  brand_id: string;
  created_at?: string;
  updated_at?: string;
  brands?: { brand_name?: string } | Array<{ brand_name?: string }>;
};

export default async function ProductPage({ params }: { params: any }) {
  const supabase = await createSupabaseServerClient();
  const { id } = await params;

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!id || typeof id !== "string" || !uuidRegex.test(id)) {
    console.error("ProductPage: invalid id param", { id });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-2xl p-6 bg-white rounded shadow">
          <h2 className="text-lg font-semibold mb-4">未找到商品</h2>
          <p className="text-sm text-gray-600 mb-2">ID: {String(id)}</p>
          <pre className="text-xs text-red-600">
            {JSON.stringify({ message: "invalid id" }, null, 2)}
          </pre>
          <p className="mt-4 text-sm text-gray-700">
            检查请求路径或前端是否传递了字符串 "undefined" 作为 ID。
          </p>
        </div>
      </div>
    );
  }

  // 带关联查询（优先）
  const { data: product, error } = await supabase
    .from("products")
    .select(
      `id, product_name, specification, description, brand_id, created_at, updated_at, brands:brand_id (brand_name)`,
    )
    .eq("id", id)
    .single();

  if (error || !product) {
    console.error("fetch product error:", error);

    // 尝试不带关联的简单查询以便降级展示或更清楚地报告错误
    try {
      const { data: simple, error: simpleErr } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (simpleErr || !simple) {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-2xl p-6 bg-white rounded shadow">
              <h2 className="text-lg font-semibold mb-4">未找到商品</h2>
              <p className="text-sm text-gray-600 mb-2">ID: {id}</p>
              <pre className="text-xs text-red-600">
                {JSON.stringify(
                  error || simpleErr || { message: "no data" },
                  null,
                  2,
                )}
              </pre>
              <p className="mt-4 text-sm text-gray-700">
                可能原因：商品不存在、RLS/权限限制或关联选择语句导致查询失败。可检查
                Supabase 表数据与 RLS 策略。
              </p>
            </div>
          </div>
        );
      }

      const brandName = (simple as any).brand_id
        ? "(has brand id)"
        : "未知品牌";
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold">{simple.product_name}</h1>
            <p className="text-sm text-gray-600 mt-2">降级显示：{brandName}</p>
            <pre className="mt-4 bg-white p-4 rounded shadow text-xs">
              {JSON.stringify(simple, null, 2)}
            </pre>
          </div>
        </div>
      );
    } catch (e) {
      console.error(e);
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-2xl p-6 bg-white rounded shadow">
            <h2 className="text-lg font-semibold mb-4">查询商品时出错</h2>
            <pre className="text-xs text-red-600">{String(e)}</pre>
          </div>
        </div>
      );
    }
  }

  // 获取所有品牌以便编辑时选择
  const { data: brandsData } = await supabase
    .from("brands")
    .select("id, brand_name")
    .order("brand_name");

  const brandName = Array.isArray(product.brands)
    ? product.brands[0]?.brand_name
    : product.brands?.brand_name;

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
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {product.product_name}
              </h1>
              <p className="mt-2 text-gray-600">
                品牌：{brandName || "未知品牌"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <EditProductModal
                brands={(brandsData || []) as any}
                initial={{
                  product_name: product.product_name,
                  specification: product.specification,
                  description: product.description,
                  brand_id: product.brand_id,
                }}
                productId={product.id}
              />
              <DeleteProductButton
                productId={product.id}
                productName={product.product_name}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">详情</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="text-sm text-gray-500">规格</div>
              <div className="mt-1 text-gray-900">
                {product.specification || "—"}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500">描述</div>
              <div className="mt-1 text-gray-900">
                {product.description || "—"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">创建时间</div>
                <div className="mt-1 text-gray-900">
                  {product.created_at || "—"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">更新时间</div>
                <div className="mt-1 text-gray-900">
                  {product.updated_at || "—"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
