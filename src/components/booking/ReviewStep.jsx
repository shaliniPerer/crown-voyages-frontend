import { calculateNights, getFinalPerNightPrice, formatDate } from "../../utils/bookingUtils"

const ReviewStep = ({
  hotel,
  room,
  bookingData,
  hotelName,
  roomName,
  savedBookings = [],
  passengerDetails = [],
}) => {
  const nights = calculateNights(bookingData.checkIn, bookingData.checkOut)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Review All Booking Requests</h2>

      {/* Display All Saved Bookings */}
      {savedBookings && savedBookings.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">All Bookings Summary</h3>
          {savedBookings.map((booking, index) => (
            <div key={index} className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-bold text-gray-900">Booking {index + 1}</h4>
                <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                  ✓ Confirmed
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Resort & Room Info */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-800 border-b border-green-300 pb-2">Property Details</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Resort:</span>
                      <span className="font-medium text-gray-900">{booking.resortName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room Type:</span>
                      <span className="font-medium text-gray-900">{booking.roomName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number of Rooms:</span>
                      <span className="font-medium text-gray-900">{booking.totalRooms} Room{booking.totalRooms !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-800 border-b border-green-300 pb-2">Stay Details</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in:</span>
                      <span className="font-medium text-gray-900">{new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out:</span>
                      <span className="font-medium text-gray-900">{new Date(booking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium text-gray-900">
                        {Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))} night{Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24)) !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Meal Plan:</span>
                      <span className="font-medium text-gray-900">{booking.mealPlan || 'Not selected'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest Configuration */}
              <div className="mt-4 pt-4 border-t border-green-300">
                <h5 className="font-semibold text-gray-800 mb-3">Guest Configuration</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {booking.roomConfigs.map((config, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 border border-green-200">
                      <p className="text-xs font-semibold text-green-700 mb-1">Room {idx + 1}</p>
                      <p className="text-sm text-gray-700">
                        {config.adults} Adult{config.adults !== 1 ? 's' : ''}
                        {config.children > 0 && `, ${config.children} Child${config.children !== 1 ? 'ren' : ''}`}
                      </p>
                      {config.children > 0 && config.childrenAges && config.childrenAges.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Ages: {config.childrenAges.filter(age => age !== undefined && age !== null).join(', ') || 'Not specified'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-green-200 rounded-lg">
                  <p className="text-sm font-semibold text-green-800">
                    Total Guests: {booking.totalAdults} Adult{booking.totalAdults !== 1 ? 's' : ''}
                    {booking.totalChildren > 0 && `, ${booking.totalChildren} Child${booking.totalChildren !== 1 ? 'ren' : ''}`}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Grand Total Summary */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
            <h4 className="text-lg font-bold text-blue-900 mb-4">Grand Total Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <p className="text-2xl font-bold text-blue-600">{savedBookings.length}</p>
                <p className="text-xs text-gray-600">Total Bookings</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <p className="text-2xl font-bold text-blue-600">{savedBookings.reduce((sum, b) => sum + b.totalRooms, 0)}</p>
                <p className="text-xs text-gray-600">Total Rooms</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <p className="text-2xl font-bold text-blue-600">{savedBookings.reduce((sum, b) => sum + b.totalAdults, 0)}</p>
                <p className="text-xs text-gray-600">Total Adults</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <p className="text-2xl font-bold text-blue-600">{savedBookings.reduce((sum, b) => sum + b.totalChildren, 0)}</p>
                <p className="text-xs text-gray-600">Total Children</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hotel and Guest Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Hotel Information</h3>
          <div className="flex space-x-4">
            <img
              src={hotel?.images?.[0] || "/placeholder.svg"}
              alt={hotelName}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="font-bold text-gray-900">{hotelName}</h4>
              <p className="text-sm text-gray-600">{hotel?.location}</p>
              <div className="flex items-center mt-2">
                <div className="flex text-yellow-400">
                  {[...Array(hotel?.starRating || 5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">{hotel?.starRating} Star</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Primary Guest Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Name</span>
              <span className="font-medium text-gray-900">{bookingData.clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email</span>
              <span className="font-medium text-gray-900">{bookingData.clientEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone</span>
              <span className="font-medium text-gray-900">{bookingData.clientPhone}</span>
            </div>
          </div>
          {bookingData.specialRequests && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Special Requests</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {bookingData.specialRequests}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* All Passenger Details */}
      {passengerDetails && passengerDetails.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">All Passengers Details</h3>
          <div className="space-y-6">
            {passengerDetails.map((room, roomIdx) => (
              <div key={roomIdx} className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-purple-200">
                  <h4 className="text-lg font-bold text-purple-700">
                    {room.bookingName || `Booking ${room.bookingIndex + 1}`} - {room.roomName || `Room ${room.roomNumber}`}
                  </h4>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                    Room {room.roomNumber}
                  </span>
                </div>

                {/* Adults */}
                {room.adults && room.adults.length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="mr-2">👤</span> Adult Passengers ({room.adults.length})
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {room.adults.map((adult, adultIdx) => (
                        <div key={adultIdx} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                          <p className="text-xs font-semibold text-purple-600 mb-2">Adult {adultIdx + 1}</p>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium text-gray-600">Name:</span> <span className="text-gray-900">{adult.name || 'Not provided'}</span></p>
                            <p><span className="font-medium text-gray-600">Passport:</span> <span className="text-gray-900">{adult.passport || 'Not provided'}</span></p>
                            <p><span className="font-medium text-gray-600">Country:</span> <span className="text-gray-900">{adult.country || 'Not provided'}</span></p>
                            {adult.arrivalFlightNumber && (
                              <>
                                <p className="text-xs font-semibold text-green-600 mt-2">Arrival</p>
                                <p><span className="font-medium text-gray-600">Flight:</span> {adult.arrivalFlightNumber}</p>
                                <p><span className="font-medium text-gray-600">Time:</span> {adult.arrivalTime}</p>
                              </>
                            )}
                            {adult.departureFlightNumber && (
                              <>
                                <p className="text-xs font-semibold text-orange-600 mt-2">Departure</p>
                                <p><span className="font-medium text-gray-600">Flight:</span> {adult.departureFlightNumber}</p>
                                <p><span className="font-medium text-gray-600">Time:</span> {adult.departureTime}</p>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Children */}
                {room.children && room.children.length > 0 && (
                  <div>
                    <h5 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="mr-2">👶</span> Children Passengers ({room.children.length})
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {room.children.map((child, childIdx) => (
                        <div key={childIdx} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <p className="text-xs font-semibold text-blue-600 mb-2">Child {childIdx + 1}</p>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium text-gray-600">Name:</span> <span className="text-gray-900">{child.name || 'Not provided'}</span></p>
                            <p><span className="font-medium text-gray-600">Age:</span> <span className="text-gray-900">{child.age !== undefined && child.age !== null ? child.age : 'Not provided'}</span></p>
                            <p><span className="font-medium text-gray-600">Passport:</span> <span className="text-gray-900">{child.passport || 'Not provided'}</span></p>
                            <p><span className="font-medium text-gray-600">Country:</span> <span className="text-gray-900">{child.country || 'Not provided'}</span></p>
                            {child.arrivalFlightNumber && (
                              <>
                                <p className="text-xs font-semibold text-green-600 mt-2">Arrival</p>
                                <p><span className="font-medium text-gray-600">Flight:</span> {child.arrivalFlightNumber}</p>
                                <p><span className="font-medium text-gray-600">Time:</span> {child.arrivalTime}</p>
                              </>
                            )}
                            {child.departureFlightNumber && (
                              <>
                                <p className="text-xs font-semibold text-orange-600 mt-2">Departure</p>
                                <p><span className="font-medium text-gray-600">Flight:</span> {child.departureFlightNumber}</p>
                                <p><span className="font-medium text-gray-600">Time:</span> {child.departureTime}</p>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ReviewStep