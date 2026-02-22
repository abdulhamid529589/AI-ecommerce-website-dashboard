import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Activity } from 'lucide-react'
import performanceMonitoringService from '../services/performanceMonitoringService'
import './PerformanceDashboard.css'

/**
 * Performance Dashboard for Monitoring Real User Metrics
 */
const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState(null)
  const [health, setHealth] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [timeRange, setTimeRange] = useState('1h')
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadMetrics()

    // Auto-refresh if enabled
    const interval = autoRefresh ? setInterval(loadMetrics, 30000) : null

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const loadMetrics = () => {
    const currentMetrics = performanceMonitoringService.getMetrics()
    const healthStatus = performanceMonitoringService.checkMetricsHealth()
    const recs = generateRecommendations(currentMetrics)

    setMetrics(currentMetrics)
    setHealth(healthStatus)
    setRecommendations(recs)
  }

  const generateRecommendations = (metrics) => {
    const recs = []

    if (metrics.pageLoadTime > 3000) {
      recs.push({
        severity: 'critical',
        title: 'Slow Page Load',
        description: `Page load time is ${metrics.pageLoadTime.toFixed(0)}ms (threshold: 3000ms)`,
        action: 'Optimize images, enable code splitting',
      })
    }

    if (metrics.largestContentfulPaint > 2500) {
      recs.push({
        severity: 'warning',
        title: 'Slow LCP',
        description: `LCP is ${metrics.largestContentfulPaint.toFixed(0)}ms (threshold: 2500ms)`,
        action: 'Preload critical resources',
      })
    }

    if (metrics.cumulativeLayoutShift > 0.1) {
      recs.push({
        severity: 'warning',
        title: 'High Layout Shift',
        description: `CLS is ${metrics.cumulativeLayoutShift.toFixed(3)} (threshold: 0.1)`,
        action: 'Reserve space for dynamic content',
      })
    }

    return recs
  }

  const getHealthBadgeColor = (status) => {
    return status === 'good' ? 'badge-success' : 'badge-warning'
  }

  const MetricCard = ({ title, value, unit, threshold, icon: Icon, status }) => (
    <div className={`metric-card ${status}`}>
      <div className="metric-header">
        <h3 className="metric-title">{title}</h3>
        <Icon size={20} className="metric-icon" />
      </div>
      <div className="metric-value">
        {typeof value === 'number' ? value.toFixed(2) : value}
        <span className="metric-unit">{unit}</span>
      </div>
      <div className="metric-threshold">
        Threshold: {threshold}
        {unit}
      </div>
      <div className={`metric-status ${status}`}>
        {status === 'good' ? '✓ Good' : '⚠ Needs Improvement'}
      </div>
    </div>
  )

  if (!metrics || !health) {
    return (
      <div className="performance-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Loading performance metrics...</p>
      </div>
    )
  }

  return (
    <div className="performance-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          <Activity size={28} />
          Performance Monitoring
        </h1>

        <div className="header-controls">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="1h">Last 1 Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto Refresh</span>
          </label>

          <button onClick={loadMetrics} className="btn-refresh">
            Refresh
          </button>
        </div>
      </div>

      {/* Health Summary */}
      <div className="health-summary">
        <div className={`health-badge ${health.overall}`}>
          {health.overall === 'good' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          <span>Overall Status: {health.overall.toUpperCase()}</span>
        </div>
      </div>

      {/* Core Web Vitals */}
      <section className="metrics-section">
        <h2 className="section-title">Core Web Vitals</h2>
        <div className="metrics-grid">
          <MetricCard
            title="First Contentful Paint"
            value={metrics.firstContentfulPaint}
            unit="ms"
            threshold="1800"
            icon={TrendingUp}
            status={health.fcp}
          />

          <MetricCard
            title="Largest Contentful Paint"
            value={metrics.largestContentfulPaint}
            unit="ms"
            threshold="2500"
            icon={TrendingUp}
            status={health.lcp}
          />

          <MetricCard
            title="Cumulative Layout Shift"
            value={metrics.cumulativeLayoutShift}
            unit=""
            threshold="0.1"
            icon={TrendingDown}
            status={health.cls}
          />

          <MetricCard
            title="First Input Delay"
            value={metrics.firstInputDelay}
            unit="ms"
            threshold="100"
            icon={Activity}
            status={health.fid}
          />
        </div>
      </section>

      {/* Page Load Metrics */}
      <section className="metrics-section">
        <h2 className="section-title">Page Load Metrics</h2>
        <div className="metrics-grid">
          <MetricCard
            title="Total Page Load Time"
            value={metrics.pageLoadTime}
            unit="ms"
            threshold="3000"
            icon={TrendingUp}
            status={metrics.pageLoadTime <= 3000 ? 'good' : 'warning'}
          />

          <MetricCard
            title="DOM Content Loaded"
            value={metrics.domContentLoaded}
            unit="ms"
            threshold="2000"
            icon={Activity}
            status={metrics.domContentLoaded <= 2000 ? 'good' : 'warning'}
          />
        </div>
      </section>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="recommendations-section">
          <h2 className="section-title">Recommendations</h2>
          <div className="recommendations-list">
            {recommendations.map((rec, idx) => (
              <div key={idx} className={`recommendation-card severity-${rec.severity}`}>
                <div className="recommendation-header">
                  <h3 className="recommendation-title">{rec.title}</h3>
                  <span className={`severity-badge severity-${rec.severity}`}>
                    {rec.severity.toUpperCase()}
                  </span>
                </div>
                <p className="recommendation-description">{rec.description}</p>
                <p className="recommendation-action">💡 {rec.action}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Performance Tips */}
      <section className="tips-section">
        <h2 className="section-title">Performance Tips</h2>
        <div className="tips-list">
          <div className="tip-card">
            <h3>📦 Code Splitting</h3>
            <p>Load only the code needed for the current page/route</p>
          </div>
          <div className="tip-card">
            <h3>🖼️ Image Optimization</h3>
            <p>Use WebP format, lazy load images, serve responsive sizes</p>
          </div>
          <div className="tip-card">
            <h3>💾 Caching Strategy</h3>
            <p>Cache API responses and static assets, use Service Workers</p>
          </div>
          <div className="tip-card">
            <h3>🔄 Compression</h3>
            <p>Enable GZIP, minify CSS/JS, purge unused CSS</p>
          </div>
        </div>
      </section>

      {/* Raw Metrics */}
      <section className="raw-metrics-section">
        <h2 className="section-title">Raw Metrics Data</h2>
        <div className="raw-metrics-table">
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(metrics).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{typeof value === 'number' ? value.toFixed(2) : value}</td>
                  <td>{key.includes('Time') || key.includes('Shift') ? 'ms' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default PerformanceDashboard
