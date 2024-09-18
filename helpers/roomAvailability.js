const { db } = require("../services/dynamodb");

const checkRoomAvailability = async (roomType) => {
  const result = await db.scan({
    TableName: "hotel-rooms",
    FilterExpression: "roomType = :roomType AND isAvailable = :isAvailable",
    ExpressionAttributeValues: {
      ":roomType": roomType,
      ":isAvailable": true,
    },
  });
  // .promise();

  if (result.Items.length === 0) {
    throw new Error(`No available ${roomType} rooms`);
  }

  return result.Items;
};

module.exports = { checkRoomAvailability };
