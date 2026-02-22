import React, { useState } from 'react'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  FileText,
  Palette,
  Mail,
  Bell,
  Search,
  ChevronDown,
  BarChart3,
  Image,
  Navigation,
  Zap,
  Globe,
  Lock,
  Code,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export default function DashboardMegaMenu() {
  const [openMenu, setOpenMenu] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/admin/dashboard',
      badge: 'Core',
    },
    {
      id: 'sales',
      label: 'Sales & Orders',
      icon: ShoppingCart,
      submenu: [
        { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
        { label: 'Payments', href: '/admin/payments', icon: 'CreditCard' },
        { label: 'Refunds', href: '/admin/refunds', icon: 'RotateCcw' },
        { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      ],
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      submenu: [
        { label: 'All Products', href: '/admin/products', icon: Package },
        { label: 'Categories', href: '/admin/categories', icon: 'Layers' },
        { label: 'Inventory', href: '/admin/inventory', icon: 'Archive' },
        { label: 'Reviews', href: '/admin/reviews', icon: 'Star' },
      ],
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      submenu: [
        { label: 'All Users', href: '/admin/users', icon: Users },
        { label: 'Segments', href: '/admin/segments', icon: 'Layers' },
        { label: 'Messages', href: '/admin/messages', icon: 'MessageSquare' },
      ],
    },
    {
      id: 'content',
      label: 'Content',
      icon: FileText,
      submenu: [
        { label: 'Pages', href: '/admin/content/pages', icon: FileText },
        { label: 'Sections', href: '/admin/content/sections', icon: 'Layout' },
        { label: 'Navigation', href: '/admin/content/navigation', icon: Navigation },
        { label: 'Banners', href: '/admin/content/banners', icon: Image },
      ],
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: Palette,
      submenu: [
        { label: 'Theme', href: '/admin/appearance/theme', icon: Palette },
        { label: 'Hero Slides', href: '/admin/appearance/hero', icon: Image },
        { label: 'Footer', href: '/admin/appearance/footer', icon: 'Layout' },
        { label: 'Branding', href: '/admin/appearance/branding', icon: 'Briefcase' },
      ],
    },
    {
      id: 'communications',
      label: 'Communications',
      icon: Mail,
      submenu: [
        { label: 'Email Templates', href: '/admin/communications/emails', icon: Mail },
        { label: 'Notifications', href: '/admin/communications/notifications', icon: Bell },
        { label: 'SMS', href: '/admin/communications/sms', icon: 'MessageCircle' },
        { label: 'Campaigns', href: '/admin/communications/campaigns', icon: 'Send' },
      ],
    },
    {
      id: 'seo',
      label: 'SEO & Marketing',
      icon: Globe,
      submenu: [
        { label: 'SEO Settings', href: '/admin/seo/settings', icon: Globe },
        { label: 'Meta Tags', href: '/admin/seo/meta', icon: 'Tag' },
        { label: 'Sitemap', href: '/admin/seo/sitemap', icon: 'Map' },
        { label: 'Analytics', href: '/admin/seo/analytics', icon: BarChart3 },
      ],
    },
    {
      id: 'system',
      label: 'System',
      icon: Settings,
      submenu: [
        { label: 'Settings', href: '/admin/system/settings', icon: Settings },
        { label: 'Security', href: '/admin/system/security', icon: Lock },
        { label: 'Integrations', href: '/admin/system/integrations', icon: Zap },
        { label: 'API', href: '/admin/system/api', icon: Code },
      ],
    },
  ]

  const filteredMenu = menuItems.filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.submenu?.some((sub) => sub.label.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const isActive = (href) => location.pathname === href

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="px-6 py-4">
        {/* Search Bar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Mega Menu */}
        <div className="flex flex-wrap gap-2">
          {filteredMenu.map((item) => (
            <div key={item.id} className="relative group">
              {item.submenu ? (
                <button
                  onMouseEnter={() => setOpenMenu(item.id)}
                  onMouseLeave={() => setOpenMenu(null)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition group relative"
                >
                  <item.icon size={18} />
                  <span className="font-medium text-sm">{item.label}</span>
                  <ChevronDown size={16} className="group-hover:rotate-180 transition" />

                  {/* Submenu Dropdown */}
                  <div
                    className={`absolute left-0 top-full mt-0 bg-slate-800 border border-slate-700 rounded-lg shadow-lg min-w-max opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${
                      openMenu === item.id ? 'opacity-100 visible' : ''
                    }`}
                  >
                    {item.submenu.map((subitem, idx) => (
                      <Link
                        key={idx}
                        to={subitem.href}
                        className={`block px-4 py-3 hover:bg-slate-700 transition first:rounded-t-lg last:rounded-b-lg text-sm whitespace-nowrap ${
                          isActive(subitem.href) ? 'bg-blue-600 text-white' : 'text-slate-200'
                        }`}
                      >
                        <span className="flex items-center gap-2">{subitem.label}</span>
                      </Link>
                    ))}
                  </div>
                </button>
              ) : (
                <Link
                  to={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm font-medium ${
                    isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-500 rounded text-xs">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
