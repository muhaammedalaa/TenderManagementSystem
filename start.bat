@echo off
REM TMS Docker Start Script for Windows
REM This script provides an easy way to start the TMS application

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

REM Check if Docker is running
:check_docker
docker info >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "Docker is not running. Please start Docker Desktop and try again."
    exit /b 1
)
call :print_success "Docker is running"
goto :eof

REM Check if docker-compose is available
:check_docker_compose
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "docker-compose is not installed. Please install it and try again."
    exit /b 1
)
call :print_success "docker-compose is available"
goto :eof

REM Create .env file if it doesn't exist
:create_env_file
if not exist .env (
    call :print_status "Creating .env file from template..."
    copy env.example .env >nul
    call :print_success ".env file created"
) else (
    call :print_status ".env file already exists"
)
goto :eof

REM Build images
:build_images
call :print_status "Building Docker images..."
docker-compose build
if %errorlevel% neq 0 (
    call :print_error "Failed to build images"
    exit /b 1
)
call :print_success "Images built successfully"
goto :eof

REM Start services
:start_services
call :print_status "Starting services..."
docker-compose up -d
if %errorlevel% neq 0 (
    call :print_error "Failed to start services"
    exit /b 1
)
call :print_success "Services started"
goto :eof

REM Wait for services to be ready
:wait_for_services
call :print_status "Waiting for services to be ready..."

REM Wait for database
call :print_status "Waiting for database..."
:wait_db
docker-compose exec postgres pg_isready -U tms_user -d tms_db >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 2 >nul
    goto wait_db
)
call :print_success "Database is ready"

REM Wait for backend
call :print_status "Waiting for backend..."
:wait_backend
curl -f http://localhost:5000/health >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 5 >nul
    goto wait_backend
)
call :print_success "Backend is ready"

REM Wait for frontend
call :print_status "Waiting for frontend..."
:wait_frontend
curl -f http://localhost:3000 >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 5 >nul
    goto wait_frontend
)
call :print_success "Frontend is ready"
goto :eof

REM Show service status
:show_status
call :print_status "Service Status:"
docker-compose ps

echo.
call :print_status "Application URLs:"
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:5000
echo   Database: localhost:5432
echo   Redis: localhost:6379
goto :eof

REM Show logs
:show_logs
call :print_status "Showing logs (Press Ctrl+C to exit)..."
docker-compose -f docker-compose.windows.yml logs -f
goto :eof

REM Show logs per service
:show_logs_backend
call :print_status "Showing backend logs (Press Ctrl+C to exit)..."
docker-compose -f docker-compose.windows.yml logs -f backend
goto :eof

:show_logs_frontend
call :print_status "Showing frontend logs (Press Ctrl+C to exit)..."
docker-compose -f docker-compose.windows.yml logs -f frontend
goto :eof

:show_logs_db
call :print_status "Showing database logs (Press Ctrl+C to exit)..."
docker-compose -f docker-compose.windows.yml logs -f postgres
goto :eof

:show_logs_redis
call :print_status "Showing redis logs (Press Ctrl+C to exit)..."
docker-compose -f docker-compose.windows.yml logs -f redis
goto :eof

:show_logs_all
call :print_status "Showing all services logs (Press Ctrl+C to exit)..."
docker-compose -f docker-compose.windows.yml logs -f
goto :eof

REM Monitoring commands
:start_monitoring
call :print_status "Starting monitoring stack..."
docker-compose -f docker-compose.monitoring.yml up -d
call :print_success "Monitoring stack started"
call :print_status "Monitoring URLs:"
echo   Prometheus: http://localhost:9090
echo   Grafana: http://localhost:3001
goto :eof

:stop_monitoring
call :print_status "Stopping monitoring stack..."
docker-compose -f docker-compose.monitoring.yml down
call :print_success "Monitoring stack stopped"
goto :eof

:show_monitoring_logs
call :print_status "Showing monitoring logs (Press Ctrl+C to exit)..."
docker-compose -f docker-compose.monitoring.yml logs -f
goto :eof

