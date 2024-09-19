const { db } = require("../../services/dynamodb");
const { sendResponse, sendError } = require("../Responses");
const { nanoid } = require("nanoid");
const {
  calculatePricePerNight,
} = require("../../helpers/calculatePricePerNight");
const {
  validateBookingRequest,
} = require("../../helpers/validateBookingRequest");
const { getAvailableRooms } = require("../../helpers/roomCapacity");
const { assignBookingToRoom } = require("../../helpers/assignBookingToRoom");

exports.handler = async (event) => {
  if (!event.body) {
    return sendError(400, "Missing request body");
  }

  try {
    const bookingData = JSON.parse(event.body);
    const validationResult = validateBookingRequest(bookingData);
    if (!validationResult.valid) {
      return sendError(400, validationResult.message);
    }

    const {
      numberOfGuests,
      roomRequests,  // Cambiato da roomTypes a roomRequests
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

      // Loop per processare ogni richiesta di stanza
      for (const roomRequest of roomRequests) {
        const { roomType, quantity } = roomRequest;

        // Ottenere stanze disponibili in base al tipo di stanza e alla quantità
        const availableRooms = await getAvailableRooms([roomType], quantity); // Passa roomType come array

        // Verifica che ci siano stanze sufficienti
        if (availableRooms.length < quantity) {
          return sendError(400, `Not enough available rooms of type ${roomType}`);
        }

        // Assegna stanze e calcola il prezzo
        for (let i = 0; i < quantity; i++) {
          const room = availableRooms[i];
          const bookingId = nanoid(10);

          await assignBookingToRoom(room, bookingId, guestName);

          assignedRooms.push({
            roomNumber: room.roomId,
            roomType: room.roomType,
          });

          // Aggiungi il prezzo della stanza al prezzo totale
          totalPrice += calculatePricePerNight(room.roomType, numberOfNights);
        }
      }

      // Creare l'oggetto di prenotazione
      const bookingId = nanoid(10);
      const booking = {
        bookingId,
        checkInDate: checkIn.toISOString().split("T")[0],
        checkOutDate: checkOut.toISOString().split("T")[0],
        numberOfGuests,
        roomRequests,
        guestName,
        guestEmail,
        totalPrice,
        assignedRooms,  // Lista delle stanze assegnate
        createdAt: new Date().toISOString(),
      };

      // Inserisci la prenotazione nel database
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
