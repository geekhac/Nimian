// 性能监控工具
import React from 'react';

export interface PerformanceMetrics {
  page: string;
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
}

export interface UserInteraction {
  action: string;
  timestamp: number;
  properties?: Record<string, any>;
}

export class PerformanceMonitor {
  private static metrics: PerformanceMetrics[] = [];
  private static interactions: UserInteraction[] = [];

  // 页面性能监控
  static trackPageView(page: string): PerformanceMetrics {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    const metrics: PerformanceMetrics = {
      page,
      loadTime: navigation.loadEventEnd - navigation.fetchStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
    };

    // 获取 Web Vitals 指标（如果支持）
    if ('PerformanceObserver' in window) {
      try {
        // First Contentful Paint
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              metrics.firstContentfulPaint = entry.startTime;
            }
          }
        });
        paintObserver.observe({ type: 'paint', buffered: true });

        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          metrics.largestContentfulPaint = lastEntry.startTime;
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (error) {
        console.warn('Performance monitoring not fully supported:', error);
      }
    }

    this.metrics.push(metrics);
    
    // 发送到分析服务（这里可以替换为实际的分析服务）
    this.sendToAnalytics('page_view', metrics);
    
    // 控制台输出（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Page Performance: ${page}`, metrics);
    }
    
    return metrics;
  }

  // 用户交互追踪
  static trackUserInteraction(action: string, properties?: Record<string, any>): void {
    const interaction: UserInteraction = {
      action,
      timestamp: Date.now(),
      properties,
    };

    this.interactions.push(interaction);
    
    // 发送到分析服务
    this.sendToAnalytics('user_interaction', interaction);
    
    // 控制台输出（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log(`👆 User Interaction: ${action}`, properties);
    }
  }

  // API 性能监控
  static trackAPICall(endpoint: string, duration: number, success: boolean): void {
    const properties = {
      endpoint,
      duration,
      success,
      status: success ? 'success' : 'error',
    };

    this.trackUserInteraction('api_call', properties);
  }

  // 错误监控
  static trackError(error: Error, context?: Record<string, any>): void {
    const properties = {
      message: error.message,
      stack: error.stack,
      context,
    };

    this.trackUserInteraction('error', properties);
    
    // 发送到错误监控服务（如 Sentry）
    if (process.env.NODE_ENV === 'production') {
      // 这里可以集成 Sentry 或其他错误监控服务
      console.error('Error tracked:', error, context);
    }
  }

  // 获取性能报告
  static getPerformanceReport(): {
    metrics: PerformanceMetrics[];
    interactions: UserInteraction[];
    summary: {
      totalPageViews: number;
      averageLoadTime: number;
      totalInteractions: number;
      errorCount: number;
    };
  } {
    const totalPageViews = this.metrics.length;
    const averageLoadTime = totalPageViews > 0 
      ? this.metrics.reduce((sum, m) => sum + m.loadTime, 0) / totalPageViews 
      : 0;
    const totalInteractions = this.interactions.length;
    const errorCount = this.interactions.filter(i => i.action === 'error').length;

    return {
      metrics: this.metrics,
      interactions: this.interactions,
      summary: {
        totalPageViews,
        averageLoadTime,
        totalInteractions,
        errorCount,
      },
    };
  }

  // 清除数据
  static clearData(): void {
    this.metrics = [];
    this.interactions = [];
  }

  // 发送到分析服务（模拟）
  private static sendToAnalytics(event: string, data: any): void {
    // 这里可以替换为实际的分析服务，如 Google Analytics、Mixpanel 等
    // 例如：
    // gtag('event', event, data);
    // mixpanel.track(event, data);
    
    // 开发环境下存储到 localStorage
    if (process.env.NODE_ENV === 'development') {
      const existingData = localStorage.getItem('performance_data') || '{}';
      const parsed = JSON.parse(existingData);
      parsed[event] = parsed[event] || [];
      parsed[event].push({
        ...data,
        timestamp: Date.now(),
      });
      localStorage.setItem('performance_data', JSON.stringify(parsed));
    }
  }

  // 性能警告
  static checkPerformanceThresholds(): void {
    const report = this.getPerformanceReport();
    
    // 检查页面加载时间
    const slowPages = report.metrics.filter(m => m.loadTime > 3000); // 3秒
    if (slowPages.length > 0) {
      console.warn('🐌 Slow loading pages detected:', slowPages);
    }
    
    // 检查错误率
    const errorRate = report.summary.errorCount / report.summary.totalInteractions;
    if (errorRate > 0.05) { // 5% 错误率
      console.warn('⚠️ High error rate detected:', errorRate);
    }
  }
}

// React Hook 用于自动追踪页面性能
export function usePerformanceTracking(page: string) {
  React.useEffect(() => {
    // 等待页面完全加载
    if (document.readyState === 'complete') {
      PerformanceMonitor.trackPageView(page);
    } else {
      window.addEventListener('load', () => {
        PerformanceMonitor.trackPageView(page);
      });
    }

    return () => {
      // 组件卸载时的清理工作
      PerformanceMonitor.checkPerformanceThresholds();
    };
  }, [page]);
}

// API 调用包装器
export function withPerformanceTracking<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  endpoint: string
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    try {
      const result = await fn(...args);
      const duration = Date.now() - startTime;
      PerformanceMonitor.trackAPICall(endpoint, duration, true);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      PerformanceMonitor.trackAPICall(endpoint, duration, false);
      PerformanceMonitor.trackError(error as Error, { endpoint });
      throw error;
    }
  };
}
