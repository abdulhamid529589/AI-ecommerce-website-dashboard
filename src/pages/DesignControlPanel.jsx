/**
 * DESIGN CONTROL PANEL
 * Complete dashboard system to control frontend UI/UX
 * Real-time theme management, colors, animations, layout
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Palette,
  Zap,
  LayoutGrid,
  Eye,
  Save,
  RotateCcw,
  Copy,
  Download,
  Upload,
} from 'lucide-react'
import axios from 'axios'

// ============================================
// 1. COLOR PICKER COMPONENT
// ============================================
const ColorPicker = ({ label, value, onChange, preset = false }) => {
  const [showPicker, setShowPicker] = useState(false)

  const presetColors = [
    '#3B82F6',
    '#06B6D4',
    '#EC4899',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#14B8A6',
    '#F97316',
    '#6366F1',
  ]

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-300">{label}</label>

      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-12 rounded-lg cursor-pointer"
          />

          <button
            onClick={() => setShowPicker(!showPicker)}
            className="absolute -right-2 -bottom-2 bg-blue-500 text-white rounded-full p-1"
          >
            <Zap size={14} />
          </button>
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:border-blue-500"
        />
      </div>

      {preset && showPicker && (
        <div className="grid grid-cols-5 gap-2">
          {presetColors.map((color) => (
            <button
              key={color}
              onClick={() => {
                onChange(color)
                setShowPicker(false)
              }}
              className="w-8 h-8 rounded-lg border-2 border-white/20 hover:border-white/50 transition-all"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// 2. THEME PRESET SELECTOR
// ============================================
const ThemePresetSelector = ({ onSelect, currentTheme }) => {
  const presets = [
    { name: 'Modern Dark', value: 'modern-dark', gradient: 'from-blue-500 to-purple-600' },
    { name: 'Cyberpunk', value: 'cyberpunk', gradient: 'from-green-400 to-cyan-500' },
    { name: 'Minimalist', value: 'minimalist', gradient: 'from-gray-200 to-gray-800' },
    { name: 'Tropical', value: 'tropical', gradient: 'from-pink-500 to-orange-500' },
    { name: 'Aurora', value: 'aurora', gradient: 'from-cyan-400 to-purple-600' },
  ]

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-300">Theme Preset</label>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {presets.map((preset) => (
          <motion.button
            key={preset.value}
            whileHover={{ scale: 1.05 }}
            onClick={() => onSelect(preset.value)}
            className={`
              p-4 rounded-xl border-2 transition-all
              ${currentTheme === preset.value ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-white/10 hover:border-white/30'}
            `}
          >
            <div className={`h-12 rounded-lg bg-gradient-to-r ${preset.gradient} mb-2`} />
            <p className="text-xs font-semibold text-white text-center">{preset.name}</p>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ============================================
// 3. ANIMATION CONTROLS
// ============================================
const AnimationControls = ({ theme, onChange }) => {
  const animationPresets = [
    { name: 'Slow', duration: 500 },
    { name: 'Normal', duration: 300 },
    { name: 'Fast', duration: 200 },
    { name: 'Instant', duration: 100 },
  ]

  return (
    <div className="space-y-4 bg-white/5 rounded-xl p-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <Zap size={18} /> Animation Settings
      </h3>

      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={theme.animations.enableMicroInteractions}
            onChange={(e) =>
              onChange({
                ...theme,
                animations: { ...theme.animations, enableMicroInteractions: e.target.checked },
              })
            }
            className="w-4 h-4 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Enable Micro-interactions</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={theme.animations.enableParallax}
            onChange={(e) =>
              onChange({
                ...theme,
                animations: { ...theme.animations, enableParallax: e.target.checked },
              })
            }
            className="w-4 h-4 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Enable Parallax Effects</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={theme.animations.enableGlow}
            onChange={(e) =>
              onChange({
                ...theme,
                animations: { ...theme.animations, enableGlow: e.target.checked },
              })
            }
            className="w-4 h-4 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Enable Glow Effects</span>
        </label>
      </div>

      <div className="pt-3 border-t border-white/10">
        <label className="block text-xs font-semibold text-gray-300 mb-2">Animation Speed</label>

        <div className="grid grid-cols-4 gap-2">
          {animationPresets.map((preset) => (
            <button
              key={preset.duration}
              onClick={() =>
                onChange({
                  ...theme,
                  animations: { ...theme.animations, duration: preset.duration },
                })
              }
              className={`
                py-2 px-2 rounded-lg text-xs font-semibold transition-all
                ${theme.animations.duration === preset.duration ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}
              `}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// 4. COMPONENT VISIBILITY CONTROL
// ============================================
const ComponentVisibilityControl = ({ theme, onChange }) => {
  const components = [
    { id: 'hero', label: 'Hero Section' },
    { id: 'featured', label: 'Featured Products' },
    { id: 'categories', label: 'Categories' },
    { id: 'trending', label: 'Trending Products' },
    { id: 'reviews', label: 'Reviews Section' },
    { id: 'newsletter', label: 'Newsletter' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'banner', label: 'Promotional Banner' },
  ]

  return (
    <div className="space-y-3 bg-white/5 rounded-xl p-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <Eye size={18} /> Component Visibility
      </h3>

      <div className="space-y-2">
        {components.map((component) => (
          <label
            key={component.id}
            className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
          >
            <input
              type="checkbox"
              defaultChecked={true}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-sm text-gray-300">{component.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

// ============================================
// 5. GRADIENT EDITOR
// ============================================
const GradientEditor = ({ theme, onChange }) => {
  const [selectedGradient, setSelectedGradient] = useState('primary')

  const gradientDirections = [
    { name: 'to-right', value: 'bg-gradient-to-r' },
    { name: 'to-bottom', value: 'bg-gradient-to-b' },
    { name: 'diagonal', value: 'bg-gradient-to-br' },
  ]

  return (
    <div className="space-y-4 bg-white/5 rounded-xl p-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <Palette size={18} /> Gradient Editor
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2">Select Gradient</label>

          <div className="grid grid-cols-2 gap-2">
            {Object.keys(theme.gradients).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedGradient(key)}
                className={`
                  p-2 rounded-lg text-xs font-semibold capitalize transition-all
                  ${selectedGradient === key ? 'bg-blue-500/50 border border-blue-400' : 'bg-white/10 border border-white/10'}
                `}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2">Preset Gradients</label>

          <div className="space-y-2">
            {[
              'from-blue-500 to-cyan-500',
              'from-purple-500 to-pink-500',
              'from-green-500 to-emerald-500',
              'from-orange-500 to-red-500',
              'from-cyan-400 to-blue-600',
            ].map((gradient) => (
              <div
                key={gradient}
                onClick={() => {
                  const gradients = { ...theme.gradients }
                  gradients[selectedGradient] = gradient
                  onChange({ ...theme, gradients })
                }}
                className={`h-8 rounded-lg bg-gradient-to-r ${gradient} cursor-pointer hover:ring-2 ring-white/50 transition-all`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// 6. LAYOUT CONTROL
// ============================================
const LayoutControl = ({ theme, onChange }) => {
  const layoutOptions = [
    { name: 'Compact', maxWidth: '1024px', padding: '1rem' },
    { name: 'Standard', maxWidth: '1440px', padding: '1.5rem' },
    { name: 'Wide', maxWidth: '1536px', padding: '2rem' },
  ]

  return (
    <div className="space-y-4 bg-white/5 rounded-xl p-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <LayoutGrid size={18} /> Layout Settings
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2">Layout Preset</label>

          <div className="grid grid-cols-3 gap-2">
            {layoutOptions.map((option) => (
              <button
                key={option.name}
                onClick={() =>
                  onChange({
                    ...theme,
                    layout: {
                      ...theme.layout,
                      maxWidth: option.maxWidth,
                      containerPadding: option.padding,
                    },
                  })
                }
                className={`
                  p-2 rounded-lg text-xs font-semibold transition-all
                  ${theme.layout.maxWidth === option.maxWidth ? 'bg-blue-500 text-white' : 'bg-white/10 hover:bg-white/20 text-gray-300'}
                `}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2">Border Radius</label>

          <select
            value={theme.components.card.borderRadius}
            onChange={(e) =>
              onChange({
                ...theme,
                components: {
                  ...theme.components,
                  card: { ...theme.components.card, borderRadius: e.target.value },
                },
              })
            }
            className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500"
          >
            <option value="0.5rem">Small (8px)</option>
            <option value="0.75rem">Medium (12px)</option>
            <option value="1rem">Large (16px)</option>
            <option value="1.25rem">Extra Large (20px)</option>
          </select>
        </div>
      </div>
    </div>
  )
}

// ============================================
// 7. MAIN DESIGN CONTROL PANEL
// ============================================
export const DesignControlPanel = () => {
  const [theme, setTheme] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('colors')
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const token = localStorage.getItem('authToken')
        const { data } = await axios.get('/api/v1/content/global', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (data.success && data.data?.theme) {
          setTheme(data.data.theme)
        } else {
          setTheme({
            colors: {
              primary: '#3B82F6',
              secondary: '#06B6D4',
              accent: '#EC4899',
              background: '#0F172A',
              surface: '#1E293B',
              text: '#F1F5F9',
              textSecondary: '#CBD5E1',
            },
            gradients: {
              primary: 'from-blue-500 to-purple-600',
            },
            animations: {
              enableMicroInteractions: true,
              enableParallax: true,
              enableGlow: true,
              duration: 300,
            },
            layout: {
              maxWidth: '1440px',
              containerPadding: '1.5rem',
            },
            components: {
              card: {
                borderRadius: '1.25rem',
              },
            },
          })
        }
      } catch (error) {
        console.error('Failed to fetch theme:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTheme()
  }, [])

  const handleSave = async () => {
    setSaving(true)

    try {
      const token = localStorage.getItem('authToken')
      await axios.post(
        '/api/v1/content/global',
        { theme },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      // Broadcast theme update to frontend
      window.dispatchEvent(
        new CustomEvent('themeUpdated', {
          detail: theme,
        }),
      )

      alert('✅ Design settings saved successfully!')
    } catch (error) {
      alert('❌ Failed to save design settings')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleExportTheme = () => {
    const dataStr = JSON.stringify(theme, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'theme.json'
    link.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin">Loading...</div>
      </div>
    )
  }

  if (!theme) return <div>Error loading theme</div>

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Palette className="text-blue-500" size={32} />
          Design Control Panel
        </h1>

        <div className="flex gap-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <Eye size={18} />
            {previewMode ? 'Close Preview' : 'Live Preview'}
          </button>

          <button
            onClick={handleExportTheme}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
          >
            <Download size={18} />
            Export
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {[
          { id: 'colors', label: 'Colors', icon: Palette },
          { id: 'animations', label: 'Animations', icon: Zap },
          { id: 'layout', label: 'Layout', icon: LayoutGrid },
          { id: 'components', label: 'Components', icon: Eye },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-3 font-semibold flex items-center gap-2 transition-all
              ${activeTab === tab.id ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}
            `}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Panel */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'colors' && (
            <div className="space-y-6">
              <ThemePresetSelector onSelect={() => {}} currentTheme="modern-dark" />

              <div className="bg-white/5 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Palette size={18} /> Custom Colors
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(theme.colors || {}).map(([key, value]) => (
                    <ColorPicker
                      key={key}
                      label={key.charAt(0).toUpperCase() + key.slice(1)}
                      value={value}
                      onChange={(newValue) => {
                        setTheme({
                          ...theme,
                          colors: { ...theme.colors, [key]: newValue },
                        })
                      }}
                      preset={true}
                    />
                  ))}
                </div>
              </div>

              <GradientEditor theme={theme} onChange={setTheme} />
            </div>
          )}

          {activeTab === 'animations' && <AnimationControls theme={theme} onChange={setTheme} />}

          {activeTab === 'layout' && <LayoutControl theme={theme} onChange={setTheme} />}

          {activeTab === 'components' && (
            <ComponentVisibilityControl theme={theme} onChange={setTheme} />
          )}
        </div>

        {/* Preview Panel */}
        <div className="bg-white/5 rounded-xl p-6 h-fit sticky top-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Eye size={18} /> Live Preview
          </h3>

          <div className="space-y-4">
            {/* Color Preview */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400">Primary Colors</p>

              <div className="grid grid-cols-3 gap-2">
                {theme.colors &&
                  Object.entries(theme.colors)
                    .slice(0, 6)
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="h-8 rounded-lg border border-white/10 hover:border-white/30 transition-all"
                        style={{ backgroundColor: value }}
                        title={key}
                      />
                    ))}
              </div>
            </div>

            {/* Gradient Preview */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400">Gradient Preview</p>

              <div
                className={`h-24 rounded-xl bg-gradient-to-br ${theme.gradients?.primary || 'from-blue-500 to-purple-600'}`}
              />
            </div>

            {/* Component Preview */}
            <div className="space-y-2 pt-4 border-t border-white/10">
              <p className="text-xs font-semibold text-gray-400">Component Preview</p>

              <button
                className={`w-full py-2 rounded-lg font-semibold text-white bg-gradient-to-r ${theme.gradients?.primary || 'from-blue-500 to-purple-600'}`}
              >
                Preview Button
              </button>

              <div
                className="h-16 rounded-xl border border-white/20 p-3 bg-white/5"
                style={{ backgroundColor: theme.colors?.surface }}
              >
                <p className="text-xs text-gray-400">Card Preview</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DesignControlPanel
