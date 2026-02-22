import React from 'react'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import './PremiumCard.css'

/**
 * INSANE-LEVEL PREMIUM CARD COMPONENT
 * Premium design with glass morphism, smooth animations, and micro-interactions
 */

export const PremiumCard = ({
  title,
  value,
  trend,
  trendLabel,
  icon: Icon,
  color = 'blue',
  size = 'default',
  showDetails = false,
  details = [],
  loading = false,
  onClick,
}) => {
  const isPositive = trend >= 0
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-200/20 hover:border-blue-300/30',
    green: 'from-green-500/20 to-green-600/5 border-green-200/20 hover:border-green-300/30',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-200/20 hover:border-purple-300/30',
    orange: 'from-orange-500/20 to-orange-600/5 border-orange-200/20 hover:border-orange-300/30',
    red: 'from-red-500/20 to-red-600/5 border-red-200/20 hover:border-red-300/30',
  }

  const iconColors = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500',
    red: 'text-red-500',
  }

  const sizeClasses = {
    small: 'p-3',
    default: 'p-6',
    large: 'p-8',
  }

  return (
    <div
      className={`
        premium-card
        relative overflow-hidden rounded-2xl backdrop-blur-xl
        border ${colorClasses[color]}
        bg-gradient-to-br transition-all duration-500 ease-out
        hover:shadow-2xl hover:shadow-${color}-500/20
        ${onClick ? 'cursor-pointer' : ''}
        ${size === 'large' ? 'col-span-2' : ''}
        group
      `}
      onClick={onClick}
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 -z-10">
        <div
          className={`
          absolute inset-0 bg-gradient-to-br ${colorClasses[color]}
          opacity-0 group-hover:opacity-100 transition-opacity duration-500
        `}
        />
      </div>

      {/* Glass Border Effect */}
      <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none" />

      {/* Content */}
      <div className={sizeClasses[size]}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">{title}</h3>
            <div className="flex items-baseline gap-3">
              {loading ? (
                <div className="h-8 w-24 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {value}
                </p>
              )}
            </div>
          </div>

          {/* Icon */}
          {Icon && (
            <div
              className={`
              ${iconColors[color]} p-3 rounded-xl
              bg-gradient-to-br from-white/20 to-white/5
              group-hover:scale-110 transition-transform duration-500
            `}
            >
              <Icon size={24} />
            </div>
          )}
        </div>

        {/* Trend */}
        {trend !== undefined && (
          <div className="flex items-center gap-2">
            <div
              className={`
              flex items-center gap-1 px-2.5 py-1 rounded-lg
              ${
                isPositive
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
              }
            `}
            >
              {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span className="text-sm font-semibold">{Math.abs(trend)}%</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {trendLabel || 'vs last month'}
            </span>
          </div>
        )}

        {/* Details Section */}
        {showDetails && details.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
            {details.map((detail, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{detail.label}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{detail.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hover Indicator */}
      <div
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent
        scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
      />
    </div>
  )
}

export default PremiumCard
