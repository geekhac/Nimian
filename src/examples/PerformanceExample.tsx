"use client";

import React, { useEffect, useState } from 'react';
import { PerformanceMonitor, usePerformanceTracking } from '@/lib/performance';

// 示例1: 使用 Hook 追踪页面性能
export function ProductPageWithTracking() {
  // 自动追踪页面性能
  usePerformanceTracking('products-page');
  
  return (
    <div>
      <h1>商品页面</h1>
      {/* 页面内容 */}
    </div>
  );
}

// 示例2: 手动追踪用户交互
export function InteractiveComponent() {
  const handleClick = () => {
    // 追踪按钮点击
    PerformanceMonitor.trackUserInteraction('button_click', {
      button_id: 'save_product',
      page: 'products',
      timestamp: Date.now()
    });
  };

  const handleSearch = (searchTerm: string) => {
    // 追踪搜索行为
    PerformanceMonitor.trackUserInteraction('search', {
      search_term: searchTerm,
      results_count: 10,
      page: 'products'
    });
  };

  return (
    <div>
      <button onClick={handleClick}>保存商品</button>
      <input 
        type="text" 
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="搜索商品..."
      />
    </div>
  );
}

// 示例3: API 调用性能追踪
export function APIComponent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // 包装 API 调用以自动追踪性能
  const fetchProductsWithTracking = PerformanceMonitor.withPerformanceTracking(
    async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    'get_products_api'
  );

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProductsWithTracking();
      setProducts(data);
    } catch (error) {
      // 错误会自动被追踪
      console.error('加载失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={loadProducts} disabled={loading}>
        {loading ? '加载中...' : '加载商品'}
      </button>
      {/* 商品列表 */}
    </div>
  );
}

// 示例4: 错误追踪
export function ErrorTrackingComponent() {
  const [error, setError] = useState<string | null>(null);

  const handleRiskyOperation = () => {
    try {
      // 模拟可能出错的操作
      throw new Error('这是一个示例错误');
    } catch (err) {
      // 追踪错误
      PerformanceMonitor.trackError(err as Error, {
        component: 'ErrorTrackingComponent',
        action: 'risky_operation',
        user_id: 'user123'
      });
      setError(err.message);
    }
  };

  return (
    <div>
      <button onClick={handleRiskyOperation}>
        执行可能出错的操作
      </button>
      {error && <p>错误: {error}</p>}
    </div>
  );
}

// 示例5: 性能报告组件
export function PerformanceReport() {
  const [report, setReport] = useState<any>(null);

  const generateReport = () => {
    const performanceReport = PerformanceMonitor.getPerformanceReport();
    setReport(performanceReport);
  };

  const clearData = () => {
    PerformanceMonitor.clearData();
    setReport(null);
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h2 className="text-lg font-semibold mb-4">性能报告</h2>
      
      <div className="space-x-2 mb-4">
        <button 
          onClick={generateReport}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          生成报告
        </button>
        <button 
          onClick={clearData}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          清除数据
        </button>
      </div>

      {report && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold mb-2">总体统计</h3>
            <ul className="space-y-1 text-sm">
              <li>页面浏览量: {report.summary.totalPageViews}</li>
              <li>平均加载时间: {report.summary.averageLoadTime.toFixed(2)}ms</li>
              <li>用户交互次数: {report.summary.totalInteractions}</li>
              <li>错误次数: {report.summary.errorCount}</li>
            </ul>
          </div>

          {report.metrics.length > 0 && (
            <div className="bg-white p-4 rounded border">
              <h3 className="font-semibold mb-2">页面性能</h3>
              <div className="space-y-2">
                {report.metrics.map((metric: any, index: number) => (
                  <div key={index} className="text-sm border-b pb-2">
                    <p><strong>页面:</strong> {metric.page}</p>
                    <p><strong>加载时间:</strong> {metric.loadTime}ms</p>
                    <p><strong>DOM加载:</strong> {metric.domContentLoaded}ms</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.interactions.length > 0 && (
            <div className="bg-white p-4 rounded border">
              <h3 className="font-semibold mb-2">用户交互</h3>
              <div className="space-y-2">
                {report.interactions.slice(-10).map((interaction: any, index: number) => (
                  <div key={index} className="text-sm border-b pb-2">
                    <p><strong>操作:</strong> {interaction.action}</p>
                    <p><strong>时间:</strong> {new Date(interaction.timestamp).toLocaleTimeString()}</p>
                    {interaction.properties && (
                      <p><strong>详情:</strong> {JSON.stringify(interaction.properties)}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 示例6: 完整的页面使用示例
export default function PerformanceExample() {
  useEffect(() => {
    // 页面加载完成后自动追踪
    PerformanceMonitor.trackPageView('performance-example');
    
    // 检查性能阈值
    setTimeout(() => {
      PerformanceMonitor.checkPerformanceThresholds();
    }, 3000);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">性能监控示例</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProductPageWithTracking />
        <InteractiveComponent />
        <APIComponent />
        <ErrorTrackingComponent />
      </div>
      
      <PerformanceReport />
    </div>
  );
}
