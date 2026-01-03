const ConfirmationStep = ({ bookingData, hotelName, navigate }) => {
  return (
    <div className="text-center py-8 sm:py-12 px-4 font-luxury">
      <div className="bg-green-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 sm:h-10 sm:w-10 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Booking Request Submitted!</h2>
      <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto mb-6 sm:mb-8">
        Your booking request for {hotelName} has been successfully submitted. You will receive a
        confirmation email soon.
      </p>
      <div className="bg-yellow-50 border-2 border-yellow-500/30 rounded-lg p-4 sm:p-6 max-w-md mx-auto mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg font-semibold text-yellow-800 mb-2">What's Next?</h3>
        <p className="text-xs sm:text-sm text-yellow-700">
          Our team will review your booking request and send you a detailed confirmation within 24
          hours. You'll receive updates via email at {bookingData.clientEmail}.
        </p>
      </div>
      <button
        onClick={() => navigate("/booking?tab=bookings")}
        className="bg-yellow-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-yellow-700 transition-colors font-medium text-sm sm:text-base"
      >
        View Booking Details
      </button>
    </div>
  )
}

export default ConfirmationStep