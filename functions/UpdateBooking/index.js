const { db } = require("../../services/dynamodb");
const { sendResponse, sendError } = require("../Responses");

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
    const { numberOfGuests, roomTypes, checkInDate, checkOutDate } = bookingData;

    if (!numberOfGuests || !roomTypes || !checkInDate || !checkOutDate) {
      return sendError(400, "Missing required fields");
    }

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
    const originalCheckInDate = existingBooking.checkInDate;
    const deleteParams = {
      TableName: "hotel-bookings",
      Key: {
        bookingId: bookingId,
        checkInDate: originalCheckInDate,
      },
    };

    await db.delete(deleteParams);

    const newBookingParams = {
      TableName: "hotel-bookings",
      Item: {
        bookingId: bookingId,
        checkInDate: new Date(checkInDate).toISOString(), 
        checkOutDate: new Date(checkOutDate).toISOString(),
        numberOfGuests: numberOfGuests,
        roomTypes: roomTypes,
        guestName: existingBooking.guestName, 
        email: existingBooking.guestEmail, 
      },
    };

    await db.put(newBookingParams);

    return sendResponse(200, { message: "Booking updated successfully", updatedBooking: newBookingParams.Item });
  } catch (error) {
    console.error("Error updating booking:", error);
    return sendError(500, "Could not update booking");
  }
};
