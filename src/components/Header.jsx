import React from 'react'
import { Menu } from 'lucide-react'
import avatar from '../assets/avatar.jpg'
import Button from './dashboard-components/Button'

const Header = ({ title = 'Admin' }) => {
  return (
    <header className="w-full flex items-center justify-between p-4 bg-background border-b border-default sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 rounded bg-card card-shadow">
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          <p className="text-xs text-muted-foreground">Control center</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" className="hidden sm:inline-flex">
          Quick Search
        </Button>
        <img src={avatar} alt="admin avatar" className="w-8 h-8 rounded-full" />
      </div>
    </header>
  )
}

export default Header
