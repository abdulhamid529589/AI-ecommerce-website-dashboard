import React from 'react'
import { ShoppingCart, Package, Users, BarChart3, Settings, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

const QuickActions = () => {
  const actions = [
    {
      icon: ShoppingCart,
      title: 'New Order',
      description: 'Create a manual order',
      href: '/dashboard/orders',
      color: 'blue',
    },
    {
      icon: Package,
      title: 'Add Product',
      description: 'Add a new product',
      href: '/dashboard/products',
      color: 'green',
    },
    {
      icon: Users,
      title: 'New Customer',
      description: 'Add customer manually',
      href: '/dashboard/customers',
      color: 'purple',
    },
    {
      icon: FileText,
      title: 'Export Report',
      description: 'Generate sales report',
      href: '#',
      color: 'orange',
    },
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Link
            key={action.title}
            to={action.href}
            className={`p-6 rounded-lg bg-gradient-to-br ${getColorClasses(action.color)} text-white transition-all duration-300 transform hover:scale-105`}
          >
            <Icon size={28} className="mb-3" />
            <h4 className="font-semibold mb-1">{action.title}</h4>
            <p className="text-sm opacity-90">{action.description}</p>
          </Link>
        )
      })}
    </div>
  )
}

export default QuickActions
