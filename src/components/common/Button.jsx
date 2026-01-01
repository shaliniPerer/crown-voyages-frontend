import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  onClick, 
  disabled = false, 
  type = 'button',
  className = '',
  icon: Icon,
  loading = false,
  fullWidth = false
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-to-r from-gold-600 to-gold-500 text-black hover:from-gold-500 hover:to-gold-400 shadow-gold hover:shadow-gold-lg',
    outline: 'border-2 border-gold-600 text-gold-600 hover:bg-gold-600 hover:text-black',
    secondary: 'bg-luxury-lighter text-gray-100 hover:bg-luxury-light border border-gold-800/30 hover:border-gold-600',
    danger: 'bg-red-600 text-white hover:bg-red-700 border-2 border-red-600',
    success: 'bg-green-600 text-white hover:bg-green-700',
    ghost: 'text-gray-400 hover:text-gold-500 hover:bg-luxury-lighter',
  };
  
  const sizes = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-2.5 text-base',
    large: 'px-8 py-3 text-lg',
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-5 h-5" />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;