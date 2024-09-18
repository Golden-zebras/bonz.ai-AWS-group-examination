const { checkRoomAvailability } = require("./roomAvailability");

const checkCapacity = (rooms, numberOfGuests) => {
  return rooms.filter((room) => {
    return room.capacity >= numberOfGuests;
  });
};

const getAvailableRooms = async (roomTypes, numberOfGuests) => {
  let availableRooms = [];

  for (const roomType of roomTypes) {
    const availableRoom = await checkRoomAvailability(roomType);
    availableRooms.push(...availableRoom);
  }

  const matchedRooms = checkCapacity(availableRooms, numberOfGuests);

  if (matchedRooms.length === 0) {
    throw new Error("No rooms available that match the capacity requirements");
  }

  return matchedRooms;
};

module.exports = { checkCapacity, getAvailableRooms };
