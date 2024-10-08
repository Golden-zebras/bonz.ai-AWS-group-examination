const { db } = require("../../services/dynamodb");
const { sendResponse, sendError } = require("../Responses");
const { nanoid } = require("nanoid");
const {
  calculatePricePerNight,
} = require("../../helpers/utils/calculatePricePerNight");
const {
  validateBookingRequest,
} = require("../../helpers/validators/validateBookingRequest");
const { getAvailableRooms } = require("../../helpers/operations/roomCapacity");
const {
  assignBookingToRoom,
} = require("../../helpers/operations/assignBookingToRoom");

exports.handler = async (event) => {
  if (!event.body) {
    return sendError(400, "Missing request body");
  }

  try {
    const bookingData = JSON.parse(event.body);
    const validationResult = await validateBookingRequest(bookingData);
    if (!validationResult.valid) {
      return sendError(400, validationResult.message);
    }

    const {
      numberOfGuests,
      roomRequests,
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
      let totalPrice = 0;
      const assignedRooms = [];

      const availableRooms = await getAvailableRooms(
        roomRequests,
        numberOfGuests
      );

      console.log("Available rooms:", availableRooms);

      const bookingId = nanoid(10);

      for (const roomRequest of roomRequests) {
        const { roomType, quantity } = roomRequest;

        const roomsOfType = availableRooms.filter(
          (room) => room.roomType === roomType
        );

        for (let i = 0; i < quantity; i++) {
          const room = roomsOfType[i];
          if (!room) break;

          console.log(`Assigning room ${room.roomId} to guest ${guestName}`);

          await assignBookingToRoom(room, bookingId, guestName);
          assignedRooms.push({
            roomNumber: room.roomId,
            roomType: room.roomType,
          });
          totalPrice += calculatePricePerNight(room.roomType, numberOfNights);
        }
      }

      const booking = {
        bookingId,
        checkInDate: checkIn.toISOString().split("T")[0],
        checkOutDate: checkOut.toISOString().split("T")[0],
        numberOfGuests,
        roomRequests,
        guestName,
        guestEmail,
        totalPrice,
        assignedRooms,
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
      return sendError(400, error.message);
    }
  } catch (error) {
    console.error("Error creating booking:", error);
    return sendError(500, "Could not create booking");
  }
};
