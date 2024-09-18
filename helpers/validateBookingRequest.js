function validateBookingRequest(bookingData) {
  const { guestName, guestEmail, checkInDate, checkOutDate } = bookingData;

  if (!guestName || typeof guestName !== "string" || guestName.trim() === "") {
    return {
      valid: false,
      message: "Name is required and can not be empty",
    };
  }

  if (
    !guestEmail ||
    typeof guestEmail !== "string" ||
    guestEmail.trim() === "" ||
    !guestEmail.includes("@")
  ) {
    return {
      valid: false,
      message: "Email is required with @ sign and can not be empty",
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

  return { valid: true, message: "Booking request is valid" };
}

module.exports = { validateBookingRequest };
