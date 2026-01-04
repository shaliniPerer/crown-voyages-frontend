import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resortApi } from '../api/resortApi';
import { ArrowLeft, MapPin, Star, Utensils } from 'lucide-react';

const TravelOverview = () => {
  const { resortId } = useParams();
  const navigate = useNavigate();
  const [resort, setResort] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchResort();
  }, [resortId]);

  const fetchResort = async () => {
    try {
      const res = await resortApi.getResortById(resortId);
      setResort(res.data?.data);
    } catch (error) {
      console.error('Failed to fetch resort', error);
    }
  };

  if (!resort) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resort details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto p-6">
        <button
          onClick={() => navigate('/travel')}
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
              onClick={() => setActiveTab('overview')}
              className={`px-3 md:px-4 py-3 md:py-4 font-medium transition-all border-b-2 text-sm md:text-base ${
                activeTab === 'overview'
                  ? 'text-yellow-600 border-yellow-600'
                  : 'text-gray-600 hover:text-gray-800 border-transparent'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => navigate(`/travel/rooms/${resortId}`)}
              className="px-3 md:px-4 py-3 md:py-4 font-medium text-gray-600 hover:text-gray-800 transition-all border-b-2 border-transparent hover:border-gray-300 text-sm md:text-base"
            >
              Rooms
            </button>
            <button
              onClick={() => setActiveTab('dining')}
              className={`px-3 md:px-4 py-3 md:py-4 font-medium transition-all border-b-2 text-sm md:text-base ${
                activeTab === 'dining'
                  ? 'text-yellow-600 border-yellow-600'
                  : 'text-gray-600 hover:text-gray-800 border-transparent'
              }`}
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
              onClick={() => setActiveTab('reviews')}
              className={`px-3 md:px-4 py-3 md:py-4 font-medium transition-all border-b-2 text-sm md:text-base ${
                activeTab === 'reviews'
                  ? 'text-yellow-600 border-yellow-600'
                  : 'text-gray-600 hover:text-gray-800 border-transparent'
              }`}
            >
              Reviews
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {activeTab === 'overview' && (
          <div className="max-w-4xl mx-auto space-y-6 md:space-y-10">
            {/* About Section */}
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">About This Hotel</h2>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                {resort.description || 'Experience luxury and comfort at this magnificent resort. Enjoy world-class amenities, stunning views, and exceptional service that will make your stay unforgettable.'}
              </p>
            </div>

            {/* Amenities Section */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 text-center">Amenities & Services</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {resort.amenities?.map((amenity, index) => (
                  <div
                    key={index}
                    className="bg-white p-3 md:p-4 rounded-lg shadow-sm border-2 border-yellow-500/30 text-center"
                  >
                    <span className="text-sm md:text-base text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Meal Plans Section */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border-2 border-yellow-500/30">
              <div className="flex items-center justify-center gap-3 mb-4 md:mb-6">
                <Utensils className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
                <div className="text-center">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">Meal Plans</h3>
                  <p className="text-xs md:text-sm text-gray-500">Choose your dining experience</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 md:p-5 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900 text-base md:text-lg">{resort.mealPlan || 'Full Board'}</h4>
                  <div className="text-right">
                    <div className="text-xl md:text-2xl font-bold text-yellow-600">
                      ${resort.pricePerNight || '500'}
                    </div>
                    <div className="text-xs text-gray-500">per person/day</div>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-gray-600 mt-2">
                  {resort.mealPlanDescription }
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dining' && (
          <div className="text-center py-16">
            <Utensils className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Dining Information</h3>
            <p className="text-gray-600">Dining details coming soon</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="text-center py-16">
            <Star className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Guest Reviews</h3>
            <p className="text-gray-600">Reviews coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelOverview;