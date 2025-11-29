# TMS Docker Start Script for Windows PowerShell
# This script provides an easy way to start the TMS application on Windows

param(
    [string]$Command = "start",
    [switch]$Windows = $false
)

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Function to check if Docker is running
function Test-Docker {
    try {
        docker info | Out-Null
        Write-Success "Docker is running"
        return $true
    }
    catch {
        Write-Error "Docker is not running. Please start Docker Desktop and try again."
        return $false
    }
}

# Function to check if docker-compose is available
function Test-DockerCompose {
    try {
        docker-compose --version | Out-Null
        Write-Success "docker-compose is available"
        return $true
    }
    catch {
        Write-Error "docker-compose is not installed. Please install it and try again."
        return $false
    }
}

# Function to create .env file if it doesn't exist
function New-EnvFile {
    if (-not (Test-Path ".env")) {
        Write-Status "Creating .env file from template..."
        if ($Windows -or (Test-Path "env.windows")) {
            Copy-Item "env.windows" ".env"
            Write-Success ".env file created from Windows template"
        } else {
            Copy-Item "env.example" ".env"
            Write-Success ".env file created from default template"
        }
    }
    else {
        Write-Status ".env file already exists"
    }
}

# Function to build images
function Build-Images {
    Write-Status "Building Docker images..."
    if ($Windows -or (Test-Path "docker-compose.windows.yml")) {
        docker-compose -f docker-compose.windows.yml build
    } else {
        docker-compose build
    }
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Images built successfully"
    }
    else {
        Write-Error "Failed to build images"
        exit 1
    }
}

# Function to start services
function Start-Services {
    Write-Status "Starting services..."
    if ($Windows -or (Test-Path "docker-compose.windows.yml")) {
        docker-compose -f docker-compose.windows.yml up -d
    } else {
        docker-compose up -d
    }
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Services started"
    }
    else {
        Write-Error "Failed to start services"
        exit 1
    }
}

# Function to wait for services to be ready
function Wait-ForServices {
    Write-Status "Waiting for services to be ready..."
    
    # Wait for database
    Write-Status "Waiting for database..."
    do {
        Start-Sleep -Seconds 2
        $dbReady = docker-compose exec postgres pg_isready -U tms_user -d tms_db 2>$null
    } while (-not $dbReady)
    Write-Success "Database is ready"
    
    # Wait for backend
    Write-Status "Waiting for backend..."
    do {
        Start-Sleep -Seconds 5
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 5
            $backendReady = $response.StatusCode -eq 200
        }
        catch {
            $backendReady = $false
        }
    } while (-not $backendReady)
    Write-Success "Backend is ready"
    
    # Wait for frontend
    Write-Status "Waiting for frontend..."
    do {
        Start-Sleep -Seconds 5
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
            $frontendReady = $response.StatusCode -eq 200
        }
        catch {
            $frontendReady = $false
        }
    } while (-not $frontendReady)
    Write-Success "Frontend is ready"
}

# Function to show service status
function Show-Status {
    Write-Status "Service Status:"
    docker-compose ps
    
    Write-Host ""
    Write-Status "Application URLs:"
    Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "  Backend API: http://localhost:5000" -ForegroundColor Cyan
    Write-Host "  Database: localhost:5432" -ForegroundColor Cyan
    Write-Host "  Redis: localhost:6379" -ForegroundColor Cyan
}

# Function to show logs
function Show-Logs {
    Write-Status "Showing logs (Press Ctrl+C to exit)..."
    if ($Windows -or (Test-Path "docker-compose.windows.yml")) {
        docker-compose -f docker-compose.windows.yml logs -f
    } else {
        docker-compose logs -f
    }
}

# Function to show logs per service
function Show-Logs-Backend {
    Write-Status "Showing backend logs (Press Ctrl+C to exit)..."
    if ($Windows -or (Test-Path "docker-compose.windows.yml")) {
        docker-compose -f docker-compose.windows.yml logs -f backend
    } else {
        docker-compose logs -f backend
    }
}

function Show-Logs-Frontend {
    Write-Status "Showing frontend logs (Press Ctrl+C to exit)..."
    if ($Windows -or (Test-Path "docker-compose.windows.yml")) {
        docker-compose -f docker-compose.windows.yml logs -f frontend
    } else {
        docker-compose logs -f frontend
    }
}

function Show-Logs-Database {
    Write-Status "Showing database logs (Press Ctrl+C to exit)..."
    if ($Windows -or (Test-Path "docker-compose.windows.yml")) {
        docker-compose -f docker-compose.windows.yml logs -f postgres
    } else {
        docker-compose logs -f postgres
    }
}

function Show-Logs-Redis {
    Write-Status "Showing redis logs (Press Ctrl+C to exit)..."
    if ($Windows -or (Test-Path "docker-compose.windows.yml")) {
        docker-compose -f docker-compose.windows.yml logs -f redis
    } else {
        docker-compose logs -f redis
    }
}

function Show-Logs-All {
    Write-Status "Showing all services logs (Press Ctrl+C to exit)..."
    if ($Windows -or (Test-Path "docker-compose.windows.yml")) {
        docker-compose -f docker-compose.windows.yml logs -f
    } else {
        docker-compose logs -f
    }
}

# Monitoring functions
function Start-Monitoring {
    Write-Status "Starting monitoring stack..."
    docker-compose -f docker-compose.monitoring.yml up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Monitoring stack started"
        Write-Status "Monitoring URLs:"
        Write-Host "  Prometheus: http://localhost:9090" -ForegroundColor Cyan
        Write-Host "  Grafana: http://localhost:3001" -ForegroundColor Cyan
    } else {
        Write-Error "Failed to start monitoring stack"
    }
}

