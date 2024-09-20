const { checkRoomAvailability } = require("./roomAvailability");

const ROOM_CAPACITIES = {
  single: 1,
  double: 2,
  suite: 3,
};

const getAvailableRooms = async (roomRequests, numberOfGuests) => {
  let availableRooms = [];

  for (const { roomType } of roomRequests) {
    const availableRoomsOfType = await checkRoomAvailability(roomType);
    availableRooms.push(...availableRoomsOfType);
  }

  const totalCapacity = availableRooms.reduce(
    (total, room) => total + room.capacity,
    0
  );

  if (totalCapacity < numberOfGuests) {
    throw new Error("Not enough rooms available to accommodate all guests");
  }

  return availableRooms;
};

module.exports = { getAvailableRooms, ROOM_CAPACITIES };
