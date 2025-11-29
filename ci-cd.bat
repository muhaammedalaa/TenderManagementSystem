@echo off
REM TMS CI/CD Pipeline Script for Windows Batch
REM This script provides local CI/CD functionality

setlocal enabledelayedexpansion

REM Colors for output
set "BLUE=[34m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "RED=[31m"
set "NC=[0m"

REM Function to print colored output
:print_status
echo %BLUE%[INFO]%NC% %~1
goto :eof

:print_success
echo %GREEN%[SUCCESS]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

REM Parse command line arguments
set "ACTION=help"
set "ENVIRONMENT=staging"
set "TAG="
set "SKIP_TESTS=false"
set "SKIP_SECURITY=false"
set "SKIP_BUILD=false"
set "FORCE=false"

:parse_args
if "%~1"=="" goto :main
if "%~1"=="-Action" (
    set "ACTION=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="-Environment" (
    set "ENVIRONMENT=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="-Tag" (
    set "TAG=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="-SkipTests" (
    set "SKIP_TESTS=true"
    shift
    goto :parse_args
)
if "%~1"=="-SkipSecurity" (
    set "SKIP_SECURITY=true"
    shift
    goto :parse_args
)
if "%~1"=="-SkipBuild" (
    set "SKIP_BUILD=true"
    shift
    goto :parse_args
)
if "%~1"=="-Force" (
    set "FORCE=true"
    shift
    goto :parse_args
)
shift
goto :parse_args

REM Check prerequisites
:check_prerequisites
call :print_status "Checking prerequisites..."

REM Check Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "Docker is not available. Please install Docker Desktop."
    exit /b 1
)
call :print_success "Docker is available"

REM Check Docker Compose
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "Docker Compose is not available. Please install Docker Compose."
    exit /b 1
)
call :print_success "Docker Compose is available"

REM Check Git
git --version >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "Git is not available. Please install Git."
    exit /b 1
)
call :print_success "Git is available"
goto :eof

REM Build images
:build_images
call :print_status "Building Docker images..."

if "%TAG%"=="" (
    for /f "tokens=*" %%i in ('git rev-parse --short HEAD') do set "TAG=%%i"
)

call :print_status "Building with tag: %TAG%"

REM Build backend
call :print_status "Building backend image..."
docker build -f TMS.API/Dockerfile.windows -t tms-backend:%TAG% .
if %errorlevel% neq 0 (
    call :print_error "Failed to build backend image"
    exit /b 1
)

REM Build frontend
call :print_status "Building frontend image..."
docker build -f Frontend/Dockerfile.windows -t tms-frontend:%TAG% ./Frontend
if %errorlevel% neq 0 (
    call :print_error "Failed to build frontend image"
    exit /b 1
)

call :print_success "Images built successfully"
goto :eof

REM Run tests
:run_tests
if "%SKIP_TESTS%"=="true" (
    call :print_warning "Tests skipped"
    goto :eof
)

call :print_status "Running tests..."

REM Start test environment
call :print_status "Starting test environment..."
docker-compose -f docker-compose.test.windows.yml up -d

REM Wait for services
call :print_status "Waiting for services to be ready..."
timeout /t 30 /nobreak >nul

REM Wait for backend
set "max_attempts=60"
set "attempt=0"
:wait_backend
curl -f http://localhost:5002/health >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 5 /nobreak >nul
    set /a attempt+=1
    if !attempt! lss !max_attempts! goto wait_backend
    call :print_error "Backend service not ready after !max_attempts! attempts"
    exit /b 1
)

REM Run backend tests
call :print_status "Running backend tests..."
docker-compose -f docker-compose.test.windows.yml exec -T backend-test dotnet test
if %errorlevel% neq 0 (
    call :print_error "Backend tests failed"
    exit /b 1
)

REM Run frontend tests
call :print_status "Running frontend tests..."
docker-compose -f docker-compose.test.windows.yml exec -T frontend-test npm test -- --coverage --watchAll=false
if %errorlevel% neq 0 (
    call :print_error "Frontend tests failed"
    exit /b 1
)

call :print_success "All tests passed"
goto :eof

REM Run security scan
:run_security_scan
if "%SKIP_SECURITY%"=="true" (
    call :print_warning "Security scan skipped"
    goto :eof
)

call :print_status "Running security scan..."

REM Check if Trivy is available
trivy --version >nul 2>&1
if %errorlevel% neq 0 (
    call :print_warning "Trivy is not available. Skipping security scan."
    goto :eof
)

REM Scan backend image
call :print_status "Scanning backend image..."
trivy image tms-backend:latest --format table --exit-code 0
if %errorlevel% neq 0 (
    call :print_error "Security scan found vulnerabilities in backend image"
    exit /b 1
)

REM Scan frontend image
call :print_status "Scanning frontend image..."
trivy image tms-frontend:latest --format table --exit-code 0
if %errorlevel% neq 0 (
    call :print_error "Security scan found vulnerabilities in frontend image"
    exit /b 1
)

