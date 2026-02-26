import React, { useEffect, useState } from 'react'
import {
  Bell,
  LayoutDashboard,
  ListOrdered,
  Package,
  Users,
  Menu,
  User,
  LogOut,
  MoveLeft,
  Settings,
  Zap,
  Home,
  Tag,
  Layers,
  Activity,
  ShoppingCart,
  MessageSquare,
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate, useLocation } from 'react-router-dom'
import './SideBar.css'

const SideBar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    // Products & Inventory
    { icon: Package, label: 'Products', path: '/products' },
    { icon: Zap, label: 'Inventory', path: '/products/inventory' },
    // Customers & Relationships
    { icon: Users, label: 'Customers', path: '/customers' },
    // Promotions & Marketing
    { icon: Tag, label: 'Promotions', path: '/promotions' },
    // Categories & Collections
    { icon: Layers, label: 'Categories', path: '/categories' },
    // Orders & Transactions
    { icon: ListOrdered, label: 'Orders', path: '/orders' },
    { icon: Zap, label: 'Order Manager', path: '/orders/manage' },
    // Performance & Analytics
    { icon: Activity, label: 'Performance', path: '/performance' },
    // Content & Homepage
    { icon: Home, label: 'Homepage', path: '/content/homepage' },
    // Ordering System Settings - NEW
    { icon: ShoppingCart, label: 'Ordering System', path: '/admin/ordering-system' },
    // Customer Chat Management
    { icon: MessageSquare, label: 'Customer Chats', path: '/admin/chats' },
    // Users & Settings
    { icon: Users, label: 'Users', path: '/users' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    // Clear auth and navigate to login
    // dispatch(logout())
    navigate('/login')
  }

  return (
    <>
      {/* Mobile Navbar - Always visible */}
      {isMobile && (
        <nav className="mobile-navbar">
          <button
            className="navbar-hamburger"
            onClick={() => setIsOpen(!isOpen)}
            title="Toggle sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="navbar-brand">
            <Package className="w-5 h-5" />
            <span>ShopHub</span>
          </div>
          <div className="navbar-spacer" />
        </nav>
      )}

      {/* Backdrop for mobile */}
      {isMobile && isOpen && <div className="sidebar-backdrop" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="logo-section">
            <div className="logo-icon">
              <Package className="w-6 h-6" />
            </div>
            <span className="logo-text">ShopHub</span>
          </div>

          {isMobile && (
            <button className="close-btn" onClick={() => setIsOpen(false)} title="Close sidebar">
              <MoveLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            <p className="nav-section-title">Menu</p>
            {menuItems.map((item) => (
              <a
                key={item.path}
                onClick={() => {
                  navigate(item.path)
                  if (isMobile) setIsOpen(false)
                }}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                title={item.label}
              >
                <span className="nav-icon">
                  <item.icon className="w-5 h-5" />
                </span>
                <span className="nav-label">{item.label}</span>
              </a>
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase() || 'A'}</div>
            <div className="user-details">
              <p className="user-name">{user?.name || 'Admin User'}</p>
              <p className="user-email">{user?.email || 'admin@example.com'}</p>
              <span className="user-role">Administrator</span>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default SideBar
