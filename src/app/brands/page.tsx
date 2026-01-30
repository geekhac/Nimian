// src/app/brands/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import BrandsTable from "@/components/brands/BrandsTable";
import BrandStats from "@/components/brands/BrandStats";
import CreateBrandButton from "@/components/brands/CreateBrandButton";
import SearchBar from "@/components/brands/SearchBar";
import { SearchParams } from "@/types";
import { Package, Plus } from "lucide-react";
import { Suspense } from "react";

// 获取品牌数据
async function getBrands(searchParams: Promise<SearchParams> | SearchParams) {
  const supabase = await createSupabaseServerClient();
  const params = await searchParams;

  let query = supabase.from("brands").select(`
      id,
      brand_name,
      registered_location,
      core_category_focus,
      created_at,
      updated_at
    `);

  // 按品牌名称搜索
  if (params?.search) {
    const searchTerm = Array.isArray(params.search)
      ? params.search[0]
      : params.search;
    query = query.ilike("brand_name", `%${searchTerm}%`);
  }

  // 按地区筛选
  if (params?.location && params.location !== "all") {
    const location = Array.isArray(params.location)
      ? params.location[0]
      : params.location;
    query = query.eq("registered_location", location);
  }

  // 修复排序参数
  const sortParam = params?.sort;
  const sortBy = Array.isArray(sortParam)
    ? sortParam[0]
    : sortParam || "brand_name";
  const sortOrder = params?.order === "desc" ? false : true;
  query = query.order(sortBy, { ascending: sortOrder });

  const { data, error } = await query;

  if (error) {
    console.error("获取品牌数据失败:", error);
    return [];
  }

  return data || [];
}

// 获取所有地区选项
async function getLocations() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("brands")
    .select("registered_location")
    .not("registered_location", "is", null);

  if (!data) return [];

  const locations = [
    ...new Set(data.map((item) => item.registered_location)),
  ].filter(Boolean);
  return locations as string[];
}

export default async function BrandsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams> | SearchParams;
}) {
  const params = await searchParams;

  // 获取搜索参数值
  const searchValue = Array.isArray(params?.search)
    ? params.search[0]
    : params?.search || "";

  const locationValue = Array.isArray(params?.location)
    ? params.location[0]
    : params?.location || "";

  // 并行获取数据
  const [brands, locations] = await Promise.all([
    getBrands(searchParams),
    getLocations(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">品牌管理</h1>
                <p className="mt-1 text-gray-600">
                  管理所有品牌信息，支持增删改查操作
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="w-full sm:w-64">
                <SearchBar initialValue={searchValue} />
              </div>
              <CreateBrandButton />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 统计卡片 */}
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <BrandStats brands={brands} />
        </Suspense>

        {/* 地区筛选 */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-700 font-medium">地区筛选:</span>
            <a
              href="?location=all"
              className={`px-3 py-1 rounded-full text-sm ${!locationValue || locationValue === "all" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              全部
            </a>
            {locations.map((location) => (
              <a
                key={location}
                href={`?location=${encodeURIComponent(location)}`}
                className={`px-3 py-1 rounded-full text-sm ${locationValue === location ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                {location}
              </a>
            ))}
          </div>
        </div>

        {/* 品牌表格 */}
        <Suspense
          fallback={
            <div className="bg-white rounded-lg shadow">
              <div className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded-t-lg"></div>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 border-t border-gray-200 p-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <BrandsTable brands={brands} />
        </Suspense>
      </div>
    </div>
  );
}
