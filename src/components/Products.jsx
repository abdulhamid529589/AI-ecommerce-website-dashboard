import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { LoaderCircle, Plus, Edit2, Trash2, Eye } from 'lucide-react'
import api from '../lib/axios'
import { toast } from 'react-toastify'
// CreateProductModal removed: using EnhancedProductModal for both create and edit
import EnhancedProductModal from '../modals/EnhancedProductModal'
import ViewProductModal from '../modals/ViewProductModal'
import Header from './Header'
import Button from './dashboard-components/Button'
import { getProductImageUrl } from '../utils/imageParser'
import { getOperationErrorMessage } from '../utils/errorHandler'
import './Products.css'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalProducts, setTotalProducts] = useState(0)

  const initialPage = parseInt(new URLSearchParams(window.location.search).get('page')) || 1
  const [currentPage, setCurrentPage] = useState(initialPage)
  const initialLimit =
    parseInt(new URLSearchParams(window.location.search).get('limit')) ||
    parseInt(localStorage.getItem('dashboardItemsPerPage')) ||
    10
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit)

  const [selectedIds, setSelectedIds] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const defaultColumns = {
    image: true,
    name: true,
    sku: true,
    category: true,
    price: true,
    stock: true,
    status: true,
    sales: true,
    rating: true,
    actions: true,
  }
  const [visibleColumns, setVisibleColumns] = useState(() => {
    try {
      const saved = localStorage.getItem('dashboardVisibleColumns')
      return saved ? JSON.parse(saved) : defaultColumns
    } catch (e) {
      return defaultColumns
    }
  })

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState({
    categories: [],
    priceMin: null,
    priceMax: null,
    stockStatus: null,
    status: null,
    dateFrom: null,
    dateTo: null,
    salesMin: null,
    ratingMin: null,
    tags: [],
    hasVariants: null,
  })

  const safeItemsPerPage = Number(itemsPerPage) || 10
  const totalPages = Math.max(1, Math.ceil((Number(totalProducts) || 0) / safeItemsPerPage))
  const startIndex = (currentPage - 1) * safeItemsPerPage

  const fetchProducts = useCallback(
    async (page = currentPage, limit = itemsPerPage, appliedFilters = filters) => {
      try {
        setLoading(true)
        const params = { page, limit }
        if (appliedFilters.categories?.length) params.category = appliedFilters.categories.join(',')
        if (appliedFilters.priceMin != null) params.priceMin = appliedFilters.priceMin
        if (appliedFilters.priceMax != null) params.priceMax = appliedFilters.priceMax
        if (appliedFilters.stockStatus) params.stockStatus = appliedFilters.stockStatus
        if (appliedFilters.status) params.status = appliedFilters.status
        if (appliedFilters.dateFrom) params.dateFrom = appliedFilters.dateFrom
        if (appliedFilters.dateTo) params.dateTo = appliedFilters.dateTo
        if (appliedFilters.salesMin != null) params.salesMin = appliedFilters.salesMin
        if (appliedFilters.ratingMin != null) params.ratingMin = appliedFilters.ratingMin

        // 🔒 Use configured axios instance with CSRF token support
        const res = await api.get('/product', { params })
        const data = res.data || {}
        setProducts(data.products || [])
        setTotalProducts(data.totalProducts ?? data.products?.length ?? 0)
      } catch (err) {
        console.error(err)
        toast.error(getOperationErrorMessage('fetchData', err))
      } finally {
        setLoading(false)
      }
    },
    [currentPage, itemsPerPage, filters],
  )

  useEffect(() => {
    fetchProducts(currentPage, itemsPerPage, filters)
  }, [fetchProducts, currentPage, itemsPerPage, filters])

  const goToPage = (p) => {
    const page = Math.max(1, Math.min(Number(p) || 1, totalPages || 1))
    setCurrentPage(page)
    const params = new URLSearchParams(window.location.search)
    if (page === 1) params.delete('page')
    else params.set('page', page)
    if (Number(itemsPerPage) && Number(itemsPerPage) !== 10) params.set('limit', itemsPerPage)
    else params.delete('limit')
    const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '')
    window.history.replaceState({}, '', newUrl)
  }

  const toggleSelectAll = () => {
    const ids = products.map((p) => p.id || p._id)
    if (selectedIds.length === ids.length) setSelectedIds([])
    else setSelectedIds(ids)
  }
  const toggleSelect = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const toggleColumn = (col) => {
    const next = { ...visibleColumns, [col]: !visibleColumns[col] }
    setVisibleColumns(next)
    try {
      localStorage.setItem('dashboardVisibleColumns', JSON.stringify(next))
    } catch (e) {}
  }

  const updateQuick = async (id, patch) => {
    try {
      setProducts((prev) => prev.map((p) => (p.id === id || p._id === id ? { ...p, ...patch } : p)))
      // 🔒 Use configured axios instance with CSRF token support
      // FIX: Use PUT instead of PATCH, and correct admin path
      await api.put(`/product/admin/update/${id}`, patch)
      toast.success('Updated')
      fetchProducts(currentPage, itemsPerPage, filters)
    } catch (err) {
      toast.error('Update failed')
      fetchProducts(currentPage, itemsPerPage, filters)
    }
  }

  const bulkDelete = async () => {
    if (!selectedIds.length) return toast.info('No products selected')
    if (!window.confirm('Delete selected products?')) return
    try {
      // FIX: Server doesn't have bulk-delete endpoint, so delete one by one
      let successCount = 0
      for (const id of selectedIds) {
        try {
          // 🔒 Use configured axios instance with CSRF token support
          await api.delete(`/product/admin/delete/${id}`)
          successCount++
        } catch (e) {
          console.error(`Failed to delete product ${id}`)
        }
      }

      if (successCount === selectedIds.length) {
        toast.success(`Deleted ${successCount} products`)
      } else {
        toast.warning(`Deleted ${successCount}/${selectedIds.length} products`)
      }

      setSelectedIds([])
      fetchProducts(currentPage, itemsPerPage, filters)
    } catch (err) {
      toast.error('Bulk delete failed')
    }
  }

  const handleExportCSV = (rows = null) => {
    const data = (rows || products).map((p) => ({
      id: p.id || p._id,
      name: p.name,
      sku: p.sku || '',
      category: p.category || '',
      price: p.price ?? '',
      stock: p.stock ?? '',
      status: p.status || '',
    }))
    if (!data.length) return toast.info('No products to export')
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map((r) =>
        Object.values(r)
          .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
          .join(','),
      ),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `products_export_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const displayedProducts = useMemo(() => products, [products])

  return (
    <div className="products-container">
      <Header title="Products Management" />

      <div className="products-content grid grid-cols-1 md:grid-cols-4 gap-4">
        <aside
          className={`filters-panel md:col-span-1 p-4 border rounded ${filtersOpen ? '' : 'hidden md:block'}`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Filters</h3>
            <button onClick={() => setFiltersOpen((s) => !s)} className="text-sm">
              {filtersOpen ? 'Close' : 'Open'}
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Category (comma separated)</label>
              <input
                value={filters.categories.join(',')}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    categories: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
                className="w-full px-2 py-1 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Price Min</label>
              <input
                type="number"
                value={filters.priceMin ?? ''}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    priceMin: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className="w-full px-2 py-1 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Price Max</label>
              <input
                type="number"
                value={filters.priceMax ?? ''}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    priceMax: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className="w-full px-2 py-1 border rounded"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setFilters({})
                }}
                className="px-3 py-1 border rounded"
              >
                Clear
              </button>
              <button
                onClick={() => fetchProducts(1, itemsPerPage, filters)}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Apply
              </button>
            </div>
          </div>
        </aside>

        <main className="md:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4" /> Create
              </Button>
              <div className="flex items-center gap-2">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value))
                    localStorage.setItem('dashboardItemsPerPage', String(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="px-2 py-1 border rounded"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <button
                  onClick={() =>
                    handleExportCSV(
                      selectedIds.length
                        ? products.filter((p) => selectedIds.includes(p.id || p._id))
                        : products,
                    )
                  }
                  className="px-3 py-1 border rounded"
                >
                  Export CSV
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  className="px-3 py-1 border rounded"
                  onClick={() => {
                    const next = !visibleColumns.actions
                    toggleColumn('actions')
                  }}
                >
                  Columns
                </button>
              </div>
              <button
                onClick={() => setFiltersOpen((s) => !s)}
                className="px-3 py-1 border rounded"
              >
                Filters
              </button>
            </div>
          </div>

          <div className="overflow-x-auto bg-card border rounded">
            <table className="min-w-full table-auto">
              <thead className="sticky top-0 bg-white">
                <tr>
                  <th className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === products.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  {visibleColumns.image && <th className="px-3 py-2">Image</th>}
                  {visibleColumns.name && <th className="px-3 py-2">Product Name</th>}
                  {visibleColumns.sku && <th className="px-3 py-2">SKU</th>}
                  {visibleColumns.category && <th className="px-3 py-2">Category</th>}
                  {visibleColumns.price && <th className="px-3 py-2">Price</th>}
                  {visibleColumns.stock && <th className="px-3 py-2">Stock</th>}
                  {visibleColumns.status && <th className="px-3 py-2">Status</th>}
                  {visibleColumns.sales && <th className="px-3 py-2">Sales</th>}
                  {visibleColumns.rating && <th className="px-3 py-2">Rating</th>}
                  {visibleColumns.actions && <th className="px-3 py-2">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={12} className="p-4 text-center">
                      Loading... <LoaderCircle className="inline-block ml-2" />
                    </td>
                  </tr>
                ) : displayedProducts.length ? (
                  displayedProducts.map((p) => {
                    const id = p.id || p._id
                    return (
                      <tr key={id} className="border-t">
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(id)}
                            onChange={() => toggleSelect(id)}
                          />
                        </td>
                        {visibleColumns.image && (
                          <td className="px-3 py-2">
                            <img
                              src={getProductImageUrl(p)}
                              alt={p.name || 'product'}
                              className="w-12 h-12 object-cover rounded"
                            />
                          </td>
                        )}
                        {visibleColumns.name && <td className="px-3 py-2">{p.name}</td>}
                        {visibleColumns.sku && <td className="px-3 py-2">{p.sku}</td>}
                        {visibleColumns.category && <td className="px-3 py-2">{p.category}</td>}
                        {visibleColumns.price && (
                          <td className="px-3 py-2">
                            <input
                              defaultValue={p.price}
                              onBlur={(e) => updateQuick(id, { price: Number(e.target.value) })}
                              className="w-20 px-1 py-0.5 border rounded bg-card text-white border-gray-700"
                            />
                          </td>
                        )}
                        {visibleColumns.stock && (
                          <td className="px-3 py-2">
                            <input
                              defaultValue={p.stock}
                              onBlur={(e) => updateQuick(id, { stock: Number(e.target.value) })}
                              className="w-16 px-1 py-0.5 border rounded bg-card text-white border-gray-700"
                            />
                          </td>
                        )}
                        {visibleColumns.status && (
                          <td className="px-3 py-2">
                            <select
                              defaultValue={p.status}
                              onChange={(e) => updateQuick(id, { status: e.target.value })}
                              className="px-1 py-0.5 border rounded"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="draft">Draft</option>
                            </select>
                          </td>
                        )}
                        {visibleColumns.sales && <td className="px-3 py-2">{p.sales ?? 0}</td>}
                        {visibleColumns.rating && <td className="px-3 py-2">{p.rating ?? '-'}</td>}
                        {visibleColumns.actions && (
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedProduct(p)
                                  setShowViewModal(true)
                                }}
                                className="p-1 rounded hover:bg-gray-100"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedProduct(p)
                                  setShowUpdateModal(true)
                                }}
                                className="p-1 rounded hover:bg-gray-100"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Delete product?')) fetchProducts()
                                }}
                                className="p-1 rounded text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={12} className="p-6 text-center text-gray-500">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              Showing {startIndex + 1} -{' '}
              {Math.min(
                startIndex + safeItemsPerPage,
                Number(totalProducts) || displayedProducts.length,
              )}{' '}
              of {totalProducts || displayedProducts.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-1 border rounded"
              >
                Prev
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i + 1)}
                    className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-gray-200' : ''}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 border rounded"
              >
                Next
              </button>
            </div>
          </div>
        </main>
      </div>

      {showCreateModal && (
        <EnhancedProductModal
          isNew={true}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchProducts()
          }}
        />
      )}
      {showUpdateModal && selectedProduct && (
        <EnhancedProductModal
          isNew={false}
          product={selectedProduct}
          onClose={() => {
            setShowUpdateModal(false)
            fetchProducts()
          }}
          onSuccess={() => {
            setShowUpdateModal(false)
            fetchProducts()
          }}
        />
      )}
      {showViewModal && selectedProduct && (
        <ViewProductModal product={selectedProduct} onClose={() => setShowViewModal(false)} />
      )}
    </div>
  )
}
