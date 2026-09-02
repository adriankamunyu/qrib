# Qrib

Qrib is a full-stack student accommodation platform built to help university students find and secure housing near their campus with less friction. The platform connects students with verified property listings, supports booking workflows, and gives hosts a way to manage their properties and availability.

## Project Overview

Qrib was designed to solve the common problem students face when moving to a new city or campus: finding trustworthy, affordable accommodation that matches their budget, preferred location, and living needs. The platform combines a modern React frontend with a Flask backend to provide a user-friendly experience for browsing listings, managing accounts, and completing bookings.

## Key Features

- Student-friendly accommodation search and discovery
- Property detail pages with booking entry flows
- Host property management and listing creation
- Role-based access for students, hosts, and administrators
- Secure authentication using JWT and Google login support
- Booking creation and management workflows
- Payment flow ready for Flutterwave-compatible processing
- Responsive UI for mobile and desktop screens
- Environment-based configuration for frontend/backend connectivity
- CORS-safe API integration for deployment environments

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- React Router
- Tailwind CSS

### Backend
- Flask
- Flask-SQLAlchemy
- Flask-JWT-Extended
- Flask-CORS
- Flask-Migrate
- PostgreSQL-ready configuration

### Additional Tools
- Git and GitHub
- Render for backend deployment
- Vercel for frontend deployment
- Google OAuth integration
- Flutterwave-compatible payment setup

## Application Flow

1. Students browse available properties.
2. They filter and view details for accommodation listings.
3. They create a booking for a selected property.
4. They complete a secure payment flow in a sandbox-ready or production-friendly setup.
5. Hosts can manage listings and relevant booking activity.
6. Admins and access-controlled users can operate within their role-specific dashboards.

## Project Structure

```text
qrib/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── extensions.py
│   │   └── __init__.py
│   ├── migrations/
│   ├── requirements.txt
│   └── run.py
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── package.json
├── vite.config.js
├── render.yaml
├── README.md
└── .env
```

## API Overview

The application uses a Flask API with REST-style endpoints for property, auth, booking, and payment actions.

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/google
- GET /api/auth/me

### Properties
- GET /api/properties
- GET /api/properties/<id>
- POST /api/properties
- PATCH /api/properties/<id>
- DELETE /api/properties/<id>

### Bookings
- GET /api/bookings
- GET /api/bookings/<id>
- POST /api/bookings
- PATCH /api/bookings/<id>

### Payments
- POST /api/payments/initiate
- GET /api/payments/<id>
- PATCH /api/payments/<id>/status

### Health Check
- GET /api/health

## Local Setup

### Prerequisites
- Node.js and npm
- Python 3.10+
- Virtual environment support

### Frontend Setup

```bash
git clone https://github.com/adriankamunyu/qrib.git
cd qrib
npm install
npm run dev
```

The frontend runs locally on:

```text
http://localhost:5173
```

### Backend Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

The backend runs locally on:

```text
http://localhost:5000
```

## Environment Variables

The project expects environment variables for both frontend and backend configuration.

### Frontend
```env
VITE_API_URL=https://your-render-backend-url/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### Backend
```env
DATABASE_URL=your_database_url
JWT_SECRET_KEY=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=https://your-vercel-app-url
CORS_ALLOWED_ORIGINS=https://your-vercel-app-url
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
FLUTTERWAVE_ENCRYPTION_KEY=your_flutterwave_encryption_key
```

## Deployment

This project is structured for deployment across separate hosts:

- Frontend: Vercel
- Backend: Render

The application uses environment-based configuration to keep production values separate from local development values.

## Challenges and Known Considerations

During development, the project required careful attention to:

- frontend-backend connectivity
- CORS configuration for production
- environment variable handling
- Google auth setup and verification
- role-based API authorization
- booking and payment workflow validation
- clean deployment configuration

## Build Verification

The project was verified with a production build check:

```bash
npm run build
```

This confirms the frontend compiles successfully for deployment.

## Conclusion

Qrib is a fully developed student accommodation solution designed for real-world use. It combines thoughtful UI design, secure backend architecture, and practical booking workflows to create a complete experience for students and hosts alike.

## Author

Project developed for the Moringa School full-stack development track.
