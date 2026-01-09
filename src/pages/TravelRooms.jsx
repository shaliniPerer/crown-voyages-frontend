import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resortApi } from '../api/resortApi';
import { roomApi } from '../api/roomApi';
import { ArrowLeft, MapPin, Star, Users, Bed, Maximize, Home } from 'lucide-react';

const TravelRooms = () => {
  const { resortId } = useParams();
  const navigate = useNavigate();
  const [resort, setResort] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [activeTab, setActiveTab] = useState('rooms');

  useEffect(() => {
    fetchData();
  }, [resortId]);

  const fetchData = async () => {
    try {
      const [resortRes, roomsRes] = await Promise.all([
        resortApi.getResortById(resortId),
        roomApi.getRooms()
      ]);
      setResort(resortRes.data?.data);
      const resortRooms = roomsRes.data?.data?.filter(room => room.resort._id === resortId) || [];
      setRooms(resortRooms);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  if (!resort) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto p-6">
        <button
          onClick={() => navigate(`/travel/overview/${resortId}`)}
          className="text-sm text-gray-500 hover:text-gold-600"
        >
          ← Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Resort Header - Centered */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {resort.name}
          </h1>
          <div className="flex items-center justify-center gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
              <span className="text-sm md:text-base">{resort.location}</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(resort.starRating || 5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-1 text-sm md:text-base">{resort.starRating} Star Hotel</span>
            </div>
          </div>
        </div>

        {/* Images as Cards - Centered */}
        {resort.images && resort.images.length > 0 && (
          <div className="flex justify-center mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-5xl w-full">
              {resort.images.slice(0, 2).map((image, index) => (
                <div key={index} className="bg-white rounded-xl overflow-hidden shadow-lg border-2 border-yellow-500/30">
                  <img
                    src={image}
                    alt={`${resort.name} - Image ${index + 1}`}
                    className="w-full h-64 md:h-72 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 overflow-x-auto mb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-center gap-4 md:gap-8">
            <button
              onClick={() => navigate(`/travel/overview/${resortId}`)}
              className="px-3 md:px-4 py-3 md:py-4 font-medium text-gray-600 hover:text-gray-800 transition-all border-b-2 border-transparent hover:border-gray-300 text-sm md:text-base"
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`px-3 md:px-4 py-3 md:py-4 font-medium transition-all border-b-2 text-sm md:text-base ${
                activeTab === 'rooms'
                  ? 'text-yellow-600 border-yellow-600'
                  : 'text-gray-600 hover:text-gray-800 border-transparent'
              }`}
            >
              Rooms
            </button>
            <button
              onClick={() => navigate(`/travel/overview/${resortId}`)}
              className="px-3 md:px-4 py-3 md:py-4 font-medium text-gray-600 hover:text-gray-800 transition-all border-b-2 border-transparent hover:border-gray-300 text-sm md:text-base"
            >
              Dining
            </button>
            <button
              onClick={() => navigate(`/travel/gallery/${resortId}`)}
              className="px-3 md:px-4 py-3 md:py-4 font-medium text-gray-600 hover:text-gray-800 transition-all border-b-2 border-transparent hover:border-gray-300 text-sm md:text-base"
            >
              Gallery
            </button>
            <button
              onClick={() => navigate(`/travel/overview/${resortId}`)}
              className="px-3 md:px-4 py-3 md:py-4 font-medium text-gray-600 hover:text-gray-800 transition-all border-b-2 border-transparent hover:border-gray-300 text-sm md:text-base"
            >
              Reviews
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        {/* Available Rooms Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-yellow-500/30 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Available Rooms</h2>
              <p className="text-sm text-gray-600">Find your perfect accommodation</p>
            </div>
          </div>
        </div>

        {/* Rooms Available Banner */}
        {rooms.length > 0 && (
          <div className="bg-green-50 border-2 border-green-500/30 rounded-xl p-4 mb-6 text-center">
            <p className="text-green-700 font-semibold">
              <span className="text-green-600 text-lg">{rooms.length}</span> Rooms Available 
            </p>
          </div>
        )}

        {/* Rooms List */}
        {rooms.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border-2 border-yellow-500/30">
            <Home className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No rooms available</h3>
            <p className="text-gray-600">Please check back later or contact us for availability</p>
          </div>
        ) : (
          <div className="space-y-6">
            {rooms.map((room) => (
              <div
                key={room._id}
                className="bg-white rounded-xl overflow-hidden shadow-lg border-2 border-yellow-500/30 hover:shadow-2xl hover:border-yellow-500/60 transition-all duration-300"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                  {/* Room Image */}
                  <div className="md:col-span-1">
                    {room.images && room.images.length > 0 ? (
                      <img
                        src={room.images[0]}
                        alt={room.roomName || room.roomType}
                        className="w-full h-48 md:h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-48 md:h-full bg-gray-200 rounded-lg flex items-center justify-center">
                        <Home className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Room Details */}
                  <div className="md:col-span-2 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600 mb-4">
                        {room.roomName || room.roomType}
                      </h3>

                      {/* Room Info Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-200">
                          <Maximize className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">Size</p>
                          <p className="font-semibold text-gray-800">{room.size || 0} m²</p>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-200">
                          <Bed className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">Bed</p>
                          <p className="font-semibold text-gray-800">{room.bedType || 'Standard'}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-200">
                          <Users className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">Adults</p>
                          <p className="font-semibold text-gray-800">{room.maxAdults || 0}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-200">
                          <Users className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">Children</p>
                          <p className="font-semibold text-gray-800">{room.maxChildren || 0}</p>
                        </div>
                      </div>

                      {/* Amenities */}
                      {room.amenities && room.amenities.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {room.amenities.slice(0, 3).map((amenity, index) => (
                              <span
                                key={index}
                                className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium border border-yellow-200"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Price and Button */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <div>
                        
                        
                      </div>
                      <button
                        onClick={() => navigate(`/travel/room/${room._id}`)}
                        className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-yellow-500/30"
                      >
                        View Room Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelRooms;