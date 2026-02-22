import React from 'react'
import { Link } from 'react-router-dom'

const AdminSidebar = () => {
  return (
    <aside className="w-64 min-h-screen bg-card border-r border-gray-200 dark:border-gray-700 p-4 hidden md:block">
      <div className="mb-6">
        <h2 className="text-lg font-bold">Admin</h2>
        <p className="text-xs text-muted-foreground">Control center</p>
      </div>

      <nav className="space-y-1">
        <Link
          to="/admin"
          className="block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Dashboard
        </Link>
        <Link
          to="/admin/orders"
          className="block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Orders
        </Link>
        <Link
          to="/admin/products"
          className="block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Products
        </Link>
        <Link
          to="/admin/customers"
          className="block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Customers
        </Link>
        <Link
          to="/admin/analytics"
          className="block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Analytics
        </Link>
        <Link
          to="/admin/settings"
          className="block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Settings
        </Link>
      </nav>
    </aside>
  )
}

export default AdminSidebar
