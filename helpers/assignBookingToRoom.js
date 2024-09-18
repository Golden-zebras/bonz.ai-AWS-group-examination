const { db } = require("../services/dynamodb");

const assignBookingToRoom = async (room, bookingId) => {
  try {
    console.log("Room object:", room);
    console.log("Room number:", room.roomId);
    await db.update({
      TableName: "hotel-rooms",
      Key: {
        roomId: room.roomId,
        roomType: room.roomType,
      },
      UpdateExpression: "SET isAvailable = :false, bookingId = :bookingId",
      ExpressionAttributeValues: {
        ":false": false,
        ":bookingId": bookingId,
      },
    });
    return true;
  } catch (error) {
    console.error("Error updating room:", error);
    throw new Error("Could not assign room to booking");
  }
};

module.exports = { assignBookingToRoom };
