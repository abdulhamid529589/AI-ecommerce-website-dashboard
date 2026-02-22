import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, BarChart3, ShoppingCart, Package, Users, Settings, LogOut } from 'lucide-react'

const AdminNavigation = ({ isDark }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: BarChart3,
    },
    {
      label: 'Orders',
      href: '/dashboard/orders',
      icon: ShoppingCart,
    },
    {
      label: 'Products',
      href: '/dashboard/products',
      icon: Package,
    },
    {
      label: 'Customers',
      href: '/dashboard/customers',
      icon: Users,
    },
    {
      label: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ]

  const isActive = (href) => location.pathname === href

  return (
    <nav
      className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-40`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <BarChart3 size={20} className="text-white" />
            </div>
            <span
              className={`font-bold text-lg hidden sm:inline ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              Admin Panel
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    active
                      ? isDark
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'bg-blue-50 text-blue-600'
                      : isDark
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <button
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              title="Logout"
            >
              <LogOut size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              {isMobileMenuOpen ? (
                <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
              ) : (
                <Menu size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div
            className={`md:hidden border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} py-4 space-y-2`}
          >
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    active
                      ? isDark
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'bg-blue-50 text-blue-600'
                      : isDark
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}

export default AdminNavigation
