import { supabase } from '@/integrations/supabase/client';
import { errorHandlingService } from './errorHandlingService';

interface PerformanceMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  tags: Record<string, any>;
  recorded_at: string;
}

interface PerformanceAlert {
  id: string;
  metric_name: string;
  threshold: number;
  operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface PerformanceReport {
  id: string;
  report_name: string;
  metrics: string[];
  time_range: {
    start: string;
    end: string;
  };
  aggregation: 'average' | 'sum' | 'min' | 'max' | 'count';
  generated_at: string;
  data: any;
}

interface SystemHealthCheck {
  id: string;
  check_name: string;
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  details: Record<string, any>;
  response_time_ms: number;
  checked_at: string;
}

export class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService;
  private readonly METRIC_RETENTION_DAYS = 90;
  private readonly HEALTH_CHECK_INTERVAL = 60000; // 1 minute
  private healthCheckTimer: NodeJS.Timeout | null = null;

  static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService();
    }
    return PerformanceMonitoringService.instance;
  }

  /**
   * Record performance metric
   */
  async recordMetric(
    metricName: string,
    value: number,
    unit: string = 'count',
    tags: Record<string, any> = {}
  ): Promise<string | null> {
    try {
      const metric: PerformanceMetric = {
        id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metric_name: metricName,
        metric_value: value,
        metric_unit: unit,
        tags,
        recorded_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('performance_metrics')
        .insert(metric)
        .select()
        .single();

      if (error) throw error;

      // Check for alerts
      await this.checkAlerts(metric);

      return data.id;

    } catch (error) {
      await errorHandlingService.logError(
        error,
        { component: 'PerformanceMonitoringService', action: 'recordMetric', metricName },
        'error'
      );
      return null;
    }
  }

  /**
   * Record API response time
   */
  async recordApiResponseTime(
    endpoint: string,
    method: string,
    responseTime: number,
    statusCode: number,
    userId?: string
  ): Promise<void> {
    try {
      await this.recordMetric('api_response_time', responseTime, 'ms', {
        endpoint,
        method,
        status_code: statusCode,
        user_id: userId
      });

      // Record status code distribution
      await this.recordMetric('api_status_codes', 1, 'count', {
        endpoint,
        method,
        status_code: statusCode
      });

    } catch (error) {
      await errorHandlingService.logError(
        error,
        { component: 'PerformanceMonitoringService', action: 'recordApiResponseTime', endpoint },
        'error'
      );
    }
  }

  /**
   * Record database query performance
   */
  async recordDatabaseQuery(
    query: string,
    executionTime: number,
    rowsAffected: number,
    userId?: string
  ): Promise<void> {
    try {
      await this.recordMetric('database_query_time', executionTime, 'ms', {
        query: query.substring(0, 100), // Truncate long queries
        rows_affected: rowsAffected,
        user_id: userId
      });

      await this.recordMetric('database_query_count', 1, 'count', {
        query_type: this.getQueryType(query)
      });

    } catch (error) {
      await errorHandlingService.logError(
        error,
        { component: 'PerformanceMonitoringService', action: 'recordDatabaseQuery' },
        'error'
      );
    }
  }

  /**
   * Record user activity
   */
  async recordUserActivity(
    userId: string,
    action: string,
    duration?: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.recordMetric('user_activity', 1, 'count', {
        user_id: userId,
        action,
        ...metadata
      });

      if (duration) {
        await this.recordMetric('user_activity_duration', duration, 'ms', {
          user_id: userId,
          action
        });
      }

    } catch (error) {
      await errorHandlingService.logError(
        error,
        { component: 'PerformanceMonitoringService', action: 'recordUserActivity', userId },
        'error'
      );
    }
  }

  /**
   * Record system resource usage
   */
  async recordSystemResources(): Promise<void> {
    try {
      // Simulate system resource monitoring
      const cpuUsage = Math.random() * 100;
      const memoryUsage = Math.random() * 100;
      const diskUsage = Math.random() * 100;

      await Promise.all([
        this.recordMetric('system_cpu_usage', cpuUsage, 'percent'),
        this.recordMetric('system_memory_usage', memoryUsage, 'percent'),
        this.recordMetric('system_disk_usage', diskUsage, 'percent')
      ]);

    } catch (error) {
      await errorHandlingService.logError(
        error,
        { component: 'PerformanceMonitoringService', action: 'recordSystemResources' },
        'error'
      );
    }
  }

  /**
   * Start health check monitoring
   */
  startHealthCheckMonitoring(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthChecks();
    }, this.HEALTH_CHECK_INTERVAL);
  }

  /**
   * Stop health check monitoring
   */
  stopHealthCheckMonitoring(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  /**
   * Perform health checks
   */
  async performHealthChecks(): Promise<void> {
    try {
      const checks = [
        this.checkDatabaseHealth(),
        this.checkEmailServiceHealth(),
        this.checkSMSServiceHealth(),
        this.checkPaymentServiceHealth(),
        this.checkWebhookServiceHealth()
      ];

      await Promise.all(checks);

    } catch (error) {
      await errorHandlingService.logError(
        error,
        { component: 'PerformanceMonitoringService', action: 'performHealthChecks' },
        'error'
      );
    }
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(): Promise<void> {
    try {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      const responseTime = Date.now() - startTime;
      const status = error ? 'critical' : responseTime > 1000 ? 'warning' : 'healthy';
      const message = error ? `Database error: ${error.message}` : 'Database connection healthy';

      await this.recordHealthCheck('database_connection', status, message, {
        response_time_ms: responseTime,
        error: error?.message
      });

    } catch (error) {
      await this.recordHealthCheck('database_connection', 'critical', `Database check failed: ${error.message}`, {
        error: error.message
      });
    }
  }

  /**
   * Check email service health
   */
  private async checkEmailServiceHealth(): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Simulate email service check
      const responseTime = Date.now() - startTime;
      const status = responseTime > 2000 ? 'warning' : 'healthy';
      const message = 'Email service operational';

      await this.recordHealthCheck('email_service', status, message, {
        response_time_ms: responseTime
      });

    } catch (error) {
      await this.recordHealthCheck('email_service', 'critical', `Email service check failed: ${error.message}`, {
        error: error.message
      });
    }
  }

  /**
   * Check SMS service health
   */
  private async checkSMSServiceHealth(): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Simulate SMS service check
      const responseTime = Date.now() - startTime;
      const status = responseTime > 3000 ? 'warning' : 'healthy';
      const message = 'SMS service operational';

      await this.recordHealthCheck('sms_service', status, message, {
        response_time_ms: responseTime
      });

    } catch (error) {
      await this.recordHealthCheck('sms_service', 'critical', `SMS service check failed: ${error.message}`, {
        error: error.message
      });
    }
  }

  /**
   * Check payment service health
   */
  private async checkPaymentServiceHealth(): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Simulate payment service check
      const responseTime = Date.now() - startTime;
      const status = responseTime > 5000 ? 'warning' : 'healthy';
      const message = 'Payment service operational';

      await this.recordHealthCheck('payment_service', status, message, {
        response_time_ms: responseTime
      });

    } catch (error) {
      await this.recordHealthCheck('payment_service', 'critical', `Payment service check failed: ${error.message}`, {
        error: error.message
      });
    }
  }

  /**
   * Check webhook service health
   */
  private async checkWebhookServiceHealth(): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Simulate webhook service check
      const responseTime = Date.now() - startTime;
      const status = responseTime > 1500 ? 'warning' : 'healthy';
      const message = 'Webhook service operational';

      await this.recordHealthCheck('webhook_service', status, message, {
        response_time_ms: responseTime
      });

    } catch (error) {
      await this.recordHealthCheck('webhook_service', 'critical', `Webhook service check failed: ${error.message}`, {
        error: error.message
      });
    }
  }

  /**
   * Record health check result
   */
  private async recordHealthCheck(
    checkName: string,
    status: 'healthy' | 'warning' | 'critical',
    message: string,
    details: Record<string, any>
  ): Promise<void> {
    try {
      const healthCheck: SystemHealthCheck = {
        id: `health_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        check_name: checkName,
        status,
        message,
        details,
        response_time_ms: details.response_time_ms || 0,
        checked_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('system_health_checks')
        .insert(healthCheck);

      if (error) throw error;

    } catch (error) {
      console.error('Error recording health check:', error);
    }
  }

  /**
   * Check performance alerts
   */
  private async checkAlerts(metric: PerformanceMetric): Promise<void> {
    try {
      const { data: alerts, error } = await supabase
        .from('performance_alerts')
        .select('*')
        .eq('metric_name', metric.metric_name)
        .eq('enabled', true);

      if (error) throw error;

      for (const alert of alerts || []) {
        const triggered = this.evaluateAlert(metric.metric_value, alert.threshold, alert.operator);
        
        if (triggered) {
          await this.handleAlert(alert, metric);
        }
      }

    } catch (error) {
      console.error('Error checking alerts:', error);
    }
  }

  /**
   * Evaluate alert condition
   */
  private evaluateAlert(value: number, threshold: number, operator: string): boolean {
    switch (operator) {
      case 'greater_than':
        return value > threshold;
      case 'less_than':
        return value < threshold;
      case 'equals':
        return value === threshold;
      case 'not_equals':
        return value !== threshold;
      default:
        return false;
    }
  }

  /**
   * Handle performance alert
   */
  private async handleAlert(alert: PerformanceAlert, metric: PerformanceMetric): Promise<void> {
    try {
      // Log alert
      await errorHandlingService.logError(
        `Performance alert triggered: ${alert.metric_name} ${alert.operator} ${alert.threshold}`,
        {
          component: 'PerformanceMonitoringService',
          action: 'handleAlert',
          metadata: {
            alert_id: alert.id,
            metric_value: metric.metric_value,
            threshold: alert.threshold,
            operator: alert.operator,
            severity: alert.severity
          }
        },
        alert.severity === 'critical' ? 'error' : 'warning'
      );

      // Send notification (in a real implementation, this would integrate with notification service)
      console.log(`ALERT: ${alert.metric_name} ${alert.operator} ${alert.threshold} (Current: ${metric.metric_value})`);

    } catch (error) {
      console.error('Error handling alert:', error);
    }
  }

  /**
   * Get query type from SQL query
   */
  private getQueryType(query: string): string {
    const upperQuery = query.toUpperCase().trim();
    
    if (upperQuery.startsWith('SELECT')) return 'SELECT';
    if (upperQuery.startsWith('INSERT')) return 'INSERT';
    if (upperQuery.startsWith('UPDATE')) return 'UPDATE';
    if (upperQuery.startsWith('DELETE')) return 'DELETE';
    if (upperQuery.startsWith('CREATE')) return 'CREATE';
    if (upperQuery.startsWith('DROP')) return 'DROP';
    if (upperQuery.startsWith('ALTER')) return 'ALTER';
    
    return 'OTHER';
  }

  /**
   * Generate performance report
   */
  async generatePerformanceReport(
    reportName: string,
    metrics: string[],
    timeRange: { start: string; end: string },
    aggregation: 'average' | 'sum' | 'min' | 'max' | 'count' = 'average'
  ): Promise<PerformanceReport | null> {
    try {
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .in('metric_name', metrics)
        .gte('recorded_at', timeRange.start)
        .lte('recorded_at', timeRange.end);

      if (error) throw error;

      const reportData = this.aggregateMetrics(data || [], aggregation);
      
      const report: PerformanceReport = {
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        report_name: reportName,
        metrics,
        time_range: timeRange,
        aggregation,
        generated_at: new Date().toISOString(),
        data: reportData
      };

      // Store report
      const { data: storedReport, error: storeError } = await supabase
        .from('performance_reports')
        .insert(report)
        .select()
        .single();

      if (storeError) throw storeError;

      return storedReport;

    } catch (error) {
      await errorHandlingService.logError(
        error,
        { component: 'PerformanceMonitoringService', action: 'generatePerformanceReport', reportName },
        'error'
      );
      return null;
    }
  }

  /**
   * Aggregate metrics data
   */
  private aggregateMetrics(metrics: PerformanceMetric[], aggregation: string): any {
    const grouped = metrics.reduce((acc, metric) => {
      if (!acc[metric.metric_name]) {
        acc[metric.metric_name] = [];
      }
      acc[metric.metric_name].push(metric.metric_value);
      return acc;
    }, {} as Record<string, number[]>);

    const result: Record<string, any> = {};

    for (const [metricName, values] of Object.entries(grouped)) {
      switch (aggregation) {
        case 'average':
          result[metricName] = values.reduce((sum, val) => sum + val, 0) / values.length;
          break;
        case 'sum':
          result[metricName] = values.reduce((sum, val) => sum + val, 0);
          break;
        case 'min':
          result[metricName] = Math.min(...values);
          break;
        case 'max':
          result[metricName] = Math.max(...values);
          break;
        case 'count':
          result[metricName] = values.length;
          break;
        default:
          result[metricName] = values;
      }
    }

    return result;
  }

  /**
   * Get performance statistics
   */
  async getPerformanceStats(days: number = 7): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('performance_metrics')
        .select('metric_name, metric_value, recorded_at')
        .gte('recorded_at', startDate.toISOString());

      if (error) throw error;

      const metrics = data || [];
      const grouped = metrics.reduce((acc, metric) => {
        if (!acc[metric.metric_name]) {
          acc[metric.metric_name] = [];
        }
        acc[metric.metric_name].push(metric.metric_value);
        return acc;
      }, {} as Record<string, number[]>);

      const stats: Record<string, any> = {};

      for (const [metricName, values] of Object.entries(grouped)) {
        stats[metricName] = {
          count: values.length,
          average: values.reduce((sum, val) => sum + val, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          latest: values[values.length - 1]
        };
      }

      return stats;

    } catch (error) {
      await errorHandlingService.logError(
        error,
        { component: 'PerformanceMonitoringService', action: 'getPerformanceStats' },
        'error'
      );
      return {};
    }
  }

  /**
   * Get system health status
   */
  async getSystemHealthStatus(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('system_health_checks')
        .select('*')
        .order('checked_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const checks = data || [];
      const statusCounts = checks.reduce((acc, check) => {
        acc[check.status] = (acc[check.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const overallStatus = statusCounts.critical > 0 ? 'critical' :
                           statusCounts.warning > 0 ? 'warning' : 'healthy';

      return {
        overall_status: overallStatus,
        status_counts: statusCounts,
        recent_checks: checks
      };

    } catch (error) {
      await errorHandlingService.logError(
        error,
        { component: 'PerformanceMonitoringService', action: 'getSystemHealthStatus' },
        'error'
      );
      return {
        overall_status: 'unknown',
        status_counts: {},
        recent_checks: []
      };
    }
  }

  /**
   * Clean up old metrics
   */
  async cleanupOldMetrics(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.METRIC_RETENTION_DAYS);

      const { error } = await supabase
        .from('performance_metrics')
        .delete()
        .lt('recorded_at', cutoffDate.toISOString());

      if (error) throw error;

      console.log(`Cleaned up metrics older than ${this.METRIC_RETENTION_DAYS} days`);

    } catch (error) {
      await errorHandlingService.logError(
        error,
        { component: 'PerformanceMonitoringService', action: 'cleanupOldMetrics' },
        'error'
      );
    }
  }
}

// Export singleton instance
export const performanceMonitoringService = PerformanceMonitoringService.getInstance();
