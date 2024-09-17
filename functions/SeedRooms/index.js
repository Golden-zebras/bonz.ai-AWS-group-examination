const { db } = require('../../services/dynamodb'); // Anslutning till DynamoDB
const { sendResponse } = require('../Responses/index'); // Anpassad funktion för att skicka svar
const { nanoid } = require('nanoid'); // nanoid används för att skapa unika ID:n

const seedRooms = async (event, context) => {
  // Array med rum för seedning
  const rooms = [
    { type: 'suite', capacity: 3, price: 1500, isAvailable: true },
    { type: 'suite', capacity: 3, price: 1500, isAvailable: true },
    { type: 'suite', capacity: 3, price: 1500, isAvailable: true },
    { type: 'single', capacity: 1, price: 500, isAvailable: true },
    { type: 'single', capacity: 1, price: 500, isAvailable: true },
    { type: 'single', capacity: 1, price: 500, isAvailable: true },
    { type: 'single', capacity: 1, price: 500, isAvailable: true },
    { type: 'single', capacity: 1, price: 500, isAvailable: true },
    { type: 'single', capacity: 1, price: 500, isAvailable: true },
    { type: 'single', capacity: 1, price: 500, isAvailable: true },
    { type: 'single', capacity: 1, price: 500, isAvailable: true },
    { type: 'single', capacity: 1, price: 500, isAvailable: true },
    { type: 'double', capacity: 2, price: 1000, isAvailable: true },
    { type: 'double', capacity: 2, price: 1000, isAvailable: true },
    { type: 'double', capacity: 2, price: 1000, isAvailable: true },
    { type: 'double', capacity: 2, price: 1000, isAvailable: true },
    { type: 'double', capacity: 2, price: 1000, isAvailable: true },
    { type: 'double', capacity: 2, price: 1000, isAvailable: true },
    { type: 'double', capacity: 2, price: 1000, isAvailable: true },
    { type: 'double', capacity: 2, price: 1000, isAvailable: true },
  ]; // 3 sviter, 9 single, 8 double

  // Använd Promise.all för att vänta på alla asynkrona put-operationer
  await Promise.all(
    rooms.map(async (room) => {
      room.id = nanoid(10); // Skapar unikt ID för varje rum
      await db.put({
        TableName: 'hotel-bookings',
        Item: {
          bookingId: room.id,
          checkInDate: room.id, // Sorteringsnyckel för att hålla det unikt
          ...room, // Lägg till alla rumsegenskaper
        },
      });
      // .promise(); // Gör det till ett Promise så vi kan vänta på det
    })
  );

  return sendResponse(rooms); // Returnerar alla rum när seedningen är klar
};

exports.handler = seedRooms;
