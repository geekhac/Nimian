# 🚀 性能监控系统使用指南

## 📖 概述

性能监控系统是一个完整的性能追踪解决方案，帮助您监控页面性能、用户交互、API调用和错误情况。

## 🎯 主要功能

### 1. 页面性能监控
- 自动追踪页面加载时间
- 监控 DOM 内容加载时间
- 支持 Web Vitals 指标
- 性能阈值警告

### 2. 用户交互追踪
- 按钮点击事件
- 搜索行为追踪
- 表单提交监控
- 自定义事件追踪

### 3. API 性能监控
- API 响应时间追踪
- 成功/失败率统计
- 错误自动捕获
- 性能包装器

### 4. 错误监控
- JavaScript 错误捕获
- 错误上下文记录
- 错误率统计
- 开发环境详细错误信息

## 🛠️ 使用方法

### 基本导入

```typescript
import { 
  PerformanceMonitor, 
  usePerformanceTracking 
} from '@/lib/performance';
```

### 1. 页面性能追踪

#### 自动追踪（推荐）
```typescript
"use client";

import { usePerformanceTracking } from '@/lib/performance';

export function ProductPage() {
  // 自动追踪页面性能
  usePerformanceTracking('products-page');
  
  return (
    <div>
      <h1>商品页面</h1>
      {/* 页面内容 */}
    </div>
  );
}
```

#### 手动追踪
```typescript
import { PerformanceMonitor } from '@/lib/performance';

export function ProductPage() {
  useEffect(() => {
    // 手动追踪页面性能
    PerformanceMonitor.trackPageView('products-page');
  }, []);
  
  return <div>商品页面</div>;
}
```

### 2. 用户交互追踪

```typescript
import { PerformanceMonitor } from '@/lib/performance';

export function ProductCard({ product }) {
  const handleViewDetails = () => {
    // 追踪商品详情查看
    PerformanceMonitor.trackUserInteraction('view_product_details', {
      product_id: product.id,
      product_name: product.name,
      brand: product.brand,
      price: product.price
    });
  };

  const handleAddToCart = () => {
    // 追踪添加到购物车
    PerformanceMonitor.trackUserInteraction('add_to_cart', {
      product_id: product.id,
      quantity: 1,
      timestamp: Date.now()
    });
  };

  return (
    <div>
      <h3>{product.name}</h3>
      <button onClick={handleViewDetails}>查看详情</button>
      <button onClick={handleAddToCart}>加入购物车</button>
    </div>
  );
}
```

### 3. API 性能监控

#### 方法一：使用包装器（推荐）
```typescript
import { PerformanceMonitor } from '@/lib/performance';

const fetchProductsWithTracking = PerformanceMonitor.withPerformanceTracking(
  async (productId: string) => {
    const response = await fetch(`/api/products/${productId}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  },
  'get_product_details'
);

export function ProductComponent({ productId }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await fetchProductsWithTracking(productId);
      setProduct(data);
    } catch (error) {
      // 错误会自动被追踪和记录
      console.error('加载商品失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={loadProduct} disabled={loading}>
        {loading ? '加载中...' : '加载商品'}
      </button>
      {product && <div>{product.name}</div>}
    </div>
  );
}
```

#### 方法二：手动追踪
```typescript
import { PerformanceMonitor } from '@/lib/performance';

export function ProductService() {
  async function getProducts() {
    const startTime = Date.now();
    try {
      const response = await fetch('/api/products');
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        // 追踪成功的 API 调用
        PerformanceMonitor.trackAPICall('/api/products', duration, true);
        return response.json();
      } else {
        // 追踪失败的 API 调用
        PerformanceMonitor.trackAPICall('/api/products', duration, false);
        throw new Error('API request failed');
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      PerformanceMonitor.trackAPICall('/api/products', duration, false);
      PerformanceMonitor.trackError(error as Error, { 
        endpoint: '/api/products',
        action: 'get_products'
      });
      throw error;
    }
  }

  return { getProducts };
}
```

### 4. 错误追踪

```typescript
import { PerformanceMonitor } from '@/lib/performance';

export function ProductForm() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    try {
      // 模拟可能出错的操作
      await saveProduct(formData);
    } catch (err) {
      // 追踪错误并提供上下文
      PerformanceMonitor.trackError(err as Error, {
        component: 'ProductForm',
        action: 'submit_form',
        form_data: Object.fromEntries(formData),
        user_id: getCurrentUserId(),
        timestamp: Date.now()
      });
      
      setError('保存商品失败，请稍后重试');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 表单字段 */}
      {error && <div className="error">{error}</div>}
    </form>
  );
}
```

### 5. 性能报告

```typescript
import { PerformanceMonitor } from '@/lib/performance';

