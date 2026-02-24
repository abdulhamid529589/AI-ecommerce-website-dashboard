import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Loader,
  AlertCircle,
  Grid,
  List,
  Filter,
  ChevronDown,
  Eye,
  Copy,
  MoreVertical,
  TrendingUp,
  Package,
  Star,
  X,
  Check,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../lib/axios'
import EnhancedProductModal from '../modals/EnhancedProductModal'
import { getImageSrc, handleImageError } from '../utils/imageUtils'

const ProductManagement = () => {
  const isDark = useSelector((state) => state.theme?.isDark) || false

  // State Management
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFormModal, setShowFormModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [categories, setCategories] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [showFilters, setShowFilters] = useState(false)

  // Fetch Products - Added timestamp to prevent caching
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      // Add cache-busting parameter with timestamp
      const response = await api.get(`/product?limit=100&_t=${Date.now()}`)
      const allProducts = response.data.products || []
      setProducts(allProducts)
    } catch (err) {
      console.error('❌ Fetch products error:', err.message)
      toast.error('Failed to load products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch Categories from Settings API
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get(`/admin/settings/categories?_t=${Date.now()}`)
      const cats = Array.isArray(response.data) ? response.data : response.data?.categories || []
      const categoryNames = cats.map((cat) => cat.name)
      setCategories(
        categoryNames.length > 0 ? categoryNames : ['Bedding', 'Pillows', 'Blankets', 'Comforters'],
      )
    } catch (err) {
      console.error('❌ Fetch categories error:', err.message)
      setCategories(['Bedding', 'Pillows', 'Blankets', 'Comforters'])
    }
  }, [])

  // Initial Load
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  // Advanced Filtering & Sorting
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products]

    // Filter by search
    if (searchTerm) {
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.id?.toString().includes(searchTerm) ||
          p.sku?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by category
    if (filterCategory !== 'all') {
      result = result.filter((p) => p.category?.toLowerCase() === filterCategory.toLowerCase())
    }

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter((p) => p.status === filterStatus)
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        break
      case 'price-low':
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
        break
      case 'price-high':
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
        break
      case 'stock-high':
        result.sort((a, b) => (b.stock || 0) - (a.stock || 0))
        break
      case 'stock-low':
        result.sort((a, b) => (a.stock || 0) - (b.stock || 0))
        break
      case 'name-a-z':
        result.sort((a, b) => a.name?.localeCompare(b.name))
        break
      default:
        break
    }

    return result
  }, [products, searchTerm, filterCategory, filterStatus, sortBy])

  // Paginated Products
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage)

  // Delete Product with confirmation
  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return
    }

    const productId = product.id || product._id
    setDeleting(productId)

    try {
      await api.delete(`/product/admin/delete/${productId}`)
      // Refetch products to ensure consistency with server state
      await fetchProducts()
      toast.success('Product deleted successfully')
    } catch (err) {
      console.error('❌ Delete error:', err)
      if (err.response?.status === 401) {
        toast.error('Unauthorized: Please login again')
      } else if (err.response?.status === 403) {
        toast.error('You do not have permission to delete products')
      } else if (err.response?.status === 404) {
        toast.error('Product not found. It may have been deleted already.')
        // Refetch to sync with server state
        await fetchProducts()
      } else {
        toast.error(err.response?.data?.message || 'Failed to delete product')
      }
    } finally {
      setDeleting(null)
    }
  }

  // Save Product (Create/Update)
  const handleSaveProduct = async (productData) => {
    try {
      if (selectedProduct) {
        // Update
        const productId = selectedProduct.id || selectedProduct._id
        await api.put(`/product/admin/update/${productId}`, productData)
        setProducts((prev) =>
          prev.map((p) => ((p.id || p._id) === productId ? { ...p, ...productData } : p)),
        )
        toast.success('Product updated successfully')
      } else {
        // Create
        const response = await api.post(`/product/admin/create`, productData)
        setProducts((prev) => [response.data.product, ...prev])
        toast.success('Product created successfully')
      }
      setShowFormModal(false)
      setSelectedProduct(null)
      // Refresh products list
      fetchProducts()
    } catch (err) {
      console.error('❌ Save error:', err)
      toast.error(err.response?.data?.message || 'Failed to save product')
    }
  }

  // Duplicate Product
  const handleDuplicateProduct = async (product) => {
    try {
      const response = await api.post(`/product/${product.id}/duplicate`)
      if (response.data?.product) {
        setProducts((prev) => [response.data.product, ...prev])
        toast.success('Product duplicated successfully')
      }
    } catch (err) {
      toast.error('Failed to duplicate product')
    }
  }

  // Format Currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(value || 0)
  }

  // Get stock status
  const getStockStatus = (stock) => {
    if (stock === 0)
      return {
        label: 'Out of Stock',
        color: 'red',
        bg: 'bg-red-100 dark:bg-red-900/30',
        icon: AlertTriangle,
      }
    if (stock < 10)
      return {
        label: 'Low Stock',
        color: 'yellow',
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        icon: AlertTriangle,
      }
    return {
      label: 'In Stock',
      color: 'green',
      bg: 'bg-green-100 dark:bg-green-900/30',
      icon: Check,
    }
  }

  // Statistics
  const stats = useMemo(
    () => ({
      total: products.length,
      outOfStock: products.filter((p) => p.stock === 0).length,
      lowStock: products.filter((p) => p.stock > 0 && p.stock < 10).length,
      avgPrice: products.length
        ? formatCurrency(
            products.reduce((sum, p) => sum + parseFloat(p.price || 0), 0) / products.length,
          )
        : '৳0',
    }),
    [products],
  )

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-30 backdrop-blur-lg border-b ${isDark ? 'bg-slate-800/95 border-slate-700' : 'bg-white/95 border-slate-200'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                📦 Product Hub
              </h1>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Manage your product catalog with advanced tools
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchProducts()}
                disabled={loading}
                title="Refresh product list"
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200 font-semibold disabled:opacity-50"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => {
                  setSelectedProduct(null)
                  setShowFormModal(true)
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
              >
                <Plus size={20} />
                <span>Add Product</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Products', value: stats.total, icon: Package, color: 'blue' },
            { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'yellow' },
            { label: 'Out of Stock', value: stats.outOfStock, icon: AlertTriangle, color: 'red' },
            { label: 'Avg Price', value: stats.avgPrice, icon: TrendingUp, color: 'green' },
          ].map((stat, i) => {
            const IconComponent = stat.icon
            const colorMap = {
              blue: 'from-blue-600/20 to-blue-600/5 border-blue-200 dark:border-blue-800',
              yellow: 'from-yellow-600/20 to-yellow-600/5 border-yellow-200 dark:border-yellow-800',
              red: 'from-red-600/20 to-red-600/5 border-red-200 dark:border-red-800',
              green: 'from-green-600/20 to-green-600/5 border-green-200 dark:border-green-800',
            }
            return (
              <div
                key={i}
                className={`bg-gradient-to-br ${colorMap[stat.color]} backdrop-blur-sm rounded-2xl p-4 border transition-all hover:shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                    >
                      {stat.label}
                    </p>
                    <p
                      className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}
                    >
                      {stat.value}
                    </p>
                  </div>
                  <IconComponent size={32} className={`opacity-50`} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Search & Filter Bar */}
        <div
          className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-2xl p-6 mb-8 backdrop-blur-sm`}
        >
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search
                size={20}
                className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
              />
              <input
                type="text"
                placeholder="Search products by name, ID, or SKU..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'}`}
              />
            </div>

            {/* Filters and Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value)
                  setCurrentPage(1)
                }}
                className={`px-4 py-3 rounded-lg border appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value)
                  setCurrentPage(1)
                }}
                className={`px-4 py-3 rounded-lg border appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-4 py-3 rounded-lg border appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="stock-high">Stock: High to Low</option>
                <option value="stock-low">Stock: Low to High</option>
                <option value="name-a-z">Name: A-Z</option>
              </select>

              {/* View Mode & Items Per Page */}
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 px-3 py-3 rounded-lg border transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white border-blue-600' : isDark ? 'bg-slate-700 border-slate-600 text-slate-400' : 'bg-white border-slate-300 text-slate-600'}`}
                >
                  <Grid size={18} className="mx-auto" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 px-3 py-3 rounded-lg border transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white border-blue-600' : isDark ? 'bg-slate-700 border-slate-600 text-slate-400' : 'bg-white border-slate-300 text-slate-600'}`}
                >
                  <List size={18} className="mx-auto" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/List View */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-16 h-16 mb-6">
              <Loader className="animate-spin text-blue-600 absolute inset-0" size={64} />
            </div>
            <p className={`text-lg font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Loading your products...
            </p>
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div
            className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-2xl p-16 text-center backdrop-blur-sm`}
          >
            <AlertCircle
              size={64}
              className={`mx-auto mb-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
            />
            <p className={`text-xl font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              No products found
            </p>
            <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your filters or search term'
                : 'Start by creating your first product'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock)
                const StockIcon = stockStatus.icon
                return (
                  <div
                    key={product.id}
                    className={`${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-750' : 'bg-white border-slate-200 hover:bg-slate-50'} border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 group`}
                  >
                    {/* Image Placeholder */}
                    <div
                      className={`h-40 ${isDark ? 'bg-slate-700' : 'bg-slate-100'} relative overflow-hidden group-hover:scale-110 transition-transform duration-300`}
                    >
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={getImageSrc(product.images[0], product.name)}
                          alt={product.name}
                          onError={(e) => handleImageError(e, product.name)}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package
                            size={48}
                            className={isDark ? 'text-slate-600' : 'text-slate-300'}
                          />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setSelectedProduct(product)
                            setShowFormModal(true)
                          }}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Title & Category */}
                      <h3
                        className={`font-bold text-sm line-clamp-2 ${isDark ? 'text-white' : 'text-slate-900'}`}
                      >
                        {product.name}
                      </h3>
                      <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                        {product.category}
                      </p>

                      {/* Price */}
                      <div className="mt-3 flex items-end justify-between">
                        <div>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Price
                          </p>
                          <p
                            className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}
                          >
                            {formatCurrency(product.price)}
                          </p>
                        </div>
                      </div>

                      {/* Stock Status */}
                      <div
                        className={`mt-3 px-3 py-2 rounded-lg ${stockStatus.bg} flex items-center justify-between text-xs font-semibold`}
                      >
                        <span>{stockStatus.label}</span>
                        <StockIcon size={14} />
                      </div>

                      {/* Stock Number */}
                      <p className={`text-xs mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {product.stock} in stock
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => {
                            setSelectedProduct(product)
                            setShowFormModal(true)
                          }}
                          className="flex-1 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDuplicateProduct(product)}
                          className={`flex-1 p-2 rounded-lg border transition-colors flex items-center justify-center gap-2 text-sm font-semibold ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                        >
                          <Copy size={14} />
                          Copy
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          disabled={deleting === (product.id || product._id)}
                          className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleting === (product.id || product._id) ? (
                            <Loader size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-2xl p-6 backdrop-blur-sm`}
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div
                    className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                  >
                    Page {currentPage} of {totalPages} • Showing {paginatedProducts.length} of{' '}
                    {filteredAndSortedProducts.length}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg border transition-all ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page
                      if (totalPages <= 5) {
                        page = i + 1
                      } else {
                        const start = Math.max(1, currentPage - 2)
                        const end = Math.min(totalPages, start + 4)
                        page = start + Math.min(i, end - start)
                      }
                      return (
                        <button
                          key={`page-${page}-${i}`}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${currentPage === page ? 'bg-blue-600 text-white' : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                          {page}
                        </button>
                      )
                    })}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg border transition-all ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* List View */
          <div
            className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-2xl overflow-hidden backdrop-blur-sm`}
          >
            <table className="w-full">
              <thead>
                <tr
                  className={
                    isDark
                      ? 'bg-slate-700 border-b border-slate-600'
                      : 'bg-slate-50 border-b border-slate-200'
                  }
                >
                  <th
                    className={`px-6 py-4 text-left text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-900'}`}
                  >
                    Product
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-900'}`}
                  >
                    Category
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-900'}`}
                  >
                    Price
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-900'}`}
                  >
                    Stock
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-900'}`}
                  >
                    Status
                  </th>
                  <th
                    className={`px-6 py-4 text-right text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-900'}`}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product, idx) => {
                  const stockStatus = getStockStatus(product.stock)
                  return (
                    <tr
                      key={idx}
                      className={`border-b transition-colors ${isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <td className={`px-6 py-4 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                        <div className="font-semibold text-sm">{product.name}</div>
                        <div
                          className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}
                        >
                          ID: {product.id?.substring(0, 8)}...
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'}`}
                        >
                          {product.category}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 font-bold text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}
                      >
                        {formatCurrency(product.price)}
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${stockStatus.bg}`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${product.status === 'published' ? (isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800') : isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800'}`}
                        >
                          {product.status === 'published' ? '✓ Published' : '◯ Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedProduct(product)
                              setShowFormModal(true)
                            }}
                            className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDuplicateProduct(product)}
                            className={`p-2 rounded-lg border transition-colors ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                            title="Duplicate"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            disabled={deleting === (product.id || product._id)}
                            className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete"
                          >
                            {deleting === (product.id || product._id) ? (
                              <Loader size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Pagination for List View */}
            {totalPages > 1 && (
              <div
                className={`flex items-center justify-between p-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
              >
                <div
                  className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                >
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg border transition-all ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page
                    if (totalPages <= 5) {
                      page = i + 1
                    } else {
                      page = currentPage - 2 + i
                      if (page < 1) page += totalPages - 4
                      if (page > totalPages) page -= totalPages - 4
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${currentPage === page ? 'bg-blue-600 text-white' : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                      >
                        {page}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg border transition-all ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Product Form Modal */}
        {showFormModal && (
          <EnhancedProductModal
            product={selectedProduct}
            onClose={() => {
              setShowFormModal(false)
              setSelectedProduct(null)
            }}
            onSuccess={() => {
              setShowFormModal(false)
              setSelectedProduct(null)
              fetchProducts()
            }}
            isNew={!selectedProduct}
          />
        )}
      </div>
    </div>
  )
}

export default ProductManagement
