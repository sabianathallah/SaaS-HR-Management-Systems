export default function Button({ 
  nameProp, 
  type = "submit", 
  onClick, 
  disabled = false,
  variant = "primary",
  fullWidth = true,
  className = ""
}) {
  
  // Base styles yang selalu ada
  let buttonClasses = "mt-5 py-3 px-6 rounded-lg font-bold transition-all duration-200 shadow-lg ";
  
  // Tambahkan variant styles
  if (variant === "primary") {
    buttonClasses += "bg-gray-700 text-white hover:bg-gray-800 border-2 border-gray-800 ";
  } else if (variant === "secondary") {
    buttonClasses += "border-2 border-gray-500 text-gray-700 hover:bg-gray-500 hover:text-white bg-white ";
  } else if (variant === "danger") {
    buttonClasses += "border-2 border-red-400 text-red-600 hover:bg-red-500 hover:text-white bg-white ";
  } else if (variant === "dark") {
    buttonClasses += "border-2 border-black text-white bg-gray-800 hover:bg-black shadow-[2px_2px_0px_rgba(0,0,0,1)] ";
  }
  
  // Tambahkan width
  if (fullWidth) {
    buttonClasses += "w-full ";
  } else {
    buttonClasses += "inline-block ";
  }
  
  // Tambahkan disabled styles
  if (disabled) {
    buttonClasses += "opacity-50 cursor-not-allowed ";
  }
  
  // Tambahkan custom className
  if (className) {
    buttonClasses += className;
  }
  
  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
    >
      {nameProp}
    </button>
  )
}
