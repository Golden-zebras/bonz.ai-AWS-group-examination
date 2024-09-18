function validateUpdateBookingRequest(bookingData) {
    const { checkInDate, checkOutDate, numberOfGuests, roomTypes } = bookingData;
  
    if (!checkInDate || !checkOutDate) {
      return {
        valid: false,
        message: "Check-in and check-out dates are required",
      };
    }
  
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
  
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return {
        valid: false,
        message: "Invalid check-in or check-out date",
      };
    }
  
    if (checkIn < today) {
      return {
        valid: false,
        message: "Check-in date cannot be in the past",
      };
    }
  
    if (checkOut <= checkIn) {
      return {
        valid: false,
        message: "Check-out date must be after check-in date",
      };
    }
  
    if (!numberOfGuests || typeof numberOfGuests !== "number" || numberOfGuests <= 0) {
      return {
        valid: false,
        message: "Number of guests must be a positive number",
      };
    }
  
    if (!roomTypes || !Array.isArray(roomTypes) || roomTypes.length === 0) {
      return {
        valid: false,
        message: "At least one room type must be selected",
      };
    }
  
    return { valid: true, message: "Booking request is valid" };
  }
  
  module.exports = { validateUpdateBookingRequest };
  