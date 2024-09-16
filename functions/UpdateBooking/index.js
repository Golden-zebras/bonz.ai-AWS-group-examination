const { sendResponse, sendError } = require("../Responses/index");
const { db } = require("../../services/dynamodb")

const updateBooking = async (event) => {
    const { id } = event.pathParameters;
    const body = JSON.parse(event.body);

    try {
        const result =  await db.update ( {
            TableName:"hotel-bookings",
            Key: {
                bookingId : id, 
            },

            UpdateExpression: "SET checkInDate = :checkInDate", // checkOutDate = :checkOutDate, guests = :guests, roomType = :roomType,
            ExpressionAttributeValues: {
               /*  ":guests": body.guests,
                ":roomType": body.roomType,  */
                ":checkInDate": body.checkInDate, 
             /*    ":checkOutDate": body.checkOutDate,  */
              },
              ReturnValues: "UPDATED_NEW" 
        })

        return sendResponse (200, result.Attributes);
    } catch (error) {
        console.error("Error updating booking:", error);
        return sendError("Could not update booking");
    }

}

exports.handler = updateBooking;
