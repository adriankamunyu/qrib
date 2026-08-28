# Qrib — Student Housing Platform (Kenya)

React + Vite + Tailwind implementation of the Qrib Figma design, localized for Kenya.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

## What's included

- **Login / Signup** (`/login`) — real client-side validation, toggle between Log In and Sign Up,
  password show/hide, role selection (Student / Host), and toast notifications for incorrect
  credentials, duplicate emails, weak passwords, etc.
  - Demo accounts: `student@university.ac.ke` / `host@qrib.co.ke`, password `password123`
- **Homepage** (`/`) — hero search bar, trust signals, featured listings, destination cards, all
  wired to real navigation (search, filters, footer links, social links).
- **Search Results** (`/search`) — filter by Kenyan university, price (KSh), property type; sortable;
  interactive Leaflet/OpenStreetMap map centered on the selected university with listing price pins.
- **Accommodation Details** (`/property/:id`) — gallery, host info, amenities, reviews, embedded map,
  and a KSh pricing breakdown (with automatic 10% student discount).
- **Booking Confirmation** (`/booking/:id`, protected route) — student info form, M-Pesa or card
  payment tabs, validation with toast notifications, KSh order summary.
- **Host Dashboard** (`/host`, role-protected — hosts only) — view listings, submit a new property.
- **Role-based access** — `AuthContext` stores a `role` of `student` or `host`. `ProtectedRoute`
  redirects unauthenticated users to `/login` and blocks non-host accounts from `/host`, each with
  an explanatory toast.

## Data

- `src/data/universities.js` — 10 major Kenyan universities with coordinates (UoN, KU, JKUAT,
  Strathmore, USIU-Africa, Multimedia, TU-K, Moi, Egerton, Maseno).
- `src/data/listings.js` — mock accommodation listings clustered near those universities, priced in KSh.

## Notes for the team

- Auth is a lightweight `localStorage`-backed mock (no real backend) — swap `AuthContext.jsx` for
  real API calls when the backend is ready.
- The map uses free OpenStreetMap tiles via `react-leaflet` (no API key required).
- Currency formatting is centralized as `KSh` throughout — search for `KSh` if you need to change it.
- Tailwind tokens (brand teal `#0f766e`, Manrope font) live in `tailwind.config.js` to match Figma.
