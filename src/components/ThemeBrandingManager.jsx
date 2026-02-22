import React, { useState, useEffect } from 'react'
import { Save, Upload, Eye, RotateCcw } from 'lucide-react'
import api, { API_PREFIX } from '../lib/axios'
import { toast } from 'react-toastify'

export default function ThemeBrandingManager() {
  const [globalSettings, setGlobalSettings] = useState({
    site_name: '',
    site_logo: '',
    site_favicon: '',
    primary_color: '#3B82F6',
    secondary_color: '#1F2937',
    accent_color: '#F59E0B',
    font_family: 'Inter, system-ui, sans-serif',
    timezone: 'UTC',
    language: 'en',
    maintenance_mode: false,
    maintenance_message: '',
  })

  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  // Fetch global settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/content/global')
        setGlobalSettings(data.data)
      } catch (error) {
        toast.error('Failed to fetch settings')
      }
    }
    fetchSettings()
  }, [])

  // Handle save
  const handleSave = async () => {
    setLoading(true)
    try {
      await api.post('/content/global', globalSettings)
      setSaved(true)
      toast.success('Theme and branding settings saved!')
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      toast.error('Failed to save settings')
    }
    setLoading(false)
  }

  // Reset to defaults
  const handleReset = () => {
    if (window.confirm('Reset all settings to defaults?')) {
      setGlobalSettings({
        site_name: '',
        site_logo: '',
        site_favicon: '',
        primary_color: '#3B82F6',
        secondary_color: '#1F2937',
        accent_color: '#F59E0B',
        font_family: 'Inter, system-ui, sans-serif',
        timezone: 'UTC',
        language: 'en',
        maintenance_mode: false,
        maintenance_message: '',
      })
      toast.info('Settings reset to defaults')
    }
  }

  const fonts = [
    'Inter, system-ui, sans-serif',
    'Poppins, sans-serif',
    'Roboto, sans-serif',
    'Playfair Display, serif',
    'Lora, serif',
  ]

  const timezones = ['UTC', 'EST', 'CST', 'MST', 'PST', 'GMT', 'IST', 'JST', 'AEST']

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'bn', name: 'Bengali' },
    { code: 'hi', name: 'Hindi' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Theme & Branding</h1>
        <p className="text-slate-400 mt-1">Customize your store appearance and global settings</p>
      </div>

      {/* Preview Section */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Eye size={20} /> Live Preview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Logo Preview */}
          <div>
            <p className="text-slate-400 text-sm mb-3">Site Logo</p>
            {globalSettings.site_logo ? (
              <img
                src={globalSettings.site_logo}
                alt="Site Logo"
                className="h-32 object-contain bg-slate-700 p-4 rounded-lg"
              />
            ) : (
              <div className="h-32 bg-slate-700 rounded-lg flex items-center justify-center text-slate-500">
                No logo uploaded
              </div>
            )}
          </div>

          {/* Color Preview */}
          <div>
            <p className="text-slate-400 text-sm mb-3">Color Scheme</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-16 h-16 rounded-lg border border-slate-600"
                  style={{ backgroundColor: globalSettings.primary_color }}
                ></div>
                <div>
                  <p className="text-sm text-slate-300">Primary</p>
                  <p className="text-xs text-slate-500">{globalSettings.primary_color}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-16 h-16 rounded-lg border border-slate-600"
                  style={{ backgroundColor: globalSettings.secondary_color }}
                ></div>
                <div>
                  <p className="text-sm text-slate-300">Secondary</p>
                  <p className="text-xs text-slate-500">{globalSettings.secondary_color}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-16 h-16 rounded-lg border border-slate-600"
                  style={{ backgroundColor: globalSettings.accent_color }}
                ></div>
                <div>
                  <p className="text-sm text-slate-300">Accent</p>
                  <p className="text-xs text-slate-500">{globalSettings.accent_color}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Information */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-6">Site Information</h3>

          {/* Site Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">Site Name</label>
            <input
              type="text"
              value={globalSettings.site_name}
              onChange={(e) => setGlobalSettings({ ...globalSettings, site_name: e.target.value })}
              placeholder="Your Store Name"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Logo */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">Logo URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={globalSettings.site_logo}
                onChange={(e) =>
                  setGlobalSettings({ ...globalSettings, site_logo: e.target.value })
                }
                placeholder="https://example.com/logo.png"
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2">
                <Upload size={16} /> Upload
              </button>
            </div>
          </div>

          {/* Favicon */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">Favicon URL</label>
            <input
              type="url"
              value={globalSettings.site_favicon}
              onChange={(e) =>
                setGlobalSettings({ ...globalSettings, site_favicon: e.target.value })
              }
              placeholder="https://example.com/favicon.ico"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Default Language
            </label>
            <select
              value={globalSettings.language}
              onChange={(e) => setGlobalSettings({ ...globalSettings, language: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Colors & Design */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-6">Colors & Design</h3>

          {/* Primary Color */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">Primary Color</label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={globalSettings.primary_color}
                onChange={(e) =>
                  setGlobalSettings({ ...globalSettings, primary_color: e.target.value })
                }
                className="w-16 h-12 bg-slate-700 border border-slate-600 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={globalSettings.primary_color}
                onChange={(e) =>
                  setGlobalSettings({ ...globalSettings, primary_color: e.target.value })
                }
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">Secondary Color</label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={globalSettings.secondary_color}
                onChange={(e) =>
                  setGlobalSettings({ ...globalSettings, secondary_color: e.target.value })
                }
                className="w-16 h-12 bg-slate-700 border border-slate-600 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={globalSettings.secondary_color}
                onChange={(e) =>
                  setGlobalSettings({ ...globalSettings, secondary_color: e.target.value })
                }
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Accent Color */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">Accent Color</label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={globalSettings.accent_color}
                onChange={(e) =>
                  setGlobalSettings({ ...globalSettings, accent_color: e.target.value })
                }
                className="w-16 h-12 bg-slate-700 border border-slate-600 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={globalSettings.accent_color}
                onChange={(e) =>
                  setGlobalSettings({ ...globalSettings, accent_color: e.target.value })
                }
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Font Family */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Font Family</label>
            <select
              value={globalSettings.font_family}
              onChange={(e) =>
                setGlobalSettings({ ...globalSettings, font_family: e.target.value })
              }
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {fonts.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-6">Regional Settings</h3>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Timezone</label>
            <select
              value={globalSettings.timezone}
              onChange={(e) => setGlobalSettings({ ...globalSettings, timezone: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-6">Maintenance Mode</h3>

          {/* Toggle */}
          <div className="flex items-center gap-4 mb-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={globalSettings.maintenance_mode}
                onChange={(e) =>
                  setGlobalSettings({ ...globalSettings, maintenance_mode: e.target.checked })
                }
                className="w-4 h-4 bg-slate-700 border border-slate-600 rounded cursor-pointer"
              />
              <span className="ml-3 text-slate-300">Enable Maintenance Mode</span>
            </label>
          </div>

          {/* Message */}
          {globalSettings.maintenance_mode && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Maintenance Message
              </label>
              <textarea
                value={globalSettings.maintenance_message}
                onChange={(e) =>
                  setGlobalSettings({ ...globalSettings, maintenance_message: e.target.value })
                }
                placeholder="We'll be back soon..."
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
        >
          <RotateCcw size={18} />
          Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className={`flex items-center gap-2 px-6 py-3 ${
            saved ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
          } text-white rounded-lg transition disabled:opacity-50`}
        >
          <Save size={18} />
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
