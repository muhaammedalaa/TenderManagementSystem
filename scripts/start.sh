#!/bin/bash

# TMS Docker Start Script
# This script provides an easy way to start the TMS application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if docker-compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "docker-compose is not installed. Please install it and try again."
        exit 1
    fi
    print_success "docker-compose is available"
}

# Function to create .env file if it doesn't exist
create_env_file() {
    if [ ! -f .env ]; then
        print_status "Creating .env file from template..."
        cp env.example .env
        print_success ".env file created"
    else
        print_status ".env file already exists"
    fi
}

# Function to build images
build_images() {
    print_status "Building Docker images..."
    docker-compose build
    print_success "Images built successfully"
}

# Function to start services
start_services() {
    print_status "Starting services..."
    docker-compose up -d
    print_success "Services started"
}

# Function to wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for database
    print_status "Waiting for database..."
    until docker-compose exec postgres pg_isready -U tms_user -d tms_db > /dev/null 2>&1; do
        sleep 2
    done
    print_success "Database is ready"
    
    # Wait for backend
    print_status "Waiting for backend..."
    until curl -f http://localhost:5000/health > /dev/null 2>&1; do
        sleep 5
    done
    print_success "Backend is ready"
    
    # Wait for frontend
    print_status "Waiting for frontend..."
    until curl -f http://localhost:3000 > /dev/null 2>&1; do
        sleep 5
    done
    print_success "Frontend is ready"
}

# Function to show service status
show_status() {
    print_status "Service Status:"
    docker-compose ps
    
    echo ""
    print_status "Application URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend API: http://localhost:5000"
    echo "  Database: localhost:5432"
    echo "  Redis: localhost:6379"
}

# Function to show logs
show_logs() {
    print_status "Showing logs (Press Ctrl+C to exit)..."
    docker-compose logs -f
}

# Main function
main() {
    echo "🐳 TMS Docker Setup"
    echo "==================="
    echo ""
    
    # Check prerequisites
    check_docker
    check_docker_compose
    
    # Create environment file
    create_env_file
    
    # Parse command line arguments
    case "${1:-start}" in
        "start")
            build_images
            start_services
            wait_for_services
            show_status
            ;;
        "build")
            build_images
            ;;
        "up")
            start_services
            wait_for_services
            show_status
            ;;
        "down")
            print_status "Stopping services..."
            docker-compose down
            print_success "Services stopped"
            ;;
        "restart")
            print_status "Restarting services..."
            docker-compose down
            start_services
            wait_for_services
            show_status
            ;;
        "logs")
            show_logs
            ;;
        "status")
            show_status
            ;;
        "clean")
            print_warning "This will remove all containers, images, and volumes. Are you sure? (y/N)"
            read -r response
            if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
                print_status "Cleaning up..."
                docker-compose down -v --rmi all --remove-orphans
                docker system prune -f
                print_success "Cleanup complete"
            else
                print_status "Cleanup cancelled"
            fi
            ;;
        "help")
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  start     - Build and start all services (default)"
            echo "  build     - Build Docker images only"
            echo "  up        - Start services without building"
            echo "  down      - Stop all services"
            echo "  restart   - Restart all services"
            echo "  logs      - Show logs for all services"
            echo "  status    - Show service status"
            echo "  clean     - Remove all containers, images, and volumes"
            echo "  help      - Show this help message"
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Use '$0 help' to see available commands"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
