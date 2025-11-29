# PowerShell script to run Frontend tests
Write-Host "Running Frontend Tests..." -ForegroundColor Green

# Install dependencies if needed
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Run Unit Tests
Write-Host "Running Unit Tests..." -ForegroundColor Yellow
npm run test:ci

# Run E2E Tests (if Cypress is installed)
Write-Host "Running E2E Tests..." -ForegroundColor Yellow
npm run test:e2e

Write-Host "Frontend tests completed!" -ForegroundColor Green


