const { db } = require("../../services/dynamodb");
const { sendResponse, sendError } = require("../Responses");
const { nanoid } = require("nanoid");
const {
  calculatePricePerNight,
} = require("../../helpers/calculatePricePerNight");
const {
  validateBookingRequest,
} = require("../../helpers/validateBookingRequest");
const { getAvailableRooms } = require("../../helpers/roomCapacity");
const { assignBookingToRoom } = require("../../helpers/assignBookingToRoom");

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

    try {
      const matchedRooms = await getAvailableRooms(roomTypes, numberOfGuests);
      const firstAvailableRoom = matchedRooms[0];
      console.log("First available room:", firstAvailableRoom);

      const bookingId = nanoid(10);

      let totalPrice = calculatePricePerNight(
        firstAvailableRoom.roomType,
        numberOfNights
      );

      const booking = {
        bookingId,
        checkInDate,
        checkOutDate,
        numberOfGuests,
        roomTypes,
        guestName,
        guestEmail,
        totalPrice,
        roomNumber: firstAvailableRoom.roomId,
        createdAt: new Date().toISOString(),
      };

      await assignBookingToRoom(firstAvailableRoom, bookingId, guestName)

      await db.put({
        TableName: "hotel-bookings",
        Item: booking,
      });

      return sendResponse(200, {
        message: "Booking created successfully",
        booking,
      });
    } catch (error) {
      return sendError(400, error.message);
    }
  } catch (error) {
    console.error("Error creating booking:", error);
    return sendError(500, "Could not create booking");
  }
};
