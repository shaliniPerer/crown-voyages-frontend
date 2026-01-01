const Loader = ({ size = 'large' }) => {
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-10 h-10 border-3',
    large: 'w-16 h-16 border-4'
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-luxury-dark">
      <div className="relative">
        <div className={`${sizeClasses[size]} border-gold-600 border-t-transparent rounded-full animate-spin`}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${size === 'large' ? 'w-8 h-8' : size === 'medium' ? 'w-5 h-5' : 'w-3 h-3'} bg-gold-500 rounded-full opacity-20 animate-pulse`}></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;