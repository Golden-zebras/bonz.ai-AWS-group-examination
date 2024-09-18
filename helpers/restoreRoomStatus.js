const { db } = require("../services/dynamodb");

const restoreRoomStatus = async (roomId, roomType) => {
  try {
    await db.update({
      TableName: "hotel-rooms",
      Key: {
        roomId: roomId,
        roomType: roomType,
      },
      UpdateExpression: "SET isAvailable = :true, bookingId = :null, bookedBy = :null",
      ExpressionAttributeValues: {
        ":true": true,
        ":null": null,
      },
    });
    return true;
  } catch (error) {
    console.error("Error restoring room status:", error);
    throw new Error("Could not restore room status");
  }
};

module.exports = { restoreRoomStatus };
