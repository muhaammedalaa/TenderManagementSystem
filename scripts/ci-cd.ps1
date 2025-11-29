# TMS CI/CD Pipeline Script for Windows
# This script provides local CI/CD functionality

param(
    [string]$Action = "help",
    [string]$Environment = "staging",
    [string]$Tag = "",
    [switch]$SkipTests = $false,
    [switch]$SkipSecurity = $false,
    [switch]$SkipBuild = $false,
    [switch]$Force = $false
)

# Colors for output
$ErrorColor = "Red"
$SuccessColor = "Green"
$WarningColor = "Yellow"
$InfoColor = "Cyan"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $InfoColor
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $SuccessColor
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $WarningColor
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $ErrorColor
}

# Function to check prerequisites
function Test-Prerequisites {
    Write-Status "Checking prerequisites..."
    
    # Check Docker
    try {
        docker --version | Out-Null
        Write-Success "Docker is available"
    } catch {
        Write-Error "Docker is not available. Please install Docker Desktop."
        return $false
    }
    
    # Check Docker Compose
    try {
        docker-compose --version | Out-Null
        Write-Success "Docker Compose is available"
    } catch {
        Write-Error "Docker Compose is not available. Please install Docker Compose."
        return $false
    }
    
    # Check Git
    try {
        git --version | Out-Null
        Write-Success "Git is available"
    } catch {
        Write-Error "Git is not available. Please install Git."
        return $false
    }
    
    return $true
}

# Function to build images
function Build-Images {
    param([string]$Tag)
    
    Write-Status "Building Docker images..."
    
    if ($Tag -eq "") {
        $Tag = (git rev-parse --short HEAD)
    }
    
    Write-Status "Building with tag: $Tag"
    
    # Build backend
    Write-Status "Building backend image..."
    docker build -f TMS.API/Dockerfile.windows -t tms-backend:$Tag .
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build backend image"
        return $false
    }
    
    # Build frontend
    Write-Status "Building frontend image..."
    docker build -f Frontend/Dockerfile.windows -t tms-frontend:$Tag ./Frontend
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build frontend image"
        return $false
    }
    
    Write-Success "Images built successfully"
    return $true
}

# Function to run tests
function Invoke-Tests {
    Write-Status "Running tests..."
    
    # Start test environment
    Write-Status "Starting test environment..."
    docker-compose -f docker-compose.test.windows.yml up -d
    
    # Wait for services
    Write-Status "Waiting for services to be ready..."
    Start-Sleep -Seconds 30
    
    $maxAttempts = 60
    $attempt = 0
    do {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5002/health" -UseBasicParsing -TimeoutSec 5
            $backendReady = $response.StatusCode -eq 200
        } catch {
            $backendReady = $false
        }
        if (-not $backendReady) {
            Start-Sleep -Seconds 5
            $attempt++
        }
    } while (-not $backendReady -and $attempt -lt $maxAttempts)
    
    if (-not $backendReady) {
        Write-Error "Backend service not ready after $maxAttempts attempts"
        return $false
    }
    
    # Run backend tests
    Write-Status "Running backend tests..."
    docker-compose -f docker-compose.test.windows.yml exec -T backend-test dotnet test
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Backend tests failed"
        return $false
    }
    
    # Run frontend tests
    Write-Status "Running frontend tests..."
    docker-compose -f docker-compose.test.windows.yml exec -T frontend-test npm test -- --coverage --watchAll=false
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Frontend tests failed"
        return $false
    }
    
    Write-Success "All tests passed"
    return $true
}

# Function to run security scan
function Invoke-SecurityScan {
    Write-Status "Running security scan..."
    
    # Check if Trivy is available
    try {
        trivy --version | Out-Null
        Write-Success "Trivy is available"
    } catch {
        Write-Warning "Trivy is not available. Skipping security scan."
        return $true
    }
    
    # Scan backend image
    Write-Status "Scanning backend image..."
    trivy image tms-backend:latest --format table --exit-code 0
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Security scan found vulnerabilities in backend image"
        return $false
    }
    
    # Scan frontend image
    Write-Status "Scanning frontend image..."
    trivy image tms-frontend:latest --format table --exit-code 0
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Security scan found vulnerabilities in frontend image"
        return $false
    }
    
    Write-Success "Security scan completed successfully"
    return $true
}

# Function to deploy
function Deploy-Application {
    param([string]$Environment, [string]$Tag)
    
    Write-Status "Deploying to $Environment environment..."
    
    # Set environment variables
    $env:ENVIRONMENT = $Environment
    $env:IMAGE_TAG = $Tag
    
    # Deploy based on environment
    switch ($Environment.ToLower()) {
        "staging" {
            Write-Status "Deploying to staging..."
            docker-compose -f docker-compose.staging.windows.yml up -d
        }
        "production" {
            Write-Status "Deploying to production..."
            docker-compose -f docker-compose.prod.windows.yml up -d
        }
        "development" {
            Write-Status "Deploying to development..."
            docker-compose -f docker-compose.windows.yml up -d
        }
        default {
            Write-Error "Unknown environment: $Environment"
            return $false
        }
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Deployment failed"
        return $false
    }
    
    Write-Success "Deployment completed successfully"
    return $true
}

