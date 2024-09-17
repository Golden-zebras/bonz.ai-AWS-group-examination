const { db } = require("../../services/dynamodb");
const { sendResponse } = require("../Responses/index");
const { nanoid } = require("nanoid");

const seedRooms = async (event, context) => {
  const rooms = [
    { type: "suite", capacity: 3, price: 1500, isAvailable: true },
    { type: "suite", capacity: 3, price: 1500, isAvailable: true },
    { type: "suite", capacity: 3, price: 1500, isAvailable: true },
    { type: "single", capacity: 1, price: 500, isAvailable: true },
    { type: "single", capacity: 1, price: 500, isAvailable: true },
    { type: "single", capacity: 1, price: 500, isAvailable: true },
    { type: "single", capacity: 1, price: 500, isAvailable: true },
    { type: "single", capacity: 1, price: 500, isAvailable: true },
    { type: "single", capacity: 1, price: 500, isAvailable: true },
    { type: "single", capacity: 1, price: 500, isAvailable: true },
    { type: "single", capacity: 1, price: 500, isAvailable: true },
    { type: "single", capacity: 1, price: 500, isAvailable: true },
    { type: "double", capacity: 2, price: 1000, isAvailable: true },
    { type: "double", capacity: 2, price: 1000, isAvailable: true },
    { type: "double", capacity: 2, price: 1000, isAvailable: true },
    { type: "double", capacity: 2, price: 1000, isAvailable: true },
    { type: "double", capacity: 2, price: 1000, isAvailable: true },
    { type: "double", capacity: 2, price: 1000, isAvailable: true },
    { type: "double", capacity: 2, price: 1000, isAvailable: true },
    { type: "double", capacity: 2, price: 1000, isAvailable: true },
  ]; // 3 sviter, 9 single, 8 double

  await Promise.all(
    rooms.map(async (room) => {
      room.id = nanoid(10);
      await db.put({
        TableName: "hotel-bookings",
        Item: {
          bookingId: room.id,
          checkInDate: room.id,
          ...room,
        },
      });
    })
  );

  return sendResponse(200, rooms);
};

exports.handler = seedRooms;
