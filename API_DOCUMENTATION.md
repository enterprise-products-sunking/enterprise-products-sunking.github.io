# ShiftSync API Documentation

Welcome to the ShiftSync API documentation. This document is intended for frontend developers to understand and integrate our services.

## Base URL

- Development: `http://localhost:8000/api/v1`
- Production: `[TBD]`

## Authentication

Our API uses JWT (JSON Web Token) for authentication.

1. **Login**: Request an OTP via email.
2. **Verify**: Exchange the OTP for a Token Pair (Access + Refresh).
3. **Authorize**: Include the Access Token in the header of subsequent requests:
   `Authorization: Bearer <your_access_token>`

---

## 🔐 Auth Endpoints

### Request OTP

`POST /auth/login`

- **Body**: `{"email": "user@example.com"}`
- **Success**: Sends a 6-digit code to the user's email.

### Verify OTP

`POST /auth/verify`

- **Body**: `{"email": "user@example.com", "otp": "123456"}`
- **Response**:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "role": "member",
  "token_type": "bearer"
}
```

### Refresh Token

`POST /auth/refresh`

- **Body**: `{"refresh_token": "..."}`
- **Response**: A new pair of Access and Refresh tokens, plus the user's `role`.

### Resend OTP

`POST /auth/resend`

- **Body**: `{"email": "user@example.com"}`

---

## 👤 User Endpoints

### Get My Profile

`GET /users/me` (Auth Required)

- **Summary**: Returns profile info for the logged-in user.

### List All Users

`GET /users` (Admin Only)

### Create User

`POST /users` (Admin Only)

### Update Profile

`PATCH /users/{user_id}` (Auth Required)

- **Note**: Users can only update their own profile. Admins can update any profile.

---

## 📅 Shift Endpoints

### Global Shift List

`GET /shifts` (Auth Required)

- **Summary**: List all `confirmed` and `pending_confirmation` shifts.
- **Includes**: Full Name, Email, and Phone Number of the assigned user.

### My Shifts

`GET /my-shifts` (Auth Required)

- **Summary**: List shifts specifically assigned to the current user.

### Create Shift

`POST /shifts` (Admin Only)

### Update/Delete Shift

`PUT /shifts/{id}` or `DELETE /shifts/{id}` (Admin Only)

### Approve/Reject Assignment

`POST /shifts/{id}/approve` or `POST /shifts/{id}/reject`

- **Note**: Only the assigned user (owner) can confirm or reject their shift.

---

## 🔄 Marketplace Endpoints

### Get Marketplace

`GET /marketplace`

- **Summary**: View open shift swap requests.

### Create Swap Request

`POST /swaps/create`

- **Body**:

```json
{
  "offered_shift_assignment_id": "...",
  "target_shift_assignment_id": "...",
  "note": "Optional note"
}
```

### Propose Swap

`POST /swaps/{id}/propose`

- **Body**: `{"target_shift_assignment_id": "..."}`

---

## 💡 Notes

- **Timezones**: All timestamps are in ISO 8601 UTC.
- **Errors**: Most errors return a standard `{"detail": "Error message"}` payload.
- **Roles**: Use the `/users/me` endpoint to verify the `role` ("admin" or "member") to show/hide UI components.
