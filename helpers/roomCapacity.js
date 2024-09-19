const { checkRoomAvailability } = require("./roomAvailability");

const checkCapacity = (rooms, numberOfGuests) => {
  return rooms.filter((room) => {
    return room.capacity >= numberOfGuests;
  });
};

const getAvailableRooms = async (roomTypes, numberOfGuests) => {
  let availableRooms = [];

  for (const roomType of roomTypes) {
    // Count how many rooms of this type are requested
    const requestedQuantity = roomTypes.filter(type => type === roomType).length;

    const availableRoom = await checkRoomAvailability(roomType, requestedQuantity);
    availableRooms.push(...availableRoom);
  }

  const matchedRooms = checkCapacity(availableRooms, numberOfGuests);

  if (matchedRooms.length === 0) {
    throw new Error("No rooms available that match the capacity requirements");
  }

  return matchedRooms;
};

module.exports = { checkCapacity, getAvailableRooms };
