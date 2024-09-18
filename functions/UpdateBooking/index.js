const { db } = require("../../services/dynamodb");
const { sendResponse, sendError } = require("../Responses");
const { validateUpdateBookingRequest } = require("../../helpers/validateUpdateBookingRequest");
const { getAvailableRooms } = require("../../helpers/roomCapacity");
const { assignBookingToRoom } = require("../../helpers/assignBookingToRoom");
const { calculatePricePerNight } = require("../../helpers/calculatePricePerNight");

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

    const validation = validateUpdateBookingRequest(bookingData);
    if (!validation.valid) {
      return sendError(400, validation.message);
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
    
   
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const numberOfNights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));


    let availableRooms;
    try {
      availableRooms = await getAvailableRooms(roomTypes, numberOfGuests, checkInDate, checkOutDate);
    } catch (error) {
      return sendError(404, error.message); 
    }

    const firstAvailableRoom = availableRooms[0];
    await assignBookingToRoom(firstAvailableRoom, bookingId, existingBooking.guestName); 

   
    const totalPrice = calculatePricePerNight(firstAvailableRoom.roomType, numberOfNights);

    
    const newBookingParams = {
      TableName: "hotel-bookings",
      Item: {
        bookingId: bookingId,
        checkInDate: checkIn.toISOString(),
        checkOutDate: checkOut.toISOString(),
        numberOfGuests: numberOfGuests,
        roomTypes: roomTypes,
        guestName: existingBooking.guestName,
        email: existingBooking.guestEmail,
        roomNumber: firstAvailableRoom.roomId, // Aggiunta del numero della stanza
        totalPrice: totalPrice // Aggiunta del prezzo totale
      },
    };

    await db.put(newBookingParams);

    return sendResponse(200, {
      message: "Booking updated successfully",
      updatedBooking: newBookingParams.Item,
      roomNumber: firstAvailableRoom.roomId, 
      totalPrice: totalPrice 
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    return sendError(500, "Could not update booking");
  }
};
