import React, { useState } from 'react'
import { X, ChevronDown, Clock, Package, Truck, CheckCircle } from 'lucide-react'

const OrderDetailModal = ({ order, onClose, onStatusUpdate, isDark }) => {
  const [newStatus, setNewStatus] = useState(order.status)
  const [isUpdating, setIsUpdating] = useState(false)

  const statusSteps = ['pending', 'processing', 'shipped', 'delivered']
  const currentStep = statusSteps.indexOf(order.status)

  const getStepIcon = (step) => {
    switch (step) {
      case 'pending':
        return Clock
      case 'processing':
        return Package
      case 'shipped':
        return Truck
      case 'delivered':
        return CheckCircle
      default:
        return Clock
    }
  }

  const handleUpdateStatus = async () => {
    if (newStatus !== order.status) {
      setIsUpdating(true)
      await onStatusUpdate(order.id, newStatus)
      setIsUpdating(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {order.id}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X size={24} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Timeline */}
          <div>
            <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Order Status
            </h3>
            <div className="flex items-center justify-between mb-4">
              {statusSteps.map((step, idx) => {
                const StepIcon = getStepIcon(step)
                const isCompleted = idx <= currentStep
                return (
                  <div key={step} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isCompleted ? 'bg-green-500' : isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                    >
                      <StepIcon
                        size={20}
                        className={
                          isCompleted ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-500'
                        }
                      />
                    </div>
                    <p
                      className={`text-xs text-center capitalize ${isCompleted ? (isDark ? 'text-green-400' : 'text-green-600') : isDark ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {step}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Status Update */}
            <div className="relative">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border appearance-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                {statusSteps.map((step) => (
                  <option key={step} value={step}>
                    {step.charAt(0).toUpperCase() + step.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className={`absolute right-3 top-3 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
              />
            </div>

            {newStatus !== order.status && (
              <button
                onClick={handleUpdateStatus}
                disabled={isUpdating}
                className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Updating...' : 'Update Status'}
              </button>
            )}
          </div>

          {/* Order Details */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Order Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Customer:</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {order.customer}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Email:</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {order.email}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Order Date:</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {new Date(order.date).toLocaleDateString('bn-BD')}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-600">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Total Amount:</span>
                <span className={`font-bold text-lg ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Items ({order.items})
            </h3>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Order contains {order.items} item(s)
              </p>
            </div>
          </div>

          {/* Payment Info */}
          <div>
            <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Payment Method
            </h3>
            <div
              className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
            >
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {order.payment}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailModal
