import React from 'react'

const KPI = ({ label, value }) => {
  return (
    <div className="bg-card rounded-lg p-4 shadow">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-sm text-muted-foreground">▲ 4.2%</div>
      </div>
      <div className="mt-3 h-8">
        <svg viewBox="0 0 100 20" className="w-full h-8 text-blue-500" preserveAspectRatio="none">
          <polyline
            points="0,16 20,12 40,8 60,6 80,4 100,2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}

export default KPI
