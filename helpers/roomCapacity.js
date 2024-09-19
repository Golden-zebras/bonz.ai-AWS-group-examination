const { checkRoomAvailability } = require("./roomAvailability");

const getAvailableRooms = async (roomRequests, numberOfGuests) => {
  let availableRooms = [];

 
  for (const { roomType, quantity } of roomRequests) {
    
    const availableRoom = await checkRoomAvailability(roomType, quantity);
    
  
    availableRooms.push(...availableRoom);
  }

  
  const totalCapacity = availableRooms.reduce((total, room) => total + room.capacity, 0);

  
  if (totalCapacity < numberOfGuests) {
    throw new Error("Not enough rooms assigned to accommodate all guests");
  }

  
  const finalAvailableRooms = [];

  for (const { roomType, quantity } of roomRequests) {
    const roomsOfType = availableRooms.filter(room => room.roomType === roomType);
    
    if (roomsOfType.length < quantity) {
      throw new Error(`Not enough available rooms of type ${roomType}`);
    }

   
    finalAvailableRooms.push(...roomsOfType.slice(0, quantity));
  }

  return finalAvailableRooms;
};

module.exports = { getAvailableRooms };
