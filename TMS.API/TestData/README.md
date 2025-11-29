# TMS API Testing Guide

This directory contains all the necessary files and documentation for testing the Tender Management System APIs.

## Quick Start

1. **Start the API**: Run the TMS.API project
2. **Seed the Database**: Make a POST request to `/api/seeder/seed`
3. **Test APIs**: Use the provided Postman collection or test endpoints directly

## Files in this Directory

- `TestDataConfig.json` - Configuration file with test data
- `TMS_API_Collection.postman_collection.json` - Complete Postman collection
- `README.md` - This documentation file

## API Endpoints

### Seeder Endpoints

| Method | Endpoint | Description | Authorization |
|--------|----------|-------------|---------------|
| POST | `/api/seeder/seed` | Seeds the database with test data | None |
| POST | `/api/seeder/clear` | Clears all data from database | Admin |
| POST | `/api/seeder/reset` | Clears and reseeds the database | Admin |
| GET | `/api/seeder/stats` | Gets current database statistics | None |
| GET | `/api/seeder/endpoints` | Gets all available API endpoints | None |

### Test Data Included

The seeder creates the following test data:

#### Users (4 users)
- **admin** (Admin role) - Full system access
- **manager1** (Manager role) - Management access
- **user1** (User role) - Regular user access
- **supplier1** (Supplier role) - Supplier access

#### Entities (6 entities)
- Ministry of Health
- Ministry of Education
- Ministry of Transportation
- City Council
- University Hospital
- Public School District

#### Suppliers (3 suppliers)
- Tech Solutions Inc (Technology)
- Construction Works Ltd (Construction)
- Medical Supplies Co (Healthcare)

#### Tenders (3 tenders)
- IT Infrastructure Upgrade ($500,000)
- School Building Construction ($2,000,000)
- Medical Equipment Supply ($800,000)

#### Quotations (4 quotations)
- 2 for IT Infrastructure tender
- 1 for School Building tender (Awarded)
- 1 for Medical Equipment tender (Awarded)

#### Contracts (2 contracts)
- IT Infrastructure contract (Active)
- Medical Equipment contract (Active)

#### Additional Data
- Assignment Orders
- Supply Deliveries
- Bank Guarantees
- Government Guarantees
- Support Matters
- Notifications
- Operation Logs
- Files

## Testing Workflow

### 1. Initial Setup
```bash
# Start the API
dotnet run --project TMS.API

# Seed the database
curl -X POST https://localhost:7001/api/seeder/seed
```

### 2. Authentication
```bash
# Login as admin
curl -X POST https://localhost:7001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "Admin123!"}'
```

### 3. Test API Endpoints
Use the Postman collection or test individual endpoints:

```bash
# Get all users (requires admin token)
curl -X GET https://localhost:7001/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get database statistics
curl -X GET https://localhost:7001/api/seeder/stats

# Get all tenders
curl -X GET https://localhost:7001/api/tenders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Postman Collection Usage

1. Import `TMS_API_Collection.postman_collection.json` into Postman
2. Set the `baseUrl` variable to your API URL (default: `https://localhost:7001`)
3. Run the "Login Admin" request to get an admin token
4. Set the `adminToken` variable with the received token
5. Run other requests as needed

## Test Credentials

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| admin | Admin123! | Admin | Full system access |
| manager1 | Manager123! | Manager | Management access |
| user1 | User123! | User | Regular user access |
| supplier1 | Supplier123! | Supplier | Supplier access |

## API Response Examples

### Successful Seeding Response
```json
{
  "message": "Database seeded successfully",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "users": 4,
    "roles": 5,
    "entities": 6,
    "suppliers": 3,
    "tenders": 3,
    "quotations": 4,
    "contracts": 2,
    "notifications": 3
  }
}
```

### Database Statistics Response
```json
{
  "users": 4,
  "roles": 5,
  "userRoles": 4,
  "entities": 6,
  "addresses": 6,
  "suppliers": 3,
  "currencies": 6,
  "tenders": 3,
  "quotations": 4,
  "assignmentOrders": 2,
  "contracts": 2,
  "supplyDeliveries": 2,
  "bankGuarantees": 2,
  "governmentGuarantees": 1,
  "supportMatters": 2,
  "notifications": 3,
  "operationLogs": 3,
  "files": 2,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check connection string in `appsettings.json`

2. **Authentication Errors**
   - Verify user credentials
   - Check if JWT configuration is correct

3. **Seeding Fails**
   - Check database permissions
   - Ensure all required tables exist
   - Check for foreign key constraint violations

### Reset Database
If you encounter issues, reset the database:
```bash
curl -X POST https://localhost:7001/api/seeder/reset \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Development Notes

- The seeder is idempotent - running it multiple times won't create duplicates
- All test data uses realistic values and relationships
- The seeder respects foreign key constraints
- All timestamps are set to realistic values relative to the current time

## Support

For issues or questions about API testing:
1. Check the API logs for detailed error messages
2. Verify all required services are running
3. Ensure database connectivity
4. Check authentication token validity
