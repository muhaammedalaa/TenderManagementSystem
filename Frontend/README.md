# TMS Frontend

A React-based frontend for the Tender Management System (TMS).

## Features

- **Authentication**: Login/Register with JWT tokens
- **Dashboard**: Real-time statistics and data overview
- **Database Seeding**: Built-in controls for testing data
- **Responsive Design**: Bootstrap-based UI
- **API Integration**: Full integration with TMS backend APIs

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- TMS Backend running on http://localhost:7101

## Installation

1. Navigate to the Frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application will open at http://localhost:3000

## Configuration

The frontend is configured to connect to the backend API at `http://localhost:7101/api`. This can be changed by setting the `REACT_APP_API_URL` environment variable.

## Test Credentials

After seeding the database, you can use these test accounts:

- **Admin**: `admin` / `Admin123!`
- **Manager**: `manager1` / `Manager123!`
- **User**: `user1` / `User123!`
- **Supplier**: `supplier1` / `Supplier123!`

## Database Seeding

The dashboard includes seeder controls that allow you to:

- **Seed Database**: Populate the database with test data
- **Clear Database**: Remove all data
- **Reset Database**: Clear and re-seed the database

## Available Scripts

- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm eject`: Eject from Create React App

## API Integration

The frontend integrates with the following backend APIs:

- Authentication (`/api/auth`)
- Users (`/api/users`)
- Suppliers (`/api/suppliers`)
- Tenders (`/api/tenders`)
- Quotations (`/api/quotations`)
- Contracts (`/api/contracts`)
- Entities (`/api/entities`)
- Bank Guarantees (`/api/bankguarantees`)
- Government Guarantees (`/api/governmentguarantees`)
- Support Matters (`/api/supportmatters`)
- Notifications (`/api/notifications`)
- Files (`/api/files`)
- Seeder (`/api/seeder`)

## Development

The frontend uses:

- React 18
- React Router for navigation
- React Bootstrap for UI components
- Axios for API calls
- Chart.js for data visualization

## Troubleshooting

1. **CORS Issues**: Ensure the backend is running and CORS is properly configured
2. **Authentication Issues**: Check that JWT tokens are being sent correctly
3. **API Connection**: Verify the backend is running on the correct port (7101)
4. **Database Issues**: Use the seeder controls to populate test data

## Building for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.
