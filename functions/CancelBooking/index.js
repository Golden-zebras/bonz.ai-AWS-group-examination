const { db } = require("../../services/dynamodb");
const { sendResponse, sendError } = require("../Responses/index");
const { restoreRoomStatus } = require("../../helpers/restoreRoomStatus");

exports.handler = async (event) => {
  try {
    if (!event.body) {
      return sendError(400, "Missing request body");
    }

    const { bookingId, checkInDate } = JSON.parse(event.body);

    if (!bookingId || !checkInDate) {
      return sendError(400, "Missing bookingId or checkInDate");
    }

    const params = {
      TableName: "hotel-bookings",
      Key: {
        bookingId: bookingId,
        checkInDate: checkInDate,
      },
    };

    const result = await db.get(params);

    if (!result.Item) {
      return sendError(404, "Booking not found");
    }

    const booking = result.Item;
    const checkIn = new Date(checkInDate);
    const cancellationDeadline = new Date(
      checkIn.getTime() - 2 * 24 * 60 * 60 * 1000
    );
    const today =
      event.body && JSON.parse(event.body).currentDate
        ? new Date(JSON.parse(event.body).currentDate)
        : new Date();

    if (today >= cancellationDeadline) {
      return sendError(
        400,
        "Booking can no longer be cancelled (less than 2 days before check-in)"
      );
    }

    for (const room of booking.assignedRooms) {
      try {
        await restoreRoomStatus(room.roomNumber, room.roomType);
      } catch (restoreError) {
        console.error("Error restoring room status:", restoreError);
      }
    }

    await db.delete(params);

    return sendResponse(200, { message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling booking: ", error);
    return sendError(500, "Could not cancel booking");
  }
};
