const { db } = require("../../services/dynamodb");
const { sendResponse, sendError } = require("../Responses");
const { nanoid } = require("nanoid");
const {
  calculatePricePerNight,
} = require("../../helpers/calculatePricePerNight");
const {
  validateBookingRequest,
} = require("../../helpers/validateBookingRequest");
const { checkRoomAvailability } = require("../../helpers/roomAvailability");

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

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const numberOfNights = Math.ceil(
      (checkOut - checkIn) / (1000 * 60 * 60 * 24)
    );

    let availableRooms = [];

    // Check availability for each room type in the booking request
    for (const roomType of roomTypes) {
      const availableRoom = await checkRoomAvailability(
        roomType,
        numberOfGuests
      );

      if (!availableRoom) {
        return sendError(
          400,
          `No available ${roomType} rooms for ${numberOfGuests} guests`
        );
      }
      availableRooms.push(availableRoom); // Collect available room details
    }

    console.log(availableRooms);

    const bookingId = nanoid(10);

    // Calculate total price based on room type and number of nights
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

    // Save the booking to the DynamoDB table
    await db.put({
      TableName: "hotel-bookings",
      Item: booking,
    });
    // .promise();

    return sendResponse(200, {
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return sendError(500, "Could not create booking");
  }
};
