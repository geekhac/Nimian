// components/brands/BrandStats.tsx
"use client";

import { Building2, MapPin, Package, TrendingUp } from "lucide-react";

interface Brand {
  id: string;
  brand_name: string;
  registered_location: string | null;
  core_category_focus: string[];
}

interface BrandStatsProps {
  brands: Brand[];
}

export default function BrandStats({ brands }: BrandStatsProps) {
  // 计算统计数据
  const totalBrands = brands.length;

  // 按地区分组
  const locations = brands.reduce(
    (acc, brand) => {
      const location = brand.registered_location || "未知";
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const uniqueLocations = Object.keys(locations).length;

  // 计算平均品类数
  const totalCategories = brands.reduce(
    (sum, brand) => sum + (brand.core_category_focus?.length || 0),
    0,
  );
  const avgCategories =
    totalBrands > 0 ? (totalCategories / totalBrands).toFixed(1) : "0";

  const stats = [
    {
      title: "品牌总数",
      value: totalBrands,
      icon: Building2,
      color: "bg-blue-500",
      change: "+12%",
      trend: "up",
    },
    {
      title: "地区分布",
      value: uniqueLocations,
      icon: MapPin,
      color: "bg-green-500",
      change: "+3",
      trend: "up",
    },
    {
      title: "平均品类",
      value: avgCategories,
      icon: Package,
      color: "bg-purple-500",
      change: "+0.5",
      trend: "up",
    },
    {
      title: "活跃品牌",
      value: totalBrands,
      icon: TrendingUp,
      color: "bg-orange-500",
      change: "100%",
      trend: "stable",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stat.value}
              </p>
              <div className="flex items-center mt-2">
                <span
                  className={`text-sm font-medium ${stat.trend === "up" ? "text-green-600" : stat.trend === "down" ? "text-red-600" : "text-gray-600"}`}
                >
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-2">上月</span>
              </div>
            </div>
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
