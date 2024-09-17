const { db } = require("../../services/dynamodb");
const { sendResponse, sendError } = require("../Responses/index");

module.exports.handler = async (event) => {
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

    const rooms = bookedRooms.map((item) => {
      return {
        bookingNumber: item.bookingId,
        checkInDate: item.checkInDate,
        checkOutDate: item.checkOutDate,
        numberOfGuests: item.numberOfGuests, //Change this line to guests and not capacity
        roomType: item.roomTypes,
        bookedBy: item.guestName,
      };
    });

    return sendResponse(200, rooms);
  } catch (error) {
    return sendError(500, "error fetching data");
  }
};
