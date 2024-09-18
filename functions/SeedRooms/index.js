const { db } = require("../../services/dynamodb");
const { sendResponse } = require("../Responses/index");
// const { nanoid } = require("nanoid");

const seedRooms = async (event, context) => {
  const rooms = [
    // Sviter
    {
      type: "suite",
      capacity: 3,
      price: 1500,
      isAvailable: true,
      roomNumber: 301,
    },
    {
      type: "suite",
      capacity: 3,
      price: 1500,
      isAvailable: true,
      roomNumber: 302,
    },
    {
      type: "suite",
      capacity: 3,
      price: 1500,
      isAvailable: true,
      roomNumber: 303,
    },

    // Enkelrum
    {
      type: "single",
      capacity: 1,
      price: 500,
      isAvailable: true,
      roomNumber: 101,
    },
    {
      type: "single",
      capacity: 1,
      price: 500,
      isAvailable: true,
      roomNumber: 102,
    },
    {
      type: "single",
      capacity: 1,
      price: 500,
      isAvailable: true,
      roomNumber: 103,
    },
    {
      type: "single",
      capacity: 1,
      price: 500,
      isAvailable: true,
      roomNumber: 104,
    },
    {
      type: "single",
      capacity: 1,
      price: 500,
      isAvailable: true,
      roomNumber: 105,
    },
    {
      type: "single",
      capacity: 1,
      price: 500,
      isAvailable: true,
      roomNumber: 106,
    },
    {
      type: "single",
      capacity: 1,
      price: 500,
      isAvailable: true,
      roomNumber: 107,
    },
    {
      type: "single",
      capacity: 1,
      price: 500,
      isAvailable: true,
      roomNumber: 108,
    },
    {
      type: "single",
      capacity: 1,
      price: 500,
      isAvailable: true,
      roomNumber: 109,
    },

    // Dubbelrum
    {
      type: "double",
      capacity: 2,
      price: 1000,
      isAvailable: true,
      roomNumber: 201,
    },
    {
      type: "double",
      capacity: 2,
      price: 1000,
      isAvailable: true,
      roomNumber: 202,
    },
    {
      type: "double",
      capacity: 2,
      price: 1000,
      isAvailable: true,
      roomNumber: 203,
    },
    {
      type: "double",
      capacity: 2,
      price: 1000,
      isAvailable: true,
      roomNumber: 204,
    },
    {
      type: "double",
      capacity: 2,
      price: 1000,
      isAvailable: true,
      roomNumber: 205,
    },
    {
      type: "double",
      capacity: 2,
      price: 1000,
      isAvailable: true,
      roomNumber: 206,
    },
    {
      type: "double",
      capacity: 2,
      price: 1000,
      isAvailable: true,
      roomNumber: 207,
    },
    {
      type: "double",
      capacity: 2,
      price: 1000,
      isAvailable: true,
      roomNumber: 208,
    },
  ]; // 3 sviter, 9 single, 8 double

  await Promise.all(
    rooms.map(async (room) => {
      // room.id = nanoid(10);
      await db.put({
        TableName: "hotel-rooms",
        Item: {
          roomId: room.roomNumber.toString(),
          roomType: room.type,
          capacity: room.capacity,
          price: room.price,
          isAvailable: room.isAvailable,
        },
      });
    })
  );

  return sendResponse(200, rooms);
};

exports.handler = seedRooms;
