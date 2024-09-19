const { db } = require("../../services/dynamodb");
const { sendResponse, sendError } = require("../Responses");
const {
  validateBookingRequest,
} = require("../../helpers/validateBookingRequest");
const { getAvailableRooms } = require("../../helpers/roomCapacity");
const { assignBookingToRoom } = require("../../helpers/assignBookingToRoom");
const { restoreRoomStatus } = require("../../helpers/restoreRoomStatus");
const {
  calculatePricePerNight,
} = require("../../helpers/calculatePricePerNight");

exports.handler = async (event) => {
  if (!event.pathParameters || !event.pathParameters.id) {
    return sendError(400, "Missing booking ID");
  }

  if (!event.body) {
    return sendError(400, "Missing request body");
  }

  try {
    const bookingId = event.pathParameters.id;
    const bookingData = JSON.parse(event.body);
    const validationResult = validateBookingRequest(bookingData, true);
    if (!validationResult.valid) {
      return sendError(400, validationResult.message);
    }

    const { numberOfGuests, roomTypes, checkInDate, checkOutDate } =
      bookingData;

    const scanParams = {
      TableName: "hotel-bookings",
      FilterExpression: "bookingId = :bookingId",
      ExpressionAttributeValues: {
        ":bookingId": bookingId,
      },
    };

    const scanResult = await db.scan(scanParams);
    if (scanResult.Items.length === 0) {
      return sendError(404, "Booking not found");
    }

    const existingBooking = scanResult.Items[0];
    const originalRoomId = existingBooking.roomNumber;
    const originalRoomType = existingBooking.roomTypes[0];

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const numberOfNights = Math.ceil(
      (checkOut - checkIn) / (1000 * 60 * 60 * 24)
    );

    try {
      await restoreRoomStatus(originalRoomId, originalRoomType);
    } catch (error) {
      return sendError(500, "Could not restore the original room status");
    }

    let availableRooms;
    try {
      availableRooms = await getAvailableRooms(
        roomTypes,
        numberOfGuests,
        checkInDate,
        checkOutDate
      );
    } catch (error) {
      return sendError(404, error.message);
    }

    const firstAvailableRoom = availableRooms[0];

    await assignBookingToRoom(
      firstAvailableRoom,
      bookingId,
      existingBooking.guestName
    );

    const totalPrice = calculatePricePerNight(
      firstAvailableRoom.roomType,
      numberOfNights
    );

    const newBookingItem = {
      bookingId: bookingId,
      checkInDate: checkIn.toISOString().split("T")[0],
      checkOutDate: checkOut.toISOString().split("T")[0],
      numberOfGuests: numberOfGuests,
      roomTypes: roomTypes,
      guestName: existingBooking.guestName,
      guestEmail: existingBooking.guestEmail,
      roomNumber: firstAvailableRoom.roomId,
      totalPrice: totalPrice,
      createdAt: existingBooking.createdAt,
      updatedAt: new Date().toISOString(),
      status: "Updated",
    };

    // Put the new item
    await db.put({
      TableName: "hotel-bookings",
      Item: newBookingItem,
    });

    // Delete the old item
    await db.delete({
      TableName: "hotel-bookings",
      Key: {
        bookingId: bookingId,
        checkInDate: existingBooking.checkInDate,
      },
    });

    return sendResponse(200, {
      message: "Booking updated successfully",
      updatedBooking: newBookingItem,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    return sendError(500, "Could not update booking");
  }
};