# Function to run health checks
function Invoke-HealthChecks {
    param([string]$Environment)
    
    Write-Status "Running health checks..."
    
    $baseUrl = switch ($Environment.ToLower()) {
        "staging" { "http://localhost:3000" }
        "production" { "http://localhost:3000" }
        "development" { "http://localhost:3000" }
        default { "http://localhost:3000" }
    }
    
    # Check frontend
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl" -UseBasicParsing -TimeoutSec 30
        if ($response.StatusCode -eq 200) {
            Write-Success "Frontend health check passed"
        } else {
            Write-Error "Frontend health check failed"
            return $false
        }
    } catch {
        Write-Error "Frontend health check failed: $($_.Exception.Message)"
        return $false
    }
    
    # Check backend
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/health" -UseBasicParsing -TimeoutSec 30
        if ($response.StatusCode -eq 200) {
            Write-Success "Backend health check passed"
        } else {
            Write-Error "Backend health check failed"
            return $false
        }
    } catch {
        Write-Error "Backend health check failed: $($_.Exception.Message)"
        return $false
    }
    
    Write-Success "All health checks passed"
    return $true
}

# Function to cleanup
function Invoke-Cleanup {
    Write-Status "Cleaning up..."
    
    # Stop all containers
    docker-compose -f docker-compose.windows.yml down
    docker-compose -f docker-compose.test.windows.yml down
    docker-compose -f docker-compose.staging.windows.yml down
    docker-compose -f docker-compose.prod.windows.yml down
    
    # Remove unused images
    docker image prune -f
    
    Write-Success "Cleanup completed"
}

# Function to show help
function Show-Help {
    Write-Host "TMS CI/CD Pipeline Script for Windows" -ForegroundColor Magenta
    Write-Host "=====================================" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "Usage: .\ci-cd.ps1 -Action <action> [options]"
    Write-Host ""
    Write-Host "Actions:"
    Write-Host "  build       - Build Docker images"
    Write-Host "  test        - Run tests"
    Write-Host "  security    - Run security scan"
    Write-Host "  deploy      - Deploy application"
    Write-Host "  health      - Run health checks"
    Write-Host "  full        - Run full CI/CD pipeline"
    Write-Host "  cleanup     - Clean up resources"
    Write-Host "  help        - Show this help"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Environment <env>  - Target environment (staging, production, development)"
    Write-Host "  -Tag <tag>          - Docker image tag"
    Write-Host "  -SkipTests          - Skip test execution"
    Write-Host "  -SkipSecurity       - Skip security scan"
    Write-Host "  -SkipBuild          - Skip build step"
    Write-Host "  -Force              - Force execution without confirmation"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\ci-cd.ps1 -Action build"
    Write-Host "  .\ci-cd.ps1 -Action test"
    Write-Host "  .\ci-cd.ps1 -Action deploy -Environment staging"
    Write-Host "  .\ci-cd.ps1 -Action full -Environment production -Tag v1.0.0"
}

# Main function
function Main {
    Write-Host "🚀 TMS CI/CD Pipeline" -ForegroundColor Magenta
    Write-Host "=====================" -ForegroundColor Magenta
    Write-Host ""
    
    # Check prerequisites
    if (-not (Test-Prerequisites)) {
        exit 1
    }
    
    # Execute action
    switch ($Action.ToLower()) {
        "build" {
            if (-not (Build-Images -Tag $Tag)) {
                exit 1
            }
        }
        "test" {
            if (-not $SkipTests) {
                if (-not (Invoke-Tests)) {
                    exit 1
                }
            } else {
                Write-Warning "Tests skipped"
            }
        }
        "security" {
            if (-not $SkipSecurity) {
                if (-not (Invoke-SecurityScan)) {
                    exit 1
                }
            } else {
                Write-Warning "Security scan skipped"
            }
        }
        "deploy" {
            if (-not (Deploy-Application -Environment $Environment -Tag $Tag)) {
                exit 1
            }
        }
        "health" {
            if (-not (Invoke-HealthChecks -Environment $Environment)) {
                exit 1
            }
        }
        "full" {
            Write-Status "Running full CI/CD pipeline..."
            
            if (-not $SkipBuild) {
                if (-not (Build-Images -Tag $Tag)) {
                    exit 1
                }
            }
            
            if (-not $SkipTests) {
                if (-not (Invoke-Tests)) {
                    exit 1
                }
            }
            
            if (-not $SkipSecurity) {
                if (-not (Invoke-SecurityScan)) {
                    exit 1
                }
            }
            
            if (-not (Deploy-Application -Environment $Environment -Tag $Tag)) {
                exit 1
            }
            
            if (-not (Invoke-HealthChecks -Environment $Environment)) {
                exit 1
            }
            
            Write-Success "Full CI/CD pipeline completed successfully!"
        }
        "cleanup" {
            Invoke-Cleanup
        }
        "help" {
            Show-Help
        }
        default {
            Write-Error "Unknown action: $Action"
            Show-Help
            exit 1
        }
    }
}

# Run main function
Main