export function PerformanceDashboard() {
  const [report, setReport] = useState(null);

  const generateReport = () => {
    const performanceReport = PerformanceMonitor.getPerformanceReport();
    setReport(performanceReport);
    
    // 开发环境下输出到控制台
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Performance Report:', performanceReport);
    }
  };

  const clearData = () => {
    PerformanceMonitor.clearData();
    setReport(null);
  };

  return (
    <div className="performance-dashboard">
      <h2>性能监控面板</h2>
      
      <div className="actions">
        <button onClick={generateReport}>生成报告</button>
        <button onClick={clearData}>清除数据</button>
      </div>

      {report && (
        <div className="report">
          {/* 显示性能报告 */}
          <div className="summary">
            <h3>总体统计</h3>
            <p>页面浏览量: {report.summary.totalPageViews}</p>
            <p>平均加载时间: {report.summary.averageLoadTime.toFixed(2)}ms</p>
            <p>用户交互次数: {report.summary.totalInteractions}</p>
            <p>错误次数: {report.summary.errorCount}</p>
          </div>

          <div className="page-metrics">
            <h3>页面性能</h3>
            {report.metrics.map((metric, index) => (
              <div key={index}>
                <p>页面: {metric.page}</p>
                <p>加载时间: {metric.loadTime}ms</p>
                <p>DOM加载: {metric.domContentLoaded}ms</p>
              </div>
            ))}
          </div>

          <div className="interactions">
            <h3>用户交互</h3>
            {report.interactions.slice(-10).map((interaction, index) => (
              <div key={index}>
                <p>操作: {interaction.action}</p>
                <p>时间: {new Date(interaction.timestamp).toLocaleString()}</p>
                <p>详情: {JSON.stringify(interaction.properties)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

## 📊 数据存储和分析

### 开发环境
- 数据存储在 `localStorage` 中
- 控制台输出详细的性能信息
- 支持实时查看性能报告

### 生产环境
- 可以集成第三方分析服务（Google Analytics、Mixpanel 等）
- 支持错误监控服务（Sentry）
- 数据发送到服务器进行长期分析

## 🔧 高级配置

### 自性能阈值
```typescript
// 在应用启动时设置
PerformanceMonitor.checkPerformanceThresholds();
```

### 集成第三方服务
```typescript
// 修改 sendToAnalytics 方法
private static sendToAnalytics(event: string, data: any) {
  // Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', event, data);
  }
  
  // Mixpanel
  if (typeof mixpanel !== 'undefined') {
    mixpanel.track(event, data);
  }
  
  // Sentry (错误追踪)
  if (event === 'error' && typeof Sentry !== 'undefined') {
    Sentry.captureException(data.error, { extra: data.context });
  }
}
```

## 📈 性能指标解读

### 页面性能指标
- **加载时间**: 页面完全加载时间（目标 < 2秒）
- **DOM加载**: DOM 内容加载完成时间（目标 < 1秒）
- **FCP**: 首次内容绘制时间（目标 < 1.5秒）
- **LCP**: 最大内容绘制时间（目标 < 2.5秒）

### API 性能指标
- **响应时间**: API 调用耗时（目标 < 500ms）
- **成功率**: API 调用成功率（目标 > 99%）
- **错误率**: API 调用错误率（目标 < 1%）

### 用户交互指标
- **交互次数**: 用户操作频率
- **错误率**: 用户操作错误率（目标 < 5%）
- **转化率**: 关键操作完成率

## 🎯 最佳实践

### 1. 合理命名
```typescript
// ✅ 好的命名
PerformanceMonitor.trackUserInteraction('view_product_details', {
  product_id: '123',
  category: 'electronics'
});

// ❌ 不好的命名
PerformanceMonitor.trackUserInteraction('click', { data: '...' });
```

### 2. 提供上下文
```typescript
// ✅ 提供丰富上下文
PerformanceMonitor.trackError(error, {
  component: 'ProductForm',
  action: 'submit',
  user_id: 'user123',
  product_id: 'prod456'
});

// ❌ 缺少上下文
PerformanceMonitor.trackError(error);
```

### 3. 性能监控时机
```typescript
// ✅ 在关键操作前后监控
const startTime = Date.now();
await criticalOperation();
const duration = Date.now() - startTime;
PerformanceMonitor.trackUserInteraction('critical_operation', { duration });

// ❌ 过度监控
PerformanceMonitor.trackUserInteraction('every_mouse_move');
```

### 4. 数据隐私
```typescript
// ✅ 避免敏感数据
PerformanceMonitor.trackUserInteraction('form_submit', {
  form_type: 'contact',
  has_email: true // 而不是 email: 'user@example.com'
});

// ❌ 包含敏感信息
PerformanceMonitor.trackUserInteraction('form_submit', {
  email: 'user@example.com',
  phone: '123-456-7890'
});
```

## 🚨 注意事项

1. **性能影响**: 性能监控本身会消耗一定资源，避免过度监控
2. **数据量**: 长期运行会产生大量数据，定期清理或归档
3. **隐私保护**: 不要记录敏感的用户数据
4. **错误处理**: 监控系统本身不应该影响应用正常运行
5. **环境差异**: 开发和生产环境使用不同的配置

## 📚 相关资源

- [Web Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API)
- [Core Web Vitals](https://web.dev/vitals/)
- [React Performance](https://reactjs.org/docs/optimizing-performance.html)
- [Next.js Analytics](https://nextjs.org/docs/analytics)

---

通过合理使用这个性能监控系统，您可以：
- 🎯 识别性能瓶颈
- 📈 优化用户体验
- 🐛 快速定位问题
- 📊 基于数据做决策
- 🔧 持续改进应用质量