function Stop-Monitoring {
    Write-Status "Stopping monitoring stack..."
    docker-compose -f docker-compose.monitoring.yml down
    Write-Success "Monitoring stack stopped"
}

function Show-Monitoring-Logs {
    Write-Status "Showing monitoring logs (Press Ctrl+C to exit)..."
    docker-compose -f docker-compose.monitoring.yml logs -f
}

function Show-Monitoring-Status {
    Write-Status "Monitoring stack status:"
    docker-compose -f docker-compose.monitoring.yml ps
}

# Testing functions
function Start-Test {
    Write-Status "Starting test environment..."
    docker-compose -f docker-compose.test.yml up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Test environment started"
    } else {
        Write-Error "Failed to start test environment"
    }
}

function Stop-Test {
    Write-Status "Stopping test environment..."
    docker-compose -f docker-compose.test.yml down
    Write-Success "Test environment stopped"
}

function Show-Test-Logs {
    Write-Status "Showing test logs (Press Ctrl+C to exit)..."
    docker-compose -f docker-compose.test.yml logs -f
}

function Run-Tests {
    Write-Status "Running tests..."
    docker-compose -f docker-compose.test.yml exec backend-test dotnet test
}

function Clean-Test {
    Write-Status "Cleaning test environment..."
    docker-compose -f docker-compose.test.yml down -v --rmi all --remove-orphans
    Write-Success "Test environment cleaned"
}

# Main function
function Main {
    Write-Host "🐳 TMS Docker Setup" -ForegroundColor Magenta
    Write-Host "===================" -ForegroundColor Magenta
    Write-Host ""
    
    # Check prerequisites
    if (-not (Test-Docker)) { exit 1 }
    if (-not (Test-DockerCompose)) { exit 1 }
    
    # Create environment file
    New-EnvFile
    
    # Execute command
    switch ($Command.ToLower()) {
        "start" {
            Build-Images
            Start-Services
            Wait-ForServices
            Show-Status
        }
        "build" {
            Build-Images
        }
        "up" {
            Start-Services
            Wait-ForServices
            Show-Status
        }
        "down" {
            Write-Status "Stopping services..."
            docker-compose down
            Write-Success "Services stopped"
        }
        "restart" {
            Write-Status "Restarting services..."
            docker-compose down
            Start-Services
            Wait-ForServices
            Show-Status
        }
        "logs" {
            Show-Logs
        }
        "logs-backend" {
            Show-Logs-Backend
        }
        "logs-frontend" {
            Show-Logs-Frontend
        }
        "logs-db" {
            Show-Logs-Database
        }
        "logs-redis" {
            Show-Logs-Redis
        }
        "logs-all" {
            Show-Logs-All
        }
        "monitoring" {
            Start-Monitoring
        }
        "monitoring-down" {
            Stop-Monitoring
        }
        "monitoring-logs" {
            Show-Monitoring-Logs
        }
        "monitoring-status" {
            Show-Monitoring-Status
        }
        "test" {
            Start-Test
        }
        "test-down" {
            Stop-Test
        }
        "test-logs" {
            Show-Test-Logs
        }
        "test-run" {
            Run-Tests
        }
        "test-clean" {
            Clean-Test
        }
        "status" {
            Show-Status
        }
        "clean" {
            Write-Warning "This will remove all containers, images, and volumes. Are you sure? (y/N)"
            $response = Read-Host
            if ($response -match "^[yY]([eE][sS])?$") {
                Write-Status "Cleaning up..."
                docker-compose down -v --rmi all --remove-orphans
                docker system prune -f
                Write-Success "Cleanup complete"
            }
            else {
                Write-Status "Cleanup cancelled"
            }
        }
        "help" {
            Write-Host "Usage: .\start.ps1 [command] [-Windows]"
            Write-Host ""
            Write-Host "Commands:"
            Write-Host "  start     - Build and start all services (default)"
            Write-Host "  build     - Build Docker images only"
            Write-Host "  up        - Start services without building"
            Write-Host "  down      - Stop all services"
            Write-Host "  restart   - Restart all services"
            Write-Host "  logs      - Show logs for all services"
            Write-Host "  logs-backend  - Show backend logs only"
            Write-Host "  logs-frontend - Show frontend logs only"
            Write-Host "  logs-db   - Show database logs only"
            Write-Host "  logs-redis - Show redis logs only"
            Write-Host "  logs-all  - Show all services logs"
            Write-Host "  monitoring - Start monitoring stack (Prometheus + Grafana)"
            Write-Host "  monitoring-down - Stop monitoring stack"
            Write-Host "  monitoring-logs - Show monitoring logs"
            Write-Host "  monitoring-status - Show monitoring status"
            Write-Host "  test      - Start test environment"
            Write-Host "  test-down - Stop test environment"
            Write-Host "  test-logs - Show test logs"
            Write-Host "  test-run  - Run tests in test environment"
            Write-Host "  test-clean - Clean test environment"
            Write-Host "  status    - Show service status"
            Write-Host "  clean     - Remove all containers, images, and volumes"
            Write-Host "  help      - Show this help message"
            Write-Host ""
            Write-Host "Options:"
            Write-Host "  -Windows  - Use Windows-specific configurations"
        }
        default {
            Write-Error "Unknown command: $Command"
            Write-Host "Use '.\start.ps1 help' to see available commands"
            exit 1
        }
    }
}

# Run main function
Main
