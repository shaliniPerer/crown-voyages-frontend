import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resortApi } from '../api/resortApi';
import { roomApi } from '../api/roomApi';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Search, MapPin, Star, Users, Calendar, Utensils, Bed, Sparkles } from 'lucide-react';

const Travel = () => {
  const navigate = useNavigate();
  const [resorts, setResorts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filteredResorts, setFilteredResorts] = useState([]);
  const [search, setSearch] = useState({
    name: '',
    checkIn: '',
    checkOut: '',
    mealPlan: '',
    roomType: '',
    adults: 1,
    children: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resResorts = await resortApi.getResorts();
      const resRooms = await roomApi.getRooms();
      const resortsData = resResorts.data?.data || [];
      const roomsData = resRooms.data?.data || [];
      setResorts(resortsData);
      setRooms(roomsData);
      
      // Filter resorts with available rooms
      const filtered = resortsData.map(r => {
        const resortRooms = roomsData.filter(room => room.resort._id === r._id);
        return { ...r, availableRooms: resortRooms.length };
      }).filter(r => r.availableRooms > 0);
      
      setFilteredResorts(filtered);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  const handleSearch = () => {
    let filtered = resorts.filter(r =>
      (!search.name || r.name.toLowerCase().includes(search.name.toLowerCase())) &&
      (!search.mealPlan || r.mealPlan === search.mealPlan)
    );

    filtered = filtered.map(r => {
      const resortRooms = rooms.filter(room =>
        room.resort._id === r._id &&
        (!search.roomType || room.roomType === search.roomType) &&
        room.maxAdults >= search.adults &&
        room.maxChildren >= search.children &&
        isAvailable(room, search.checkIn, search.checkOut)
      );
      return { ...r, availableRooms: resortRooms.length };
    }).filter(r => r.availableRooms > 0);

    setFilteredResorts(filtered);
  };

  const isAvailable = (room, checkIn, checkOut) => {
    if (!checkIn || !checkOut) return true;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return room.availabilityCalendar.some(a => {
      const aStart = new Date(a.startDate);
      const aEnd = new Date(a.endDate);
      return start >= aStart && end <= aEnd;
    });
  };

  const openDetails = (resort) => {
    navigate(`/travel/overview/${resort._id}`);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="max-w-[1400px] mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-yellow-500" />
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600">
            Crown Voyages
          </h1>
        </div>
        <p className="text-gray-600 text-lg ml-11">Discover your perfect escape</p>
      </div>

      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Search Card */}
        <div className="bg-white border-2 border-yellow-500/30 rounded-2xl p-10 shadow-2xl shadow-yellow-500/10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Hotel/Resort Name */}
            <div className="relative">
              <label className="block text-yellow-500 text-sm font-semibold mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Hotel/Resort Name
              </label>
              <input
                type="text"
                value={search.name}
                onChange={e => setSearch({...search, name: e.target.value})}
                className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                placeholder="Enter resort name..."
              />
            </div>

            {/* Check-in Date */}
            <div className="relative">
              <label className="block text-yellow-500 text-sm font-semibold mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Check-in Date
              </label>
              <input
                type="date"
                value={search.checkIn}
                onChange={e => setSearch({...search, checkIn: e.target.value})}
                className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
              />
            </div>

            {/* Check-out Date */}
            <div className="relative">
              <label className="block text-yellow-500 text-sm font-semibold mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Check-out Date
              </label>
              <input
                type="date"
                value={search.checkOut}
                onChange={e => setSearch({...search, checkOut: e.target.value})}
                className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
              />
            </div>

            {/* Meal Plan */}
            <div className="relative">
              <label className="block text-yellow-500 text-sm font-semibold mb-2 flex items-center gap-2">
                <Utensils className="w-4 h-4" />
                Meal Plan
              </label>
              <select
                value={search.mealPlan}
                onChange={e => setSearch({...search, mealPlan: e.target.value})}
                className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all appearance-none cursor-pointer"
              >
                <option value="">Select meal plan</option>
                <option value="All Inclusive">All Inclusive</option>
                <option value="Half Board">Half Board</option>
                <option value="Full Board">Full Board</option>
                <option value="Bed & Breakfast">Bed & Breakfast</option>
              </select>
            </div>

            {/* Room Type */}
            {/* <div className="relative">
              <label className="block text-yellow-500 text-sm font-semibold mb-2 flex items-center gap-2">
                <Bed className="w-4 h-4" />
                Room Type
              </label>
              <select
                value={search.roomType}
                onChange={e => setSearch({...search, roomType: e.target.value})}
                className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all appearance-none cursor-pointer"
              >
                <option value="">Select room type</option>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Suite">Suite</option>
                <option value="Villa">Villa</option>
              </select>
            </div> */}

            {/* Adults */}
            <div className="relative">
              <label className="block text-yellow-500 text-sm font-semibold mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Adults
              </label>
              <input
                type="number"
                min="1"
                value={search.adults}
                onChange={e => setSearch({...search, adults: parseInt(e.target.value) || 1})}
                className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
              />
            </div>

            {/* Children */}
            <div className="relative">
              <label className="block text-yellow-500 text-sm font-semibold mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Children
              </label>
              <input
                type="number"
                min="0"
                value={search.children}
                onChange={e => setSearch({...search, children: parseInt(e.target.value) || 0})}
                className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 font-bold rounded-lg shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Search Resorts
          </button>
        </div>

        {/* Results Count */}
        {filteredResorts.length > 0 && (
          <div className="text-gray-600 text-sm">
            Found <span className="text-yellow-600 font-semibold">{filteredResorts.length}</span>  resort{filteredResorts.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Resorts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredResorts.map(r => (
            <div
              key={r._id}
              className="group bg-white border-2 border-yellow-500/30 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 hover:border-yellow-500/60 hover:-translate-y-1"
            >
              {/* Resort Image */}
              {r.images && r.images.length > 0 && (
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={r.images[0]}
                    alt={r.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent"></div>
                  
                  {/* Star Rating Badge */}
                  <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1 border border-yellow-500/30">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="text-yellow-500 font-bold text-sm">{r.starRating}</span>
                  </div>
                </div>
              )}

              {/* Resort Details */}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600 mb-4 group-hover:from-yellow-600 group-hover:to-yellow-700 transition-all">
                  {r.name}
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-5 h-5 text-yellow-500" />
                    <span className="text-base">{r.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-700">
                    <Bed className="w-5 h-5 text-yellow-500" />
                    <span className="text-base">
                      <span className="font-semibold text-yellow-600">{r.availableRooms}</span> rooms available
                    </span>
                  </div>
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => openDetails(r)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/30"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {filteredResorts.length === 0 && resorts.length > 0 && (
          <div className="text-center py-16">
            <div className="inline-block p-8 bg-white rounded-2xl border-2 border-yellow-500/30 shadow-xl">
              <Search className="w-16 h-16 text-yellow-500/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No resorts found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Travel;