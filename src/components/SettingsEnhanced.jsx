import React, { useState, useEffect } from 'react'
import Header from './Header'
import { toast } from 'react-toastify'
import {
  LoaderCircle,
  Save,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  X,
  ChevronDown,
  GripVertical,
} from 'lucide-react'
import api from '../lib/axios'
import Button from './dashboard-components/Button'
import { getOperationErrorMessage } from '../utils/errorHandler'
import './Settings.css'

// ==================== TABS COMPONENTS ====================
const TabContext = React.createContext()

const TabsList = ({ children }) => {
  return (
    <div className="tabs-list flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
      {children}
    </div>
  )
}

const TabsTrigger = ({ value, children }) => {
  const parent = React.useContext(TabContext)
  const isActive = parent?.value === value
  return (
    <button
      onClick={() => parent?.onValueChange?.(value)}
      className={`px-4 py-3 font-medium border-b-2 transition ${
        isActive
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}

const TabsContent = ({ value, children }) => {
  const parent = React.useContext(TabContext)
  if (parent?.value !== value) return null
  return <div className="mt-6">{children}</div>
}

const TabsWithContext = ({ value, onValueChange, children }) => {
  return (
    <TabContext.Provider value={{ value, onValueChange }}>
      <div data-value={value}>{children}</div>
    </TabContext.Provider>
  )
}

// ==================== REUSABLE COMPONENTS ====================

const FormInput = ({ label, value, onChange, placeholder, type = 'text', required, error }) => (
  <div className="flex flex-col gap-2">
    <label className="font-medium text-foreground">
      {label} {required && <span className="text-red-600">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`px-4 py-2 border rounded-lg bg-background text-foreground ${
        error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
      }`}
    />
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
)

const FormTextarea = ({ label, value, onChange, placeholder, required, error, rows = 4 }) => (
  <div className="flex flex-col gap-2">
    <label className="font-medium text-foreground">
      {label} {required && <span className="text-red-600">*</span>}
    </label>
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`px-4 py-2 border rounded-lg bg-background text-foreground ${
        error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
      }`}
    />
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
)

const FormSelect = ({ label, value, onChange, options, required, error }) => (
  <div className="flex flex-col gap-2">
    <label className="font-medium text-foreground">
      {label} {required && <span className="text-red-600">*</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      className={`px-4 py-2 border rounded-lg bg-background text-foreground ${
        error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
      }`}
    >
      <option value="">Select an option</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
)

const FormToggle = ({ label, value, onChange }) => (
  <div className="flex items-center gap-3">
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
        value ? 'bg-blue-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          value ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
    <label className="font-medium text-foreground">{label}</label>
  </div>
)

const ColorInput = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-2">
    <label className="font-medium text-foreground">{label}</label>
    <div className="flex gap-2 items-center">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 h-10 rounded cursor-pointer"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-background text-foreground text-sm"
        placeholder="#000000"
      />
    </div>
  </div>
)

const ImageUpload = ({ label, value, onChange, preview = true }) => (
  <div className="flex flex-col gap-2">
    <label className="font-medium text-foreground">{label}</label>
    <div className="flex gap-4 items-center">
      {preview && value && (
        <img
          src={value}
          alt="Preview"
          className="w-24 h-24 object-cover rounded-lg border border-gray-300"
        />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = (ev) => onChange(ev.target.result)
            reader.readAsDataURL(file)
          }
        }}
        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
      />
    </div>
  </div>
)

// ==================== MAIN SETTINGS COMPONENT ====================

const SettingsEnhanced = () => {
  const [activeTab, setActiveTab] = useState('shop-info')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // ========== SHOP INFO STATE ==========
  const [shopName, setShopName] = useState('Bedtex')
  const [shopEmail, setShopEmail] = useState('support@bedtex.com')
  const [shopPhone, setShopPhone] = useState('+880 1234567890')
  const [shopAddress, setShopAddress] = useState('Dhaka, Bangladesh')
  const [shopDescription, setShopDescription] = useState('')
  const [shopLogo, setShopLogo] = useState('')
  const [shopFavicon, setShopFavicon] = useState('')
  const [shopTagline, setShopTagline] = useState('')
  const [currency, setCurrency] = useState('BDT')
  const [currencySymbol, setCurrencySymbol] = useState('৳')
  const [currencyPosition, setCurrencyPosition] = useState('before')
  const [timezone, setTimezone] = useState('Asia/Dhaka')
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY')
  const [timeFormat, setTimeFormat] = useState('24-hour')
  const [language, setLanguage] = useState('en')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [metaKeywords, setMetaKeywords] = useState('')
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('')
  const [facebookPixelId, setFacebookPixelId] = useState('')
  const [storeEnabled, setStoreEnabled] = useState(true)
  const [maintenanceMessage, setMaintenanceMessage] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [twitterUrl, setTwitterUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [businessRegNumber, setBusinessRegNumber] = useState('')
  const [taxVatNumber, setTaxVatNumber] = useState('')
  const [copyrightText, setCopyrightText] = useState('')
  const [termsUrl, setTermsUrl] = useState('')
  const [privacyUrl, setPrivacyUrl] = useState('')
  const [returnPolicyUrl, setReturnPolicyUrl] = useState('')
  const [formErrors, setFormErrors] = useState({})

  // Categories state
  const [categoriesList, setCategoriesList] = useState([])
  const [savingCategories, setSavingCategories] = useState(false)

  // ========== HERO SLIDER STATE ==========
  const [heroSlides, setHeroSlides] = useState([])
  const [editingSlide, setEditingSlide] = useState(null)
  const [showSlideForm, setShowSlideForm] = useState(false)
  const [slideForm, setSlideForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    cta: '',
    url: '',
    textPosition: 'left',
    textColor: '#ffffff',
    overlayOpacity: 30,
    isActive: true,
    displayOrder: 0,
  })
  const [draggedSlideId, setDraggedSlideId] = useState(null)
  const [prevHeroSlides, setPrevHeroSlides] = useState(null)
  const [pendingHeroSave, setPendingHeroSave] = useState(false)
  const [heroSettings, setHeroSettings] = useState({
    autoplay: true,
    autoplaySpeed: 5,
    transition: 'fade',
    showArrows: true,
    showDots: true,
    loop: true,
  })

  // ========== FEATURED PRODUCTS STATE ==========
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [draggedFeaturedId, setDraggedFeaturedId] = useState(null)
  const [productSearch, setProductSearch] = useState('')
  const [availableProducts, setAvailableProducts] = useState([])
  const [searchTimeout, setSearchTimeout] = useState(null)
  const [prevFeaturedProducts, setPrevFeaturedProducts] = useState(null)
  const [pendingFeaturedSave, setPendingFeaturedSave] = useState(false)
  const [featuredSettings, setFeaturedSettings] = useState({
    productsToShow: 8,
    layoutStyle: 'grid',
    showBadges: true,
    sortOrder: 'manual',
  })

  // ========== HOMEPAGE SECTIONS STATE ==========
  const [homeSections, setHomeSections] = useState({
    categories: {
      enabled: true,
      title: 'Shop by Category',
      count: 6,
      layout: 'grid',
      showCount: true,
    },
    flashSale: { enabled: true, title: 'Flash Sale', endDate: '', products: [] },
    newArrivals: { enabled: true, title: 'New Arrivals', count: 8, daysNew: 30 },
    bestSellers: { enabled: true, title: 'Best Sellers', count: 8, period: '30' },
    testimonials: { enabled: true, title: 'Customer Reviews', count: 6, autoFetch: false },
    newsletter: { enabled: true, title: 'Subscribe', description: '', buttonText: 'Subscribe' },
    brands: { enabled: false, title: 'Our Partners', layout: 'carousel', grayscale: true },
    whyChoose: { enabled: false, title: 'Why Choose Us' },
    instagram: { enabled: false, title: 'Follow Us', username: '', posts: 6 },
    blog: { enabled: false, title: 'Latest News', posts: 3, layout: 'grid' },
  })
  const [sectionOrder, setSectionOrder] = useState([
    'categories',
    'flashSale',
    'newArrivals',
    'bestSellers',
    'testimonials',
    'newsletter',
    'brands',
    'whyChoose',
    'instagram',
    'blog',
  ])

  // ========== NAVIGATION MENUS STATE ==========
  const [headerMenu, setHeaderMenu] = useState([])
  const [footerMenus, setFooterMenus] = useState({
    column1: [],
    column2: [],
    column3: [],
    column4: [],
  })
  const [newMenuItem, setNewMenuItem] = useState({
    label: '',
    type: 'custom',
    url: '',
    newTab: false,
  })

  // ========== THEME CUSTOMIZATION STATE ==========
  const [colors, setColors] = useState({
    primary: '#2563eb',
    secondary: '#06b6d4',
    accent: '#f59e0b',
    text: '#0f172a',
    heading: '#1e293b',
    background: '#ffffff',
    headerBg: '#ffffff',
    footerBg: '#1e293b',
    buttonPrimary: '#2563eb',
    buttonHover: '#1d4ed8',
    link: '#2563eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    saleBadge: '#ef4444',
    newBadge: '#10b981',
  })
  const [typography, setTypography] = useState({
    headingFont: 'Poppins',
    bodyFont: 'Inter',
    fontScale: 'medium',
    h1Size: '2.5rem',
    h2Size: '2rem',
    h3Size: '1.5rem',
    h4Size: '1.25rem',
    bodySize: '1rem',
    lineHeight: '1.5',
    fontWeight: '400',
  })
  const [layout, setLayout] = useState({
    containerWidth: '1200px',
    sidebarPosition: 'right',
    productCardStyle: 'style1',
    borderRadius: 'slightly-rounded',
    boxShadow: 'light',
  })
  const [headerSettings, setHeaderSettings] = useState({
    layoutStyle: 'style1',
    sticky: true,
    height: '70px',
    showAnnouncement: true,
    announcementText: 'Welcome to our store!',
    announcementBg: '#1e293b',
    showSearch: true,
    showWishlist: true,
    showCompare: false,
    showCart: true,
    showAccount: true,
  })
  const [footerSettings, setFooterSettings] = useState({
    columns: '4',
    showSocial: true,
    showPayment: true,
    showNewsletter: true,
    bgImage: '',
    copyrightText: '© 2026 Your Shop. All rights reserved.',
    showBackToTop: true,
  })
  const [productPageSettings, setProductPageSettings] = useState({
    galleryStyle: 'thumbnails-left',
    zoomOnHover: true,
    showRelated: true,
    relatedCount: 4,
    showReviews: true,
    showTabs: true,
    showShare: true,
    showSku: true,
    showStock: true,
  })
  const [shopPageSettings, setShopPageSettings] = useState({
    productsPerPage: 12,
    defaultSort: 'newest',
    gridLayout: '3-columns',
    showFilters: true,
    showSort: true,
    showViewMode: true,
    infiniteScroll: false,
  })

  // ========== SHIPPING & DELIVERY STATE ==========
  const [shippingZones, setShippingZones] = useState([])
  const [shippingMethods, setShippingMethods] = useState([])
  const [deliverySettings, setDeliverySettings] = useState({
    processingTime: '1-3 days',
    standardDelivery: '5-7 days',
    expressDelivery: '2-3 days',
    orderCutoff: '14:00',
  })
  const [packagingOptions, setPackagingOptions] = useState({
    giftWrap: true,
    giftWrapCost: 0,
    giftMessage: true,
    boxSizes: [],
  })

  // ==================== API CALLS ====================

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const responses = await Promise.all([
        api.get('/admin/settings/shop').catch(() => null),
        api.get('/admin/settings/hero-slides').catch(() => null),
        api.get('/admin/settings/featured-products').catch(() => null),
        api.get('/admin/settings/home-sections').catch(() => null),
        api.get('/admin/settings/menus').catch(() => null),
        api.get('/admin/settings/theme').catch(() => null),
        api.get('/admin/settings/shipping').catch(() => null),
      ])

      if (responses[0]?.data) populateShopInfo(responses[0].data)
      if (responses[1]?.data) setHeroSlides(responses[1].data.slides || [])
      if (responses[2]?.data) setFeaturedProducts(responses[2].data.products || [])
      if (responses[3]?.data) setHomeSections(responses[3].data)
      if (responses[4]?.data) {
        setHeaderMenu(responses[4].data.headerMenu || [])
        setFooterMenus(responses[4].data.footerMenus || {})
      }
      if (responses[5]?.data) populateTheme(responses[5].data)
      if (responses[6]?.data) {
        setShippingZones(responses[6].data.zones || [])
        setShippingMethods(responses[6].data.methods || [])
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const populateShopInfo = (data) => {
    setShopName(data.shopName || 'Bedtex')
    setShopEmail(data.shopEmail || '')
    setShopPhone(data.shopPhone || '')
    setShopAddress(data.shopAddress || '')
    setShopDescription(data.shopDescription || '')
    setShopLogo(data.shopLogo || '')
    setShopFavicon(data.shopFavicon || '')
    setShopTagline(data.shopTagline || '')
    setCurrency(data.currency || 'BDT')
    setCurrencySymbol(data.currencySymbol || '৳')
    setCurrencyPosition(data.currencyPosition || 'before')
    setTimezone(data.timezone || 'Asia/Dhaka')
    setDateFormat(data.dateFormat || 'DD/MM/YYYY')
    setTimeFormat(data.timeFormat || '24-hour')
    setLanguage(data.language || 'en')
    setMetaTitle(data.metaTitle || '')
    setMetaDescription(data.metaDescription || '')
    setMetaKeywords(data.metaKeywords || '')
    setGoogleAnalyticsId(data.googleAnalyticsId || '')
    setFacebookPixelId(data.facebookPixelId || '')
    setStoreEnabled(data.storeEnabled !== false)
    setMaintenanceMessage(data.maintenanceMessage || '')
    setFacebookUrl(data.facebookUrl || '')
    setInstagramUrl(data.instagramUrl || '')
    setTwitterUrl(data.twitterUrl || '')
    setYoutubeUrl(data.youtubeUrl || '')
    setLinkedinUrl(data.linkedinUrl || '')
    setWhatsappNumber(data.whatsappNumber || '')
    setBusinessRegNumber(data.businessRegNumber || '')
    setTaxVatNumber(data.taxVatNumber || '')
    setCopyrightText(data.copyrightText || '')
    setTermsUrl(data.termsUrl || '')
    setPrivacyUrl(data.privacyUrl || '')
    setReturnPolicyUrl(data.returnPolicyUrl || '')
  }

  const populateTheme = (data) => {
    if (data.colors) setColors({ ...colors, ...data.colors })
    if (data.typography) setTypography({ ...typography, ...data.typography })
    if (data.layout) setLayout({ ...layout, ...data.layout })
    if (data.headerSettings) setHeaderSettings({ ...headerSettings, ...data.headerSettings })
    if (data.footerSettings) setFooterSettings({ ...footerSettings, ...data.footerSettings })
    if (data.productPageSettings)
      setProductPageSettings({ ...productPageSettings, ...data.productPageSettings })
    if (data.shopPageSettings)
      setShopPageSettings({ ...shopPageSettings, ...data.shopPageSettings })
  }

  // ==================== SHOP INFO HANDLERS ====================

  const handleSaveShopInfo = async () => {
    const errors = {}
    if (!shopName || shopName.trim().length < 2) errors.shopName = 'Shop name is required'
    if (shopEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shopEmail))
      errors.shopEmail = 'Invalid email'
    if (shopPhone && !/^[+0-9 ()-]{6,20}$/.test(shopPhone)) errors.shopPhone = 'Invalid phone'

    setFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix validation errors')
      return
    }

    setSaving(true)
    try {
      await api.post('/admin/settings/shop', {
        shopName,
        shopEmail,
        shopPhone,
        shopAddress,
        shopDescription,
        shopLogo,
        shopFavicon,
        shopTagline,
        currency,
        currencySymbol,
        currencyPosition,
        timezone,
        dateFormat,
        timeFormat,
        language,
        metaTitle,
        metaDescription,
        metaKeywords,
        googleAnalyticsId,
        facebookPixelId,
        storeEnabled,
        maintenanceMessage,
        facebookUrl,
        instagramUrl,
        twitterUrl,
        youtubeUrl,
        linkedinUrl,
        whatsappNumber,
        businessRegNumber,
        taxVatNumber,
        copyrightText,
        termsUrl,
        privacyUrl,
        returnPolicyUrl,
      })
      toast.success('Shop info updated successfully')
    } catch (error) {
      toast.error(getOperationErrorMessage('saveShopInfo', error))
    } finally {
      setSaving(false)
    }
  }

  // ==================== HERO SLIDER HANDLERS ====================

  const handleSaveSlide = async () => {
    if (!slideForm.title || !slideForm.image) {
      toast.error('Title and image are required')
      return
    }

    setSaving(true)
    try {
      if (editingSlide?.id) {
        await api.put(`/admin/settings/hero-slides/${editingSlide.id}`, slideForm)
        toast.success('Slide updated successfully')
      } else {
        await api.post('/admin/settings/hero-slides', slideForm)
        toast.success('Slide created successfully')
      }
      setShowSlideForm(false)
      setEditingSlide(null)
      setSlideForm({
        title: '',
        subtitle: '',
        description: '',
        image: '',
        cta: '',
        url: '',
        textPosition: 'left',
        textColor: '#ffffff',
        overlayOpacity: 30,
        isActive: true,
        displayOrder: 0,
      })
      fetchSettings()
    } catch (error) {
      toast.error(getOperationErrorMessage('saveSlide', error))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSlide = async (slideId) => {
    if (!window.confirm('Delete this slide?')) return
    try {
      await api.delete(`/admin/settings/hero-slides/${slideId}`)
      toast.success('Slide deleted')
      fetchSettings()
    } catch (error) {
      toast.error('Failed to delete slide')
    }
  }

  const handleEditSlide = (slide) => {
    setEditingSlide(slide)
    setSlideForm(slide)
    setShowSlideForm(true)
  }

  const handleSaveHeroSettings = async () => {
    setSaving(true)
    try {
      await api.post('/admin/settings/hero-settings', heroSettings)
      toast.success('Hero slider settings saved')
    } catch (error) {
      toast.error('Failed to save hero settings')
    } finally {
      setSaving(false)
    }
  }

  // ==================== FEATURED PRODUCTS HANDLERS ====================

  useEffect(() => {
    if (!productSearch) {
      setAvailableProducts([])
      return
    }
    if (searchTimeout) clearTimeout(searchTimeout)
    const t = setTimeout(async () => {
      try {
        const res = await api.get(`/product?search=${encodeURIComponent(productSearch)}&limit=8`)
        setAvailableProducts(res.data.products || [])
      } catch (err) {
        console.error('Product search failed', err)
      }
    }, 450)
    setSearchTimeout(t)
    return () => clearTimeout(t)
  }, [productSearch])

  const handleAddFeaturedProduct = async (product) => {
    try {
      await api.post('/admin/settings/featured-products', {
        productId: product.id,
      })
      setFeaturedProducts((s) => [product, ...s])
      toast.success('Product added to featured')
      setProductSearch('')
    } catch (err) {
      toast.error('Failed to add featured product')
    }
  }

  const handleRemoveFeaturedProduct = async (productId) => {
    try {
      await api.delete(`/admin/settings/featured-products/${productId}`)
      setFeaturedProducts(featuredProducts.filter((p) => p.id !== productId))
      toast.success('Product removed from featured')
    } catch (err) {
      toast.error('Failed to remove featured product')
    }
  }

  const handleSaveFeaturedSettings = async () => {
    setSaving(true)
    try {
      await api.post('/admin/settings/featured-settings', featuredSettings)
      toast.success('Featured products settings saved')
    } catch (error) {
      toast.error('Failed to save featured settings')
    } finally {
      setSaving(false)
    }
  }

  // ==================== HOMEPAGE SECTIONS HANDLERS ====================

  const handleSaveHomeSections = async () => {
    setSaving(true)
    try {
      await api.post('/admin/settings/home-sections', {
        sections: homeSections,
        order: sectionOrder,
      })
      toast.success('Homepage sections updated')
    } catch (error) {
      toast.error('Failed to save homepage sections')
    } finally {
      setSaving(false)
    }
  }

  // ==================== THEME HANDLERS ====================

  const handleSaveTheme = async () => {
    setSaving(true)
    try {
      await api.post('/admin/settings/theme', {
        colors,
        typography,
        layout,
        headerSettings,
        footerSettings,
        productPageSettings,
        shopPageSettings,
      })
      toast.success('Theme saved successfully')
    } catch (error) {
      toast.error('Failed to save theme')
    } finally {
      setSaving(false)
    }
  }

  const handleResetTheme = () => {
    if (!window.confirm('Reset to default theme?')) return
    setColors({
      primary: '#2563eb',
      secondary: '#06b6d4',
      accent: '#f59e0b',
      text: '#0f172a',
      heading: '#1e293b',
      background: '#ffffff',
      headerBg: '#ffffff',
      footerBg: '#1e293b',
      buttonPrimary: '#2563eb',
      buttonHover: '#1d4ed8',
      link: '#2563eb',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      saleBadge: '#ef4444',
      newBadge: '#10b981',
    })
    toast.success('Theme reset to defaults')
  }

  // ==================== SHIPPING HANDLERS ====================

  const handleSaveShipping = async () => {
    setSaving(true)
    try {
      await api.post('/admin/settings/shipping', {
        zones: shippingZones,
        methods: shippingMethods,
        deliverySettings,
        packagingOptions,
      })
      toast.success('Shipping settings saved')
    } catch (error) {
      toast.error('Failed to save shipping settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderCircle className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="settings-container">
      <Header title="Site Settings & CMS (Complete Dashboard)" />

      <div className="settings-content p-6">
        <TabsWithContext value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="shop-info">Shop Info</TabsTrigger>
            <TabsTrigger value="hero-slides">Hero Slider</TabsTrigger>
            <TabsTrigger value="featured">Featured Products</TabsTrigger>
            <TabsTrigger value="home-sections">Homepage Sections</TabsTrigger>
            <TabsTrigger value="menus">Navigation Menus</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="theme">Theme Customization</TabsTrigger>
            <TabsTrigger value="shipping">Shipping & Delivery</TabsTrigger>
          </TabsList>

          {/* ==================== SHOP INFO TAB ==================== */}
          <TabsContent value="shop-info">
            <div className="bg-card rounded-lg p-6 shadow">
              <h2 className="text-2xl font-bold text-foreground mb-6">Shop Information</h2>

              <div className="space-y-8">
                {/* Basic Info */}
                <section>
                  <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ImageUpload label="Shop Logo" value={shopLogo} onChange={setShopLogo} />
                    <ImageUpload
                      label="Favicon (16x16, 32x32, .ico or .png)"
                      value={shopFavicon}
                      onChange={setShopFavicon}
                    />
                    <FormInput
                      label="Shop Name"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="Your shop name"
                      required
                      error={formErrors.shopName}
                    />
                    <FormInput
                      label="Shop Tagline/Slogan"
                      value={shopTagline}
                      onChange={(e) => setShopTagline(e.target.value)}
                      placeholder="Your tagline"
                    />
                    <FormInput
                      label="Email"
                      value={shopEmail}
                      onChange={(e) => setShopEmail(e.target.value)}
                      placeholder="shop@example.com"
                      type="email"
                      required
                      error={formErrors.shopEmail}
                    />
                    <FormInput
                      label="Phone"
                      value={shopPhone}
                      onChange={(e) => setShopPhone(e.target.value)}
                      placeholder="+880 1234567890"
                      type="tel"
                      error={formErrors.shopPhone}
                    />
                    <FormInput
                      label="Business Address"
                      value={shopAddress}
                      onChange={(e) => setShopAddress(e.target.value)}
                      placeholder="Shop address"
                    />
                    <FormTextarea
                      label="Shop Description"
                      value={shopDescription}
                      onChange={(e) => setShopDescription(e.target.value)}
                      placeholder="Shop description for SEO and about pages"
                      rows={3}
                    />
                  </div>
                </section>

                {/* Localization */}
                <section>
                  <h3 className="text-lg font-semibold mb-4">Localization Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect
                      label="Currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      options={[
                        { value: 'USD', label: 'US Dollar (USD)' },
                        { value: 'EUR', label: 'Euro (EUR)' },
                        { value: 'GBP', label: 'British Pound (GBP)' },
                        { value: 'BDT', label: 'Bangladeshi Taka (BDT)' },
                        { value: 'INR', label: 'Indian Rupee (INR)' },
                      ]}
                    />
                    <FormInput
                      label="Currency Symbol"
                      value={currencySymbol}
                      onChange={(e) => setCurrencySymbol(e.target.value)}
                      placeholder="৳"
                    />
                    <FormSelect
                      label="Currency Position"
                      value={currencyPosition}
                      onChange={(e) => setCurrencyPosition(e.target.value)}
                      options={[
                        { value: 'before', label: 'Before Amount (৳100)' },
                        { value: 'after', label: 'After Amount (100 ৳)' },
                      ]}
                    />
                    <FormSelect
                      label="Timezone"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      options={[
                        { value: 'Asia/Dhaka', label: 'Asia/Dhaka (GMT+6)' },
                        { value: 'Asia/Kolkata', label: 'Asia/Kolkata (GMT+5:30)' },
                        { value: 'UTC', label: 'UTC' },
                        { value: 'Europe/London', label: 'Europe/London (GMT+0)' },
                      ]}
                    />
                    <FormSelect
                      label="Date Format"
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                      options={[
                        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                      ]}
                    />
                    <FormSelect
                      label="Time Format"
                      value={timeFormat}
                      onChange={(e) => setTimeFormat(e.target.value)}
                      options={[
                        { value: '12-hour', label: '12-hour (2:30 PM)' },
                        { value: '24-hour', label: '24-hour (14:30)' },
                      ]}
                    />
                    <FormSelect
                      label="Language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      options={[
                        { value: 'en', label: 'English' },
                        { value: 'bn', label: 'Bengali' },
                        { value: 'hi', label: 'Hindi' },
                      ]}
                    />
                  </div>
                </section>

                {/* SEO */}
                <section>
                  <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Meta Title"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="Your shop - Best products online"
                    />
                    <FormInput
                      label="Google Analytics ID"
                      value={googleAnalyticsId}
                      onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                      placeholder="UA-XXXXXXXXX-X"
                    />
                    <FormInput
                      label="Facebook Pixel ID"
                      value={facebookPixelId}
                      onChange={(e) => setFacebookPixelId(e.target.value)}
                      placeholder="Your pixel ID"
                    />
                    <FormTextarea
                      label="Meta Description"
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="Shop description for search engines"
                      rows={2}
                    />
                    <FormTextarea
                      label="Meta Keywords"
                      value={metaKeywords}
                      onChange={(e) => setMetaKeywords(e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                      rows={2}
                    />
                  </div>
                </section>

                {/* Store Status */}
                <section>
                  <h3 className="text-lg font-semibold mb-4">Store Status</h3>
                  <div className="space-y-4">
                    <FormToggle
                      label="Enable Store (Show/Maintenance Mode)"
                      value={storeEnabled}
                      onChange={setStoreEnabled}
                    />
                    {!storeEnabled && (
                      <FormTextarea
                        label="Maintenance Message"
                        value={maintenanceMessage}
                        onChange={(e) => setMaintenanceMessage(e.target.value)}
                        placeholder="We're currently under maintenance..."
                        rows={3}
                      />
                    )}
                  </div>
                </section>

                {/* Social Media */}
                <section>
                  <h3 className="text-lg font-semibold mb-4">Social Media Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Facebook URL"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      placeholder="https://facebook.com/yourshop"
                      type="url"
                    />
                    <FormInput
                      label="Instagram URL"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/yourshop"
                      type="url"
                    />
                    <FormInput
                      label="Twitter URL"
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                      placeholder="https://twitter.com/yourshop"
                      type="url"
                    />
                    <FormInput
                      label="YouTube URL"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/@yourshop"
                      type="url"
                    />
                    <FormInput
                      label="LinkedIn URL"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/company/yourshop"
                      type="url"
                    />
                    <FormInput
                      label="WhatsApp Number"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="+880 1234567890"
                      type="tel"
                    />
                  </div>
                </section>

                {/* Business Info */}
                <section>
                  <h3 className="text-lg font-semibold mb-4">Business Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Business Registration Number"
                      value={businessRegNumber}
                      onChange={(e) => setBusinessRegNumber(e.target.value)}
                      placeholder="Your registration number"
                    />
                    <FormInput
                      label="Tax/VAT Number"
                      value={taxVatNumber}
                      onChange={(e) => setTaxVatNumber(e.target.value)}
                      placeholder="Your tax number"
                    />
                  </div>
                </section>

                {/* Footer Links */}
                <section>
                  <h3 className="text-lg font-semibold mb-4">Footer Links & Copyright</h3>
                  <div className="space-y-4">
                    <FormTextarea
                      label="Copyright Text"
                      value={copyrightText}
                      onChange={(e) => setCopyrightText(e.target.value)}
                      placeholder="© 2026 ShopHub. All rights reserved."
                      rows={2}
                    />
                    <FormInput
                      label="Terms & Conditions URL"
                      value={termsUrl}
                      onChange={(e) => setTermsUrl(e.target.value)}
                      placeholder="/pages/terms"
                      type="url"
                    />
                    <FormInput
                      label="Privacy Policy URL"
                      value={privacyUrl}
                      onChange={(e) => setPrivacyUrl(e.target.value)}
                      placeholder="/pages/privacy"
                      type="url"
                    />
                    <FormInput
                      label="Return/Refund Policy URL"
                      value={returnPolicyUrl}
                      onChange={(e) => setReturnPolicyUrl(e.target.value)}
                      placeholder="/pages/return-policy"
                      type="url"
                    />
                  </div>
                </section>

                {/* Save Button */}
                <div className="flex gap-4 pt-4 border-t">
                  <button
                    onClick={handleSaveShopInfo}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ==================== HERO SLIDES TAB ==================== */}
          <TabsContent value="hero-slides">
            <div className="bg-card rounded-lg p-6 shadow space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Hero Slider</h2>

                {/* Slide Form */}
                {showSlideForm && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
                    <h3 className="font-semibold text-foreground">
                      {editingSlide ? 'Edit Slide' : 'New Slide'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput
                        label="Title"
                        value={slideForm.title}
                        onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                        placeholder="Slide title"
                        required
                      />
                      <FormInput
                        label="Subtitle"
                        value={slideForm.subtitle}
                        onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })}
                        placeholder="Slide subtitle"
                      />
                      <FormInput
                        label="CTA Text"
                        value={slideForm.cta}
                        onChange={(e) => setSlideForm({ ...slideForm, cta: e.target.value })}
                        placeholder="Shop Now"
                      />
                      <FormInput
                        label="CTA URL"
                        value={slideForm.url}
                        onChange={(e) => setSlideForm({ ...slideForm, url: e.target.value })}
                        placeholder="/products"
                        type="url"
                      />
                      <FormSelect
                        label="Text Position"
                        value={slideForm.textPosition}
                        onChange={(e) =>
                          setSlideForm({ ...slideForm, textPosition: e.target.value })
                        }
                        options={[
                          { value: 'left', label: 'Left' },
                          { value: 'center', label: 'Center' },
                          { value: 'right', label: 'Right' },
                        ]}
                      />
                      <ColorInput
                        label="Text Color"
                        value={slideForm.textColor}
                        onChange={(val) => setSlideForm({ ...slideForm, textColor: val })}
                      />
                      <div className="flex flex-col gap-2">
                        <label className="font-medium">
                          Overlay Opacity: {slideForm.overlayOpacity}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={slideForm.overlayOpacity}
                          onChange={(e) =>
                            setSlideForm({
                              ...slideForm,
                              overlayOpacity: parseInt(e.target.value),
                            })
                          }
                          className="w-full"
                        />
                      </div>
                      <FormToggle
                        label="Active/Inactive"
                        value={slideForm.isActive}
                        onChange={(val) => setSlideForm({ ...slideForm, isActive: val })}
                      />
                    </div>

                    <ImageUpload
                      label="Slide Image (1920x800px recommended)"
                      value={slideForm.image}
                      onChange={(val) => setSlideForm({ ...slideForm, image: val })}
                    />

                    <div className="flex gap-2 pt-4 border-t">
                      <button
                        onClick={handleSaveSlide}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save Slide'}
                      </button>
                      <button
                        onClick={() => {
                          setShowSlideForm(false)
                          setEditingSlide(null)
                        }}
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Slides List */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Slides ({heroSlides.length})</h3>
                    {!showSlideForm && (
                      <Button
                        onClick={() => {
                          setShowSlideForm(true)
                          setEditingSlide(null)
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        Add Slide
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {heroSlides.map((slide) => (
                      <div
                        key={slide.id}
                        className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
                      >
                        {slide.image && (
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-40 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <h4 className="font-semibold text-foreground mb-2">{slide.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {slide.subtitle}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditSlide(slide)}
                              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              <Edit2 className="w-3 h-3 inline mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSlide(slide.id)}
                              className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                            >
                              <Trash2 className="w-3 h-3 inline mr-1" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {heroSlides.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No slides yet. Create one!
                    </p>
                  )}
                </div>

                {/* Hero Settings */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold mb-4">Slider Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormToggle
                      label="Autoplay"
                      value={heroSettings.autoplay}
                      onChange={(val) => setHeroSettings({ ...heroSettings, autoplay: val })}
                    />
                    <FormInput
                      label="Autoplay Speed (seconds)"
                      value={heroSettings.autoplaySpeed}
                      onChange={(e) =>
                        setHeroSettings({
                          ...heroSettings,
                          autoplaySpeed: parseInt(e.target.value),
                        })
                      }
                      type="number"
                    />
                    <FormSelect
                      label="Transition Effect"
                      value={heroSettings.transition}
                      onChange={(e) =>
                        setHeroSettings({ ...heroSettings, transition: e.target.value })
                      }
                      options={[
                        { value: 'fade', label: 'Fade' },
                        { value: 'slide', label: 'Slide' },
                        { value: 'zoom', label: 'Zoom' },
                      ]}
                    />
                    <FormToggle
                      label="Show Navigation Arrows"
                      value={heroSettings.showArrows}
                      onChange={(val) => setHeroSettings({ ...heroSettings, showArrows: val })}
                    />
                    <FormToggle
                      label="Show Pagination Dots"
                      value={heroSettings.showDots}
                      onChange={(val) => setHeroSettings({ ...heroSettings, showDots: val })}
                    />
                    <FormToggle
                      label="Loop Slides"
                      value={heroSettings.loop}
                      onChange={(val) => setHeroSettings({ ...heroSettings, loop: val })}
                    />
                  </div>
                  <button
                    onClick={handleSaveHeroSettings}
                    disabled={saving}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ==================== FEATURED PRODUCTS TAB ==================== */}
          <TabsContent value="featured">
            <div className="bg-card rounded-lg p-6 shadow space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Featured Products</h2>

              {/* Product Search */}
              <div>
                <label className="font-medium text-foreground block mb-2">Add Products</label>
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by name..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-background text-foreground"
                />
                {availableProducts.length > 0 && (
                  <div className="mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg max-h-48 overflow-auto">
                    {availableProducts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div>
                          <div className="font-medium text-foreground">{p.name}</div>
                          <div className="text-sm text-muted-foreground">৳{p.price}</div>
                        </div>
                        <button
                          onClick={() => handleAddFeaturedProduct(p)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Featured Products List */}
              <div>
                <h3 className="font-semibold mb-4">
                  Featured Products ({featuredProducts.length})
                </h3>
                <div className="space-y-2">
                  {featuredProducts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No featured products yet. Search and add some!
                    </p>
                  ) : (
                    featuredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <GripVertical className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="font-medium text-foreground">{product.name}</div>
                            <div className="text-sm text-muted-foreground">৳{product.price}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFeaturedProduct(product.id)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Featured Display Settings */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold mb-4">Display Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelect
                    label="Products to Show"
                    value={featuredSettings.productsToShow}
                    onChange={(e) =>
                      setFeaturedSettings({
                        ...featuredSettings,
                        productsToShow: parseInt(e.target.value),
                      })
                    }
                    options={[
                      { value: '4', label: '4 Products' },
                      { value: '6', label: '6 Products' },
                      { value: '8', label: '8 Products' },
                      { value: '12', label: '12 Products' },
                    ]}
                  />
                  <FormSelect
                    label="Layout Style"
                    value={featuredSettings.layoutStyle}
                    onChange={(e) =>
                      setFeaturedSettings({ ...featuredSettings, layoutStyle: e.target.value })
                    }
                    options={[
                      { value: 'grid', label: 'Grid' },
                      { value: 'carousel', label: 'Carousel' },
                      { value: 'list', label: 'List' },
                    ]}
                  />
                  <FormToggle
                    label="Show Product Badges"
                    value={featuredSettings.showBadges}
                    onChange={(val) =>
                      setFeaturedSettings({ ...featuredSettings, showBadges: val })
                    }
                  />
                  <FormSelect
                    label="Sort Order"
                    value={featuredSettings.sortOrder}
                    onChange={(e) =>
                      setFeaturedSettings({ ...featuredSettings, sortOrder: e.target.value })
                    }
                    options={[
                      { value: 'manual', label: 'Manual Order' },
                      { value: 'newest', label: 'Newest First' },
                      { value: 'bestselling', label: 'Best Selling' },
                      { value: 'highest-rated', label: 'Highest Rated' },
                    ]}
                  />
                </div>
                <button
                  onClick={handleSaveFeaturedSettings}
                  disabled={saving}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </TabsContent>

          {/* ==================== HOMEPAGE SECTIONS TAB ==================== */}
          <TabsContent value="home-sections">
            <div className="bg-card rounded-lg p-6 shadow space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Homepage Sections</h2>

              <div className="space-y-4">
                {Object.entries(homeSections).map(([key, section]) => (
                  <div
                    key={key}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-foreground">{section.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 capitalize">{key}</p>
                      </div>
                      <FormToggle
                        label=""
                        value={section.enabled}
                        onChange={(val) =>
                          setHomeSections({
                            ...homeSections,
                            [key]: { ...section, enabled: val },
                          })
                        }
                      />
                    </div>

                    {section.enabled && (
                      <div className="space-y-3 mt-4 pl-4 border-l-2 border-blue-400">
                        {/* Categories Section */}
                        {key === 'categories' && (
                          <>
                            <FormInput
                              label="Section Title"
                              value={section.title}
                              onChange={(e) =>
                                setHomeSections({
                                  ...homeSections,
                                  [key]: { ...section, title: e.target.value },
                                })
                              }
                            />
                            <FormSelect
                              label="Number of Categories"
                              value={section.count}
                              onChange={(e) =>
                                setHomeSections({
                                  ...homeSections,
                                  [key]: { ...section, count: parseInt(e.target.value) },
                                })
                              }
                              options={[
                                { value: '4', label: '4 Categories' },
                                { value: '6', label: '6 Categories' },
                                { value: '8', label: '8 Categories' },
                              ]}
                            />
                            <FormSelect
                              label="Layout"
                              value={section.layout}
                              onChange={(e) =>
                                setHomeSections({
                                  ...homeSections,
                                  [key]: { ...section, layout: e.target.value },
                                })
                              }
                              options={[
                                { value: 'grid', label: 'Grid with Images' },
                                { value: 'icon', label: 'Icon-based' },
                                { value: 'text', label: 'Text Only' },
                              ]}
                            />
                            <FormToggle
                              label="Show Product Count"
                              value={section.showCount}
                              onChange={(val) =>
                                setHomeSections({
                                  ...homeSections,
                                  [key]: { ...section, showCount: val },
                                })
                              }
                            />
                          </>
                        )}

                        {/* Flash Sale Section */}
                        {key === 'flashSale' && (
                          <>
                            <FormInput
                              label="Section Title"
                              value={section.title}
                              onChange={(e) =>
                                setHomeSections({
                                  ...homeSections,
                                  [key]: { ...section, title: e.target.value },
                                })
                              }
                            />
                            <FormInput
                              label="Sale End Date/Time"
                              value={section.endDate}
                              onChange={(e) =>
                                setHomeSections({
                                  ...homeSections,
                                  [key]: { ...section, endDate: e.target.value },
                                })
                              }
                              type="datetime-local"
                            />
                          </>
                        )}

                        {/* New Arrivals Section */}
                        {key === 'newArrivals' && (
                          <>
                            <FormInput
                              label="Section Title"
                              value={section.title}
                              onChange={(e) =>
                                setHomeSections({
                                  ...homeSections,
                                  [key]: { ...section, title: e.target.value },
                                })
                              }
                            />
                            <FormInput
                              label="Days to Consider New"
                              value={section.daysNew}
                              onChange={(e) =>
                                setHomeSections({
                                  ...homeSections,
                                  [key]: {
                                    ...section,
                                    daysNew: parseInt(e.target.value),
                                  },
                                })
                              }
                              type="number"
                            />
                            <FormInput
                              label="Number of Products"
                              value={section.count}
                              onChange={(e) =>
                                setHomeSections({
                                  ...homeSections,
                                  [key]: { ...section, count: parseInt(e.target.value) },
                                })
                              }
                              type="number"
                            />
                          </>
                        )}

                        {/* Best Sellers Section */}
                        {key === 'bestSellers' && (
                          <>
                            <FormInput
                              label="Section Title"
                              value={section.title}
                              onChange={(e) =>
                                setHomeSections({
                                  ...homeSections,
                                  [key]: { ...section, title: e.target.value },
                                })
                              }
                            />
                            <FormSelect
                              label="Time Period"
                              value={section.period}
                              onChange={(e) =>
                                setHomeSections({
                                  ...homeSections,
                                  [key]: { ...section, period: e.target.value },
                                })
                              }
                              options={[
                                { value: '7', label: 'Last 7 Days' },
                                { value: '30', label: 'Last 30 Days' },
                                { value: '90', label: 'Last 90 Days' },
                              ]}
                            />
                            <FormInput
                              label="Number of Products"
                              value={section.count}
                              onChange={(e) =>
                                setHomeSections({
                                  ...homeSections,
                                  [key]: { ...section, count: parseInt(e.target.value) },
                                })
                              }
                              type="number"
                            />
                          </>
                        )}

                        {/* Testimonials Section */}
                        {key === 'testimonials' && (
                          <>
                            <FormInput
                              label="Section Title"
                              value={section.title}
                              onChange={(e) =>
                                setHomeSections({
                                  ...homeSections,
                                  [key]: { ...section, title: e.target.value },
                                })
                              }
                            />
                            <FormInput
                              label="Number of Testimonials"
                              value={section.count}
                              onChange={(e) =>
                                setHomeSections({
                                  ...homeSections,
                                  [key]: { ...section, count: parseInt(e.target.value) },
                                })
                              }
                              type="number"
                            />
                            <FormToggle
                              label="Auto-pull from Product Reviews"
                              value={section.autoFetch}
                              onChange={(val) =>
                                setHomeSections({
                                  ...homeSections,
                                  [key]: { ...section, autoFetch: val },
                                })
                              }
                            />
                          </>
                        )}

                        {/* Newsletter Section */}
                        {key === 'newsletter' && (
                          <>
                            <FormInput
                              label="Section Title"
                              value={section.title}
                              onChange={(e) =>
                                setHomeSections({
                                  ...homeSections,
                                  [key]: { ...section, title: e.target.value },
                                })
                              }
                            />
                            <FormTextarea
                              label="Section Description"
                              value={section.description}
                              onChange={(e) =>
                                setHomeSections({
                                  ...homeSections,
                                  [key]: { ...section, description: e.target.value },
                                })
                              }
                              rows={2}
                            />
                            <FormInput
                              label="Button Text"
                              value={section.buttonText}
                              onChange={(e) =>
                                setHomeSections({
                                  ...homeSections,
                                  [key]: { ...section, buttonText: e.target.value },
                                })
                              }
                            />
                          </>
                        )}

                        {/* Brands Section */}
                        {key === 'brands' && (
                          <>
                            <FormInput
                              label="Section Title"
                              value={section.title}
                              onChange={(e) =>
                                setHomeSections({
                                  ...homeSections,
                                  [key]: { ...section, title: e.target.value },
                                })
                              }
                            />
                            <FormSelect
                              label="Layout"
                              value={section.layout}
                              onChange={(e) =>
                                setHomeSections({
                                  ...homeSections,
                                  [key]: { ...section, layout: e.target.value },
                                })
                              }
                              options={[
                                { value: 'carousel', label: 'Carousel' },
                                { value: 'grid', label: 'Grid' },
                              ]}
                            />
                            <FormToggle
                              label="Grayscale Hover Effect"
                              value={section.grayscale}
                              onChange={(val) =>
                                setHomeSections({
                                  ...homeSections,
                                  [key]: { ...section, grayscale: val },
                                })
                              }
                            />
                          </>
                        )}

                        {/* Instagram Section */}
                        {key === 'instagram' && (
                          <>
                            <FormInput
                              label="Section Title"
                              value={section.title}
                              onChange={(e) =>
                                setHomeSections({
                                  ...homeSections,
                                  [key]: { ...section, title: e.target.value },
                                })
                              }
                            />
                            <FormInput
                              label="Instagram Username"
                              value={section.username}
                              onChange={(e) =>
                                setHomeSections({
                                  ...homeSections,
                                  [key]: { ...section, username: e.target.value },
                                })
                              }
                              placeholder="@yourshop"
                            />
                            <FormInput
                              label="Number of Posts"
                              value={section.posts}
                              onChange={(e) =>
                                setHomeSections({
                                  ...homeSections,
                                  [key]: { ...section, posts: parseInt(e.target.value) },
                                })
                              }
                              type="number"
                            />
                          </>
                        )}

                        {/* Blog Section */}
                        {key === 'blog' && (
                          <>
                            <FormInput
                              label="Section Title"
                              value={section.title}
                              onChange={(e) =>
                                setHomeSections({
                                  ...homeSections,
                                  [key]: { ...section, title: e.target.value },
                                })
                              }
                            />
                            <FormInput
                              label="Number of Posts"
                              value={section.posts}
                              onChange={(e) =>
                                setHomeSections({
                                  ...homeSections,
                                  [key]: { ...section, posts: parseInt(e.target.value) },
                                })
                              }
                              type="number"
                            />
                            <FormSelect
                              label="Layout"
                              value={section.layout}
                              onChange={(e) =>
                                setHomeSections({
                                  ...homeSections,
                                  [key]: { ...section, layout: e.target.value },
                                })
                              }
                              options={[
                                { value: 'grid', label: 'Grid' },
                                { value: 'list', label: 'List' },
                                { value: 'carousel', label: 'Carousel' },
                              ]}
                            />
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveHomeSections}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save All Sections'}
              </button>
            </div>
          </TabsContent>

          {/* ==================== MENUS TAB ==================== */}
          {/* ==================== CATEGORIES TAB ==================== */}
          <TabsContent value="categories">
            <div className="bg-card rounded-lg p-6 shadow space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Categories & Subcategories</h2>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    value={''}
                    onChange={() => {}}
                    placeholder="New category name"
                    className="flex-1 px-4 py-2 border rounded bg-background text-foreground border-gray-300 dark:border-gray-600"
                    id="_unused_cat_input"
                  />
                  <button
                    onClick={async () => {
                      // fetch current list, add placeholder and open editor
                      try {
                        setSaving(true)
                        const res = await api
                          .get('/admin/settings/categories')
                          .catch(() => ({ data: [] }))
                        const cats = Array.isArray(res.data) ? res.data : []
                        cats.push({ name: 'New Category', subcategories: [] })
                        await api.post('/admin/settings/categories', cats)
                        toast.success('Category added')
                      } catch (e) {
                        toast.error('Failed to add category')
                      } finally {
                        setSaving(false)
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    <Plus className="w-4 h-4 inline-block mr-2" /> Add Category
                  </button>
                </div>

                <CategoryManager />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="menus">
            <div className="bg-card rounded-lg p-6 shadow space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Navigation Menus</h2>

              {/* Header Menu */}
              <section className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold mb-4">Header Menu</h3>
                <div className="space-y-2 mb-4">
                  {headerMenu.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded border"
                    >
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-sm text-muted-foreground">{item.url}</div>
                      </div>
                      <button
                        onClick={() => setHeaderMenu(headerMenu.filter((_, i) => i !== idx))}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground text-center py-4">
                  Menu management coming soon!
                </p>
              </section>

              {/* Footer Menus */}
              <section className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold mb-4">Footer Menus</h3>
                <p className="text-sm text-muted-foreground text-center py-4">
                  Footer menu management coming soon!
                </p>
              </section>
            </div>
          </TabsContent>

          {/* ==================== THEME CUSTOMIZATION TAB ==================== */}
          <TabsContent value="theme">
            <div className="bg-card rounded-lg p-6 shadow space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Theme Customization</h2>

              {/* Color Scheme */}
              <section className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold mb-4">Color Scheme</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <ColorInput
                    label="Primary Color"
                    value={colors.primary}
                    onChange={(val) => setColors({ ...colors, primary: val })}
                  />
                  <ColorInput
                    label="Secondary Color"
                    value={colors.secondary}
                    onChange={(val) => setColors({ ...colors, secondary: val })}
                  />
                  <ColorInput
                    label="Accent Color"
                    value={colors.accent}
                    onChange={(val) => setColors({ ...colors, accent: val })}
                  />
                  <ColorInput
                    label="Text Color"
                    value={colors.text}
                    onChange={(val) => setColors({ ...colors, text: val })}
                  />
                  <ColorInput
                    label="Heading Color"
                    value={colors.heading}
                    onChange={(val) => setColors({ ...colors, heading: val })}
                  />
                  <ColorInput
                    label="Background Color"
                    value={colors.background}
                    onChange={(val) => setColors({ ...colors, background: val })}
                  />
                  <ColorInput
                    label="Header Background"
                    value={colors.headerBg}
                    onChange={(val) => setColors({ ...colors, headerBg: val })}
                  />
                  <ColorInput
                    label="Footer Background"
                    value={colors.footerBg}
                    onChange={(val) => setColors({ ...colors, footerBg: val })}
                  />
                  <ColorInput
                    label="Button Primary Color"
                    value={colors.buttonPrimary}
                    onChange={(val) => setColors({ ...colors, buttonPrimary: val })}
                  />
                  <ColorInput
                    label="Button Hover Color"
                    value={colors.buttonHover}
                    onChange={(val) => setColors({ ...colors, buttonHover: val })}
                  />
                  <ColorInput
                    label="Link Color"
                    value={colors.link}
                    onChange={(val) => setColors({ ...colors, link: val })}
                  />
                  <ColorInput
                    label="Success Color"
                    value={colors.success}
                    onChange={(val) => setColors({ ...colors, success: val })}
                  />
                  <ColorInput
                    label="Warning Color"
                    value={colors.warning}
                    onChange={(val) => setColors({ ...colors, warning: val })}
                  />
                  <ColorInput
                    label="Error Color"
                    value={colors.error}
                    onChange={(val) => setColors({ ...colors, error: val })}
                  />
                  <ColorInput
                    label="Sale Badge Color"
                    value={colors.saleBadge}
                    onChange={(val) => setColors({ ...colors, saleBadge: val })}
                  />
                  <ColorInput
                    label="New Badge Color"
                    value={colors.newBadge}
                    onChange={(val) => setColors({ ...colors, newBadge: val })}
                  />
                </div>
                <button
                  onClick={handleResetTheme}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Reset to Defaults
                </button>
              </section>

              {/* Typography */}
              <section className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold mb-4">Typography</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelect
                    label="Heading Font"
                    value={typography.headingFont}
                    onChange={(e) => setTypography({ ...typography, headingFont: e.target.value })}
                    options={[
                      { value: 'Poppins', label: 'Poppins' },
                      { value: 'Roboto', label: 'Roboto' },
                      { value: 'Montserrat', label: 'Montserrat' },
                      { value: 'Inter', label: 'Inter' },
                    ]}
                  />
                  <FormSelect
                    label="Body Font"
                    value={typography.bodyFont}
                    onChange={(e) => setTypography({ ...typography, bodyFont: e.target.value })}
                    options={[
                      { value: 'Inter', label: 'Inter' },
                      { value: 'Roboto', label: 'Roboto' },
                      { value: 'Open Sans', label: 'Open Sans' },
                    ]}
                  />
                  <FormInput
                    label="Body Font Size"
                    value={typography.bodySize}
                    onChange={(e) => setTypography({ ...typography, bodySize: e.target.value })}
                    placeholder="1rem"
                  />
                  <FormInput
                    label="Line Height"
                    value={typography.lineHeight}
                    onChange={(e) => setTypography({ ...typography, lineHeight: e.target.value })}
                    placeholder="1.5"
                  />
                </div>
              </section>

              {/* Layout Settings */}
              <section className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold mb-4">Layout Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelect
                    label="Container Width"
                    value={layout.containerWidth}
                    onChange={(e) => setLayout({ ...layout, containerWidth: e.target.value })}
                    options={[
                      { value: '1200px', label: '1200px' },
                      { value: '1400px', label: '1400px' },
                      { value: '1600px', label: '1600px' },
                      { value: '100%', label: 'Full Width' },
                    ]}
                  />
                  <FormSelect
                    label="Sidebar Position"
                    value={layout.sidebarPosition}
                    onChange={(e) => setLayout({ ...layout, sidebarPosition: e.target.value })}
                    options={[
                      { value: 'left', label: 'Left' },
                      { value: 'right', label: 'Right' },
                      { value: 'none', label: 'No Sidebar' },
                    ]}
                  />
                  <FormSelect
                    label="Border Radius"
                    value={layout.borderRadius}
                    onChange={(e) => setLayout({ ...layout, borderRadius: e.target.value })}
                    options={[
                      { value: 'sharp', label: 'Sharp (No Radius)' },
                      { value: 'slightly-rounded', label: 'Slightly Rounded' },
                      { value: 'fully-rounded', label: 'Fully Rounded' },
                    ]}
                  />
                  <FormSelect
                    label="Box Shadow"
                    value={layout.boxShadow}
                    onChange={(e) => setLayout({ ...layout, boxShadow: e.target.value })}
                    options={[
                      { value: 'none', label: 'None' },
                      { value: 'light', label: 'Light' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'strong', label: 'Strong' },
                    ]}
                  />
                </div>
              </section>

              {/* Header Settings */}
              <section className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold mb-4">Header Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormToggle
                    label="Sticky Header"
                    value={headerSettings.sticky}
                    onChange={(val) => setHeaderSettings({ ...headerSettings, sticky: val })}
                  />
                  <FormToggle
                    label="Show Announcement Bar"
                    value={headerSettings.showAnnouncement}
                    onChange={(val) =>
                      setHeaderSettings({ ...headerSettings, showAnnouncement: val })
                    }
                  />
                  <FormToggle
                    label="Show Search Bar"
                    value={headerSettings.showSearch}
                    onChange={(val) => setHeaderSettings({ ...headerSettings, showSearch: val })}
                  />
                  <FormToggle
                    label="Show Wishlist Icon"
                    value={headerSettings.showWishlist}
                    onChange={(val) => setHeaderSettings({ ...headerSettings, showWishlist: val })}
                  />
                  <FormToggle
                    label="Show Compare Icon"
                    value={headerSettings.showCompare}
                    onChange={(val) => setHeaderSettings({ ...headerSettings, showCompare: val })}
                  />
                  <FormToggle
                    label="Show Cart Icon"
                    value={headerSettings.showCart}
                    onChange={(val) => setHeaderSettings({ ...headerSettings, showCart: val })}
                  />
                  {headerSettings.showAnnouncement && (
                    <FormInput
                      label="Announcement Text"
                      value={headerSettings.announcementText}
                      onChange={(e) =>
                        setHeaderSettings({ ...headerSettings, announcementText: e.target.value })
                      }
                    />
                  )}
                </div>
              </section>

              {/* Footer Settings */}
              <section className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold mb-4">Footer Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelect
                    label="Footer Columns"
                    value={footerSettings.columns}
                    onChange={(e) =>
                      setFooterSettings({ ...footerSettings, columns: e.target.value })
                    }
                    options={[
                      { value: '1', label: '1 Column' },
                      { value: '2', label: '2 Columns' },
                      { value: '3', label: '3 Columns' },
                      { value: '4', label: '4 Columns' },
                    ]}
                  />
                  <FormToggle
                    label="Show Social Media Icons"
                    value={footerSettings.showSocial}
                    onChange={(val) => setFooterSettings({ ...footerSettings, showSocial: val })}
                  />
                  <FormToggle
                    label="Show Payment Methods"
                    value={footerSettings.showPayment}
                    onChange={(val) => setFooterSettings({ ...footerSettings, showPayment: val })}
                  />
                  <FormToggle
                    label="Show Newsletter Subscription"
                    value={footerSettings.showNewsletter}
                    onChange={(val) =>
                      setFooterSettings({ ...footerSettings, showNewsletter: val })
                    }
                  />
                  <FormToggle
                    label="Show Back to Top Button"
                    value={footerSettings.showBackToTop}
                    onChange={(val) => setFooterSettings({ ...footerSettings, showBackToTop: val })}
                  />
                </div>
              </section>

              <button
                onClick={handleSaveTheme}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Theme'}
              </button>
            </div>
          </TabsContent>

          {/* ==================== SHIPPING TAB ==================== */}
          <TabsContent value="shipping">
            <div className="bg-card rounded-lg p-6 shadow space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Shipping & Delivery</h2>

              {/* Delivery Settings */}
              <section className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold mb-4">Delivery Time Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelect
                    label="Processing Time"
                    value={deliverySettings.processingTime}
                    onChange={(e) =>
                      setDeliverySettings({
                        ...deliverySettings,
                        processingTime: e.target.value,
                      })
                    }
                    options={[
                      { value: '1-3 days', label: '1-3 Days' },
                      { value: '3-5 days', label: '3-5 Days' },
                      { value: '5-7 days', label: '5-7 Days' },
                    ]}
                  />
                  <FormSelect
                    label="Standard Delivery"
                    value={deliverySettings.standardDelivery}
                    onChange={(e) =>
                      setDeliverySettings({
                        ...deliverySettings,
                        standardDelivery: e.target.value,
                      })
                    }
                    options={[
                      { value: '5-7 days', label: '5-7 Days' },
                      { value: '7-10 days', label: '7-10 Days' },
                      { value: '10-14 days', label: '10-14 Days' },
                    ]}
                  />
                  <FormSelect
                    label="Express Delivery"
                    value={deliverySettings.expressDelivery}
                    onChange={(e) =>
                      setDeliverySettings({
                        ...deliverySettings,
                        expressDelivery: e.target.value,
                      })
                    }
                    options={[
                      { value: '1-2 days', label: '1-2 Days' },
                      { value: '2-3 days', label: '2-3 Days' },
                      { value: '3-4 days', label: '3-4 Days' },
                    ]}
                  />
                  <FormInput
                    label="Order Cutoff Time"
                    value={deliverySettings.orderCutoff}
                    onChange={(e) =>
                      setDeliverySettings({ ...deliverySettings, orderCutoff: e.target.value })
                    }
                    type="time"
                  />
                </div>
              </section>

              {/* Packaging Options */}
              <section className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold mb-4">Packaging Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormToggle
                    label="Gift Wrap Available"
                    value={packagingOptions.giftWrap}
                    onChange={(val) => setPackagingOptions({ ...packagingOptions, giftWrap: val })}
                  />
                  {packagingOptions.giftWrap && (
                    <FormInput
                      label="Gift Wrap Cost (৳)"
                      value={packagingOptions.giftWrapCost}
                      onChange={(e) =>
                        setPackagingOptions({
                          ...packagingOptions,
                          giftWrapCost: parseFloat(e.target.value),
                        })
                      }
                      type="number"
                    />
                  )}
                  <FormToggle
                    label="Gift Message Option"
                    value={packagingOptions.giftMessage}
                    onChange={(val) =>
                      setPackagingOptions({ ...packagingOptions, giftMessage: val })
                    }
                  />
                </div>
              </section>

              {/* Shipping Info Coming Soon */}
              <section className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold mb-4">Shipping Zones & Methods</h3>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Advanced shipping zones and methods management coming soon!
                </p>
              </section>

              <button
                onClick={handleSaveShipping}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Shipping Settings'}
              </button>
            </div>
          </TabsContent>
        </TabsWithContext>
      </div>
    </div>
  )
}

// Small internal component to manage categories UI
const CategoryManager = () => {
  const [localCats, setLocalCats] = useState([])
  const [loadingCats, setLoadingCats] = useState(false)

  const fetchCats = async () => {
    setLoadingCats(true)
    try {
      const res = await api.get('/admin/settings/categories')
      setLocalCats(Array.isArray(res.data) ? res.data : [])
    } catch (e) {
      console.error(e)
      toast.error('Failed to load categories')
    } finally {
      setLoadingCats(false)
    }
  }

  useEffect(() => {
    fetchCats()
  }, [])

  const save = async (cats) => {
    setSavingCategories(true)
    try {
      await api.post('/admin/settings/categories', cats)
      setLocalCats(cats)
      toast.success('Categories saved')
    } catch (e) {
      console.error(e)
      toast.error('Failed to save categories')
    } finally {
      setSavingCategories(false)
    }
  }

  const addCategory = () => {
    const next = [...localCats, { name: 'New Category', subcategories: [] }]
    setLocalCats(next)
  }

  const updateCategoryName = (idx, name) => {
    const next = [...localCats]
    next[idx] = { ...next[idx], name }
    setLocalCats(next)
  }

  const deleteCategory = (idx) => {
    const next = [...localCats]
    next.splice(idx, 1)
    setLocalCats(next)
  }

  const addSub = (cIdx, name = 'New Subcategory') => {
    const next = [...localCats]
    next[cIdx].subcategories = next[cIdx].subcategories || []
    next[cIdx].subcategories.push({ name })
    setLocalCats(next)
  }

  const updateSubName = (cIdx, sIdx, name) => {
    const next = [...localCats]
    next[cIdx].subcategories[sIdx].name = name
    setLocalCats(next)
  }

  const deleteSub = (cIdx, sIdx) => {
    const next = [...localCats]
    next[cIdx].subcategories.splice(sIdx, 1)
    setLocalCats(next)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={addCategory} className="px-3 py-1 bg-green-600 text-white rounded">
          Add Category
        </button>
        <button
          onClick={() => save(localCats)}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          {savingCategories ? 'Saving...' : 'Save All'}
        </button>
        <button onClick={fetchCats} className="px-3 py-1 border rounded">
          Refresh
        </button>
      </div>

      {loadingCats ? (
        <div className="py-6 text-center">Loading...</div>
      ) : localCats.length ? (
        localCats.map((cat, ci) => (
          <div key={ci} className="p-4 bg-card rounded border border-gray-700">
            <div className="flex items-center gap-2">
              <input
                value={cat.name}
                onChange={(e) => updateCategoryName(ci, e.target.value)}
                className="flex-1 px-3 py-2 bg-background text-foreground border rounded"
              />
              <button
                onClick={() => addSub(ci)}
                className="px-3 py-1 bg-indigo-600 text-white rounded"
              >
                + Sub
              </button>
              <button
                onClick={() => deleteCategory(ci)}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {(cat.subcategories || []).map((sub, si) => (
                <div key={si} className="flex items-center gap-2">
                  <input
                    value={sub.name}
                    onChange={(e) => updateSubName(ci, si, e.target.value)}
                    className="flex-1 px-3 py-2 bg-background text-foreground border rounded"
                  />
                  <button
                    onClick={() => deleteSub(ci, si)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="py-6 text-center text-muted-foreground">No categories added yet.</div>
      )}
    </div>
  )
}

export default SettingsEnhanced
