// Resort Gallery Component
export const ResortGallery = ({ images = [] }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {images.length > 0 ? (
        images.map((image, index) => (
          <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gold-800/30 group cursor-pointer">
            <img
              src={image}
              alt={`Gallery ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        ))
      ) : (
        <div className="col-span-full flex items-center justify-center py-12 border-2 border-dashed border-gold-800/30 rounded-lg">
          <div className="text-center">
            <FiImage className="w-12 h-12 mx-auto text-gray-600 mb-2" />
            <p className="text-gray-400">No images available</p>
          </div>
        </div>
      )}
    </div>
  );
};