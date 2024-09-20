# Hotel Booking API

This project implements a serverless API for hotel room booking using AWS Lambda and API Gateway.

## API Base URL

https://yaap12zvnj.execute-api.eu-north-1.amazonaws.com/

## Endpoints

### 1. Seed Rooms

Initializes the database with room data.

- **URL:** `/seed/rooms`
- **Method:** POST

### 2. Book Room

Creates a new booking.

- **URL:** `/bookings`
- **Method:** POST
- **Headers:**
  - Content-Type: application/json
- **Body:**
  ```json
  {
    "numberOfGuests": 3,
    "roomRequests": [
      {
        "roomType": "double",
        "quantity": 1
      },
      {
        "roomType": "single",
        "quantity": 1
      }
    ],
    "checkInDate": "2024-09-22",
    "checkOutDate": "2024-09-24",
    "guestName": "John Doe",
    "guestEmail": "john.doe@example.com"
  }
  ```

### 3. Update Booking

Modifies an existing booking.

- **URL:** `/bookings/{bookingId}`
- **Method:** PUT
- **Headers:**
  - Content-Type: application/json
- **Body:**
  ```json
  {
    "numberOfGuests": 3,
    "roomRequests": [
      {
        "roomType": "double",
        "quantity": 1
      },
      {
        "roomType": "single",
        "quantity": 1
      }
    ],
    "checkInDate": "2024-09-22",
    "checkOutDate": "2024-09-24"
  }
  ```

### 4. Delete Booking

Cancels an existing booking.

- **URL:** `/bookings/cancel`
- **Method:** DELETE
- **Headers:**
  - Content-Type: application/json
- **Body:**
  ```json
  {
    "bookingId": "4jRvCUw6na",
    "checkInDate": "2024-09-22"
  }
  ```

### 5. Get All Bookings (Admin)

Retrieves all bookings.

- **URL:** `/bookings`
- **Method:** GET
- **Headers:**
  - Content-Type: application/json

## Usage

You can use tools like Postman or curl to interact with these endpoints. Make sure to replace `{bookingId}` with an actual booking ID when updating bookings.

## Notes

- This API is deployed on AWS and uses Lambda functions with API Gateway.
- Ensure proper error handling and input validation when interacting with the API.
- The API uses JSON for request and response bodies.

## Postman Collection

There is a Postman collection in the repository that you can use to test the API.
