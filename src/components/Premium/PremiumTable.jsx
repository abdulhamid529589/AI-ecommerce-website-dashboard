import React, { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import './PremiumTable.css'

/**
 * PREMIUM TABLE COMPONENT
 * Sortable, filterable, paginated with premium styling
 */

export const PremiumTable = ({
  columns = [],
  data = [],
  title,
  searchable = true,
  sortable = true,
  paginated = true,
  pageSize = 10,
  onRowClick,
  rowActions,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchTerm) return data
    return data.filter((row) =>
      columns.some((col) => String(row[col.key]).toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [data, searchTerm, columns])

  // Sort data
  const sortedData = useMemo(() => {
    let sorted = [...filteredData]
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aVal = a[sortConfig.key]
        const bVal = b[sortConfig.key]

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return sorted
  }, [filteredData, sortConfig])

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!paginated) return sortedData
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, currentPage, pageSize, paginated])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  const handleSort = (key) => {
    if (!sortable) return
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return null
    return sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
  }

  console.log(
    '📊 PremiumTable rendered with data:',
    data.length,
    'items, hasActions:',
    !!rowActions,
  )

  return (
    <div className="premium-table-wrapper">
      {/* Header */}
      <div className="table-header">
        <div>
          {title && <h2 className="table-title">{title}</h2>}
          <p className="table-subtitle">{sortedData.length} records</p>
        </div>
        {searchable && (
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="search-input"
            />
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="table-container">
        <table className="premium-table">
          {/* Table Head */}
          <thead>
            <tr className="table-header-row">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`table-header-cell ${col.width ? `w-${col.width}` : ''} ${
                    sortable ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => handleSort(col.key)}
                >
                  <div className="header-cell-content">
                    <span>{col.label}</span>
                    {sortable && <div className="sort-icon">{getSortIcon(col.key)}</div>}
                  </div>
                </th>
              ))}
              {rowActions && <th className="table-header-cell actions-column">Actions</th>}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr
                  key={idx}
                  className="table-row hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="table-cell" data-label={col.label}>
                      {col.render ? (
                        col.render(row[col.key], row)
                      ) : (
                        <span>{formatCell(row[col.key])}</span>
                      )}
                    </td>
                  ))}
                  {rowActions && (
                    <td className="table-cell actions-cell">
                      <div className="action-buttons">
                        {rowActions.map((action) => (
                          <button
                            key={action.key}
                            className={`action-btn action-btn-${action.variant || 'primary'}`}
                            onClick={(e) => {
                              console.log('🔘 Button clicked:', action.key, 'for row:', row)
                              e.stopPropagation()
                              action.onClick?.(row)
                            }}
                            title={action.label}
                          >
                            {action.icon && <action.icon size={16} />}
                            {action.label && <span>{action.label}</span>}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (rowActions ? 1 : 0)}
                  className="table-cell text-center py-8"
                >
                  <p className="text-gray-500 dark:text-gray-400">No data found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="table-pagination">
          <div className="pagination-info">
            Page {currentPage} of {totalPages} • {sortedData.length} total records
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={18} />
            </button>

            {/* Page Numbers */}
            <div className="page-numbers">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Format cell data for display
 */
const formatCell = (value) => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return value.toLocaleString()
  return String(value)
}

export default PremiumTable
