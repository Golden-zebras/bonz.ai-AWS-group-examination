const { db } = require("../../services/dynamodb");
const { sendResponse, sendError } = require("../Responses");
const { nanoid } = require("nanoid");

exports.handler = async (event) => {
  if (!event.body) {
    return sendError(400, "Missing request body");
  }

  

  try {
    const bookingData = JSON.parse(event.body);
    const {
      numberOfGuests,
      roomTypes,
      checkInDate,
      checkOutDate,
      guestName,
      guestEmail,
    } = bookingData;

    // här validerar vi input bara
    if (
      !numberOfGuests ||
      !roomTypes ||
      !checkInDate ||
      !checkOutDate ||
      !guestName ||
      !guestEmail
    ) {
      return sendError(400, "Missing required fields");
    }

    const bookingId = nanoid(10);
    const booking = {
      bookingId,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      numberOfGuests,
      roomTypes,
      guestName,
      guestEmail,
      createdAt: new Date().toISOString(),
    };

    // här sparar vi bokningen i databasen
    await db.put({
      TableName: "hotel-bookings",
      Item: booking,
    });

    return sendResponse(booking);
  } catch (error) {
    console.error("Error creating booking:", error);
    return sendError(500, "Could not create booking");
  }
};

// //    {
// //      "numberOfGuests": 2,
// //      "roomTypes": ["double"],
// //      "checkInDate": "2023-06-15",
// //      "checkOutDate": "2023-06-17",
// //      "guestName": "test testsson",
// //      "guestEmail": "testtestsson@example.com"
// //    }

// för postman
