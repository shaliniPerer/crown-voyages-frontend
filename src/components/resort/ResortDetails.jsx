// Resort Details Component
export const ResortDetails = ({ resort }) => {
  if (!resort) return null;

  return (
    <div className="space-y-6">
      {/* Main Image */}
      <div className="aspect-video rounded-xl overflow-hidden border border-gold-800/30">
        <img
          src={resort.images?.[0] || 'https://via.placeholder.com/800x450?text=Resort'}
          alt={resort.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Resort Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-luxury font-bold text-gold-500 mb-2">{resort.name}</h2>
          <div className="flex items-center gap-2 text-gray-400 mb-4">
            <FiMapPin className="w-5 h-5" />
            <span>{resort.location}</span>
          </div>
          <p className="text-gray-300">{resort.description}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-gray-400">Rating:</span>
            <div className="flex items-center gap-1">
              {[...Array(resort.starRating)].map((_, i) => (
                <FiStar key={i} className="w-5 h-5 text-gold-500 fill-gold-500" />
              ))}
            </div>
          </div>

          {resort.amenities?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {resort.amenities.map((amenity, index) => (
                  <span key={index} className="badge-gold">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gallery */}
      {resort.images?.length > 1 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Gallery</h3>
          <ResortGallery images={resort.images.slice(1)} />
        </div>
      )}
    </div>
  );
};
