function validateBookingRequest(bookingData, isUpdate = false) {
  const {
    guestName,
    guestEmail,
    checkInDate,
    checkOutDate,
    numberOfGuests,
    roomRequests,  // Cambiato da roomTypes a roomRequests
  } = bookingData;

  if (!isUpdate) {
    // Validate guest info only for new bookings
    if (
      !guestName ||
      typeof guestName !== "string" ||
      guestName.trim() === ""
    ) {
      return { valid: false, message: "Name is required and cannot be empty" };
    }

    if (
      !guestEmail ||
      typeof guestEmail !== "string" ||
      guestEmail.trim() === "" ||
      !guestEmail.includes("@")
    ) {
      return {
        valid: false,
        message: "Email is required with @ sign and cannot be empty",
      };
    }
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    return { valid: false, message: "Invalid check-in or check-out date" };
  }

  if (!isUpdate) {
    const today = new Date();
    if (checkIn < today) {
      return { valid: false, message: "Check-in date cannot be in the past" };
    }
  }

  if (checkOut <= checkIn) {
    return {
      valid: false,
      message: "Check-out date must be after check-in date",
    };
  }

  if (
    !numberOfGuests ||
    typeof numberOfGuests !== "number" ||
    numberOfGuests < 1
  ) {
    return { valid: false, message: "Number of guests must be at least 1" };
  }

  // Validazione roomRequests (array di richieste di stanze)
  if (!roomRequests || !Array.isArray(roomRequests) || roomRequests.length === 0) {
    return { valid: false, message: "At least one room request must be provided" };
  }

  for (const request of roomRequests) {
    const { roomType, quantity } = request;

    if (!roomType || typeof roomType !== "string" || roomType.trim() === "") {
      return { valid: false, message: "Room type is required and cannot be empty" };
    }

    if (!quantity || typeof quantity !== "number" || quantity < 1) {
      return { valid: false, message: `Quantity for room type ${roomType} must be at least 1` };
    }
  }

  return { valid: true, message: "Booking request is valid" };
}

module.exports = { validateBookingRequest };
