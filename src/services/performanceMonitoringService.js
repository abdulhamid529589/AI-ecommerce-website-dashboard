/**
 * Performance Monitoring Service for Dashboard
 * Tracks and monitors system performance, API response times, and resource usage
 */

import api from '../lib/axios'

// Performance metrics storage
const METRICS = {
  pageLoadTime: 0,
  apiResponseTime: 0,
  serverUptime: 100,
  databaseQueryTime: 0,
  cacheHitRate: 95,
  errorRate: 0,
  requestsPerSecond: 0,
  activeConnections: 0,
  cpuUsage: 0,
  memoryUsage: 0,
  diskUsage: 0,
}

// Performance thresholds
const THRESHOLDS = {
  'good-api-response': 200, // milliseconds
  'acceptable-api-response': 500,
  'good-db-query': 100,
  'good-cpu': 70, // percentage
  'good-memory': 80, // percentage
  'good-cache-hit': 85, // percentage
  'max-error-rate': 1, // percentage
}

// Metrics history for trend analysis
let metricsHistory = []
const MAX_HISTORY = 100

/**
 * Initialize performance monitoring
 */
export const initPerformanceMonitoring = () => {
  // Set initial page load time
  if (window.performance && window.performance.timing) {
    window.addEventListener('load', () => {
      const timing = window.performance.timing
      METRICS.pageLoadTime = timing.loadEventEnd - timing.navigationStart
    })
  }

  // Start collecting metrics periodically
  setInterval(collectMetrics, 30000) // Every 30 seconds
}

/**
 * Collect performance metrics from backend
 */
const collectMetrics = async () => {
  try {
    const response = await api.get('/api/v1/monitoring/metrics')

    if (response.data) {
      updateMetrics(response.data)
      addToHistory(response.data)
    }
  } catch (error) {
    console.error('Error collecting metrics:', error)
  }
}

/**
 * Update metrics object
 */
const updateMetrics = (data) => {
  Object.assign(METRICS, {
    apiResponseTime: data.apiResponseTime || METRICS.apiResponseTime,
    serverUptime: data.serverUptime || METRICS.serverUptime,
    databaseQueryTime: data.databaseQueryTime || METRICS.databaseQueryTime,
    cacheHitRate: data.cacheHitRate || METRICS.cacheHitRate,
    errorRate: data.errorRate || METRICS.errorRate,
    requestsPerSecond: data.requestsPerSecond || METRICS.requestsPerSecond,
    activeConnections: data.activeConnections || METRICS.activeConnections,
    cpuUsage: data.cpuUsage || METRICS.cpuUsage,
    memoryUsage: data.memoryUsage || METRICS.memoryUsage,
    diskUsage: data.diskUsage || METRICS.diskUsage,
  })
}

/**
 * Add metrics to history for trend analysis
 */
const addToHistory = (metrics) => {
  metricsHistory.push({
    ...metrics,
    timestamp: new Date().toISOString(),
  })

  // Keep only last 100 entries
  if (metricsHistory.length > MAX_HISTORY) {
    metricsHistory = metricsHistory.slice(-MAX_HISTORY)
  }
}

/**
 * Get current metrics
 */
export const getMetrics = () => {
  return { ...METRICS }
}

/**
 * Get metrics history
 */
export const getMetricsHistory = () => {
  return [...metricsHistory]
}

/**
 * Check if metrics are within healthy thresholds
 */
export const checkMetricsHealth = () => {
  const health = {
    apiResponse:
      METRICS.apiResponseTime <= THRESHOLDS['good-api-response']
        ? 'excellent'
        : METRICS.apiResponseTime <= THRESHOLDS['acceptable-api-response']
          ? 'good'
          : 'poor',
    serverUptime:
      METRICS.serverUptime >= 99.5 ? 'excellent' : METRICS.serverUptime >= 95 ? 'good' : 'poor',
    cpu: METRICS.cpuUsage <= THRESHOLDS['good-cpu'] ? 'good' : 'high',
    memory: METRICS.memoryUsage <= THRESHOLDS['good-memory'] ? 'good' : 'high',
    cacheHitRate: METRICS.cacheHitRate >= THRESHOLDS['good-cache-hit'] ? 'good' : 'low',
    errorRate: METRICS.errorRate <= THRESHOLDS['max-error-rate'] ? 'good' : 'high',
    databaseQueryTime:
      METRICS.databaseQueryTime <= THRESHOLDS['good-db-query']
        ? 'good'
        : METRICS.databaseQueryTime <= THRESHOLDS['good-db-query'] * 2
          ? 'acceptable'
          : 'slow',
  }

  // Calculate overall health
  const statuses = Object.values(health)
  const healthCounts = {
    excellent: statuses.filter((s) => s === 'excellent').length,
    good: statuses.filter((s) => s === 'good').length,
    acceptable: statuses.filter((s) => s === 'acceptable').length,
    high: statuses.filter((s) => s === 'high' || s === 'poor' || s === 'low' || s === 'slow')
      .length,
  }

  if (healthCounts.high > 0) {
    health.overall = 'needs-improvement'
  } else if (healthCounts.acceptable > 0) {
    health.overall = 'acceptable'
  } else if (healthCounts.excellent > 2) {
    health.overall = 'excellent'
  } else {
    health.overall = 'good'
  }

  return health
}

