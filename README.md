# ElectroMart

ElectroMart is a full-stack e-commerce platform built using Next.js and Socket.IO.  
It supports multiple roles (user, vendor, admin) and provides real-time features like live orders, product updates, and notifications.

The project is divided into two main parts:
1. Next.js application (frontend + backend)
2. Dedicated Socket.IO server for real-time communication

---

## Live Links

Next.js application (frontend + backend):
https://electro-mart-u5yl.vercel.app

Socket server:
https://electromary-socket-server.onrender.com

---

## Project Overview

ElectroMart allows users to browse products, place orders, and track them in real time.  
Vendors can manage products and orders, while admins control vendor verification.

Real-time updates are handled using a separate socket server to keep the system scalable and responsive.

---

## Roles and Access

### User
- Browse products by category
- Search products
- Place orders (COD) (ONLINE)
- Track order status in real time
- Receive live updates for order status, cancellation, and returns

### Vendor
- Submit shop details for approval
- Manage products (add, edit, activate / deactivate)
- Receive live order notifications
- Update order status
- Verify delivery
- Handle cancelled and returned orders

### Admin
- Approve or reject vendor requests
- Manage vendor verification
- View platform data in real time

---

## Tech Stack

### Frontend
- Next.js (App Router)
- React
- Tailwind CSS
- Redux Toolkit

### Backend (Next.js)
- Next.js API routes
- MongoDB
- Mongoose
- NextAuth (authentication)

### Real-Time Server
- Node.js
- Express.js
- Socket.IO

---

## Architecture

- Next.js handles UI and REST APIs
- Socket server handles real-time communication
- Backend APIs trigger socket events using REST calls
- Clients listen to socket events and update UI instantly

This separation keeps the system clean and scalable.

---

## Real-Time Features

- Live product updates
- Product active / inactive sync
- Vendor order notifications
- User order status updates
- Order cancellation events
- Order return events
- Real-time chat support
- Multi-tab and refresh safe socket handling

---

## Socket Communication

### Client Registration

```js
socket.emit("user_id_with_socket", {
  userID: "USER_ID"
});
