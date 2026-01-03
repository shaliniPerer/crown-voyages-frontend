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
}) => {
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

            {/* Room Config */}
            <div className="mb-10">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Room Configuration</h3>
              {roomConfigs.map((config, roomIdx) => (
                <div key={roomIdx} className="space-y-5">
                  <p className="text-base font-medium text-gray-700">Room {roomIdx + 1}</p>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-500">Adults</label>
                      <input
                        type="number"
                        value={config.adults}
                        onChange={(e) => handleRoomConfigChange(roomIdx, "adults", e.target.value)}
                        className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:border-yellow-500 outline-none text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-500">Children</label>
                      <input
                        type="number"
                        value={config.children}
                        onChange={(e) => handleRoomConfigChange(roomIdx, "children", e.target.value)}
                        className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:border-yellow-500 outline-none text-base"
                      />
                    </div>
                  </div>
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
                <option value="Half Board">Half Board</option>
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

           
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatesGuestsStep;
