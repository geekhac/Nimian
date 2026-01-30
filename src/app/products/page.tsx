// src/app/products/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import ProductList from "@/components/products/ProductList";
import ProductFilters from "@/components/products/ProductFilters";
import SearchBar from "@/components/products/SearchBar";
import { SearchParams } from "@/types";
import { Suspense } from "react";

// 获取商品数据（带筛选功能）
async function getProducts(searchParams: Promise<SearchParams> | SearchParams) {
  const supabase = await createSupabaseServerClient();

  // ✅ 先解析 searchParams
  const params = await searchParams;

  let query = supabase.from("products").select(`
      id,
      product_name,
      specification,
      description,
      brand_id,
      brands:brand_id (
        brand_name
      )
    `);

  // 按商品名称或描述搜索
  if (params?.search) {
    query = query.or(
      `product_name.ilike.%${params.search}%,description.ilike.%${params.search}%`,
    );
  }

  // 按品牌筛选
  if (params?.brand_id) {
    query = query.eq("brand_id", params.brand_id);
  }

  // 按类别筛选（如果您有category字段）
  if (params?.category) {
    query = query.eq("category", params.category);
  }

  // 价格范围筛选（如果您有price字段）
  if (params?.min_price) {
    query = query.gte("price", parseFloat(params.min_price as string));
  }

  if (params?.max_price) {
    query = query.lte("price", parseFloat(params.max_price as string));
  }

  // 排序
  const sortBy = params?.sort || "product_name";
  const sortOrder = params?.order === "desc" ? false : true;
  query = query.order(sortBy, { ascending: sortOrder });

  // 分页
  const page = Number(params?.page) || 1;
  const pageSize = Number(params?.pageSize) || 24;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query.range(from, to);

  const { data, error } = await query;

  if (error) {
    console.error("获取商品数据失败:", error);
    return [];
  }

  return {
    products: data || [],
    currentPage: page,
    pageSize: pageSize,
  };
}

// 获取所有品牌（用于筛选下拉框）
async function getBrands() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("brands")
    .select("id, brand_name")
    .order("brand_name");

  return data || [];
}

// 获取商品总数（用于分页）
async function getProductsCount(
  searchParams: Promise<SearchParams> | SearchParams,
) {
  const supabase = await createSupabaseServerClient();
  const params = await searchParams;

  let query = supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  // 应用相同的筛选条件
  if (params?.search) {
    query = query.or(
      `product_name.ilike.%${params.search}%,description.ilike.%${params.search}%`,
    );
  }

  if (params?.brand_id) {
    query = query.eq("brand_id", params.brand_id);
  }

  const { count, error } = await query;

  if (error) {
    console.error("获取商品总数失败:", error);
    return 0;
  }

  return count || 0;
}

// 主页面组件
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams> | SearchParams;
}) {
  // ✅ 先解析 searchParams
  const params = await searchParams;

  // 并行获取数据
  const [productsData, brands, totalCount] = await Promise.all([
    getProducts(searchParams),
    getBrands(),
    getProductsCount(searchParams),
  ]);

  const { products, currentPage, pageSize } = productsData;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">商品管理</h1>
              <p className="mt-2 text-gray-600">
                共 {totalCount} 个商品
                {params?.search && (
                  <span>，搜索到 {products.length} 个结果</span>
                )}
              </p>
            </div>
            <div className="w-full lg:w-64">
              <SearchBar initialValue={params?.search as string} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左侧筛选栏 */}
          <div className="lg:w-1/4">
            <div className="sticky top-8">
              <Suspense
                fallback={
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                }
              >
                <ProductFilters
                  brands={brands}
                  currentBrand={params?.brand_id as string}
                  searchParams={params}
                />
              </Suspense>
            </div>
          </div>

          {/* 右侧内容区 */}
          <div className="lg:w-3/4">
            {/* 排序和分页信息 */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* 排序和分页信息 */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    {/* 使用更简单的文本结构 */}
                    <div className="text-sm text-gray-600">
                      <span>显示第 </span>
                      <span className="font-medium">
                        {(currentPage - 1) * pageSize + 1}
                      </span>
                      <span> - </span>
                      <span className="font-medium">
                        {Math.min(currentPage * pageSize, totalCount)}
                      </span>
                      <span> 个商品，共 </span>
                      <span className="font-medium">{totalCount}</span>
                      <span> 个</span>
                      {params?.search && (
                        <span>，关键词: &quot;{params.search}&quot;</span>
                      )}
                    </div>

                    {/* 排序选项 - 确保这是客户端组件 */}
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="sort-select"
                        className="text-sm text-gray-600"
                      >
                        排序:
                      </label>
                      <select
                        id="sort-select"
                        defaultValue={params?.sort || "product_name"}
                        className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="排序选项"
                      >
                        <option value="product_name">名称 (A-Z)</option>
                        <option value="product_name_desc">名称 (Z-A)</option>
                        <option value="created_at">最新上架</option>
                        <option value="created_at_desc">最早上架</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 排序选项 */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">排序:</label>
                  <select
                    defaultValue={params?.sort || "product_name"}
                    className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="product_name">名称 (A-Z)</option>
                    <option value="product_name_desc">名称 (Z-A)</option>
                    <option value="created_at">最新上架</option>
                    <option value="created_at_desc">最早上架</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 商品列表 */}
            <Suspense
              fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              }
            >
              <ProductList
                products={products}
                currentPage={currentPage}
                totalPages={totalPages}
                searchParams={params}
              />
            </Suspense>

            {/* 简单分页（如果没有Pagination组件） */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage <= 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一页
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          className={`px-3 py-1 text-sm rounded ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <span className="px-2">...</span>
                    )}
                  </div>

                  <button
                    disabled={currentPage >= totalPages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
