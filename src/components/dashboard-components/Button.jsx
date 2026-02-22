import React from 'react'

const Button = ({ children, className = '', variant = 'primary', ...props }) => {
  const base = 'inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium smooth'
  const variants = {
    primary: 'btn-primary',
    ghost: 'bg-transparent border border-transparent text-foreground',
    neutral: 'bg-card border border-default text-foreground',
  }
  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  )
}

export default Button
