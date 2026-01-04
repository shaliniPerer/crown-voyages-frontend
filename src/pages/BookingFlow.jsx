import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { roomApi } from '../api/roomApi';
import { resortApi } from '../api/resortApi';
import { bookingApi } from '../api/bookingApi';
import { toast } from 'react-toastify';
import { calculateNights } from '../utils/bookingUtils';
import DatesGuestsStep from '../components/booking/DatesGuestsStep';
import ClientInfoStep from '../components/booking/ClientInfoStep';
import ReviewStep from '../components/booking/ReviewStep';
import ConfirmationStep from '../components/booking/ConfirmationStep';

const BookingFlow = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [room, setRoom] = useState(null);
  const [resort, setResort] = useState(null);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    rooms: 1,
    adults: 1,
    children: 0,
    mealPlan: '',
    selectedMealPlan: null,
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    specialRequests: '',
  });
  const [roomConfigs, setRoomConfigs] = useState([{ adults: 1, children: 0, childrenAges: [] }]);
  const [savedBookings, setSavedBookings] = useState([]);
  const [passengerDetails, setPassengerDetails] = useState([]);
  const [errors, setErrors] = useState({});
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [autoAppliedOffers, setAutoAppliedOffers] = useState([]);

  useEffect(() => {
    if (location.state) {
      setBookingData(prev => ({ ...prev, ...location.state }));
    }
    fetchData();
    
    // Load saved bookings from localStorage
    const pendingBookings = localStorage.getItem('pendingBookings');
    if (pendingBookings) {
      try {
        const bookings = JSON.parse(pendingBookings);
        setSavedBookings(bookings);
        toast.info(`${bookings.length} room${bookings.length > 1 ? 's' : ''} already added to booking`);
      } catch (error) {
        console.error('Error loading saved bookings:', error);
      }
    }
  }, [roomId, location.state]);

  useEffect(() => {
    // Update roomConfigs when rooms change
    setRoomConfigs(prev => {
      const newConfigs = [...prev];
      while (newConfigs.length < bookingData.rooms) {
        newConfigs.push({ adults: 1, children: 0, childrenAges: [] });
      }
      return newConfigs.slice(0, bookingData.rooms);
    });
  }, [bookingData.rooms]);

  const fetchData = async () => {
    try {
      const roomRes = await roomApi.getRoomById(roomId);
      const roomData = roomRes.data?.data;
      setRoom(roomData);
      const resortRes = await resortApi.getResortById(roomData.resort._id);
      setResort(resortRes.data?.data);
      // Initialize passenger details based on rooms
      initializePassengerDetails(1);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  const initializePassengerDetails = (numRooms) => {
    const details = [];
    for (let i = 0; i < numRooms; i++) {
      details.push({
        roomNumber: i + 1,
        adults: [],
        children: [],
      });
    }
    setPassengerDetails(details);
    // Also initialize room configs
    setRoomConfigs(Array.from({ length: numRooms }, () => ({ adults: 1, children: 0, childrenAges: [] })));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoomConfigChange = (roomIdx, field, value) => {
    setRoomConfigs(prev => {
      const newConfigs = [...prev];
      if (!newConfigs[roomIdx]) {
        newConfigs[roomIdx] = { adults: 1, children: 0, childrenAges: [] };
      }
      newConfigs[roomIdx] = { ...newConfigs[roomIdx], [field]: parseInt(value) };
      if (field === 'children') {
        newConfigs[roomIdx].childrenAges = Array.from({ length: parseInt(value) }, () => 0);
      }
      return newConfigs;
    });
  };

  const handleChildAgeChange = (roomIdx, childIdx, age) => {
    setRoomConfigs(prev => {
      const newConfigs = [...prev];
      newConfigs[roomIdx].childrenAges[childIdx] = parseInt(age);
      return newConfigs;
    });
  };

  const handlePassengerChange = (roomIdx, adultIdx, field, value) => {
    setPassengerDetails(prev => {
      const newDetails = [...prev];
      newDetails[roomIdx].adults[adultIdx] = { ...newDetails[roomIdx].adults[adultIdx], [field]: value };
      return newDetails;
    });
  };

  const handleChildPassengerChange = (roomIdx, childIdx, field, value) => {
    setPassengerDetails(prev => {
      const newDetails = [...prev];
      newDetails[roomIdx].children[childIdx] = { ...newDetails[roomIdx].children[childIdx], [field]: value };
      return newDetails;
    });
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 0) {
      if (!bookingData.checkIn) newErrors.checkIn = 'Check-in date is required';
      if (!bookingData.checkOut) newErrors.checkOut = 'Check-out date is required';
      if (bookingData.checkIn && bookingData.checkOut && new Date(bookingData.checkIn) >= new Date(bookingData.checkOut)) {
        newErrors.checkOut = 'Check-out must be after check-in';
      }
    } else if (step === 1) {
      if (!bookingData.clientName) newErrors.clientName = 'Name is required';
      if (!bookingData.clientEmail) newErrors.clientEmail = 'Email is required';
      if (!bookingData.clientPhone) newErrors.clientPhone = 'Phone is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveCurrentBooking = () => {
    const bookingSummary = {
      roomId: room._id,
      roomName: room.roomName,
      resortId: resort._id,
      resortName: resort.name,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      mealPlan: bookingData.mealPlan,
      roomConfigs: [...roomConfigs],
      totalRooms: roomConfigs.length,
      totalAdults: roomConfigs.reduce((sum, config) => sum + config.adults, 0),
      totalChildren: roomConfigs.reduce((sum, config) => sum + config.children, 0)
    };
    setSavedBookings(prev => [...prev, bookingSummary]);
    return bookingSummary;
  };

  const handleBookAnotherRoom = () => {
    // Validate dates first
    if (!bookingData.checkIn || !bookingData.checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }
    // Save current booking
    const currentBooking = saveCurrentBooking();
    
    // Store all bookings in localStorage before navigating
    const allBookings = [...savedBookings, currentBooking];
    localStorage.setItem('pendingBookings', JSON.stringify(allBookings));
    
    toast.success('Booking saved! Select another room.');
    // Navigate back to travel rooms page with resort id
    navigate(`/travel/rooms/${resort._id}`);
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 0) {
        // Save current booking summary before proceeding
        const currentBooking = saveCurrentBooking();
        toast.success('Booking summary saved!');
        
        // Create passenger details for ALL bookings (saved + current)
        const allBookings = [...savedBookings, currentBooking];
        const newPassengerDetails = [];
        
        allBookings.forEach((booking, bookingIdx) => {
          booking.roomConfigs.forEach((config, roomIdx) => {
            newPassengerDetails.push({
              bookingIndex: bookingIdx,
              bookingName: `Booking ${bookingIdx + 1}`,
              roomName: booking.roomName,
              roomNumber: roomIdx + 1,
              adults: Array.from({ length: config.adults }, () => ({
                name: '',
                passport: '',
                country: '',
                arrivalFlightNumber: '',
                arrivalTime: '',
                departureFlightNumber: '',
                departureTime: '',
              })),
              children: Array.from({ length: config.children }, () => ({
                name: '',
                passport: '',
                country: '',
                age: config.childrenAges?.[0] || 0,
                arrivalFlightNumber: '',
                arrivalTime: '',
                departureFlightNumber: '',
                departureTime: '',
              })),
            });
          });
        });
        
        setPassengerDetails(newPassengerDetails);
      }
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!bookingData.clientName || !bookingData.clientEmail || !bookingData.clientPhone) {
        throw new Error('Client information is incomplete');
      }

      // Create bookings for all saved bookings
      const allBookings = savedBookings;
      
      if (!allBookings || allBookings.length === 0) {
        throw new Error('No bookings to submit');
      }

      const bookingPromises = [];
      
      for (const booking of allBookings) {
        const checkInDate = new Date(booking.checkIn);
        const checkOutDate = new Date(booking.checkOut);
        
        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
          throw new Error('Invalid check-in or check-out date');
        }
        
        if (checkOutDate <= checkInDate) {
          throw new Error('Check-out date must be after check-in date');
        }

        const payload = {
          room: booking.roomId,
          guestName: bookingData.clientName.trim(),
          email: bookingData.clientEmail.trim().toLowerCase(),
          phone: bookingData.clientPhone.trim(),
          resort: booking.resortId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          adults: Number(booking.totalAdults),
          children: Number(booking.totalChildren || 0),
          rooms: Number(booking.totalRooms || 1),
          mealPlan: booking.mealPlan,
          totalAmount: 0, // Calculate later if needed
          specialRequests: bookingData.specialRequests?.trim(),
          passengerDetails: passengerDetails.filter(p => p.bookingIndex === allBookings.indexOf(booking)),
        };
        
        // Create both booking and lead for each
        bookingPromises.push(
          Promise.all([
            bookingApi.createBooking(payload),
            bookingApi.createLead({
              guestName: payload.guestName,
              email: payload.email,
              phone: payload.phone,
              resort: payload.resort,
              room: payload.room,
              checkIn: payload.checkIn,
              checkOut: payload.checkOut,
              adults: payload.adults,
              children: payload.children,
              rooms: payload.rooms,
              mealPlan: payload.mealPlan,
              specialRequests: payload.specialRequests,
              totalAmount: payload.totalAmount,
              source: 'Booking',
            })
          ])
        );
      }
      
      await Promise.all(bookingPromises);
      
      // Clear localStorage after successful submission
      localStorage.removeItem('pendingBookings');
      
      toast.success(`${allBookings.length} booking${allBookings.length > 1 ? 's' : ''} created successfully!`);
      setCurrentStep(3); // Go to confirmation
    } catch (error) {
      toast.error('Failed to create booking: ' + error.message);
      console.error('Booking creation error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
    }
  };

  const calculateTotalAmount = () => {
    const nights = calculateNights(bookingData.checkIn, bookingData.checkOut);
    const basePrice = room.price * nights * bookingData.rooms;
    const mealPlanPrice = (bookingData.selectedMealPlan?.price || 0) * nights * (bookingData.adults + bookingData.children) * bookingData.rooms;
    const total = basePrice + mealPlanPrice;
    console.log('Total amount calculation:', { nights, basePrice, mealPlanPrice, total, roomPrice: room.price, rooms: bookingData.rooms });
    return total;
  };

  const steps = [
    { title: 'Dates & Guests', component: DatesGuestsStep },
    { title: 'Client Info', component: ClientInfoStep },
    { title: 'Review', component: ReviewStep },
    { title: 'Confirmation', component: ConfirmationStep },
  ];

  const CurrentComponent = steps[currentStep].component;

  if (!room || !resort) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
              Complete Your Booking
            </h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    index <= currentStep ? 'bg-gold-500 text-white shadow-lg' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`ml-3 text-sm font-medium transition-colors duration-300 ${
                    index <= currentStep ? 'text-gold-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`hidden sm:block w-16 h-0.5 mx-4 transition-colors duration-300 ${
                      index < currentStep ? 'bg-gold-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 sm:p-8 lg:p-10">
          <div className="max-w-4xl mx-auto">
            {currentStep === 0 && (
              <DatesGuestsStep
                hotel={resort}
                room={room}
                bookingData={bookingData}
                handleChange={handleChange}
                errors={errors}
                offers={offers}
                selectedOffer={selectedOffer}
                setSelectedOffer={setSelectedOffer}
                market={bookingData.market}
                marketSurcharge={0} // TODO: implement market surcharge
                basePricePerNight={room.price}
                hotelName={resort.name}
                roomName={room.roomName}
                roomConfigs={roomConfigs}
                handleRoomConfigChange={handleRoomConfigChange}
                handleChildAgeChange={handleChildAgeChange}
                handleNext={nextStep}
                handleBookAnotherRoom={handleBookAnotherRoom}
                savedBookings={savedBookings}
              />
            )}
            {currentStep === 1 && (
              <ClientInfoStep
                bookingData={bookingData}
                handleChange={handleChange}
                errors={errors}
                passengerDetails={passengerDetails}
                handlePassengerChange={handlePassengerChange}
                handleChildPassengerChange={handleChildPassengerChange}
                roomConfigs={roomConfigs}
                savedBookings={savedBookings}
              />
            )}
            {currentStep === 2 && (
              <ReviewStep
                hotel={resort}
                room={room}
                bookingData={bookingData}
                hotelName={resort.name}
                roomName={room.roomName}
                market={bookingData.market}
                marketSurcharge={0}
                basePricePerNight={room.price}
                autoAppliedOffers={autoAppliedOffers}
                selectedOffer={selectedOffer}
                savedBookings={savedBookings}
                passengerDetails={passengerDetails}
              />
            )}
            {currentStep === 3 && (
              <ConfirmationStep
                bookingData={bookingData}
                hotelName={resort.name}
                navigate={navigate}
              />
            )}
          </div>

          {/* Navigation Buttons */}
          {currentStep > 0 && currentStep < 3 && (
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-start">
                {currentStep > 0 && (
                  <button
                    onClick={prevStep}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                  >
                    ← Previous
                  </button>
                )}
              </div>
              <div className="flex justify-end">
                {currentStep === 1 ? (
                  <button
                    onClick={nextStep}
                    className="px-8 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-lg hover:from-gold-600 hover:to-gold-700 transition-all duration-200 font-semibold shadow-lg"
                  >
                    Next →
                  </button>
                ) : currentStep === 2 ? (
                  <button
                    onClick={handleSubmit}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg"
                  >
                    Submit Booking
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;