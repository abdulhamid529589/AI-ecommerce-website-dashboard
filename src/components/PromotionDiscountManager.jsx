import React, { useState, useEffect } from 'react'
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Search,
  Copy,
  Calendar,
  TrendingUp,
  Percent,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import api, { API_PREFIX } from '../lib/axios'

export default function PromotionDiscountManager() {
  const [promotions, setPromotions] = useState([])
  const [filteredPromotions, setFilteredPromotions] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [selectedPromotion, setSelectedPromotion] = useState(null)
  const [stats, setStats] = useState({
    activePromotions: 0,
    totalDiscountValue: 0,
    applicationsCount: 0,
  })

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage', // percentage or fixed
    value: '',
    minOrderValue: '',
    maxUses: '',
    usedCount: 0,
    expiryDate: '',
    description: '',
    applicableProducts: [],
    applicableCategories: [],
    isActive: true,
  })

  // Fetch promotions
  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      const res = await api.get('/admin/promotions')
      const promotionsList = (res.data.promotions || []).map((promo) => ({
        id: promo.id,
        code: promo.code,
        type: promo.type,
        value: parseFloat(promo.value),
        minOrderValue: promo.min_order_value ? parseFloat(promo.min_order_value) : 0,
        maxUses: promo.max_uses,
        usedCount: promo.used_count || 0,
        expiryDate: promo.expiry_date
          ? new Date(promo.expiry_date).toISOString().split('T')[0]
          : null,
        description: promo.description || '',
        isActive: promo.is_active,
        createdAt: new Date(promo.created_at).toISOString().split('T')[0],
        isExpired: promo.expiry_date && new Date(promo.expiry_date) < new Date(),
      }))
      setPromotions(promotionsList)
      calculateStats(promotionsList)
    } catch (error) {
      console.error('Error fetching promotions:', error)
      setPromotions([])
    }
  }

  const calculateStats = (promotionList) => {
    const activePromotions = promotionList.filter((p) => p.isActive && !p.isExpired).length
    const totalDiscountValue = promotionList.reduce(
      (sum, p) => sum + (p.type === 'percentage' ? p.value : p.value),
      0,
    )

    setStats({
      activePromotions,
      totalDiscountValue,
      applicationsCount: promotionList.reduce((sum, p) => sum + p.usedCount, 0),
    })
  }

  // Filter promotions
  useEffect(() => {
    let filtered = promotions

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (statusFilter === 'active') {
      filtered = filtered.filter((p) => p.isActive && new Date(p.expiryDate) > new Date())
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((p) => !p.isActive || new Date(p.expiryDate) <= new Date())
    } else if (statusFilter === 'expired') {
      filtered = filtered.filter((p) => new Date(p.expiryDate) <= new Date())
    }

    setFilteredPromotions(filtered)
  }, [searchQuery, statusFilter, promotions])

  const handleEdit = (promotion) => {
    setSelectedPromotion(promotion)
    setFormData(promotion)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleCreate = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      minOrderValue: '',
      maxUses: '',
      usedCount: 0,
      expiryDate: '',
      description: '',
      applicableProducts: [],
      applicableCategories: [],
      isActive: true,
    })
    setModalMode('create')
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      if (!formData.code || formData.value === '' || !formData.expiryDate) {
        alert('Please fill in all required fields')
        return
      }

      if (formData.type === 'percentage' && (formData.value < 0 || formData.value > 100)) {
        alert('Percentage must be between 0 and 100')
        return
      }

      if (modalMode === 'create') {
        const res = await api.post('/admin/promotions', {
          code: formData.code,
          type: formData.type,
          value: formData.value,
          minOrderValue: formData.minOrderValue,
          maxUses: formData.maxUses,
          expiryDate: formData.expiryDate,
          description: formData.description,
          isActive: formData.isActive,
        })
        alert('Promotion created successfully!')
        setFormData({
          code: '',
          type: 'percentage',
          value: '',
          minOrderValue: '',
          maxUses: '',
          expiryDate: '',
          description: '',
          isActive: true,
        })
      } else {
        await api.put(`/admin/promotions/${selectedPromotion.id}`, {
          code: formData.code,
          type: formData.type,
          value: formData.value,
          minOrderValue: formData.minOrderValue,
          maxUses: formData.maxUses,
          expiryDate: formData.expiryDate,
          description: formData.description,
          isActive: formData.isActive,
        })
        alert('Promotion updated successfully!')
      }

      fetchPromotions()
      setShowModal(false)
    } catch (error) {
      console.error('Error saving promotion:', error)
      alert(error.response?.data?.message || 'Error saving promotion')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      try {
        await api.delete(`/admin/promotions/${id}`)
        alert('Promotion deleted successfully!')
        fetchPromotions()
      } catch (error) {
        console.error('Error deleting promotion:', error)
        alert(error.response?.data?.message || 'Error deleting promotion')
      }
    }
  }

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    alert('Code copied to clipboard!')
  }

  const isPromotionValid = (promotion) => {
    return (
      promotion.isActive &&
      (!promotion.expiryDate || new Date(promotion.expiryDate) > new Date()) &&
      (!promotion.maxUses || promotion.usedCount < promotion.maxUses)
    )
  }

  const getPromotionStatus = (promotion) => {
    if (!promotion.isActive) {
      return { label: 'Inactive', color: 'bg-gray-500', icon: AlertCircle }
    }
    if (promotion.expiryDate && new Date(promotion.expiryDate) <= new Date()) {
      return { label: 'Expired', color: 'bg-red-500', icon: AlertCircle }
    }
    if (promotion.maxUses && promotion.usedCount >= promotion.maxUses) {
      return { label: 'Limit Reached', color: 'bg-yellow-500', icon: AlertCircle }
    }
    return { label: 'Active', color: 'bg-green-500', icon: CheckCircle }
  }

  return (
    <div className="space-y-6 p-6 bg-slate-900 min-h-screen text-white">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Promotions & Discounts</h1>
          <p className="text-slate-400 mt-1">Create and manage promotional codes and discounts</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
        >
          <Plus size={18} />
          New Promotion
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Active Promotions</p>
          <p className="text-2xl font-bold mt-1 text-green-500">{stats.activePromotions}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Total Discount Value</p>
          <p className="text-2xl font-bold mt-1 text-blue-500">
            {stats.totalDiscountValue > 100
              ? `${stats.totalDiscountValue}%`
              : `$${stats.totalDiscountValue}`}
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Applications</p>
          <p className="text-2xl font-bold mt-1 text-purple-500">{stats.applicationsCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search promotions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Promotions</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Promotions Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        {filteredPromotions.length === 0 ? (
          <div className="p-8 text-center">
            <Tag size={40} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">No promotions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900">
                  <th className="px-6 py-3 text-left text-sm font-semibold">Code</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Value</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Min Order</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Uses</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Expiry</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPromotions.map((promotion, index) => {
                  const status = getPromotionStatus(promotion)
                  const StatusIcon = status.icon

                  return (
                    <tr
                      key={promotion.id}
                      className={index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-750 bg-opacity-50'}
                    >
                      <td className="px-6 py-4 text-sm font-semibold">{promotion.code}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="flex items-center gap-2">
                          {promotion.type === 'percentage' ? (
                            <>
                              <Percent size={14} />
                              Percentage
                            </>
                          ) : (
                            <>
                              <DollarSign size={14} />
                              Fixed
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-400">
                        {promotion.type === 'percentage'
                          ? `${promotion.value}%`
                          : `$${promotion.value}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        ${promotion.minOrderValue}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="text-slate-400">
                          {promotion.usedCount} / {promotion.maxUses}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(promotion.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${status.color} bg-opacity-20`}
                        >
                          <StatusIcon size={14} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleCopyCode(promotion.code)}
                            className="p-2 hover:bg-slate-700 rounded-lg transition text-cyan-400"
                            title="Copy Code"
                          >
                            <Copy size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(promotion)}
                            className="p-2 hover:bg-slate-700 rounded-lg transition text-blue-400"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(promotion.id)}
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
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full border border-slate-700 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {modalMode === 'create' ? 'Create Promotion' : 'Edit Promotion'}
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Promo Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>

              <input
                type="number"
                placeholder={formData.type === 'percentage' ? 'Discount %' : 'Discount $'}
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="number"
                placeholder="Min Order Value ($)"
                value={formData.minOrderValue}
                onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="number"
                placeholder="Max Uses"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <span>Active</span>
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
