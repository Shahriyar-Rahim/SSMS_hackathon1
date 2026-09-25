# SmartService Platform

A full-stack service marketplace for connecting customers with local providers for home and appliance services. The platform supports customer bookings, provider matching, service tracking, provider dashboards, and admin oversight in a single, streamlined workflow.

## Overview

SmartService is designed to simplify the process of finding reliable service providers for everyday home and appliance needs. Customers can browse categories, submit service requests, compare matched providers, and track the progress of bookings. Providers can manage their profile, availability, and service offerings, while admins can review platform activity and operational status.

## Key Features

- Customer-facing service booking flow
- Provider profile creation and specialization
- Smart provider matching by service category and location
- Booking lifecycle tracking from request to completion
- Provider and admin dashboards
- JWT-based authentication and role-based access control
- MongoDB-powered data persistence
- React + Vite frontend with modern UI styling

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- Lucide React

### Backend
- Node.js
- Express 5
- MongoDB with Mongoose
- JWT authentication
- CORS and rate limiting middleware

## Repository Structure

```text
SSMS_hackathon1/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── .env
│   ├── package.json
│   ├── server.js
│   ├── seed.js
│   └── vercel.json
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json
│   └── index.html
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas connection string or a local MongoDB instance

### 1) Clone the repository

```bash
git clone https://github.com/Shahriyar-Rahim/SSMS_hackathon1.git
cd SSMS_hackathon1
```

### 2) Configure the backend environment

Create a `.env` file inside the `backend` directory with the required variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
```

Then install dependencies:

```bash
cd backend
npm install
```

Start the backend:

```bash
npm run dev
```

### 3) Configure the frontend

Open a new terminal and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start with Vite and typically run on the local development port configured by the tool.

## Available Scripts

### Backend

```bash
npm run dev    # start server with nodemon
npm run start  # start production server
npm run seed   # seed database fixtures
```

### Frontend

```bash
npm run dev    # start Vite dev server
npm run build  # build production bundle
npm run preview # preview production build
npm run lint   # run lint checks
```

## Core User Flows

### Customer Journey
1. Create an account or sign in
2. Choose a service category
3. Submit a repair or service request
4. Review matched providers
5. Select a provider and create a booking
6. Track status updates until completion

### Provider Journey
1. Register as a provider
2. Add service specialization and hourly rate
3. Manage profile information
4. Receive and respond to booking requests
5. Update service progress and status

### Admin Journey
- Review activity and platform operations
- Monitor requests and provider-related workflows

## Deployment Notes

This repository includes deployment configuration for hosting both frontend and backend separately:

- `frontend/vercel.json`
- `backend/vercel.json`

The frontend is built with Vite and is suitable for deployment on Vercel. The backend is an Express API designed for Node-compatible hosting environments.

## Project Status

This project is a functional hackathon-style full-stack application focused on service matching and booking management. It is intended as a practical demonstration of a modern service marketplace architecture.

## License

This project does not currently declare an explicit license. If you plan to distribute or reuse the project publicly, it is recommended to add an appropriate open-source license such as MIT.

## Contributing

Contributions are welcome. If you would like to improve the platform, open a pull request with a clear explanation of the change and the problem it addresses.

## Contact

For questions or collaboration opportunities, contact the repository owner on GitHub:

- Shahriyar-Rahim

---

Built for modern service discovery, provider matching, and customer booking workflows.
