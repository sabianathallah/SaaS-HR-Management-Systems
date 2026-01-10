export default function FormTextarea({ 
  label, 
  value, 
  onChange, 
  placeholder,
  required = false,
  disabled = false,
  error = null,
  helpText = null,
  name,
  rows = 3,
  maxLength,
  className = ''
}) {
  const textareaClasses = `w-full px-4 py-2 rounded-lg border-2 transition-all resize-vertical
    ${error 
      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
      : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
    }
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    focus:outline-none
    ${className}`

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-gray-700 font-semibold mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={textareaClasses}
      />
      
      {maxLength && (
        <div className="flex justify-between items-center mt-1">
          <div>
            {error && <p className="text-red-600 text-sm">⚠️ {error}</p>}
            {helpText && !error && <p className="text-gray-500 text-sm">{helpText}</p>}
          </div>
          <p className="text-gray-400 text-sm">
            {value?.length || 0} / {maxLength}
          </p>
        </div>
      )}
      
      {!maxLength && error && (
        <p className="text-red-600 text-sm mt-1">⚠️ {error}</p>
      )}
      
      {!maxLength && helpText && !error && (
        <p className="text-gray-500 text-sm mt-1">{helpText}</p>
      )}
    </div>
  )
}
