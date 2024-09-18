const { db } = require("../../services/dynamodb");
const { sendResponse, sendError } = require("../Responses/index");

module.exports.handler = async () => {
  try {
    const result = await db.scan({
      TableName: "hotel-bookings",
    });

    const bookedRooms = result.Items.filter(
      (item) =>
        item.isAvailable === false ||
        item.isAvailable === null ||
        item.isAvailable === "" ||
        item.isAvailable === undefined
    );

    if (bookedRooms.length === 0) {
      return sendResponse(200, { message: "No booked rooms" });
    }

    const rooms = bookedRooms.map((item) => {
      return {
        bookingNumber: item.bookingId,
        checkInDate: item.checkInDate,
        checkOutDate: item.checkOutDate,
        numberOfGuests: item.numberOfGuests,
        roomType: item.roomTypes,
        bookedBy: item.guestName,
      };
    });

    return sendResponse(200, rooms);
  } catch (error) {
    return sendError(500, "error fetching data");
  }
};
