const { db } = require("../../services/dynamodb");
const { sendResponse, sendError } = require("../Responses/index");

exports.handler = async (event) => {

    try {
        const bookingId = event.pathParameters.id;
        const checkInDate = event.queryStringParameters.checkInDate;

        const checkIn = new Date(checkInDate);
        const today = new Date();

        const timeDiff = Math.ceil((checkIn - today) / (1000 * 60 * 60 * 24));

        if (timeDiff <= 2) {
            return sendError(400, "Booking can no longer be cancelled")
        }

        const params = {
            TableName: "hotel-bookings",
            Key: {
                bookingId: bookingId,
                checkInDate: checkInDate
            }
        }

        const cancelledBooking = await db.delete(params);
        
        return sendResponse(200, cancelledBooking)
    } catch (error) {
        console.error("Error cancelling booking: ", error);
        return sendError(500, "Could not cancel booking")
    }

}