/**
 * Get performance trend (up/down/stable)
 */
export const getPerformanceTrend = (metricName, windowSize = 5) => {
  if (metricsHistory.length < windowSize) {
    return 'insufficient-data'
  }

  const recent = metricsHistory.slice(-windowSize).map((m) => m[metricName] || 0)
  const older = metricsHistory.slice(-windowSize * 2, -windowSize).map((m) => m[metricName] || 0)

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length

  const percentChange = ((recentAvg - olderAvg) / olderAvg) * 100

  if (percentChange > 5) return 'up'
  if (percentChange < -5) return 'down'
  return 'stable'
}

/**
 * Generate performance recommendations based on current metrics
 */
export const generateRecommendations = (metrics = METRICS) => {
  const recs = []

  // API Response Time
  if (metrics.apiResponseTime > THRESHOLDS['acceptable-api-response']) {
    recs.push({
      severity: 'critical',
      title: 'Slow API Response Time',
      description: `API response time is ${metrics.apiResponseTime.toFixed(0)}ms (acceptable: ${THRESHOLDS['acceptable-api-response']}ms)`,
      action: 'Optimize database queries, implement caching, scale API servers',
    })
  }

  // CPU Usage
  if (metrics.cpuUsage > THRESHOLDS['good-cpu']) {
    recs.push({
      severity: 'warning',
      title: 'High CPU Usage',
      description: `CPU usage is at ${metrics.cpuUsage.toFixed(1)}% (threshold: ${THRESHOLDS['good-cpu']}%)`,
      action: 'Review background jobs, optimize algorithms, consider horizontal scaling',
    })
  }

  // Memory Usage
  if (metrics.memoryUsage > THRESHOLDS['good-memory']) {
    recs.push({
      severity: 'warning',
      title: 'High Memory Usage',
      description: `Memory usage is at ${metrics.memoryUsage.toFixed(1)}% (threshold: ${THRESHOLDS['good-memory']}%)`,
      action: 'Check for memory leaks, optimize data structures, increase server RAM',
    })
  }

  // Cache Hit Rate
  if (metrics.cacheHitRate < THRESHOLDS['good-cache-hit']) {
    recs.push({
      severity: 'info',
      title: 'Low Cache Hit Rate',
      description: `Cache hit rate is ${metrics.cacheHitRate.toFixed(1)}% (target: ${THRESHOLDS['good-cache-hit']}%)`,
      action: 'Increase cache TTL, improve cache key strategy, add Redis cluster',
    })
  }

  // Error Rate
  if (metrics.errorRate > THRESHOLDS['max-error-rate']) {
    recs.push({
      severity: 'critical',
      title: 'High Error Rate',
      description: `Error rate is ${metrics.errorRate.toFixed(2)}% (acceptable: ${THRESHOLDS['max-error-rate']}%)`,
      action: 'Check error logs, debug failed requests, review recent deployments',
    })
  }

  // Database Query Time
  if (metrics.databaseQueryTime > THRESHOLDS['good-db-query'] * 2) {
    recs.push({
      severity: 'warning',
      title: 'Slow Database Queries',
      description: `Average query time is ${metrics.databaseQueryTime.toFixed(0)}ms (target: ${THRESHOLDS['good-db-query']}ms)`,
      action: 'Add database indexes, optimize queries, consider query caching',
    })
  }

  // Server Uptime
  if (metrics.serverUptime < 95) {
    recs.push({
      severity: 'critical',
      title: 'Low Server Uptime',
      description: `Server uptime is ${metrics.serverUptime.toFixed(2)}% (target: 99.9%)`,
      action: 'Investigate crashes, check resource limits, implement health monitoring',
    })
  }

  return recs
}

/**
 * Report performance issue to backend
 */
export const reportPerformanceIssue = async (issue, severity = 'warning') => {
  try {
    await api.post('/api/v1/monitoring/issues', {
      issue,
      severity,
      metrics: METRICS,
      timestamp: new Date().toISOString(),
    })

    console.log('Performance issue reported:', issue)
  } catch (error) {
    console.error('Error reporting performance issue:', error)
  }
}

/**
 * Get dashboard summary
 */
export const getDashboardSummary = () => {
  const health = checkMetricsHealth()

  return {
    metrics: METRICS,
    health,
    recommendations: generateRecommendations(),
    trends: {
      apiResponse: getPerformanceTrend('apiResponseTime'),
      cpuUsage: getPerformanceTrend('cpuUsage'),
      memoryUsage: getPerformanceTrend('memoryUsage'),
      errorRate: getPerformanceTrend('errorRate'),
    },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Reset metrics (for testing)
 */
export const resetMetrics = () => {
  Object.keys(METRICS).forEach((key) => {
    METRICS[key] = 0
  })
  metricsHistory = []
}

export default {
  initPerformanceMonitoring,
  getMetrics,
  getMetricsHistory,
  checkMetricsHealth,
  getPerformanceTrend,
  generateRecommendations,
  reportPerformanceIssue,
  getDashboardSummary,
  resetMetrics,
}
