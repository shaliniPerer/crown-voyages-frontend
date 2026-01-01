// Room Card Component
export const RoomCard = ({ room, onEdit, onDelete, onView }) => {
  return (
    <div className="card-luxury group hover:shadow-gold-lg transition-all duration-300">
      {/* Room Image */}
      <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-xl">
        <img
          src={room.images?.[0] || 'https://via.placeholder.com/400x300?text=Room'}
          alt={room.roomType}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
          <FiUsers className="w-4 h-4 text-gold-500" />
          <span className="text-sm font-semibold text-gold-500">{room.occupancy}</span>
        </div>
      </div>

      {/* Room Info */}
      <div>
        <h3 className="text-xl font-luxury font-semibold text-gold-500 mb-1">
          {room.roomType}
        </h3>
        <p className="text-gray-400 text-sm mb-3">{room.resort?.name}</p>
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {room.description}
        </p>

        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gold-800/20">
          <span className="text-gray-400 text-sm">Price per night</span>
          <span className="text-2xl font-bold text-gold-500">
            ${room.price}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {onView && (
            <Button variant="outline" size="small" onClick={() => onView(room)} className="flex-1">
              View
            </Button>
          )}
          {onEdit && (
            <Button variant="outline" size="small" onClick={() => onEdit(room)} className="flex-1">
              Edit
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="outline" 
              size="small" 
              onClick={() => onDelete(room._id)} 
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