import { calculateNights, getFinalPerNightPrice, formatDate } from "../../utils/bookingUtils"

const ReviewStep = ({
  hotel,
  room,
  bookingData,
  hotelName,
  roomName,
  
}) => {
  const nights = calculateNights(bookingData.checkIn, bookingData.checkOut)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Review Booking Request</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in</span>
                <span className="font-medium text-gray-900">{formatDate(bookingData.checkIn)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-out</span>
                <span className="font-medium text-gray-900">{formatDate(bookingData.checkOut)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration</span>
                <span className="font-medium text-gray-900">
                  {nights} night{nights !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Guests</span>
                <span className="font-medium text-gray-900">
                  {bookingData.adults} Adults, {bookingData.children} Children
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rooms</span>
                <span className="font-medium text-gray-900">
                  {bookingData.rooms} Room{bookingData.rooms !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Room Type</span>
                <span className="font-medium text-gray-900">{roomName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Meal Plan</span>
                <span className="font-medium text-gray-900">
                  {bookingData.mealPlan} (+${bookingData.selectedMealPlan?.price || 0})
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Guest Information</h3>
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

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-2 border-yellow-500/30 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Summary</h3>
            <p>Review your booking details above.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewStep