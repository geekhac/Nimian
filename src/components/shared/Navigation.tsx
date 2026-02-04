"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Truck, Store } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const allNavItems = [
    {
      href: "/",
      label: "首页",
      icon: Package,
      active: pathname === "/",
    },
    {
      href: "/products",
      label: "商品管理",
      icon: Package,
      active: pathname.startsWith("/products"),
    },
    {
      href: "/suppliers",
      label: "供应商管理",
      icon: Truck,
      active: pathname.startsWith("/suppliers"),
    },
    {
      href: "/brands",
      label: "品牌管理",
      icon: Store,
      active: pathname.startsWith("/brands"),
    },
  ];

  // 过滤掉当前页面的导航项
  const navItems = allNavItems.filter((item) => !item.active);

  // 如果过滤后没有导航项（比如在首页），则显示所有导航项
  const displayNavItems = navItems.length === 0 ? allNavItems : navItems;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav className="flex items-center space-x-8">
          {displayNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  item.active
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
