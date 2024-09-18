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
const { checkCapacity} = require("../../helpers/roomCapacity")


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

    for (const roomType of roomTypes) {
      const availableRoom = await checkRoomAvailability(roomType, numberOfGuests);
      if (!availableRoom) {
        return sendError(
          400,
          `No available ${roomType} rooms for ${numberOfGuests} guests`
        );
      }
      availableRooms.push(...availableRoom);
    }

    console.log(availableRooms);

    const matchedRooms = checkCapacity(availableRooms, numberOfGuests);

    if (matchedRooms.length === 0) {
      return sendError(400, "No rooms available that match the capacity");
    }

    const firstAvailableRoom = matchedRooms[0];
    console.log("First available room:", firstAvailableRoom);

    const bookingId = nanoid(10);

    let totalPrice = 0;
    totalPrice += calculatePricePerNight(firstAvailableRoom.roomType, numberOfNights);

    const booking = {
      bookingId,
      checkInDate,
      checkOutDate,
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
