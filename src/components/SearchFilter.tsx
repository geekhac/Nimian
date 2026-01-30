"use client";

import { useRouter, usePathname } from "next/navigation";
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface SearchFilterProps {
  regions: string[];
  categories: string[];
  initialSearchParams: {
    search?: string;
    region?: string;
    category?: string;
    rating?: string;
  };
}

export default function SearchFilter({
  regions,
  categories,
  initialSearchParams,
}: SearchFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    search: initialSearchParams?.search || "",
    region: initialSearchParams?.region || "all",
    category: initialSearchParams?.category || "all",
    rating: initialSearchParams?.rating || "all",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();

    // 只添加非默认值的参数
    if (localFilters.search) params.set("search", localFilters.search);
    if (localFilters.region !== "all")
      params.set("region", localFilters.region);
    if (localFilters.category !== "all")
      params.set("category", localFilters.category);
    if (localFilters.rating !== "all")
      params.set("rating", localFilters.rating);

    // 构建URL
    const queryString = params.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;

    router.push(url);
  };

  const handleReset = () => {
    setLocalFilters({
      search: "",
      region: "all",
      category: "all",
      rating: "all",
    });
    router.push(pathname);
  };

  const handleChange = (key: keyof typeof localFilters, value: string) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleQuickFilter = (type: "rating", value: string) => {
    setLocalFilters((prev) => ({ ...prev, [type]: value }));
    const params = new URLSearchParams();

    Object.entries({ ...localFilters, [type]: value }).forEach(([k, v]) => {
      if (v && v !== "all" && k !== "search") {
        params.set(k, v as string);
      }
    });

    const queryString = params.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(url);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 搜索框 */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={localFilters.search}
            onChange={(e) => handleChange("search", e.target.value)}
            placeholder="搜索供应商名称、联系人、电话或邮箱..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* 快速筛选 */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              handleQuickFilter(
                "rating",
                localFilters.rating === "4" ? "all" : "4",
              )
            }
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${localFilters.rating === "4" ? "bg-blue-100 text-blue-800 border border-blue-200" : "bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200"}`}
          >
            ⭐ 4星以上
          </button>
          <button
            type="button"
            onClick={() =>
              handleQuickFilter(
                "rating",
                localFilters.rating === "3" ? "all" : "3",
              )
            }
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${localFilters.rating === "3" ? "bg-blue-100 text-blue-800 border border-blue-200" : "bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200"}`}
          >
            ⭐ 3星以上
          </button>
        </div>

        {/* 基本筛选 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              地区筛选
            </label>
            <select
              value={localFilters.region}
              onChange={(e) => handleChange("region", e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">全部地区</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              评分筛选
            </label>
            <select
              value={localFilters.rating}
              onChange={(e) => handleChange("rating", e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">全部评分</option>
              <option value="5">5星及以上</option>
              <option value="4">4星及以上</option>
              <option value="3">3星及以上</option>
              <option value="2">2星及以上</option>
              <option value="1">1星及以上</option>
            </select>
          </div>
        </div>

        {/* 高级筛选切换 */}
        <div className="border-t pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4 mr-1" />
            ) : (
              <ChevronDown className="w-4 h-4 mr-1" />
            )}
            {showAdvanced ? "隐藏高级筛选" : "显示高级筛选"}
            <Filter className="w-4 h-4 ml-1" />
          </button>

          {/* 高级筛选内容 */}
          {showAdvanced && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  产品品类
                </label>
                <select
                  value={localFilters.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">全部品类</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <X className="w-4 h-4 mr-2" />
                  清除所有筛选
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  应用筛选
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 当前筛选标签 */}
        {Object.values(localFilters).some((v) => v && v !== "all") && (
          <div className="flex flex-wrap gap-2 pt-2">
            {localFilters.search && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                搜索: {localFilters.search}
                <button
                  type="button"
                  onClick={() => handleChange("search", "")}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                >
                  ×
                </button>
              </span>
            )}
            {localFilters.region !== "all" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                地区: {localFilters.region}
                <button
                  type="button"
                  onClick={() => handleChange("region", "all")}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-purple-200"
                >
                  ×
                </button>
              </span>
            )}
            {localFilters.rating !== "all" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                评分: {localFilters.rating}星以上
                <button
                  type="button"
                  onClick={() => handleChange("rating", "all")}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-yellow-200"
                >
                  ×
                </button>
              </span>
            )}
            {localFilters.category !== "all" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                品类: {localFilters.category}
                <button
                  type="button"
                  onClick={() => handleChange("category", "all")}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-indigo-200"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
