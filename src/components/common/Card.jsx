const Card = ({ children, title, subtitle, className = '', headerAction }) => {
  return (
    <div className={`card-luxury ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="flex items-start justify-between mb-4 pb-4 border-b border-gold-800/20">
          <div>
            {title && <h3 className="text-xl font-luxury font-semibold text-gold-500">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;