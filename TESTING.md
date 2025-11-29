# TMS Testing Guide

## Overview
This document provides a comprehensive guide for testing the Tender Management System (TMS) application.

## Test Structure

### Backend Tests (TMS.Tests)
- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test API endpoints and database interactions
- **Service Tests**: Test business logic and services

### Frontend Tests
- **Unit Tests**: Test React components and utilities
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows with Cypress

## Running Tests

### Backend Tests
```bash
# Run all tests
cd TMS.Tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific test category
dotnet test --filter "Category=Unit"
dotnet test --filter "Category=Integration"

# Run with PowerShell script
.\run-tests.ps1
```

### Frontend Tests
```bash
# Run unit tests
cd Frontend
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run cypress:open  # Interactive mode
npm run cypress:run   # Headless mode

# Run with PowerShell script
.\run-tests.ps1
```

## Test Categories

### Unit Tests
- **Services**: Test business logic
- **Controllers**: Test API endpoints
- **Components**: Test React components
- **Utilities**: Test helper functions

### Integration Tests
- **API Tests**: Test complete API workflows
- **Database Tests**: Test data persistence
- **Component Tests**: Test component interactions

### E2E Tests
- **User Workflows**: Test complete user journeys
- **Cross-browser**: Test in different browsers
- **Performance**: Test application performance

## Test Data

### Backend Test Data
- Uses In-Memory Database for isolation
- AutoFixture for generating test data
- Seeded data for integration tests

### Frontend Test Data
- Mock API responses
- Test fixtures for components
- Cypress fixtures for E2E tests

## Coverage Requirements

### Backend Coverage
- **Lines**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Statements**: 80%

### Frontend Coverage
- **Lines**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Statements**: 70%

## Best Practices

### Backend Testing
1. Use dependency injection for testability
2. Mock external dependencies
3. Test edge cases and error scenarios
4. Use meaningful test names
5. Keep tests independent and isolated

### Frontend Testing
1. Test user interactions, not implementation details
2. Use data-testid attributes for reliable selectors
3. Mock API calls and external dependencies
4. Test accessibility features
5. Keep tests focused and readable

## Continuous Integration

### GitHub Actions
- Runs tests on every push and PR
- Generates coverage reports
- Runs both backend and frontend tests
- Uploads coverage to Codecov

### Local Development
- Run tests before committing
- Use watch mode for development
- Fix failing tests immediately
- Maintain high test coverage

## Troubleshooting

### Common Issues
1. **Test Database Issues**: Clear database between tests
2. **Mock Issues**: Reset mocks between tests
3. **Async Issues**: Use proper async/await patterns
4. **Cypress Issues**: Check baseUrl configuration

### Debugging
1. Use debugger statements in tests
2. Check console output for errors
3. Use Cypress debug mode for E2E tests
4. Check test coverage reports

## Test Maintenance

### Regular Tasks
1. Update tests when features change
2. Remove obsolete tests
3. Add tests for new features
4. Review and improve test coverage
5. Update test documentation

### Performance
1. Keep tests fast and reliable
2. Use parallel execution where possible
3. Optimize test data generation
4. Monitor test execution time


