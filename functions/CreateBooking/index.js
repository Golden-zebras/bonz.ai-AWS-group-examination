const { db } = require("../../services/dynamodb");
const { sendResponse, sendError } = require("../Responses");
const { nanoid } = require("nanoid");
const {
  calculatePricePerNight,
} = require("../../helpers/calculatePricePerNight");
const {
  validateBookingRequest,
} = require("../../helpers/validateBookingRequest");

exports.handler = async (event) => {
  if (!event.body) {
    return sendError(400, "Missing request body");
  }

  try {
    const bookingData = JSON.parse(event.body);
    const validationResult = validateBookingRequest(bookingData);
    if (!validationResult.valid) {
      return sendError(400, validationResult.message);
    }

    const {
      numberOfGuests,
      roomTypes,
      checkInDate,
      checkOutDate,
      guestName,
      guestEmail,
    } = bookingData;

    const bookingId = nanoid(10);
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const numberOfNights = Math.ceil(
      (checkOut - checkIn) / (1000 * 60 * 60 * 24)
    );

    let totalPrice = 0;
    for (const roomType of roomTypes) {
      totalPrice += calculatePricePerNight(roomType, numberOfNights);
    }

    const booking = {
      bookingId,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      numberOfGuests,
      roomTypes,
      guestName,
      guestEmail,
      totalPrice,
      createdAt: new Date().toISOString(),
    };

    await db.put({
      TableName: "hotel-bookings",
      Item: booking,
    });

    return sendResponse(200, {
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return sendError(500, "Could not create booking");
  }
};
