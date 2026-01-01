import { FiStar, FiMapPin, FiUsers, FiImage } from 'react-icons/fi';
import Button from '../common/Button';

// Resort Card Component
export const ResortCard = ({ resort, onEdit, onDelete, onView }) => {
  return (
    <div className="card-luxury group hover:shadow-gold-lg transition-all duration-300">
      {/* Resort Image */}
      <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-xl">
        <img
          src={resort.images?.[0] || 'https://via.placeholder.com/400x300?text=Resort'}
          alt={resort.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
          <FiStar className="w-4 h-4 text-gold-500 fill-gold-500" />
          <span className="text-sm font-semibold text-gold-500">{resort.starRating}</span>
        </div>
      </div>

      {/* Resort Info */}
      <div>
        <h3 className="text-xl font-luxury font-semibold text-gold-500 mb-2">
          {resort.name}
        </h3>
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
          <FiMapPin className="w-4 h-4" />
          <span>{resort.location}</span>
        </div>
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {resort.description}
        </p>

        {/* Amenities */}
        {resort.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {resort.amenities.slice(0, 3).map((amenity, index) => (
              <span key={index} className="badge-gold text-xs">
                {amenity}
              </span>
            ))}
            {resort.amenities.length > 3 && (
              <span className="badge-gold text-xs">
                +{resort.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gold-800/20">
          {onView && (
            <Button variant="outline" size="small" onClick={() => onView(resort)} className="flex-1">
              View
            </Button>
          )}
          {onEdit && (
            <Button variant="outline" size="small" onClick={() => onEdit(resort)} className="flex-1">
              Edit
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="outline" 
              size="small" 
              onClick={() => onDelete(resort._id)} 
              className="flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};