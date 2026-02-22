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
} from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../lib/axios'
import ProductFormModal from '../modals/ProductFormModal'
import ProductDetailsModal from '../modals/ProductDetailsModal'

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
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [categories, setCategories] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get(`/product?limit=100`)
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

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get(`/product?limit=100`)
      if (response.data.products) {
        const uniqueCategories = [...new Set(response.data.products.map((p) => p.category))].filter(
          Boolean,
        )
        setCategories(uniqueCategories)
      }
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
      setProducts((prev) => prev.filter((p) => (p.id || p._id) !== productId))
      toast.success('Product deleted successfully')
    } catch (err) {
      console.error('❌ Delete error:', err)
      if (err.response?.status === 401) {
        toast.error('Unauthorized: Please login again')
      } else if (err.response?.status === 403) {
        toast.error('You do not have permission to delete products')
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

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div
        className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-20`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1
                className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                Product Management
              </h1>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage {products.length} products • Showing {filteredProducts.length}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedProduct(null)
                setShowFormModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Add Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter Bar */}
        <div
          className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4 sm:p-6 mb-6`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search
                size={18}
                className={`absolute left-3 top-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
              />
              <input
                type="text"
                placeholder="Search by product name or ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
              />
            </div>
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value)
                  setCurrentPage(1)
                }}
                className={`w-full px-4 py-2 rounded-lg border appearance-none cursor-pointer ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table / Cards View */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading products...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div
            className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-12 text-center`}
          >
            <AlertCircle
              size={48}
              className={`mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}
            />
            <p className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              No products found
            </p>
            <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchTerm || filterCategory !== 'all'
                ? 'Try adjusting your search or filter'
                : 'Create your first product to get started'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div
              className="hidden md:block overflow-x-auto rounded-lg border"
              style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className={
                      isDark
                        ? 'bg-gray-800 border-b border-gray-700'
                        : 'bg-gray-50 border-b border-gray-200'
                    }
                  >
                    <th
                      className={`px-6 py-3 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}
                    >
                      Product
                    </th>
                    <th
                      className={`px-6 py-3 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}
                    >
                      Category
                    </th>
                    <th
                      className={`px-6 py-3 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}
                    >
                      Price
                    </th>
                    <th
                      className={`px-6 py-3 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}
                    >
                      Stock
                    </th>
                    <th
                      className={`px-6 py-3 text-right font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product, idx) => (
                    <tr
                      key={idx}
                      className={`border-b transition-colors ${isDark ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className="font-medium">{product.name}</div>
                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          ID: {product.id || product._id}
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'}`}
                        >
                          {product.category}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}
                      >
                        {formatCurrency(product.price)}
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? (isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800') : isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'}`}
                        >
                          {product.stock}
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-4">
              {paginatedProducts.map((product, idx) => (
                <div
                  key={idx}
                  className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}
                >
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {product.name}
                  </h3>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                    {product.category}
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Price
                      </div>
                      <div
                        className={`font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}
                      >
                        {formatCurrency(product.price)}
                      </div>
                    </div>
                    <div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Stock
                      </div>
                      <div
                        className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}
                      >
                        {product.stock}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        setSelectedProduct(product)
                        setShowFormModal(true)
                      }}
                      className="flex-1 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product)}
                      disabled={deleting === (product.id || product._id)}
                      className="flex-1 p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {deleting === (product.id || product._id) ? (
                        <Loader size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4 mt-6 flex items-center justify-between flex-wrap gap-4`}
              >
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Page {currentPage} of {totalPages} • Showing {paginatedProducts.length} of{' '}
                  {filteredProducts.length} products
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg border ${isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'bg-blue-600 text-white' : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg border ${isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Product Form Modal */}
        {showFormModal && (
          <ProductFormModal
            product={selectedProduct}
            categories={categories}
            onClose={() => {
              setShowFormModal(false)
              setSelectedProduct(null)
            }}
            onSave={handleSaveProduct}
            isDark={isDark}
          />
        )}
      </div>
    </div>
  )
}

export default ProductManagement
