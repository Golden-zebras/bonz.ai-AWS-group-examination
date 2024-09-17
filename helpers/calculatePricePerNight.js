const ROOM_PRICES = {
  single: 500,
  double: 1000,
  suite: 1500,
};

function calculatePricePerNight(roomType, numberOfNights) {
  if (!ROOM_PRICES[roomType]) {
    throw new Error(`Invalid room type: ${roomType}`);
  }
  return ROOM_PRICES[roomType] * numberOfNights;
}

module.exports = { calculatePricePerNight };
