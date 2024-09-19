const { db } = require('../../services/dynamodb');
const { sendResponse, sendError } = require('../Responses/index');

module.exports.handler = async () => {
  try {
    // Search and store database items
    const result = await db.scan({
      TableName: 'hotel-bookings',
    });

    // If there are no items send response
    if (result.Items.length === 0) {
      return sendResponse(200, { message: 'No booked rooms' });
    }

    // Map over items and save each one in rooms
    const rooms = result.Items.map((item) => {
      return {
        bookingNumber: item.bookingId,
        checkInDate: item.checkInDate,
        checkOutDate: item.checkOutDate,
        numberOfGuests: item.numberOfGuests,
        roomType: item.roomTypes,
        bookedBy: item.guestName,
        rooms: item.assignedRooms,
      };
    });

    // Send response with all rooms
    return sendResponse(200, rooms);
  } catch (error) {
    return sendError(500, 'error fetching data');
  }
};
