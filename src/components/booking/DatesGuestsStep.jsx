import React from "react";
import { FaBed, FaRulerCombined, FaUsers, FaShip, FaPlane, FaCar, FaPlaneDeparture, FaMapMarkerAlt, FaFileAlt } from "react-icons/fa";
import { getFinalPerNightPrice } from "../../utils/bookingUtils";

const DatesGuestsStep = ({
  hotel,
  room,
  bookingData,
  handleChange,
  handleChildAgeChange,
  errors,
  basePricePerNight,
  marketSurcharge,
  hotelName,
  roomConfigs,
  handleRoomConfigChange,
  handleNext,
  handleBookAnotherRoom,
  savedBookings = [],
}) => {
  const [numberOfRooms, setNumberOfRooms] = React.useState(roomConfigs.length || 1);

  const handleNumberOfRoomsChange = (value) => {
    const numRooms = parseInt(value);
    setNumberOfRooms(numRooms);
    // This will be handled by parent component through handleChange
    handleChange({ target: { name: 'rooms', value: numRooms } });
  };

  const getTransportIcon = (method) => {
    const lowerMethod = method.toLowerCase();
    if (lowerMethod.includes("boat") || lowerMethod.includes("ship")) return <FaShip className="text-yellow-600" />;
    if (lowerMethod.includes("plane") && !lowerMethod.includes("domestic")) return <FaPlane className="text-yellow-600" />;
    if (lowerMethod.includes("domestic flight")) return <FaPlaneDeparture className="text-yellow-600" />;
    return <FaCar className="text-yellow-600" />;
  };

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100 font-luxury">
      {/* Progress Steps */}
      {/* <div className="py-12">
        <div className="w-full px-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500 text-white font-bold text-lg">1</div>
              <span className="font-bold text-gray-900 text-base">Dates & Guests</span>
            </div>
            <div className="w-20 h-px bg-gray-300 mx-5"></div>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-500 font-bold text-lg">2</div>
              <span className="font-medium text-gray-400 text-base">Guest Info</span>
            </div>
            <div className="w-20 h-px bg-gray-300 mx-5"></div>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-500 font-bold text-lg">3</div>
              <span className="font-medium text-gray-400 text-base">Confirmation</span>
            </div>
          </div>
        </div>
      </div> */}

      <div className="w-full px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-12">Select Dates & Guests</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column: Hotel Card */}
          <div className="space-y-8 lg:max-w-lg xl:max-w-2xl">
            <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 w-full">
              <img
                src={hotel?.images?.[0] || "/placeholder.svg"}
                alt={hotelName}
                className="w-full h-80 object-cover"
              />
              <div className="p-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-3">{hotelName}</h3>
                <div className="flex items-center text-gray-600 mb-8">
                  <FaMapMarkerAlt className="text-yellow-500 mr-3 text-base" />
                  <span className="text-base font-medium">{hotel?.location || "Maldives"}</span>
                </div>
                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-yellow-600">
                      ${getFinalPerNightPrice(basePricePerNight, marketSurcharge)}
                    </span>
                    <span className="text-gray-500 text-base">per night</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Highlights */}
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 w-full">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Property Highlights</h3>
              <p className="text-base text-gray-600 leading-relaxed">{hotel?.description || "No description available."}</p>
            </div>
          </div>

          {/* Right Column: Booking Form */}
          <div className="lg:max-w-lg xl:max-w-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-10">Select Dates and Guests</h2>

            {/* Date Pickers */}
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Check-in Date</label>
                <input
                  type="date"
                  name="checkIn"
                  value={bookingData.checkIn}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 outline-none transition-all text-gray-700 text-base"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Check-out Date</label>
                <input
                  type="date"
                  name="checkOut"
                  value={bookingData.checkOut}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 outline-none transition-all text-gray-700 text-base"
                />
              </div>
            </div>

            {/* Number of Rooms */}
            <div className="mb-10 space-y-3">
              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Number of Rooms</label>
              <select
                value={numberOfRooms}
                onChange={(e) => handleNumberOfRoomsChange(e.target.value)}
                className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:border-yellow-500 outline-none text-base appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.67%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_1.5rem_center] bg-no-repeat"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'Room' : 'Rooms'}</option>
                ))}
              </select>
            </div>

            {/* Room Config */}
            <div className="mb-10">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Room Configuration</h3>
              {roomConfigs.map((config, roomIdx) => (
                <div key={roomIdx} className="space-y-5 mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  <p className="text-lg font-bold text-gray-800 border-b border-gray-300 pb-2">Room {roomIdx + 1}</p>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-500">Adults</label>
                      <input
                        type="number"
                        min="1"
                        max={room?.maxAdults || 10}
                        value={config.adults}
                        onChange={(e) => handleRoomConfigChange(roomIdx, "adults", e.target.value)}
                        className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:border-yellow-500 outline-none text-base"
                      />
                      <p className="text-xs text-gray-500">Max: {room?.maxAdults || 'N/A'} adults per room</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-500">Children</label>
                      <input
                        type="number"
                        min="0"
                        max={room?.maxChildren || 5}
                        value={config.children}
                        onChange={(e) => handleRoomConfigChange(roomIdx, "children", e.target.value)}
                        className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:border-yellow-500 outline-none text-base"
                      />
                      <p className="text-xs text-gray-500">Max: {room?.maxChildren || 'N/A'} children per room</p>
                    </div>
                  </div>

                  {/* Children Ages */}
                  {config.children > 0 && (
                    <div className="mt-4 space-y-3">
                      <label className="text-sm font-semibold text-gray-500">Children Ages</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {Array.from({ length: config.children }).map((_, childIdx) => (
                          <div key={childIdx} className="space-y-1">
                            <label className="text-xs text-gray-600">Child {childIdx + 1} Age</label>
                            <input
                              type="number"
                              min="0"
                              max="17"
                              value={config.childrenAges?.[childIdx] || 0}
                              onChange={(e) => handleChildAgeChange(roomIdx, childIdx, e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-yellow-500 outline-none text-sm"
                              placeholder="Age"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Meal Plan */}
            <div className="mb-10 space-y-3">
              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Selected Meal Plan</label>
              <select
                name="mealPlan"
                value={bookingData.mealPlan}
                onChange={handleChange}
                className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:border-yellow-500 outline-none text-base appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.67%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_1.5rem_center] bg-no-repeat"
              >
                <option value="">Select Meal Plan</option>
                <option value="All Inclusive">All Inclusive</option>
                <option value="Full Board">Full Board</option>
                <option value="Half Board">Half Board</option>
                <option value="Bed & Breakfast">Bed & Breakfast</option>
              </select>
            </div>

            {/* Transportation */}
            {room?.transportations?.length > 0 && (
              <div className="mb-12">
                <label className="flex items-center gap-3 text-base font-bold text-gray-800 mb-5">
                  <FaFileAlt className="text-gray-400" /> Transportation Options
                </label>
                <div className="flex flex-wrap gap-4">
                  {room.transportations.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 text-gray-800 px-6 py-3 rounded-full text-sm font-bold">
                      {getTransportIcon(t.method)}
                      <span className="capitalize">{t.type}: {t.method}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Previously Saved Bookings */}
            {savedBookings && savedBookings.length > 0 && (
              <div className="mb-10">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Previously Selected Rooms</h3>
                <div className="space-y-4">
                  {savedBookings.map((booking, index) => (
                    <div key={index} className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-2xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-bold text-gray-900">Booking Summary {index + 1}</h4>
                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                          Saved
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-700">
                        {/* Room Details */}
                        <div className="flex justify-between items-center py-2 border-b border-green-200">
                          <span className="font-semibold">Room:</span>
                          <span className="font-medium">{booking.roomName}</span>
                        </div>
                        
                        {/* Resort Details */}
                        <div className="flex justify-between items-center py-2 border-b border-green-200">
                          <span className="font-semibold">Resort:</span>
                          <span className="font-medium">{booking.resortName}</span>
                        </div>
                        
                        {/* Dates */}
                        {booking.checkIn && booking.checkOut && (
                          <div className="flex justify-between items-center py-2 border-b border-green-200">
                            <span className="font-semibold">Stay Duration:</span>
                            <span className="font-medium">
                              {new Date(booking.checkIn).toLocaleDateString('en-US', { 
                                month: 'short', day: 'numeric', year: 'numeric' 
                              })} - {new Date(booking.checkOut).toLocaleDateString('en-US', { 
                                month: 'short', day: 'numeric', year: 'numeric' 
                              })}
                              <span className="ml-2 text-green-700">
                                ({Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))} night{Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24)) !== 1 ? 's' : ''})
                              </span>
                            </span>
                          </div>
                        )}
                        
                        {/* Total Rooms */}
                        {booking.totalRooms > 0 && (
                          <div className="flex justify-between items-center py-2 border-b border-green-200">
                            <span className="font-semibold">Total Rooms:</span>
                            <span className="font-medium text-green-700">{booking.totalRooms} {booking.totalRooms === 1 ? 'Room' : 'Rooms'}</span>
                          </div>
                        )}
                        
                        {/* Room Configurations */}
                        {booking.roomConfigs && booking.roomConfigs.map((config, idx) => (
                          (config.adults > 0 || config.children > 0) && (
                            <div key={idx} className="py-2 border-b border-green-200">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold">Room {idx + 1}:</span>
                                <span className="font-medium">
                                  {config.adults} Adult{config.adults !== 1 ? 's' : ''}
                                  {config.children > 0 && `, ${config.children} Child${config.children !== 1 ? 'ren' : ''}`}
                                </span>
                              </div>
                              {config.children > 0 && config.childrenAges && config.childrenAges.length > 0 && (
                                <div className="text-xs text-gray-600 mt-1 ml-4">
                                  Children ages: {config.childrenAges.filter(age => age > 0).join(', ') || 'Not specified'}
                                </div>
                              )}
                            </div>
                          )
                        ))}
                        
                        {/* Total Guests */}
                        {(booking.totalAdults > 0 || booking.totalChildren > 0) && (
                          <div className="flex justify-between items-center py-2 border-b border-green-200">
                            <span className="font-semibold">Total Guests:</span>
                            <span className="font-medium">
                              {booking.totalAdults} Adult{booking.totalAdults !== 1 ? 's' : ''}
                              {booking.totalChildren > 0 && `, ${booking.totalChildren} Child${booking.totalChildren !== 1 ? 'ren' : ''}`}
                            </span>
                          </div>
                        )}
                        
                        {/* Meal Plan */}
                        {booking.mealPlan && (
                          <div className="flex justify-between items-center py-2">
                            <span className="font-semibold">Meal Plan:</span>
                            <span className="font-medium text-green-700">{booking.mealPlan}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Current Booking Summary */}
            {(bookingData.checkIn || bookingData.checkOut || bookingData.mealPlan || roomConfigs.some(r => r.adults > 0 || r.children > 0)) && (
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-2xl p-6 mb-10">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    {savedBookings && savedBookings.length > 0 ? `Booking Summary ${savedBookings.length + 1}` : 'Booking Summary'}
                  </h3>
                  <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                    Current
                  </span>
                </div>
                <div className="space-y-3 text-sm text-gray-700">
                  {/* Dates */}
                  {bookingData.checkIn && bookingData.checkOut && (
                    <div className="flex justify-between items-center py-2 border-b border-yellow-200">
                      <span className="font-semibold">Stay Duration:</span>
                      <span className="font-medium">
                        {new Date(bookingData.checkIn).toLocaleDateString('en-US', { 
                          month: 'short', day: 'numeric', year: 'numeric' 
                        })} - {new Date(bookingData.checkOut).toLocaleDateString('en-US', { 
                          month: 'short', day: 'numeric', year: 'numeric' 
                        })}
                        <span className="ml-2 text-yellow-700">
                          ({Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24))} night{Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24)) !== 1 ? 's' : ''})
                        </span>
                      </span>
                    </div>
                  )}
                  
                  {/* Number of Rooms */}
                  {roomConfigs.length > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-yellow-200">
                      <span className="font-semibold">Total Rooms:</span>
                      <span className="font-medium text-yellow-700">{roomConfigs.length} {roomConfigs.length === 1 ? 'Room' : 'Rooms'}</span>
                    </div>
                  )}
                  
                  {/* Room Configurations */}
                  {roomConfigs.map((config, idx) => (
                    (config.adults > 0 || config.children > 0) && (
                      <div key={idx} className="py-2 border-b border-yellow-200">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold">Room {idx + 1}:</span>
                          <span className="font-medium">
                            {config.adults} Adult{config.adults !== 1 ? 's' : ''}
                            {config.children > 0 && `, ${config.children} Child${config.children !== 1 ? 'ren' : ''}`}
                          </span>
                        </div>
                        {config.children > 0 && config.childrenAges && config.childrenAges.length > 0 && (
                          <div className="text-xs text-gray-600 mt-1 ml-4">
                            Children ages: {config.childrenAges.filter(age => age > 0).join(', ') || 'Not specified'}
                          </div>
                        )}
                      </div>
                    )
                  ))}
                  
                  {/* Total Guests */}
                  {roomConfigs.some(r => r.adults > 0 || r.children > 0) && (
                    <div className="flex justify-between items-center py-2 border-b border-yellow-200">
                      <span className="font-semibold">Total Guests:</span>
                      <span className="font-medium">
                        {roomConfigs.reduce((sum, config) => sum + config.adults, 0)} Adult{roomConfigs.reduce((sum, config) => sum + config.adults, 0) !== 1 ? 's' : ''}
                        {roomConfigs.reduce((sum, config) => sum + config.children, 0) > 0 && 
                          `, ${roomConfigs.reduce((sum, config) => sum + config.children, 0)} Child${roomConfigs.reduce((sum, config) => sum + config.children, 0) !== 1 ? 'ren' : ''}`
                        }
                      </span>
                    </div>
                  )}
                  
                  {/* Meal Plan */}
                  {bookingData.mealPlan && (
                    <div className="flex justify-between items-center py-2">
                      <span className="font-semibold">Meal Plan:</span>
                      <span className="font-medium text-yellow-700">{bookingData.mealPlan}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 mt-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => window.history.back()}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                >
                  ← Previous
                </button>
                {handleBookAnotherRoom && (
                  <button
                    onClick={handleBookAnotherRoom}
                    className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium"
                  >
                    + Book Another Room
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="flex-1 px-8 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-lg hover:from-gold-600 hover:to-gold-700 transition-all duration-200 font-semibold shadow-lg"
                >
                  Next →
                </button>
              </div>

              {/* Show saved bookings count */}
              {savedBookings && savedBookings.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <p className="text-sm text-green-700 font-medium">
                    ✓ {savedBookings.length} room{savedBookings.length > 1 ? 's' : ''} added to booking
                  </p>
                </div>
              )}
            </div>
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatesGuestsStep;
