import React, { useState, useEffect } from 'react'
import {
  Save,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import api from '../lib/axios'
import { toast } from 'react-toastify'

const OrderingSystemSettings = () => {
  const [activeTab, setActiveTab] = useState('shipping')
  const [globalSettings, setGlobalSettings] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Shipping Settings
  const [shipping, setShipping] = useState({
    freeShippingEnabled: true,
    freeShippingThreshold: 5000,
    standardShippingCost: 100,
    expressShippingCost: 200,
    shippingZones: [
      { id: 1, name: 'Dhaka', cost: 50, deliveryDays: '1-2 days' },
      { id: 2, name: 'Other Cities', cost: 150, deliveryDays: '3-5 days' },
    ],
  })

  // Pricing Settings
  const [pricing, setPricing] = useState({
    currency: 'BDT',
    taxRate: 15,
    taxMode: 'inclusive',
  })

  // Inventory Settings
  const [inventory, setInventory] = useState({
    lowStockThreshold: 10,
    allowBackorders: true,
    backorderDays: 7,
    minOrderQuantity: 1,
    maxOrderQuantity: 100,
  })

  // Payment Methods
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'bkash', name: 'bKash', enabled: true },
    { id: 'nagad', name: 'Nagad', enabled: true },
    { id: 'rocket', name: 'Rocket', enabled: false },
    { id: 'cod', name: 'Cash on Delivery', enabled: true },
  ])

  // Return Settings
  const [returns, setReturns] = useState({
    returnEnabled: true,
    returnWindowDays: 30,
    refundProcessingDays: 5,
    restockingFee: 5,
  })

  // Promotions
  const [promotions, setPromotions] = useState([
    {
      id: 1,
      name: 'Flash Sale',
      type: 'percentage',
      value: 30,
      startDate: '2026-02-24',
      endDate: '2026-02-28',
      enabled: true,
    },
  ])

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const response = await api.get('/content/global')
      const data = response.data?.data || {}

      setGlobalSettings(data)

      // Load each section with defaults
      if (data.shipping) setShipping(data.shipping)
      if (data.pricing) setPricing(data.pricing)
      if (data.inventory) setInventory(data.inventory)
      if (data.paymentMethods) setPaymentMethods(data.paymentMethods)
      if (data.returns) setReturns(data.returns)
      if (data.promotions) setPromotions(data.promotions)
    } catch (error) {
      console.error('Failed to load settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const updatedSettings = {
        ...globalSettings,
        shipping,
        pricing,
        inventory,
        paymentMethods,
        returns,
        promotions,
      }

      await api.put('/content/global', updatedSettings)
      toast.success('Settings saved successfully!')
      setGlobalSettings(updatedSettings)
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6">Loading settings...</div>

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Tabs */}
      <div className="border-b flex overflow-x-auto">
        {[
          { id: 'shipping', label: '🚚 Shipping' },
          { id: 'pricing', label: '💰 Pricing' },
          { id: 'inventory', label: '📦 Inventory' },
          { id: 'payment', label: '💳 Payment' },
          { id: 'returns', label: '🔄 Returns' },
          { id: 'promotions', label: '🎁 Promotions' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* SHIPPING TAB */}
        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Shipping Settings</h2>

            {/* Free Shipping */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={shipping.freeShippingEnabled}
                  onChange={(e) =>
                    setShipping({ ...shipping, freeShippingEnabled: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <span className="font-semibold text-gray-900">Enable Free Shipping</span>
              </label>

              {shipping.freeShippingEnabled && (
                <div className="mt-4 ml-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Free Shipping Threshold (BDT):
                  </label>
                  <input
                    type="number"
                    value={shipping.freeShippingThreshold}
                    onChange={(e) =>
                      setShipping({
                        ...shipping,
                        freeShippingThreshold: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    ℹ️ Customers get free shipping on orders above ৳{shipping.freeShippingThreshold}
                  </p>
                </div>
              )}
            </div>

            {/* Standard Shipping */}
            <div className="border rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Standard Shipping Cost (BDT):
              </label>
              <input
                type="number"
                value={shipping.standardShippingCost}
                onChange={(e) =>
                  setShipping({ ...shipping, standardShippingCost: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Express Shipping */}
            <div className="border rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Express Shipping Cost (BDT):
              </label>
              <input
                type="number"
                value={shipping.expressShippingCost}
                onChange={(e) =>
                  setShipping({ ...shipping, expressShippingCost: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Shipping Zones */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Shipping Zones</h3>
              {shipping.shippingZones?.map((zone, idx) => (
                <div key={zone.id} className="mb-4 pb-4 border-b last:border-b-0">
                  <input
                    type="text"
                    placeholder="Zone name (e.g., Dhaka)"
                    value={zone.name}
                    onChange={(e) => {
                      const newZones = [...shipping.shippingZones]
                      newZones[idx].name = e.target.value
                      setShipping({ ...shipping, shippingZones: newZones })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Cost"
                      value={zone.cost}
                      onChange={(e) => {
                        const newZones = [...shipping.shippingZones]
                        newZones[idx].cost = parseInt(e.target.value)
                        setShipping({ ...shipping, shippingZones: newZones })
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Delivery (e.g., 1-2 days)"
                      value={zone.deliveryDays}
                      onChange={(e) => {
                        const newZones = [...shipping.shippingZones]
                        newZones[idx].deliveryDays = e.target.value
                        setShipping({ ...shipping, shippingZones: newZones })
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRICING TAB */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Pricing Settings</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency Code:
                </label>
                <input
                  type="text"
                  value={pricing.currency}
                  onChange={(e) => setPricing({ ...pricing, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="BDT"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Rate (%):
                </label>
                <input
                  type="number"
                  value={pricing.taxRate}
                  onChange={(e) => setPricing({ ...pricing, taxRate: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax Mode:</label>
              <select
                value={pricing.taxMode}
                onChange={(e) => setPricing({ ...pricing, taxMode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="inclusive">Inclusive (Price includes tax)</option>
                <option value="exclusive">Exclusive (Tax added to price)</option>
              </select>
            </div>
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Inventory Settings</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Low Stock Threshold (units):
              </label>
              <input
                type="number"
                value={inventory.lowStockThreshold}
                onChange={(e) =>
                  setInventory({ ...inventory, lowStockThreshold: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-sm text-gray-600 mt-2">
                Show "Low Stock" warning when quantity falls below this level
              </p>
            </div>

            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={inventory.allowBackorders}
                  onChange={(e) =>
                    setInventory({ ...inventory, allowBackorders: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <span className="font-semibold text-gray-900">Allow Backorders</span>
              </label>
            </div>

            {inventory.allowBackorders && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backorder Delivery Days:
                </label>
                <input
                  type="number"
                  value={inventory.backorderDays}
                  onChange={(e) =>
                    setInventory({ ...inventory, backorderDays: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Order Quantity:
                </label>
                <input
                  type="number"
                  value={inventory.minOrderQuantity}
                  onChange={(e) =>
                    setInventory({ ...inventory, minOrderQuantity: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Order Quantity:
                </label>
                <input
                  type="number"
                  value={inventory.maxOrderQuantity}
                  onChange={(e) =>
                    setInventory({ ...inventory, maxOrderQuantity: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* PAYMENT TAB */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Payment Methods</h2>

            {paymentMethods.map((method) => (
              <label key={method.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <input
                  type="checkbox"
                  checked={method.enabled}
                  onChange={(e) => {
                    setPaymentMethods(
                      paymentMethods.map((m) =>
                        m.id === method.id ? { ...m, enabled: e.target.checked } : m,
                      ),
                    )
                  }}
                  className="w-5 h-5"
                />
                <span className="font-semibold text-gray-900">{method.name}</span>
                <span
                  className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
                    method.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {method.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            ))}
          </div>
        )}

        {/* RETURNS TAB */}
        {activeTab === 'returns' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Return & Refund Settings</h2>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={returns.returnEnabled}
                onChange={(e) => setReturns({ ...returns, returnEnabled: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="font-semibold text-gray-900">Enable Returns</span>
            </label>

            {returns.returnEnabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Window (Days):
                  </label>
                  <input
                    type="number"
                    value={returns.returnWindowDays}
                    onChange={(e) =>
                      setReturns({ ...returns, returnWindowDays: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Processing (Days):
                  </label>
                  <input
                    type="number"
                    value={returns.refundProcessingDays}
                    onChange={(e) =>
                      setReturns({
                        ...returns,
                        refundProcessingDays: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restocking Fee (%):
                  </label>
                  <input
                    type="number"
                    value={returns.restockingFee}
                    onChange={(e) =>
                      setReturns({ ...returns, restockingFee: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    step="0.1"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* PROMOTIONS TAB */}
        {activeTab === 'promotions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Promotions & Discounts</h2>
              <button
                onClick={() => {
                  const newPromotion = {
                    id: Date.now(),
                    name: 'New Promotion',
                    type: 'percentage',
                    value: 10,
                    enabled: true,
                  }
                  setPromotions([...promotions, newPromotion])
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" /> Add Promotion
              </button>
            </div>

            {promotions.map((promo, idx) => (
              <div key={promo.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <input
                    type="text"
                    value={promo.name}
                    onChange={(e) => {
                      const newPromos = [...promotions]
                      newPromos[idx].name = e.target.value
                      setPromotions(newPromos)
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-semibold"
                  />
                  <button
                    onClick={() => setPromotions(promotions.filter((p) => p.id !== promo.id))}
                    className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <select
                    value={promo.type}
                    onChange={(e) => {
                      const newPromos = [...promotions]
                      newPromos[idx].type = e.target.value
                      setPromotions(newPromos)
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (BDT)</option>
                  </select>

                  <input
                    type="number"
                    value={promo.value}
                    onChange={(e) => {
                      const newPromos = [...promotions]
                      newPromos[idx].value = parseFloat(e.target.value)
                      setPromotions(newPromos)
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Value"
                  />

                  <label className="flex items-center gap-2 p-2 border rounded-lg">
                    <input
                      type="checkbox"
                      checked={promo.enabled}
                      onChange={(e) => {
                        const newPromos = [...promotions]
                        newPromos[idx].enabled = e.target.checked
                        setPromotions(newPromos)
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Active</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="border-t p-6 bg-gray-50 flex gap-3">
        <button
          onClick={saveSettings}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-white ${
            saving
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
          } transition`}
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  )
}

export default OrderingSystemSettings
