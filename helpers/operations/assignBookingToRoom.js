const { db } = require("../../services/dynamodb");

const assignBookingToRoom = async (room, bookingId, bookedBy) => {
  try {
    await db.update({
      TableName: "hotel-rooms",
      Key: {
        roomId: room.roomId,
        roomType: room.roomType,
      },
      UpdateExpression:
        "SET isAvailable = :false, bookingId = :bookingId, bookedBy = :bookedBy",
      ExpressionAttributeValues: {
        ":false": false,
        ":bookingId": bookingId,
        ":bookedBy": bookedBy,
      },
    });
    return true;
  } catch (error) {
    console.error("Error updating room:", error);
    throw new Error("Could not assign room to booking: " + error.message);
  }
};

module.exports = { assignBookingToRoom };
