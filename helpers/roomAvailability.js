const { db } = require("../services/dynamodb");

const checkRoomAvailability = async (roomType, requestedQuantity) => {
  const result = await db.scan({
    TableName: "hotel-rooms",
    FilterExpression: "roomType = :roomType AND isAvailable = :isAvailable",
    ExpressionAttributeValues: {
      ":roomType": roomType,
      ":isAvailable": true,
    },
  });
  
  const availableRooms = result.Items;
  if (availableRooms.length < requestedQuantity) {
    throw new Error(
      `Not enough available ${roomType} rooms. Requested: ${requestedQuantity}, Available: ${availableRooms.length}`
    );
  }

  // Return only the requested number of rooms
  return availableRooms.slice(0, requestedQuantity);
};

module.exports = { checkRoomAvailability };
