const checkCapacity = (rooms, numberOfGuests) => {
    return rooms.filter((room) => room.capacity === numberOfGuests);
  };
  module.exports = { checkCapacity };
  