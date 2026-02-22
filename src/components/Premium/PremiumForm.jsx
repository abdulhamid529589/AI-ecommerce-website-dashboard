import React, { useState } from 'react'
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import './PremiumForm.css'

/**
 * PREMIUM FORM COMPONENT
 * Beautiful form inputs with validation and error handling
 */

export const PremiumForm = ({ onSubmit, children, className = '' }) => {
  return (
    <form onSubmit={onSubmit} className={`premium-form ${className}`}>
      {children}
    </form>
  )
}

/**
 * Form Group Component
 */
export const FormGroup = ({
  label,
  error,
  success,
  required = false,
  children,
  className = '',
}) => {
  return (
    <div className={`form-group ${error ? 'error' : ''} ${success ? 'success' : ''} ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required-asterisk">*</span>}
        </label>
      )}
      {children}
      {error && (
        <div className="form-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="form-success">
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Input Component
 */
export const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  success,
  required = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  return (
    <FormGroup
      label={label}
      error={error}
      success={success}
      required={required}
      className={className}
    >
      <div className="input-wrapper">
        {Icon && <Icon className="input-icon" size={18} />}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`premium-input ${Icon ? 'with-icon' : ''}`}
          {...props}
        />
      </div>
    </FormGroup>
  )
}

/**
 * Password Input Component
 */
export const PasswordInput = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  success,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <FormGroup
      label={label}
      error={error}
      success={success}
      required={required}
      className={className}
    >
      <div className="input-wrapper">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="premium-input with-icon"
          {...props}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex="-1"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </FormGroup>
  )
}

/**
 * Textarea Component
 */
export const Textarea = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  success,
  required = false,
  disabled = false,
  rows = 4,
  className = '',
  ...props
}) => {
  return (
    <FormGroup
      label={label}
      error={error}
      success={success}
      required={required}
      className={className}
    >
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        className="premium-textarea"
        {...props}
      />
    </FormGroup>
  )
}

/**
 * Select Component
 */
export const Select = ({
  label,
  options = [],
  value,
  onChange,
  error,
  success,
  required = false,
  disabled = false,
  placeholder = 'Select an option',
  className = '',
  ...props
}) => {
  return (
    <FormGroup
      label={label}
      error={error}
      success={success}
      required={required}
      className={className}
    >
      <div className="input-wrapper">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="premium-select"
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </FormGroup>
  )
}

/**
 * Checkbox Component
 */
export const Checkbox = ({
  label,
  checked,
  onChange,
  disabled = false,
  error,
  className = '',
  ...props
}) => {
  return (
    <FormGroup error={error} className={className}>
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="checkbox-input"
          {...props}
        />
        <span className="checkbox-custom" />
        <span className="checkbox-text">{label}</span>
      </label>
    </FormGroup>
  )
}

/**
 * Radio Group Component
 */
export const RadioGroup = ({
  label,
  options = [],
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
}) => {
  return (
    <FormGroup label={label} error={error} required={required} className={className}>
      <div className="radio-group">
        {options.map((opt) => (
          <label key={opt.value} className="radio-label">
            <input
              type="radio"
              name={label}
              value={opt.value}
              checked={value === opt.value}
              onChange={onChange}
              disabled={disabled}
              className="radio-input"
            />
            <span className="radio-custom" />
            <span className="radio-text">{opt.label}</span>
          </label>
        ))}
      </div>
    </FormGroup>
  )
}

/**
 * Form Button Component
 */
export const FormButton = ({
  type = 'submit',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  className = '',
  ...props
}) => {
  const sizeClass = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  }[size]

  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success',
  }[variant]

  return (
    <button
      type={type}
      disabled={loading || disabled}
      className={`premium-button ${sizeClass} ${variantClass} ${className}`}
      {...props}
    >
      {loading && <span className="button-loader" />}
      {children}
    </button>
  )
}

export default PremiumForm
