import React, { useState, useEffect } from 'react'
import { Save, RefreshCw, Zap, Globe } from 'lucide-react'
import api, { API_PREFIX } from '../lib/axios'
import { toast } from 'react-toastify'

export default function SEOMetadataManager() {
  const [seoSettings, setSeoSettings] = useState({
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    og_image: '',
    og_title: '',
    og_description: '',
    robots_txt: 'User-agent: *\nAllow: /',
    sitemap_enabled: true,
  })

  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  // Fetch SEO settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/content/seo')
        if (data.data) {
          setSeoSettings(data.data)
        }
      } catch (error) {
        toast.error('Failed to fetch SEO settings')
      }
    }
    fetchSettings()
  }, [])

  // Handle save
  const handleSave = async () => {
    setLoading(true)
    try {
      await api.post('/content/seo', seoSettings)
      setSaved(true)
      toast.success('SEO settings saved successfully!')
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      toast.error('Failed to save SEO settings')
    }
    setLoading(false)
  }

  // Character counter for meta description
  const metaDescLength = seoSettings.meta_description?.length || 0
  const metaTitleLength = seoSettings.meta_title?.length || 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">SEO & Metadata</h1>
        <p className="text-slate-400 mt-1">Optimize your store for search engines</p>
      </div>

      {/* Preview Section */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
        <h2 className="text-xl font-bold text-white mb-6">Google Search Preview</h2>
        <div className="bg-white rounded-lg p-6 space-y-2 text-slate-900">
          <div className="text-blue-600 text-sm font-medium">https://example.com › page</div>
          <h3 className="text-xl font-bold text-blue-900 truncate">
            {seoSettings.meta_title || 'Your Site Title'}
          </h3>
          <p className="text-sm text-slate-600 line-clamp-2">
            {seoSettings.meta_description || 'Your site description will appear here...'}
          </p>
        </div>
      </div>

      {/* SEO Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meta Tags */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-6">Global Meta Tags</h3>
          <div className="space-y-6">
            {/* Meta Title */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-300">Meta Title</label>
                <span
                  className={`text-xs ${metaTitleLength > 60 ? 'text-red-400' : 'text-slate-500'}`}
                >
                  {metaTitleLength}/60
                </span>
              </div>
              <input
                type="text"
                value={seoSettings.meta_title}
                onChange={(e) => setSeoSettings({ ...seoSettings, meta_title: e.target.value })}
                placeholder="Your site title for search results..."
                maxLength={60}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500 mt-2">💡 Ideal length: 50-60 characters</p>
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-300">Meta Description</label>
                <span
                  className={`text-xs ${
                    metaDescLength > 160
                      ? 'text-red-400'
                      : metaDescLength > 120
                        ? 'text-yellow-400'
                        : 'text-slate-500'
                  }`}
                >
                  {metaDescLength}/160
                </span>
              </div>
              <textarea
                value={seoSettings.meta_description}
                onChange={(e) =>
                  setSeoSettings({ ...seoSettings, meta_description: e.target.value })
                }
                placeholder="A compelling description of your site..."
                maxLength={160}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
              />
              <p className="text-xs text-slate-500 mt-2">💡 Ideal length: 120-160 characters</p>
            </div>

            {/* Meta Keywords */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Meta Keywords</label>
              <input
                type="text"
                value={seoSettings.meta_keywords}
                onChange={(e) => setSeoSettings({ ...seoSettings, meta_keywords: e.target.value })}
                placeholder="keyword1, keyword2, keyword3..."
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500 mt-2">💡 Separate keywords with commas</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Sitemap */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Globe size={16} /> Sitemap
            </h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={seoSettings.sitemap_enabled}
                  onChange={(e) =>
                    setSeoSettings({ ...seoSettings, sitemap_enabled: e.target.checked })
                  }
                  className="w-4 h-4 bg-slate-700 border border-slate-600 rounded cursor-pointer"
                />
                <span className="text-sm text-slate-300">Enable XML Sitemap</span>
              </label>
              {seoSettings.sitemap_enabled && (
                <div className="text-xs text-slate-500 bg-slate-700 p-3 rounded">
                  ✓ Sitemap available at: /sitemap.xml
                </div>
              )}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-50 rounded-lg p-6">
            <h4 className="text-sm font-bold text-blue-300 mb-3 flex items-center gap-2">
              <Zap size={16} /> SEO Tips
            </h4>
            <ul className="text-xs text-slate-300 space-y-2">
              <li>• Use target keywords in meta tags</li>
              <li>• Keep descriptions concise</li>
              <li>• Make titles compelling</li>
              <li>• Include site name in title</li>
              <li>• Use hyphens in URLs</li>
              <li>• Add schema markup</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Open Graph Tags */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-6">Open Graph (OG) Tags</h3>
        <p className="text-sm text-slate-400 mb-6">
          These tags control how your site appears when shared on social media
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* OG Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">OG Title</label>
            <input
              type="text"
              value={seoSettings.og_title}
              onChange={(e) => setSeoSettings({ ...seoSettings, og_title: e.target.value })}
              placeholder="Title for social sharing..."
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* OG Image */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">OG Image URL</label>
            <input
              type="url"
              value={seoSettings.og_image}
              onChange={(e) => setSeoSettings({ ...seoSettings, og_image: e.target.value })}
              placeholder="https://example.com/image.jpg (1200x630px recommended)"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* OG Description */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">OG Description</label>
            <textarea
              value={seoSettings.og_description}
              onChange={(e) => setSeoSettings({ ...seoSettings, og_description: e.target.value })}
              placeholder="Description for social sharing..."
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
            />
          </div>
        </div>
      </div>

      {/* Robots.txt */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-2">Robots.txt Configuration</h3>
        <p className="text-sm text-slate-400 mb-4">Control how search engines crawl your site</p>
        <textarea
          value={seoSettings.robots_txt}
          onChange={(e) => setSeoSettings({ ...seoSettings, robots_txt: e.target.value })}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm h-32"
        />
      </div>

      {/* Social Media Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Facebook Preview */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h4 className="text-sm font-bold text-slate-300 mb-4">Facebook Preview</h4>
          <div className="bg-white rounded text-slate-900 overflow-hidden">
            {seoSettings.og_image && (
              <img src={seoSettings.og_image} alt="OG" className="w-full h-32 object-cover" />
            )}
            <div className="p-3">
              <p className="text-xs text-slate-500">yoursite.com</p>
              <h5 className="font-bold text-sm line-clamp-2">
                {seoSettings.og_title || 'Your title here'}
              </h5>
              <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                {seoSettings.og_description || 'Your description here...'}
              </p>
            </div>
          </div>
        </div>

        {/* Twitter Preview */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h4 className="text-sm font-bold text-slate-300 mb-4">Twitter Preview</h4>
          <div className="bg-black rounded text-white p-4 border border-slate-600">
            <p className="text-sm line-clamp-3">
              {seoSettings.og_description || 'Your description here...'}
            </p>
            {seoSettings.og_image && (
              <img
                src={seoSettings.og_image}
                alt="OG"
                className="w-full h-24 object-cover rounded mt-3"
              />
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className={`flex items-center gap-2 px-6 py-3 ${
            saved ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
          } text-white rounded-lg transition disabled:opacity-50`}
        >
          <Save size={18} />
          {saved ? 'Saved!' : 'Save SEO Settings'}
        </button>
      </div>
    </div>
  )
}
