# Qrib — Student Accommodation Finder

## Project Description

Qrib is a student accommodation finder built with React. The application helps university students discover accommodation, search and filter available properties, view accommodation details, and navigate through a student-focused interface.

This project was developed as part of Moringa School Project 1 to demonstrate React component structure, routing, asynchronous data fetching, state management, controlled inputs, dynamic rendering, and responsive UI design.

## Features

- Student accommodation search
- Dynamic accommodation listings
- Search and filtering
- Property details
- Student dashboard
- Host dashboard
- User authentication
- Protected routes
- Responsive UI
- Loading and error states
- Interactive map
- External API integration

## Technologies Used

- React
- Vite
- JavaScript
- React Router
- Tailwind CSS
- Fetch API
- Flask
- SQLAlchemy
- Leaflet
- OpenStreetMap
- Git and GitHub

## API Integration

The React application uses asynchronous JavaScript with the Fetch API.

### Qrib Backend API

The application communicates with the Qrib Flask backend for accommodation and authentication data.

Base URL:

http://172.29.254.86:5000/api

Property endpoint:

GET /api/properties

Property details:

GET /api/properties/:id

Authentication endpoints:

POST /api/auth/login
POST /api/auth/register
GET /api/auth/me

### External API

An external public API will be integrated into the React application to satisfy the Moringa Project 1 external API requirement. The API and endpoint will be documented here after integration.

## Routing

React Router is used for application navigation.

Important routes include:

- /
- /login
- /search
- /property/:id
- /booking/:id
- /student/dashboard
- /host
- /host/dashboard
- /host/add-property

Protected routes require the appropriate authenticated user role.

## Setup Instructions

### Frontend

Clone the repository:

git clone https://github.com/adriankamunyu/qrib.git
cd qrib

Install dependencies:

npm install

Start the frontend:

npm run dev

The frontend normally runs on:

http://localhost:5173

### Backend

Open another terminal:

cd backend

Create the virtual environment:

python3 -m venv .venv

Activate it:

source .venv/bin/activate

Install dependencies:

pip install -r requirements.txt

Start Flask:

python run.py

The backend normally runs on:

http://localhost:5000

## Project Structure

qrib/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   └── routes/
│   ├── migrations/
│   ├── requirements.txt
│   └── run.py
│
├── src/
│   ├── components/
│   ├── context/
│   ├── data/
│   └── pages/
│
├── public/
├── package.json
└── README.md

## Challenges and Known Issues

During development, challenges included:

- Connecting React to the Flask API
- Managing authentication state
- Protecting routes based on user roles
- Handling asynchronous API requests
- Managing loading and error states
- Normalizing API responses
- Creating responsive layouts
- Integrating map functionality
- Working with external API data

Known limitations:

- The backend currently uses a local development IP address.
- Some property images use external image URLs.
- The Flask backend must be running for live accommodation data.

## Build Verification

The production React build was successfully tested using:

npm run build

## Author

Moringa School Software Engineering — Project 1