:show_monitoring_status
call :print_status "Monitoring stack status:"
docker-compose -f docker-compose.monitoring.yml ps
goto :eof

REM Testing commands
:start_test
call :print_status "Starting test environment..."
docker-compose -f docker-compose.test.yml up -d
call :print_success "Test environment started"
goto :eof

:stop_test
call :print_status "Stopping test environment..."
docker-compose -f docker-compose.test.yml down
call :print_success "Test environment stopped"
goto :eof

:show_test_logs
call :print_status "Showing test logs (Press Ctrl+C to exit)..."
docker-compose -f docker-compose.test.yml logs -f
goto :eof

:run_tests
call :print_status "Running tests..."
docker-compose -f docker-compose.test.yml exec backend-test dotnet test
goto :eof

:clean_test
call :print_status "Cleaning test environment..."
docker-compose -f docker-compose.test.windows.yml down -v --rmi all --remove-orphans
call :print_success "Test environment cleaned"
goto :eof

REM CI/CD commands
:ci_build
call :print_status "Building Docker images for CI/CD..."
docker build -f TMS.API/Dockerfile.windows -t tms-backend:latest .
docker build -f Frontend/Dockerfile.windows -t tms-frontend:latest ./Frontend
call :print_success "CI/CD images built successfully"
goto :eof

:ci_test
call :print_status "Running CI/CD tests..."
docker-compose -f docker-compose.test.windows.yml up -d
call :print_status "Waiting for services to be ready..."
timeout /t 30 /nobreak >nul
docker-compose -f docker-compose.test.windows.yml exec -T backend-test dotnet test
docker-compose -f docker-compose.test.windows.yml exec -T frontend-test npm test -- --coverage --watchAll=false
docker-compose -f docker-compose.test.windows.yml down
call :print_success "CI/CD tests completed"
goto :eof

:ci_security
call :print_status "Running security scan..."
if exist "C:\Program Files\Trivy\trivy.exe" (
    "C:\Program Files\Trivy\trivy.exe" image tms-backend:latest --format table --exit-code 0
    "C:\Program Files\Trivy\trivy.exe" image tms-frontend:latest --format table --exit-code 0
) else (
    call :print_warning "Trivy not found. Skipping security scan."
)
call :print_success "Security scan completed"
goto :eof

:ci_deploy
call :print_status "Deploying application..."
docker-compose -f docker-compose.staging.windows.yml up -d
call :print_success "Deployment completed"
goto :eof

:ci_health
call :print_status "Running health checks..."
timeout /t 10 /nobreak >nul
curl -f http://localhost:3000 >nul 2>&1 && call :print_success "Frontend health check passed" || call :print_error "Frontend health check failed"
curl -f http://localhost:3000/api/health >nul 2>&1 && call :print_success "Backend health check passed" || call :print_error "Backend health check failed"
call :print_success "Health checks completed"
goto :eof

:ci_full
call :print_status "Running full CI/CD pipeline..."
call :ci_build
call :ci_test
call :ci_security
call :ci_deploy
call :ci_health
call :print_success "Full CI/CD pipeline completed successfully!"
goto :eof

:ci_cleanup
call :print_status "Cleaning up CI/CD resources..."
docker-compose -f docker-compose.windows.yml down
docker-compose -f docker-compose.test.windows.yml down
docker-compose -f docker-compose.staging.windows.yml down
docker-compose -f docker-compose.prod.windows.yml down
docker image prune -f
call :print_success "CI/CD cleanup completed"
goto :eof

REM Main function
:main
echo.
echo 🐳 TMS Docker Setup
echo ===================
echo.

REM Check prerequisites
call :check_docker
if %errorlevel% neq 0 exit /b 1

call :check_docker_compose
if %errorlevel% neq 0 exit /b 1

REM Create environment file
call :create_env_file

REM Parse command line arguments
if "%1"=="" set "1=start"

