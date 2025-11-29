# PowerShell script to run all tests
Write-Host "Running TMS Tests..." -ForegroundColor Green

# Run Unit Tests
Write-Host "Running Unit Tests..." -ForegroundColor Yellow
dotnet test --filter "Category=Unit" --logger "console;verbosity=detailed"

# Run Integration Tests
Write-Host "Running Integration Tests..." -ForegroundColor Yellow
dotnet test --filter "Category=Integration" --logger "console;verbosity=detailed"

# Run All Tests with Coverage
Write-Host "Running All Tests with Coverage..." -ForegroundColor Yellow
dotnet test --collect:"XPlat Code Coverage" --results-directory ./TestResults

Write-Host "Tests completed!" -ForegroundColor Green


