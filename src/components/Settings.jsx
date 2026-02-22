// ===== ENHANCED SETTINGS COMPONENT =====
// This file has been replaced with SettingsEnhanced.jsx
// which contains all the new dashboard features

import React from 'react'
import SettingsEnhanced from './SettingsEnhanced'

export default SettingsEnhanced

// Legacy code below - not used anymore
// Simple Tabs Component
const Tabs = ({ value, onValueChange, children }) => {
  return (
    <div className="tabs-wrapper" data-value={value}>
      {children}
    </div>
  )
}

const TabsList = ({ children }) => {
  return <div className="tabs-list">{children}</div>
}

const TabsTrigger = ({ value, children, onClick }) => {
  const parent = React.useContext(TabContext)
  const isActive = parent?.value === value
  return (
    <button
      onClick={() => {
        onClick?.()
        parent?.onValueChange?.(value)
      }}
      className={`tab-trigger ${isActive ? 'active' : ''}`}
    >
      {children}
    </button>
  )
}

const TabsContent = ({ value, children }) => {
  const parent = React.useContext(TabContext)
  if (parent?.value !== value) return null
  return <div className="tab-content">{children}</div>
}

const TabContext = React.createContext()

// Wrap Tabs to provide context
const TabsWithContext = ({ value, onValueChange, children }) => {
  return (
    <TabContext.Provider value={{ value, onValueChange }}>
      <div className="tabs-wrapper" data-value={value}>
        {children}
      </div>
    </TabContext.Provider>
  )
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState('shop-info')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Shop Info State
  const [shopName, setShopName] = useState('Bedtex')
  const [shopEmail, setShopEmail] = useState('support@bedtex.com')
  const [shopPhone, setShopPhone] = useState('+880 1234567890')
  const [shopAddress, setShopAddress] = useState('Dhaka, Bangladesh')
  const [shopDescription, setShopDescription] = useState('')
  const [shopLogo, setShopLogo] = useState('')
  const [formErrors, setFormErrors] = useState({})

  // Hero Slides State
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
  })
  const [draggedSlideId, setDraggedSlideId] = useState(null)
  const [prevHeroSlides, setPrevHeroSlides] = useState(null)
  const [pendingHeroSave, setPendingHeroSave] = useState(false)

  // Featured Products State
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [draggedFeaturedId, setDraggedFeaturedId] = useState(null)
  const [productSearch, setProductSearch] = useState('')
  const [availableProducts, setAvailableProducts] = useState([])
  const [searchTimeout, setSearchTimeout] = useState(null)
  const [prevFeaturedProducts, setPrevFeaturedProducts] = useState(null)
  const [pendingFeaturedSave, setPendingFeaturedSave] = useState(false)

  // Fetch all settings on mount
  useEffect(() => {
    fetchSettings()
  }, [])

  // Product search (debounced)
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

  // Featured products drag handlers
  const handleFeaturedDragStart = (e, productId) => {
    setDraggedFeaturedId(productId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleFeaturedDrop = async (e, targetId) => {
    e.preventDefault()
    if (!draggedFeaturedId || draggedFeaturedId === targetId) return
    const fromIndex = featuredProducts.findIndex((p) => p.id === draggedFeaturedId)
    const toIndex = featuredProducts.findIndex((p) => p.id === targetId)
    if (fromIndex === -1 || toIndex === -1) return
    const updated = [...featuredProducts]
    const [moved] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, moved)
    const withOrder = updated.map((p, idx) => ({ ...p, display_order: idx }))
    // keep previous state for undo
    setPrevFeaturedProducts(featuredProducts)
    setFeaturedProducts(withOrder)
    setDraggedFeaturedId(null)
    setPendingFeaturedSave(true)
  }

  const saveFeaturedOrder = async () => {
    try {
      await api.put('/admin/settings/featured-products/order', {
        order: featuredProducts.map((p) => ({ productId: p.id, display_order: p.display_order })),
      })
      toast.success('Featured products order saved')
      setPrevFeaturedProducts(null)
      setPendingFeaturedSave(false)
    } catch (err) {
      console.error('Failed to save featured order', err)
      toast.error('Failed to save featured order')
    }
  }

  const undoFeaturedOrder = () => {
    if (prevFeaturedProducts) {
      setFeaturedProducts(prevFeaturedProducts)
      setPrevFeaturedProducts(null)
      setPendingFeaturedSave(false)
      toast.info('Reverted featured products order')
    }
  }

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const [shopRes, slidesRes, featuredRes] = await Promise.all([
        api.get('/admin/settings/shop').catch(() => null),
        api.get('/admin/settings/hero-slides').catch(() => null),
        api.get('/admin/settings/featured-products').catch(() => null),
      ])

      if (shopRes?.data) {
        setShopName(shopRes.data.shopName || 'Bedtex')
        setShopEmail(shopRes.data.shopEmail || 'support@bedtex.com')
        setShopPhone(shopRes.data.shopPhone || '')
        setShopAddress(shopRes.data.shopAddress || '')
        setShopDescription(shopRes.data.shopDescription || '')
        setShopLogo(shopRes.data.shopLogo || '')
      }

      if (slidesRes?.data) {
        setHeroSlides(slidesRes.data.slides || [])
      }

      if (featuredRes?.data) {
        setFeaturedProducts(featuredRes.data.products || [])
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  // Save Shop Info
  const handleSaveShopInfo = async () => {
    // Validate
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
      // optimistic toast
      toast.info('Saving shop info...')
      await api.post('/admin/settings/shop', {
        shopName,
        shopEmail,
        shopPhone,
        shopAddress,
        shopDescription,
        shopLogo,
      })
      toast.success('Shop info updated successfully')
    } catch (error) {
      console.error('Save shop info failed', error)
      toast.error(error.response?.data?.message || 'Failed to save shop info')
    } finally {
      setSaving(false)
    }
  }

  // Add/Update Hero Slide
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
      setSlideForm({ title: '', subtitle: '', description: '', image: '', cta: '', url: '' })
      fetchSettings()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save slide')
    } finally {
      setSaving(false)
    }
  }

  // Delete Hero Slide
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

  // Edit Slide
  const handleEditSlide = (slide) => {
    setEditingSlide(slide)
    setSlideForm(slide)
    setShowSlideForm(true)
  }

  // Drag & Drop handlers for slides (HTML5 API)
  const handleDragStart = (e, slideId) => {
    setDraggedSlideId(slideId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDropOnSlide = async (e, targetId) => {
    e.preventDefault()
    if (!draggedSlideId || draggedSlideId === targetId) return
    const fromIndex = heroSlides.findIndex((s) => s.id === draggedSlideId)
    const toIndex = heroSlides.findIndex((s) => s.id === targetId)
    if (fromIndex === -1 || toIndex === -1) return
    const updated = [...heroSlides]
    const [moved] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, moved)
    // Update display_order locally (0-based)
    const withOrder = updated.map((s, idx) => ({ ...s, display_order: idx }))
    // keep previous state for undo
    setPrevHeroSlides(heroSlides)
    setHeroSlides(withOrder)
    setDraggedSlideId(null)
    setPendingHeroSave(true)
  }

  const saveHeroOrder = async () => {
    try {
      await Promise.all(
        heroSlides.map((s) =>
          api.put(`/admin/settings/hero-slides/${s.id}`, {
            ...s,
            display_order: s.display_order,
          }),
        ),
      )
      toast.success('Hero slide order saved')
      setPrevHeroSlides(null)
      setPendingHeroSave(false)
    } catch (err) {
      console.error('Failed to save hero slide order', err)
      toast.error('Failed to save slide order')
    }
  }

  const undoHeroOrder = () => {
    if (prevHeroSlides) {
      setHeroSlides(prevHeroSlides)
      setPrevHeroSlides(null)
      setPendingHeroSave(false)
      toast.info('Reverted slide order')
    }
  }

  // Handle Logo Upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    // Resize image client-side to max width/height 512 for faster uploads and preview
    const resizeImage = (file, maxSize = 512) =>
      new Promise((resolve, reject) => {
        const img = new Image()
        const reader = new FileReader()
        reader.onload = (ev) => {
          img.onload = () => {
            let { width, height } = img
            if (width > maxSize || height > maxSize) {
              const scale = Math.min(maxSize / width, maxSize / height)
              width = Math.round(width * scale)
              height = Math.round(height * scale)
            }
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, width, height)
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
            resolve(dataUrl)
          }
          img.onerror = (err) => reject(err)
          img.src = ev.target.result
        }
        reader.onerror = (err) => reject(err)
        reader.readAsDataURL(file)
      })

    try {
      const resized = await resizeImage(file, 512)
      setShopLogo(resized)
    } catch (err) {
      console.error('Image resize failed, using original file', err)
      const reader = new FileReader()
      reader.onload = (event) => setShopLogo(event.target.result)
      reader.readAsDataURL(file)
    }
  }

  // Handle Slide Image Upload
  const handleSlideImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setSlideForm({ ...slideForm, image: event.target.result })
    }
    reader.readAsDataURL(file)
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
      <Header title="Site Settings & CMS" />

      <div className="settings-content">
        <TabsWithContext value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="shop-info">Shop Info</TabsTrigger>
            <TabsTrigger value="hero-slides">Hero Slider</TabsTrigger>
            <TabsTrigger value="featured">Featured Products</TabsTrigger>
          </TabsList>

          {/* Shop Info Tab */}
          <TabsContent value="shop-info">
            <div className="bg-card rounded-lg p-6 shadow">
              <h2 className="text-2xl font-bold text-foreground mb-6">Shop Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  {/* Logo Upload */}
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-foreground">Shop Logo</label>
                    <div className="flex gap-4 items-center">
                      {shopLogo && (
                        <img
                          src={shopLogo}
                          alt="Shop Logo"
                          className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Shop Name */}
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-foreground">Shop Name</label>
                    <input
                      type="text"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-background text-foreground"
                      placeholder="Your shop name"
                    />
                    {formErrors.shopName && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.shopName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-foreground">Email</label>
                    <input
                      type="email"
                      value={shopEmail}
                      onChange={(e) => setShopEmail(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-background text-foreground"
                      placeholder="shop@example.com"
                    />
                    {formErrors.shopEmail && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.shopEmail}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-foreground">Phone</label>
                    <input
                      type="tel"
                      value={shopPhone}
                      onChange={(e) => setShopPhone(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-background text-foreground"
                      placeholder="+880 1234567890"
                    />
                    {formErrors.shopPhone && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.shopPhone}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-foreground">Address</label>
                    <input
                      type="text"
                      value={shopAddress}
                      onChange={(e) => setShopAddress(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-background text-foreground"
                      placeholder="Shop address"
                    />
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-foreground">Description</label>
                    <textarea
                      value={shopDescription}
                      onChange={(e) => setShopDescription(e.target.value)}
                      rows="4"
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-background text-foreground"
                      placeholder="Shop description for SEO and about pages"
                    />
                  </div>
                </div>

                {/* Preview column */}
                <div className="md:col-span-1">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                    <h3 className="font-semibold mb-3">Live Preview</h3>
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border">
                        {shopLogo ? (
                          <img
                            src={shopLogo}
                            alt="Logo preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground">No logo</div>
                        )}
                      </div>
                      <div className="text-center">
                        <h4 className="text-lg font-bold">{shopName || 'Shop Name'}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {shopDescription || 'Shop description will appear here.'}
                        </p>
                      </div>
                      <div className="w-full mt-3 text-sm text-foreground">
                        <p>
                          <strong>Email:</strong> {shopEmail || '—'}
                        </p>
                        <p>
                          <strong>Phone:</strong> {shopPhone || '—'}
                        </p>
                        <p>
                          <strong>Address:</strong> {shopAddress || '—'}
                        </p>
                      </div>
                      <div className="w-full mt-4">
                        <button
                          onClick={handleSaveShopInfo}
                          disabled={saving}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Hero Slides Tab */}
          <TabsContent value="hero-slides">
            <div className="bg-card rounded-lg p-6 shadow">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Hero Slider Slides</h2>
                <Button
                  onClick={() => {
                    setShowSlideForm(true)
                    setEditingSlide(null)
                    setSlideForm({
                      title: '',
                      subtitle: '',
                      description: '',
                      image: '',
                      cta: '',
                      url: '',
                    })
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add Slide
                </Button>
              </div>

              {/* Slide Form */}
              {showSlideForm && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-foreground mb-4">
                    {editingSlide ? 'Edit Slide' : 'New Slide'}
                  </h3>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="font-medium text-foreground">Title *</label>
                      <input
                        type="text"
                        value={slideForm.title}
                        onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-background text-foreground"
                        placeholder="Slide title"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-medium text-foreground">Subtitle</label>
                      <input
                        type="text"
                        value={slideForm.subtitle}
                        onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-background text-foreground"
                        placeholder="Slide subtitle"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-medium text-foreground">Description</label>
                      <textarea
                        value={slideForm.description}
                        onChange={(e) =>
                          setSlideForm({ ...slideForm, description: e.target.value })
                        }
                        rows="2"
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-background text-foreground"
                        placeholder="Slide description"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-medium text-foreground">Image *</label>
                      <div className="flex gap-4 items-center">
                        {slideForm.image && (
                          <img
                            src={slideForm.image}
                            alt="Slide preview"
                            className="w-32 h-20 object-cover rounded-lg border border-gray-300"
                          />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSlideImageUpload}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-medium text-foreground">CTA Button Text</label>
                      <input
                        type="text"
                        value={slideForm.cta}
                        onChange={(e) => setSlideForm({ ...slideForm, cta: e.target.value })}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-background text-foreground"
                        placeholder="e.g., Shop Now"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-medium text-foreground">CTA URL</label>
                      <input
                        type="text"
                        value={slideForm.url}
                        onChange={(e) => setSlideForm({ ...slideForm, url: e.target.value })}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-background text-foreground"
                        placeholder="/products?category=electronics"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveSlide}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save'}
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
                </div>
              )}

              {/* Slides List */}
              {pendingHeroSave && (
                <div className="mb-4 flex items-center gap-3">
                  <button
                    onClick={saveHeroOrder}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Save Order
                  </button>
                  <button
                    onClick={undoHeroOrder}
                    className="px-3 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                  >
                    Undo
                  </button>
                  <span className="text-sm text-muted-foreground">You have unsaved changes</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {heroSlides.map((slide) => (
                  <div
                    key={slide.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, slide.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropOnSlide(e, slide.id)}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden cursor-grab"
                  >
                    {slide.image && (
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-1">{slide.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {slide.description}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditSlide(slide)}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 text-sm"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSlide(slide.id)}
                          className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-1 text-sm"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {heroSlides.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No slides yet. Create one!</p>
              )}
            </div>
          </TabsContent>

          {/* Featured Products Tab */}
          <TabsContent value="featured">
            <div className="bg-card rounded-lg p-6 shadow">
              <h2 className="text-2xl font-bold text-foreground mb-6">Featured Products</h2>
              <div className="mb-4">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products to add..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-background text-foreground"
                />
                {availableProducts.length > 0 && (
                  <div className="mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 max-h-48 overflow-auto">
                    {availableProducts.map((p) => (
                      <div key={p.id} className="flex items-center justify-between gap-2 py-2">
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-sm text-muted-foreground">৳{p.price}</div>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              await api.post('/admin/settings/featured-products', {
                                productId: p.id,
                              })
                              setFeaturedProducts((s) => [p, ...s])
                              toast.success('Product added to featured')
                            } catch (err) {
                              toast.error('Failed to add featured product')
                            }
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingFeaturedSave && (
                  <div className="col-span-1 md:col-span-2 mb-2 flex items-center gap-3">
                    <button
                      onClick={saveFeaturedOrder}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Save Order
                    </button>
                    <button
                      onClick={undoFeaturedOrder}
                      className="px-3 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                    >
                      Undo
                    </button>
                    <span className="text-sm text-muted-foreground">You have unsaved changes</span>
                  </div>
                )}
                {featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    draggable
                    onDragStart={(e) => handleFeaturedDragStart(e, product.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleFeaturedDrop(e, product.id)}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 flex justify-between items-start cursor-grab"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">৳{product.price}</p>
                    </div>
                    <button
                      onClick={() => {
                        setFeaturedProducts(featuredProducts.filter((p) => p.id !== product.id))
                        // also remove on server
                        api
                          .delete(`/admin/settings/featured-products/${product.id}`)
                          .catch(() => {})
                      }}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => toast.info('Product selection feature coming soon')}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Featured Product
              </button>
            </div>
          </TabsContent>
        </TabsWithContext>
      </div>
    </div>
  )
}
