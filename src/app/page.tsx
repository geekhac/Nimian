import Link from "next/link";
import {
  Store,
  Tag,
  Package,
  Truck,
  Layers,
  BarChart,
  Settings,
  Users,
  ShoppingBag,
  Grid,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  const navigationCards = [
    {
      title: "商家管理",
      description: "管理入驻商家信息、交易数据和业绩统计",
      icon: <Store className="w-8 h-8" />,
      href: "/merchants",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      stats: "45家商家",
      statColor: "text-blue-500",
    },
    {
      title: "品牌管理",
      description: "维护品牌信息、授权管理和品牌分类",
      icon: <Tag className="w-8 h-8" />,
      href: "/brands",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      stats: "32个品牌",
      statColor: "text-purple-500",
    },
    {
      title: "商品管理",
      description: "商品上架、库存管理和商品分类",
      icon: <Package className="w-8 h-8" />,
      href: "/products",
      color: "bg-gradient-to-br from-green-500 to-green-600",
      stats: "1,248件商品",
      statColor: "text-green-500",
    },
    {
      title: "供应商管理",
      description: "供应商信息、合作状态和联系方式",
      icon: <Truck className="w-8 h-8" />,
      href: "/suppliers",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      stats: "18家供应商",
      statColor: "text-orange-500",
    },
    {
      title: "供货信息管理",
      description: "供应商商品供货价格、库存和合同管理",
      icon: <Layers className="w-8 h-8" />,
      href: "/supplies",
      color: "bg-gradient-to-br from-red-500 to-red-600",
      stats: "256条记录",
      statColor: "text-red-500",
    },
    {
      title: "数据统计",
      description: "查看业务数据报表和分析图表",
      icon: <BarChart className="w-8 h-8" />,
      href: "/analytics",
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
      stats: "实时更新",
      statColor: "text-indigo-500",
    },
  ];

  const quickActions = [
    {
      name: "添加新商家",
      href: "/merchants?action=add",
      icon: <Users className="w-4 h-4" />,
    },
    {
      name: "上架新商品",
      href: "/products?action=add",
      icon: <ShoppingBag className="w-4 h-4" />,
    },
    {
      name: "新增供应商",
      href: "/suppliers?action=add",
      icon: <Truck className="w-4 h-4" />,
    },
    {
      name: "系统设置",
      href: "/settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const recentActivities = [
    { action: "新商家入驻", merchant: "鲜果时光", time: "10分钟前" },
    { action: "商品上架", merchant: "Nike运动鞋", time: "30分钟前" },
    { action: "供货价格更新", merchant: "苹果供应商", time: "1小时前" },
    { action: "品牌授权更新", merchant: "Adidas", time: "2小时前" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Grid className="w-8 h-8 text-blue-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">
                供应链管理系统
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                系统设置
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 欢迎区域 */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            欢迎回来，管理员
          </h2>
          <p className="text-gray-600">
            这里是供应链管理系统的控制中心，您可以快速访问各个管理模块
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">今日订单</p>
                <p className="text-2xl font-bold mt-2">1,248</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-green-600">↑ 12.5% 较昨日</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">活跃商家</p>
                <p className="text-2xl font-bold mt-2">38</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Store className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-green-600">↑ 3家 本周新增</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总库存量</p>
                <p className="text-2xl font-bold mt-2">45,621</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-red-600">↓ 2.3% 较上周</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">待处理</p>
                <p className="text-2xl font-bold mt-2">23</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Tag className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">包含审核、问题单等</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要功能导航 */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">功能模块</h3>
              <p className="text-sm text-gray-500">点击卡片进入对应管理页面</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {navigationCards.map((card) => (
                <Link key={card.title} href={card.href} className="group">
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border hover:border-blue-200">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`${card.color} p-3 rounded-xl text-white`}
                        >
                          {card.icon}
                        </div>
                        <span
                          className={`text-sm font-medium ${card.statColor}`}
                        >
                          {card.stats}
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {card.title}
                      </h4>
                      <p className="text-gray-600 text-sm mb-4">
                        {card.description}
                      </p>
                      <div className="flex items-center text-blue-600 text-sm font-medium">
                        <span>立即访问</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 右侧侧边栏 */}
          <div className="space-y-8">
            {/* 快捷操作 */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                快捷操作
              </h3>
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.name}
                    href={action.href}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-100 rounded-lg mr-3 group-hover:bg-blue-50 transition-colors">
                        {action.icon}
                      </div>
                      <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                        {action.name}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </div>

            {/* 最近动态 */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                最近动态
              </h3>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {activity.action}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {activity.merchant}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 系统状态 */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">系统状态</h3>
              <p className="text-sm opacity-90 mb-4">所有系统运行正常</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">API响应时间</span>
                  <span className="text-sm font-medium">128ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">数据库连接</span>
                  <span className="text-sm font-medium text-green-300">
                    正常
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">在线用户</span>
                  <span className="text-sm font-medium">24</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部说明 */}
        <div className="mt-10 pt-8 border-t">
          <div className="text-center text-gray-600">
            <p className="mb-2">供应链管理系统 v1.0</p>
            <p className="text-sm">如有问题，请联系技术支持或查看使用文档</p>
          </div>
        </div>
      </main>
    </div>
  );
}