if "%1"=="start" (
    call :build_images
    call :start_services
    call :wait_for_services
    call :show_status
) else if "%1"=="build" (
    call :build_images
) else if "%1"=="up" (
    call :start_services
    call :wait_for_services
    call :show_status
) else if "%1"=="down" (
    call :print_status "Stopping services..."
    docker-compose down
    call :print_success "Services stopped"
) else if "%1"=="restart" (
    call :print_status "Restarting services..."
    docker-compose down
    call :start_services
    call :wait_for_services
    call :show_status
) else if "%1"=="logs" (
    call :show_logs
) else if "%1"=="logs-backend" (
    call :show_logs_backend
) else if "%1"=="logs-frontend" (
    call :show_logs_frontend
) else if "%1"=="logs-db" (
    call :show_logs_db
) else if "%1"=="logs-redis" (
    call :show_logs_redis
) else if "%1"=="logs-all" (
    call :show_logs_all
) else if "%1"=="monitoring" (
    call :start_monitoring
) else if "%1"=="monitoring-down" (
    call :stop_monitoring
) else if "%1"=="monitoring-logs" (
    call :show_monitoring_logs
) else if "%1"=="monitoring-status" (
    call :show_monitoring_status
) else if "%1"=="test" (
    call :start_test
) else if "%1"=="test-down" (
    call :stop_test
) else if "%1"=="test-logs" (
    call :show_test_logs
) else if "%1"=="test-run" (
    call :run_tests
) else if "%1"=="test-clean" (
    call :clean_test
) else if "%1"=="ci-build" (
    call :ci_build
) else if "%1"=="ci-test" (
    call :ci_test
) else if "%1"=="ci-security" (
    call :ci_security
) else if "%1"=="ci-deploy" (
    call :ci_deploy
) else if "%1"=="ci-health" (
    call :ci_health
) else if "%1"=="ci-full" (
    call :ci_full
) else if "%1"=="ci-cleanup" (
    call :ci_cleanup
) else if "%1"=="status" (
    call :show_status
) else if "%1"=="clean" (
    call :print_warning "This will remove all containers, images, and volumes. Are you sure? (y/N)"
    set /p response=
    if /i "!response!"=="y" (
        call :print_status "Cleaning up..."
        docker-compose down -v --rmi all --remove-orphans
        docker system prune -f
        call :print_success "Cleanup complete"
    ) else (
        call :print_status "Cleanup cancelled"
    )
) else if "%1"=="help" (
    echo Usage: start.bat [command]
    echo.
    echo Commands:
    echo   start     - Build and start all services (default)
    echo   build     - Build Docker images only
    echo   up        - Start services without building
    echo   down      - Stop all services
    echo   restart   - Restart all services
    echo   logs      - Show logs for all services
    echo   logs-backend  - Show backend logs only
    echo   logs-frontend - Show frontend logs only
    echo   logs-db   - Show database logs only
    echo   logs-redis - Show redis logs only
    echo   logs-all  - Show all services logs
    echo   monitoring - Start monitoring stack (Prometheus + Grafana)
    echo   monitoring-down - Stop monitoring stack
    echo   monitoring-logs - Show monitoring logs
    echo   monitoring-status - Show monitoring status
    echo   test      - Start test environment
    echo   test-down - Stop test environment
    echo   test-logs - Show test logs
    echo   test-run  - Run tests in test environment
    echo   test-clean - Clean test environment
    echo   ci-build  - Build Docker images for CI/CD
    echo   ci-test   - Run CI/CD tests
    echo   ci-security - Run security scan
    echo   ci-deploy - Deploy application
    echo   ci-health - Run health checks
    echo   ci-full   - Run full CI/CD pipeline
    echo   ci-cleanup - Clean up CI/CD resources
    echo   status    - Show service status
    echo   clean     - Remove all containers, images, and volumes
    echo   help      - Show this help message
) else (
    call :print_error "Unknown command: %1"
    echo Use 'start.bat help' to see available commands
    exit /b 1
)

goto :eof

REM Run main function
call :main %*
