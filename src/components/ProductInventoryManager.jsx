import React, { useState, useEffect } from 'react'
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  Download,
  Upload,
  Filter,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  TrendingUp,
} from 'lucide-react'
import api, { API_PREFIX } from '../lib/axios'

export default function ProductInventoryManager() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create') // create or edit
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    outOfStock: 0,
    totalValue: 0,
  })

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: [],
    featured: false,
    status: 'active',
  })
  const [csrfToken, setCsrfToken] = useState('')

  const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty']

  // Fetch products and CSRF token
  useEffect(() => {
    fetchProducts()
    fetchCSRFToken()
  }, [])

  const fetchCSRFToken = async () => {
    try {
      const response = await api.get('/csrf-token')
      if (response.data?.csrfToken) {
        setCsrfToken(response.data.csrfToken)
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await api.get('/product')
      if (res.data.success) {
        const productData = res.data.data?.products || []
        setProducts(productData)
        calculateStats(productData)
      } else {
        console.error('Failed to fetch products:', res.data.message)
        setError(res.data.message || 'Failed to load products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch products'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (productList) => {
    const totalProducts = productList.length
    const lowStockItems = productList.filter((p) => p.stock > 0 && p.stock < 10).length
    const outOfStock = productList.filter((p) => p.stock === 0).length
    const totalValue = productList.reduce((sum, p) => sum + p.price * p.stock, 0)

    setStats({
      totalProducts,
      lowStockItems,
      outOfStock,
      totalValue,
    })
  }

  // Filter products
  useEffect(() => {
    let filtered = products

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory)
    }

    // Stock filter
    if (stockFilter === 'low') {
      filtered = filtered.filter((p) => p.stock > 0 && p.stock < 10)
    } else if (stockFilter === 'out') {
      filtered = filtered.filter((p) => p.stock === 0)
    } else if (stockFilter === 'in-stock') {
      filtered = filtered.filter((p) => p.stock > 0)
    }

    setFilteredProducts(filtered)
  }, [searchQuery, selectedCategory, stockFilter, products])

  const handleEdit = (product) => {
    setSelectedProduct(product)
    setFormData(product)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleCreate = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      images: [],
      featured: false,
      status: 'active',
    })
    setModalMode('create')
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
      if (modalMode === 'create') {
        const response = await api.post('/product/admin/create', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-CSRF-Token': csrfToken,
            Authorization: token ? `Bearer ${token}` : '',
          },
        })
        if (!response.data.success) throw new Error(response.data.message)
      } else {
        const response = await api.put(`/product/admin/update/${selectedProduct.id}`, formData, {
          headers: {
            'X-CSRF-Token': csrfToken,
            Authorization: token ? `Bearer ${token}` : '',
          },
        })
        if (!response.data.success) throw new Error(response.data.message)
      }
      await fetchProducts()
      setShowModal(false)
      setError(null)
    } catch (error) {
      console.error('Error saving product:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Error saving product'
      setError(errorMsg)
      alert(errorMsg)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await api.delete(`/product/admin/delete/${id}`)
        if (!response.data.success) throw new Error(response.data.message)
        await fetchProducts()
        setError(null)
      } catch (error) {
        console.error('Error deleting product:', error)
        const errorMsg = error.response?.data?.message || error.message || 'Error deleting product'
        setError(errorMsg)
        alert(errorMsg)
      }
    }
  }

  const handleBulkImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formDataToSend = new FormData()
    formDataToSend.append('file', file)

    try {
      const response = await api.post('/product/import', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (!response.data.success) throw new Error(response.data.message)
      await fetchProducts()
      setError(null)
      alert('Products imported successfully')
    } catch (error) {
      console.error('Error importing products:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Error importing products'
      setError(errorMsg)
      alert(errorMsg)
    }
  }

  const handleExport = () => {
    const csv = [
      ['ID', 'Name', 'Category', 'Price', 'Stock', 'Status'],
      ...filteredProducts.map((p) => [p.id, p.name, p.category, p.price, p.stock, p.status]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'products.csv'
    a.click()
  }

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-500', icon: AlertCircle }
    if (stock < 10) return { label: 'Low Stock', color: 'bg-yellow-500', icon: TrendingUp }
    return { label: 'In Stock', color: 'bg-green-500', icon: CheckCircle }
  }

  return (
    <div className="space-y-6 p-6 bg-slate-900 min-h-screen text-white">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Product Inventory</h1>
          <p className="text-slate-400 mt-1">Manage all products and stock levels</p>
        </div>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition">
            <Upload size={18} />
            Import
            <input type="file" accept=".csv" onChange={handleBulkImport} className="hidden" />
          </label>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
          >
            <Download size={18} />
            Export
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Total Products</p>
          <p className="text-2xl font-bold mt-1">{stats.totalProducts}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Low Stock</p>
          <p className="text-2xl font-bold mt-1 text-yellow-500">{stats.lowStockItems}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Out of Stock</p>
          <p className="text-2xl font-bold mt-1 text-red-500">{stats.outOfStock}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Inventory Value</p>
          <p className="text-2xl font-bold mt-1 text-green-500">${stats.totalValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Stock Levels</option>
          <option value="in-stock">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-slate-400">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center">
            <Package size={40} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900">
                  <th className="px-6 py-3 text-left text-sm font-semibold">Product Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Stock</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => {
                  const stockStatus = getStockStatus(product.stock)
                  const StatusIcon = stockStatus.icon

                  return (
                    <tr
                      key={product.id}
                      className={index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-750 bg-opacity-50'}
                    >
                      <td className="px-6 py-4 text-sm">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{product.category}</td>
                      <td className="px-6 py-4 text-sm font-semibold">${product.price}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${stockStatus.color} bg-opacity-20`}
                        >
                          <StatusIcon size={14} />
                          {product.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            product.status === 'active'
                              ? 'bg-green-500 bg-opacity-20 text-green-300'
                              : 'bg-gray-500 bg-opacity-20 text-gray-300'
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 hover:bg-slate-700 rounded-lg transition text-blue-400"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 hover:bg-slate-700 rounded-lg transition text-red-400"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">
              {modalMode === 'create' ? 'Add New Product' : 'Edit Product'}
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />

              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Stock"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded"
                />
                <span>Mark as Featured</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  {modalMode === 'create' ? 'Create' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
