import React from 'react'

const AdminTopbar = () => {
  return (
    <header className="bg-background border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button className="md:hidden px-2 py-1 border rounded">Menu</button>
        <div>
          <h2 className="text-lg font-semibold">Overview</h2>
          <p className="text-xs text-muted-foreground">Live insights and activity</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <input
          className="hidden sm:block px-3 py-2 rounded border bg-white dark:bg-gray-800 text-sm"
          placeholder="Search..."
        />
        <div className="text-sm text-muted-foreground">Admin User</div>
      </div>
    </header>
  )
}

export default AdminTopbar
