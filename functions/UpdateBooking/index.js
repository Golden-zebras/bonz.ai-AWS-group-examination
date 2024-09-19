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

    const { numberOfGuests, roomRequests, checkInDate, checkOutDate } =
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

    // Handle multiple rooms
    for (const assignedRoom of existingBooking.assignedRooms) {
      await restoreRoomStatus(assignedRoom.roomNumber, assignedRoom.roomType);
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const numberOfNights = Math.ceil(
      (checkOut - checkIn) / (1000 * 60 * 60 * 24)
    );

    let availableRooms;
    try {
      availableRooms = await getAvailableRooms(roomRequests, numberOfGuests);
    } catch (error) {
      return sendError(404, error.message);
    }

    let totalPrice = 0;
    const assignedRooms = [];

    for (const room of availableRooms) {
      await assignBookingToRoom(room, bookingId, existingBooking.guestName);
      assignedRooms.push({
        roomNumber: room.roomId,
        roomType: room.roomType,
      });
      totalPrice += calculatePricePerNight(room.roomType, numberOfNights);
    }

    const updateParams = {
      TableName: "hotel-bookings",
      Key: {
        bookingId: bookingId,
        checkInDate: existingBooking.checkInDate,
      },
      UpdateExpression:
        "SET checkOutDate = :checkOutDate, numberOfGuests = :numberOfGuests, roomRequests = :roomRequests, assignedRooms = :assignedRooms, totalPrice = :totalPrice, updatedAt = :updatedAt, #status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":checkOutDate": checkOut.toISOString().split("T")[0],
        ":numberOfGuests": numberOfGuests,
        ":roomRequests": roomRequests,
        ":assignedRooms": assignedRooms,
        ":totalPrice": totalPrice,
        ":updatedAt": new Date().toISOString(),
        ":status": "Updated",
      },
      ReturnValues: "ALL_NEW",
    };

    const result = await db.update(updateParams);

    return sendResponse(200, {
      message: "Booking updated successfully",
      updatedBooking: result.Attributes,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    return sendError(500, "Could not update booking");
  }
};
