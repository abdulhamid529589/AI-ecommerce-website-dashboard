import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  Users,
  ShoppingCart,
  Eye,
  Clock,
  MapPin,
  BarChart3,
  PieChart,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart as RechartsChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

export default function AdvancedAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7days')
  const [analytics, setAnalytics] = useState({
    pageViews: 0,
    uniqueVisitors: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
    conversionRate: 0,
    revenue: 0,
  })

  // Sample data for charts
  const trafficData = [
    { date: 'Mon', views: 400, visitors: 240, sales: 24 },
    { date: 'Tue', views: 600, visitors: 320, sales: 36 },
    { date: 'Wed', views: 800, visitors: 420, sales: 48 },
    { date: 'Thu', views: 700, visitors: 380, sales: 42 },
    { date: 'Fri', views: 950, visitors: 520, sales: 58 },
    { date: 'Sat', views: 1100, visitors: 680, sales: 72 },
    { date: 'Sun', views: 900, visitors: 590, sales: 64 },
  ]

  const topPages = [
    { name: 'Home', views: 4500, visitors: 2800, bounce: 32 },
    { name: 'Products', views: 3200, visitors: 2100, bounce: 28 },
    { name: 'About', views: 1800, visitors: 1200, bounce: 45 },
    { name: 'Contact', views: 1200, visitors: 800, bounce: 52 },
    { name: 'Blog', views: 900, visitors: 600, bounce: 38 },
  ]

  const deviceData = [
    { name: 'Mobile', value: 55, fill: '#3B82F6' },
    { name: 'Desktop', value: 35, fill: '#8B5CF6' },
    { name: 'Tablet', value: 10, fill: '#EC4899' },
  ]

  const regionData = [
    { name: 'Bangladesh', value: 45, fill: '#10B981' },
    { name: 'India', value: 25, fill: '#F59E0B' },
    { name: 'Pakistan', value: 15, fill: '#EF4444' },
    { name: 'Others', value: 15, fill: '#6B7280' },
  ]

  const conversionFunnel = [
    { stage: 'Visitors', count: 10000 },
    { stage: 'Product Views', count: 6500 },
    { stage: 'Add to Cart', count: 2100 },
    { stage: 'Checkout', count: 1200 },
    { stage: 'Purchase', count: 850 },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-slate-400 mt-1">Track your store performance and visitor behavior</p>
        </div>
        <div className="flex gap-2">
          {['24hours', '7days', '30days', '90days'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              {range === '24hours' && '24 Hours'}
              {range === '7days' && '7 Days'}
              {range === '30days' && '30 Days'}
              {range === '90days' && '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Page Views */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm font-medium">Page Views</p>
              <h3 className="text-3xl font-bold mt-2">24,585</h3>
              <p className="text-blue-200 text-sm mt-2">↑ 12% from last period</p>
            </div>
            <Eye size={32} className="opacity-20" />
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm font-medium">Unique Visitors</p>
              <h3 className="text-3xl font-bold mt-2">15,420</h3>
              <p className="text-purple-200 text-sm mt-2">↑ 8% from last period</p>
            </div>
            <Users size={32} className="opacity-20" />
          </div>
        </div>

        {/* Conversions */}
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm font-medium">Conversions</p>
              <h3 className="text-3xl font-bold mt-2">850</h3>
              <p className="text-green-200 text-sm mt-2">↑ 5.5% conversion rate</p>
            </div>
            <ShoppingCart size={32} className="opacity-20" />
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-100 text-sm font-medium">Revenue</p>
              <h3 className="text-3xl font-bold mt-2">$45,250</h3>
              <p className="text-orange-200 text-sm mt-2">↑ 23% from last period</p>
            </div>
            <TrendingUp size={32} className="opacity-20" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Chart */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-6">Traffic Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#3B82F6"
                name="Page Views"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="visitors"
                stroke="#8B5CF6"
                name="Visitors"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Device Distribution */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-6">Devices</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {deviceData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
            </RechartsChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {deviceData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-slate-300">{item.name}</span>
                <span className="text-white font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Pages & Regions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 size={20} /> Top Pages
          </h3>
          <div className="space-y-4">
            {topPages.map((page, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-medium">{page.name}</span>
                  <span className="text-slate-500 text-sm">
                    {page.views.toLocaleString()} views
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(page.views / 4500) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <MapPin size={20} /> Geographic Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsChart>
              <Pie
                data={regionData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label
              >
                {regionData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
            </RechartsChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-6">Conversion Funnel</h3>
        <div className="space-y-4">
          {conversionFunnel.map((item, idx) => {
            const percentage = (item.count / conversionFunnel[0].count) * 100
            return (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-medium">{item.stage}</span>
                  <span className="text-slate-500 text-sm">
                    {item.count.toLocaleString()} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      idx === 0
                        ? 'bg-blue-600'
                        : idx === 1
                          ? 'bg-purple-600'
                          : idx === 2
                            ? 'bg-pink-600'
                            : idx === 3
                              ? 'bg-orange-600'
                              : 'bg-green-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-2">Avg. Session Duration</p>
          <h3 className="text-2xl font-bold text-white">4m 32s</h3>
          <p className="text-green-400 text-sm mt-2">↑ 15% improvement</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-2">Bounce Rate</p>
          <h3 className="text-2xl font-bold text-white">32%</h3>
          <p className="text-green-400 text-sm mt-2">↓ 8% improvement</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-2">Pages per Session</p>
          <h3 className="text-2xl font-bold text-white">3.8</h3>
          <p className="text-green-400 text-sm mt-2">↑ 12% improvement</p>
        </div>
      </div>
    </div>
  )
}
