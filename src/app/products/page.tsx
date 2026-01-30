// src/app/products/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import ProductList from "@/components/products/ProductList";
import ProductFilters from "@/components/products/ProductFilters";
import SearchBar from "@/components/products/SearchBar";
import { SearchParams } from "@/types";

// 先定义正确的类型
type ProductWithBrand = {
  id: string;
  product_name: string;
  specification: string | null;
  description: string | null;
  brand_id: string;
  brands: {
    brand_name: string;
  };
};

// 获取商品数据（带筛选功能）
async function getProducts(searchParams: Promise<SearchParams> | SearchParams) {
  const supabase = await createSupabaseServerClient();
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

  if (params?.search) {
    const searchTerm = Array.isArray(params.search)
      ? params.search[0]
      : params.search;
    query = query.or(
      `product_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`,
    );
  }

  if (params?.brand_id) {
    const brandId = Array.isArray(params.brand_id)
      ? params.brand_id[0]
      : params.brand_id;
    query = query.eq("brand_id", brandId);
  }

  const sortParam = params?.sort;
  const sortBy = Array.isArray(sortParam)
    ? sortParam[0]
    : sortParam || "product_name";
  const sortOrder = params?.order === "desc" ? false : true;
  query = query.order(sortBy, { ascending: sortOrder });

  const pageParam = params?.page;
  const page = Array.isArray(pageParam)
    ? Number(pageParam[0])
    : Number(pageParam) || 1;

  const pageSizeParam = params?.pageSize;
  const pageSize = Array.isArray(pageSizeParam)
    ? Number(pageSizeParam[0])
    : Number(pageSizeParam) || 24;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query.range(from, to);

  const { data, error } = await query;

  if (error) {
    console.error("获取商品数据失败:", error);
    return { products: [], currentPage: page, pageSize: pageSize };
  }

  // 转换数据格式，兼容 Supabase 返回的 brands 为数组或对象
  const products = (data || []).map((product) => {
    const brandName = Array.isArray(product.brands)
      ? product.brands[0]?.brand_name
      : product.brands?.brand_name;

    return {
      id: product.id,
      product_name: product.product_name,
      specification: product.specification,
      description: product.description,
      brand_id: product.brand_id,
      brands: {
        brand_name: brandName || "未知品牌",
      },
    };
  }) as ProductWithBrand[];

  return {
    products,
    currentPage: page,
    pageSize: pageSize,
  };
}

// 获取所有品牌
async function getBrands() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("brands")
    .select("id, brand_name")
    .order("brand_name");

  return data || [];
}

// 获取商品总数
async function getProductsCount(
  searchParams: Promise<SearchParams> | SearchParams,
) {
  const supabase = await createSupabaseServerClient();
  const params = await searchParams;

  let query = supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  if (params?.search) {
    const searchTerm = Array.isArray(params.search)
      ? params.search[0]
      : params.search;
    query = query.or(
      `product_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`,
    );
  }

  if (params?.brand_id) {
    const brandId = Array.isArray(params.brand_id)
      ? params.brand_id[0]
      : params.brand_id;
    query = query.eq("brand_id", brandId);
  }

  const { count, error } = await query;

  if (error) {
    console.error("获取商品总数失败:", error);
    return 0;
  }

  return count || 0;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams> | SearchParams;
}) {
  const params = await searchParams;

  // 获取搜索参数值
  const searchValue = Array.isArray(params?.search)
    ? params.search[0]
    : params?.search || "";

  const brandValue = Array.isArray(params?.brand_id)
    ? params.brand_id[0]
    : params?.brand_id || "";

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
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">商品管理</h1>
              <p className="mt-2 text-gray-600">
                共 {totalCount} 个商品
                {searchValue && <span>，搜索到 {products.length} 个结果</span>}
              </p>
            </div>
            <div className="w-full lg:w-64">
              <SearchBar initialValue={searchValue} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左侧筛选栏 */}
          <div className="lg:w-1/4">
            <div className="sticky top-8">
              <ProductFilters
                brands={brands}
                currentBrand={brandValue}
                searchParams={params as Record<string, string | string[]>}
              />
            </div>
          </div>

          {/* 右侧内容区 */}
          <div className="lg:w-3/4">
            {/* 排序和分页信息 - 简化结构 */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  显示第 {(currentPage - 1) * pageSize + 1} -{" "}
                  {Math.min(currentPage * pageSize, totalCount)} 个商品，共{" "}
                  {totalCount} 个{searchValue && `，关键词: "${searchValue}"`}
                </div>

                {/* 使用简单的链接而不是表单，避免 hydration 问题 */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">排序:</span>
                  <div className="flex gap-1">
                    {(() => {
                      const rawParams = params as Record<
                        string,
                        string | string[] | undefined
                      >;
                      const currentOrder =
                        rawParams?.order === "desc" ? "desc" : "asc";
                      const nextOrder =
                        currentOrder === "desc" ? "asc" : "desc";

                      // 构建新的查询参数，保留原有参数并覆盖排序参数
                      const newParams: Record<string, string | string[]> = {
                        ...(rawParams as any),
                      };
                      newParams.sort = "product_name";
                      newParams.order = nextOrder;

                      const sp = new URLSearchParams();
                      Object.entries(newParams).forEach(([k, v]) => {
                        if (v === undefined) return;
                        if (Array.isArray(v)) v.forEach((x) => sp.append(k, x));
                        else sp.append(k, v);
                      });

                      const href = `?${sp.toString()}`;
                      const isActive =
                        (rawParams?.sort === undefined &&
                          currentOrder === "asc") ||
                        rawParams?.sort === "product_name";
                      const label =
                        currentOrder === "desc" ? "名称：降序" : "名称：升序";

                      return (
                        <a
                          href={href}
                          className={`px-3 py-1 text-sm rounded ${isActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                        >
                          {label}
                        </a>
                      );
                    })()}
                    <a
                      href="?sort=created_at&order=desc"
                      className={`px-3 py-1 text-sm rounded ${params?.sort === "created_at" && (!params?.order || params.order === "desc") ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                      最新
                    </a>
                    <a
                      href="?sort=created_at"
                      className={`px-3 py-1 text-sm rounded ${params?.sort === "created_at" && params?.order !== "desc" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                      最早
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* 商品列表 */}
            <ProductList
              products={products}
              currentPage={currentPage}
              totalPages={totalPages}
              searchParams={params as Record<string, string | string[]>}
              brands={brands}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