call :print_success "Security scan completed successfully"
goto :eof

REM Deploy application
:deploy_application
call :print_status "Deploying to %ENVIRONMENT% environment..."

REM Set environment variables
set "ENVIRONMENT=%ENVIRONMENT%"
set "IMAGE_TAG=%TAG%"

REM Deploy based on environment
if /i "%ENVIRONMENT%"=="staging" (
    call :print_status "Deploying to staging..."
    docker-compose -f docker-compose.staging.windows.yml up -d
) else if /i "%ENVIRONMENT%"=="production" (
    call :print_status "Deploying to production..."
    docker-compose -f docker-compose.prod.windows.yml up -d
) else if /i "%ENVIRONMENT%"=="development" (
    call :print_status "Deploying to development..."
    docker-compose -f docker-compose.windows.yml up -d
) else (
    call :print_error "Unknown environment: %ENVIRONMENT%"
    exit /b 1
)

if %errorlevel% neq 0 (
    call :print_error "Deployment failed"
    exit /b 1
)

call :print_success "Deployment completed successfully"
goto :eof

REM Run health checks
:run_health_checks
call :print_status "Running health checks..."

REM Check frontend
curl -f http://localhost:3000 >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "Frontend health check failed"
    exit /b 1
)
call :print_success "Frontend health check passed"

REM Check backend
curl -f http://localhost:3000/api/health >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "Backend health check failed"
    exit /b 1
)
call :print_success "Backend health check passed"

call :print_success "All health checks passed"
goto :eof

REM Cleanup
:cleanup
call :print_status "Cleaning up..."

REM Stop all containers
docker-compose -f docker-compose.windows.yml down
docker-compose -f docker-compose.test.windows.yml down
docker-compose -f docker-compose.staging.windows.yml down
docker-compose -f docker-compose.prod.windows.yml down

REM Remove unused images
docker image prune -f

call :print_success "Cleanup completed"
goto :eof

REM Show help
:show_help
echo.
echo 🚀 TMS CI/CD Pipeline
echo =====================
echo.
echo Usage: ci-cd.bat -Action ^<action^> [options]
echo.
echo Actions:
echo   build       - Build Docker images
echo   test        - Run tests
echo   security    - Run security scan
echo   deploy      - Deploy application
echo   health      - Run health checks
echo   full        - Run full CI/CD pipeline
echo   cleanup     - Clean up resources
echo   help        - Show this help
echo.
echo Options:
echo   -Environment ^<env^>  - Target environment (staging, production, development)
echo   -Tag ^<tag^>          - Docker image tag
echo   -SkipTests          - Skip test execution
echo   -SkipSecurity       - Skip security scan
echo   -SkipBuild          - Skip build step
echo   -Force              - Force execution without confirmation
echo.
echo Examples:
echo   ci-cd.bat -Action build
echo   ci-cd.bat -Action test
echo   ci-cd.bat -Action deploy -Environment staging
echo   ci-cd.bat -Action full -Environment production -Tag v1.0.0
goto :eof

REM Main function
:main
echo.
echo 🚀 TMS CI/CD Pipeline
echo =====================
echo.

REM Check prerequisites
call :check_prerequisites
if %errorlevel% neq 0 exit /b 1

REM Execute action
if /i "%ACTION%"=="build" (
    call :build_images
    if %errorlevel% neq 0 exit /b 1
) else if /i "%ACTION%"=="test" (
    call :run_tests
    if %errorlevel% neq 0 exit /b 1
) else if /i "%ACTION%"=="security" (
    call :run_security_scan
    if %errorlevel% neq 0 exit /b 1
) else if /i "%ACTION%"=="deploy" (
    call :deploy_application
    if %errorlevel% neq 0 exit /b 1
) else if /i "%ACTION%"=="health" (
    call :run_health_checks
    if %errorlevel% neq 0 exit /b 1
) else if /i "%ACTION%"=="full" (
    call :print_status "Running full CI/CD pipeline..."
    
    if not "%SKIP_BUILD%"=="true" (
        call :build_images
        if %errorlevel% neq 0 exit /b 1
    )
    
    call :run_tests
    if %errorlevel% neq 0 exit /b 1
    
    call :run_security_scan
    if %errorlevel% neq 0 exit /b 1
    
    call :deploy_application
    if %errorlevel% neq 0 exit /b 1
    
    call :run_health_checks
    if %errorlevel% neq 0 exit /b 1
    
    call :print_success "Full CI/CD pipeline completed successfully!"
) else if /i "%ACTION%"=="cleanup" (
    call :cleanup
) else if /i "%ACTION%"=="help" (
    call :show_help
) else (
    call :print_error "Unknown action: %ACTION%"
    call :show_help
    exit /b 1
)

goto :eof

REM Run main function
call :main
