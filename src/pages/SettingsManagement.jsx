import React, { useState, useEffect } from 'react'
import {
  Save,
  AlertCircle,
  CheckCircle,
  Trash2,
  Plus,
  Upload,
  Eye,
  EyeOff,
  Settings,
} from 'lucide-react'
import api from '../lib/axios'
import './SettingsManagement.css'

/**
 * Settings Management Component for Admin Dashboard
 * Manages hero slides, featured products, shop info, and system settings
 */
const SettingsManagement = () => {
  const [activeTab, setActiveTab] = useState('heroSlides')
  const [heroSlides, setHeroSlides] = useState([])
  const [shopInfo, setShopInfo] = useState({})
  const [systemSettings, setSystemSettings] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [editingSlide, setEditingSlide] = useState(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      // Load all settings in parallel
      const [bannersRes, globalRes] = await Promise.all([
        api.get('/content/banners'),
        api.get('/content/global'),
      ])

      // Parse hero slides from banners
      const bannersData = bannersRes.data?.data || []
      if (Array.isArray(bannersData)) {
        setHeroSlides(
          bannersData.map((banner) => ({
            id: banner.id,
            title: banner.title,
            description: banner.description || '',
            image: banner.image_url,
            link: banner.link,
            isActive: banner.is_active,
            order: banner.position || 0,
          })),
        )
      }

      // Parse global settings
      const globalData = globalRes.data?.data || {}
      setShopInfo({
        shopName: globalData.site_name || 'BedTex Bangladesh',
        email: globalData.email || 'contact@bedtex.bd',
        phone: globalData.phone || '+880 1234 567890',
        address: globalData.address || 'Dhaka, Bangladesh',
        description: globalData.description || 'Premium bedding and home textile store',
        currency: globalData.currency || 'BDT',
        timezone: globalData.timezone || 'Asia/Dhaka',
        logo: globalData.site_logo || '/logo.png',
        favicon: globalData.site_favicon || '/favicon.png',
      })

      setSystemSettings({
        maintenanceMode: globalData.maintenance_mode || false,
        orderNotifications: globalData.order_notifications !== false,
        stockAlerts: globalData.stock_alerts !== false,
        emailNotifications: globalData.email_notifications !== false,
        smsNotifications: globalData.sms_notifications || false,
        analyticsTracking: globalData.analytics_tracking !== false,
        socialMediaIntegration: globalData.social_media_integration !== false,
      })
    } catch (err) {
      console.error('Failed to load settings:', err)
      // Use fallback data
      setHeroSlides([
        {
          id: 1,
          title: 'Summer Collection',
          description: 'Get up to 50% off',
          image: '/slide1.jpg',
          link: '/collection/summer',
          isActive: true,
          order: 1,
        },
      ])

      setShopInfo({
        shopName: 'BedTex Bangladesh',
        email: 'contact@bedtex.bd',
        phone: '+880 1234 567890',
        address: 'Dhaka, Bangladesh',
        description: 'Premium bedding and home textile store',
        currency: 'BDT',
        timezone: 'Asia/Dhaka',
        logo: '/logo.png',
        favicon: '/favicon.png',
      })

      setSystemSettings({
        maintenanceMode: false,
        orderNotifications: true,
        stockAlerts: true,
        emailNotifications: true,
        smsNotifications: false,
        analyticsTracking: true,
        socialMediaIntegration: true,
      })

      showMessage('Using default settings - API temporarily unavailable', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  // Hero Slides Management
  const addNewSlide = () => {
    const newSlide = {
      id: Date.now(),
      title: '',
      description: '',
      image: '',
      link: '',
      isActive: true,
      order: heroSlides.length + 1,
    }
    setHeroSlides([...heroSlides, newSlide])
    setEditingSlide(newSlide.id)
  }

  const updateSlide = (id, field, value) => {
    setHeroSlides(
      heroSlides.map((slide) => (slide.id === id ? { ...slide, [field]: value } : slide)),
    )
  }

  const deleteSlide = (id) => {
    if (window.confirm('Are you sure you want to delete this slide?')) {
      // If it's a saved banner (numeric ID), delete from backend
      if (typeof id === 'number') {
        api
          .delete(`/content/banners/${id}`)
          .then(() => {
            setHeroSlides(heroSlides.filter((slide) => slide.id !== id))
            showMessage('Slide deleted successfully!', 'success')
          })
          .catch((err) => {
            showMessage('Failed to delete slide', 'error')
            console.error('Delete error:', err)
          })
      } else {
        // If it's a new slide (temporary ID), just remove from state
        setHeroSlides(heroSlides.filter((slide) => slide.id !== id))
      }
    }
  }

  const moveSlide = (id, direction) => {
    const index = heroSlides.findIndex((s) => s.id === id)
    if (direction === 'up' && index > 0) {
      const newSlides = [...heroSlides]
      ;[newSlides[index], newSlides[index - 1]] = [newSlides[index - 1], newSlides[index]]
      setHeroSlides(newSlides)
    } else if (direction === 'down' && index < heroSlides.length - 1) {
      const newSlides = [...heroSlides]
      ;[newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]]
      setHeroSlides(newSlides)
    }
  }

  // Shop Info Management
  const updateShopInfo = (field, value) => {
    setShopInfo({ ...shopInfo, [field]: value })
  }

  // System Settings Management
  const updateSystemSettings = (field, value) => {
    setSystemSettings({ ...systemSettings, [field]: value })
  }

  // Save All Settings
  const saveSettings = async () => {
    setSaving(true)
    try {
      // Prepare banner data from hero slides
      const bannerPromises = heroSlides.map((slide) => {
        const bannerData = {
          title: slide.title,
          description: slide.description,
          image_url: slide.image,
          link: slide.link,
          is_active: slide.isActive,
          position: slide.order,
        }

        if (slide.id && typeof slide.id === 'number') {
          // Update existing banner
          return api.put(`/content/banners/${slide.id}`, bannerData)
        } else {
          // Create new banner
          return api.post('/content/banners', bannerData)
        }
      })

      // Prepare global settings data
      const globalSettingsData = {
        site_name: shopInfo.shopName,
        site_logo: shopInfo.logo,
        site_favicon: shopInfo.favicon,
        email: shopInfo.email,
        phone: shopInfo.phone,
        address: shopInfo.address,
        description: shopInfo.description,
        currency: shopInfo.currency,
        timezone: shopInfo.timezone,
        maintenance_mode: systemSettings.maintenanceMode,
        order_notifications: systemSettings.orderNotifications,
        stock_alerts: systemSettings.stockAlerts,
        email_notifications: systemSettings.emailNotifications,
        sms_notifications: systemSettings.smsNotifications,
        analytics_tracking: systemSettings.analyticsTracking,
        social_media_integration: systemSettings.socialMediaIntegration,
      }

      // Save banners and global settings in parallel
      await Promise.all([...bannerPromises, api.post('/content/global', globalSettingsData)])

      showMessage('All settings saved successfully!', 'success')
      // Reload settings to confirm changes
      await loadSettings()
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to save settings'
      showMessage(errorMsg, 'error')
      console.error('Settings save error:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="settings-loading">Loading settings...</div>
  }

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="settings-header">
        <div>
          <h1 className="settings-title">
            <Settings size={28} />
            Settings Management
          </h1>
          <p className="settings-subtitle">Configure your store settings and content</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className={`settings-save-btn ${saving ? 'loading' : ''}`}
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`settings-message settings-${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="settings-tabs">
        <button
          className={`settings-tab ${activeTab === 'heroSlides' ? 'active' : ''}`}
          onClick={() => setActiveTab('heroSlides')}
        >
          Hero Slides
        </button>
        <button
          className={`settings-tab ${activeTab === 'shopInfo' ? 'active' : ''}`}
          onClick={() => setActiveTab('shopInfo')}
        >
          Shop Info
        </button>
        <button
          className={`settings-tab ${activeTab === 'systemSettings' ? 'active' : ''}`}
          onClick={() => setActiveTab('systemSettings')}
        >
          System Settings
        </button>
      </div>

      {/* Content */}
      <div className="settings-content">
        {/* Hero Slides Tab */}
        {activeTab === 'heroSlides' && (
          <div className="settings-panel">
            <div className="settings-panel-header">
              <h2>Manage Hero Slides</h2>
              <button onClick={addNewSlide} className="btn-primary">
                <Plus size={18} /> Add New Slide
              </button>
            </div>

            <div className="hero-slides-list">
              {heroSlides.length === 0 ? (
                <div className="empty-state">
                  <AlertCircle size={32} />
                  <p>No slides added yet</p>
                  <button onClick={addNewSlide} className="btn-primary">
                    Add First Slide
                  </button>
                </div>
              ) : (
                heroSlides.map((slide, index) => (
                  <div key={slide.id} className="slide-card">
                    <div className="slide-order">{index + 1}</div>

                    <div className="slide-image-preview">
                      {slide.image ? (
                        <img src={slide.image} alt={slide.title} />
                      ) : (
                        <div className="slide-image-placeholder">
                          <Upload size={24} />
                          <p>Upload Image</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = (event) => {
                              updateSlide(slide.id, 'image', event.target?.result)
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                        className="slide-file-input"
                      />
                    </div>

                    <div className="slide-fields">
                      <div className="form-group">
                        <label>Slide Title</label>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                          placeholder="Enter slide title"
                        />
                      </div>

                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          value={slide.description}
                          onChange={(e) => updateSlide(slide.id, 'description', e.target.value)}
                          placeholder="Enter slide description"
                          rows="2"
                        />
                      </div>

                      <div className="form-group">
                        <label>Link URL</label>
                        <input
                          type="text"
                          value={slide.link}
                          onChange={(e) => updateSlide(slide.id, 'link', e.target.value)}
                          placeholder="e.g., /collection/summer"
                        />
                      </div>

                      <div className="form-group checkbox">
                        <label>
                          <input
                            type="checkbox"
                            checked={slide.isActive}
                            onChange={(e) => updateSlide(slide.id, 'isActive', e.target.checked)}
                          />
                          Active
                        </label>
                      </div>
                    </div>

                    <div className="slide-actions">
                      <button
                        onClick={() => moveSlide(slide.id, 'up')}
                        disabled={index === 0}
                        className="btn-icon"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveSlide(slide.id, 'down')}
                        disabled={index === heroSlides.length - 1}
                        className="btn-icon"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => deleteSlide(slide.id)}
                        className="btn-danger"
                        title="Delete slide"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Shop Info Tab */}
        {activeTab === 'shopInfo' && (
          <div className="settings-panel">
            <div className="settings-panel-header">
              <h2>Shop Information</h2>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Shop Name</label>
                <input
                  type="text"
                  value={shopInfo.shopName || ''}
                  onChange={(e) => updateShopInfo('shopName', e.target.value)}
                  placeholder="Enter shop name"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={shopInfo.email || ''}
                  onChange={(e) => updateShopInfo('email', e.target.value)}
                  placeholder="Enter email"
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={shopInfo.phone || ''}
                  onChange={(e) => updateShopInfo('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label>Currency</label>
                <select
                  value={shopInfo.currency || 'BDT'}
                  onChange={(e) => updateShopInfo('currency', e.target.value)}
                >
                  <option value="BDT">Bangladeshi Taka (BDT)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Address</label>
                <input
                  type="text"
                  value={shopInfo.address || ''}
                  onChange={(e) => updateShopInfo('address', e.target.value)}
                  placeholder="Enter shop address"
                />
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  value={shopInfo.description || ''}
                  onChange={(e) => updateShopInfo('description', e.target.value)}
                  placeholder="Enter shop description"
                  rows="4"
                />
              </div>
            </div>
          </div>
        )}

        {/* System Settings Tab */}
        {activeTab === 'systemSettings' && (
          <div className="settings-panel">
            <div className="settings-panel-header">
              <h2>System Settings</h2>
            </div>

            <div className="settings-grid">
              {Object.entries(systemSettings).map(([key, value]) => (
                <div key={key} className="settings-toggle">
                  <div className="toggle-label">
                    <h3>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                    </h3>
                    <p className="toggle-description">{getSettingDescription(key)}</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => updateSystemSettings(key, e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const getSettingDescription = (key) => {
  const descriptions = {
    maintenanceMode: 'Enable maintenance mode to prevent customer access',
    orderNotifications: 'Receive notifications for new orders',
    stockAlerts: 'Get alerted when product stock runs low',
    emailNotifications: 'Send email notifications to customers',
    smsNotifications: 'Send SMS notifications to customers',
    analyticsTracking: 'Track user behavior and analytics',
    socialMediaIntegration: 'Enable social media sharing and integration',
  }
  return descriptions[key] || ''
}

export default SettingsManagement
