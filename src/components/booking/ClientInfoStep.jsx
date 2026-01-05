import { countries } from "../../assets/nationalities"

const ClientInfoStep = ({
  bookingData,
  handleChange,
  errors,
  passengerDetails,
  handlePassengerChange,
  handleChildPassengerChange,
  roomConfigs,
  savedBookings = []
}) => {
  return (
    <div className="space-y-6 font-luxury">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Guest Information</h2>

      {/* Display All Saved Bookings Summary */}
      {savedBookings && savedBookings.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">All Booked Rooms Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedBookings.map((booking, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-base font-bold text-gray-900">Booking {index + 1}</h4>
                  <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                    ✓ Saved
                  </span>
                </div>
                <div className="space-y-1 text-xs text-gray-700">
                  <p><span className="font-semibold">Room:</span> {booking.roomName}</p>
                  <p><span className="font-semibold">Resort:</span> {booking.resortName}</p>
                  <p><span className="font-semibold">Dates:</span> {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</p>
                  <p><span className="font-semibold">Guests:</span> {booking.totalAdults} Adult{booking.totalAdults !== 1 ? 's' : ''}{booking.totalChildren > 0 && `, ${booking.totalChildren} Child${booking.totalChildren !== 1 ? 'ren' : ''}`}</p>
                  <p><span className="font-semibold">Rooms:</span> {booking.totalRooms}</p>
                  {booking.mealPlan && <p><span className="font-semibold">Meal:</span> {booking.mealPlan}</p>}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              📋 Total Bookings: {savedBookings.length} | 
              Total Rooms: {savedBookings.reduce((sum, b) => sum + b.totalRooms, 0)} | 
              Total Guests: {savedBookings.reduce((sum, b) => sum + b.totalAdults + b.totalChildren, 0)}
            </p>
          </div>
        </div>
      )}
      
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 sm:p-4 rounded-lg mb-6 sm:mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-800">
              Please ensure all guest information is accurate. Changes cannot be made after booking.
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border-2 border-yellow-500/30">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Guest Name *</label>
            <input
              type="text"
              name="clientName"
              value={bookingData.clientName}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${
                errors.clientName ? "border-red-300" : "border-gray-300"
              } rounded-lg focus:ring-yellow-500 focus:border-yellow-500 text-sm`}
            />
            {errors.clientName && <p className="mt-1 text-xs text-red-600">{errors.clientName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Guest Email *</label>
            <input
              type="email"
              name="clientEmail"
              value={bookingData.clientEmail}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${
                errors.clientEmail ? "border-red-300" : "border-gray-300"
              } rounded-lg focus:ring-yellow-500 focus:border-yellow-500 text-sm`}
            />
            {errors.clientEmail && <p className="mt-1 text-xs text-red-600">{errors.clientEmail}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Guest Phone *</label>
            <input
              type="text"
              name="clientPhone"
              value={bookingData.clientPhone}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${
                errors.clientPhone ? "border-red-300" : "border-gray-300"
              } rounded-lg focus:ring-yellow-500 focus:border-yellow-500 text-sm`}
            />
            {errors.clientPhone && <p className="mt-1 text-xs text-red-600">{errors.clientPhone}</p>}
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
          <textarea
            name="specialRequests"
            value={bookingData.specialRequests}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 text-sm"
            placeholder="Enter any special requests or preferences..."
          />
        </div>
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Guests Details for All Bookings</h3>

        {passengerDetails.map((room, roomIdx) => (
          <div key={`room-${roomIdx}`} className="mb-8 p-6 border-2 border-yellow-500/30 rounded-lg bg-white">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-semibold text-yellow-600">
                {room.bookingName || `Booking ${room.bookingIndex + 1}`} - {room.roomName || `Room ${room.roomNumber}`}
              </h4>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                Room {room.roomNumber}
              </span>
            </div>

            {/* Adult Guests for this room */}
            <div className="mb-6">
              <h5 className="font-medium text-yellow-600 mb-3">Adult Guests ({room.adults.length})</h5>
              {room.adults.map((_, adultIdx) => (
                <div key={`adult-${roomIdx}-${adultIdx}`} className="mb-8 p-4 border border-gray-200 rounded-lg bg-white">
                  <h5 className="font-medium text-gray-700 mb-2">Adult {adultIdx + 1}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={passengerDetails[roomIdx]?.adults[adultIdx]?.name || ''}
                        onChange={e => handlePassengerChange(roomIdx, adultIdx, "name", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Passport Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={passengerDetails[roomIdx]?.adults[adultIdx]?.passport || ''}
                        onChange={e => handlePassengerChange(roomIdx, adultIdx, "passport", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={passengerDetails[roomIdx]?.adults[adultIdx]?.country || ''}
                        onChange={e => handlePassengerChange(roomIdx, adultIdx, "country", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                      >
                        <option value="">Select country</option>
                        {countries.map((c, i) => (
                          <option key={i} value={c.name}>{c.flag} {c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Arrival Flight Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={passengerDetails[roomIdx]?.adults[adultIdx]?.arrivalFlightNumber || ''}
                        onChange={e => handlePassengerChange(roomIdx, adultIdx, "arrivalFlightNumber", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Arrival Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={passengerDetails[roomIdx]?.adults[adultIdx]?.arrivalTime || ''}
                        onChange={e => handlePassengerChange(roomIdx, adultIdx, "arrivalTime", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Departure Flight Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={passengerDetails[roomIdx]?.adults[adultIdx]?.departureFlightNumber || ''}
                        onChange={e => handlePassengerChange(roomIdx, adultIdx, "departureFlightNumber", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Departure Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={passengerDetails[roomIdx]?.adults[adultIdx]?.departureTime || ''}
                        onChange={e => handlePassengerChange(roomIdx, adultIdx, "departureTime", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Child Guests for this room */}
            {room.children.length > 0 && (
              <div className="mb-6">
                <h5 className="font-medium text-yellow-600 mb-3">Child Guests ({room.children.length})</h5>
                {room.children.map((_, childIdx) => {
                  return (
                    <div key={`child-${roomIdx}-${childIdx}`} className="mb-8 p-4 border border-gray-200 rounded-lg bg-indigo-50">
                      <h5 className="font-medium text-gray-700 mb-2 flex items-center">Child {childIdx + 1}
                        <span className="ml-3 text-xs font-semibold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full">
                          Age: {roomConfigs[roomIdx]?.childrenAges[childIdx] !== undefined && roomConfigs[roomIdx]?.childrenAges[childIdx] !== null ? `${roomConfigs[roomIdx].childrenAges[childIdx]} ${roomConfigs[roomIdx].childrenAges[childIdx] === 1 ? 'year' : 'years'}` : 'Not specified'}
                        </span>
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={passengerDetails[roomIdx]?.children[childIdx]?.name || ''}
                            onChange={e => handleChildPassengerChange(roomIdx, childIdx, "name", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Passport Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={passengerDetails[roomIdx]?.children[childIdx]?.passport || ''}
                            onChange={e => handleChildPassengerChange(roomIdx, childIdx, "passport", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={passengerDetails[roomIdx]?.children[childIdx]?.country || ''}
                            onChange={e => handleChildPassengerChange(roomIdx, childIdx, "country", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            required
                          >
                            <option value="">Select country</option>
                            {countries.map((c, i) => (
                              <option key={i} value={c.name}>{c.flag} {c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Arrival Flight Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={passengerDetails[roomIdx]?.children[childIdx]?.arrivalFlightNumber || ''}
                            onChange={e => handleChildPassengerChange(roomIdx, childIdx, "arrivalFlightNumber", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Arrival Time <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="time"
                            value={passengerDetails[roomIdx]?.children[childIdx]?.arrivalTime || ''}
                            onChange={e => handleChildPassengerChange(roomIdx, childIdx, "arrivalTime", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Departure Flight Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={passengerDetails[roomIdx]?.children[childIdx]?.departureFlightNumber || ''}
                            onChange={e => handleChildPassengerChange(roomIdx, childIdx, "departureFlightNumber", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Departure Time <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="time"
                            value={passengerDetails[roomIdx]?.children[childIdx]?.departureTime || ''}
                            onChange={e => handleChildPassengerChange(roomIdx, childIdx, "departureTime", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ClientInfoStep