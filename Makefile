# TMS Docker Management Makefile

.PHONY: help build up down restart logs clean dev prod test

# Default target
help:
	@echo "TMS Docker Management Commands:"
	@echo ""
	@echo "Development:"
	@echo "  dev          - Start development environment with hot reload"
	@echo "  dev-build    - Build development images"
	@echo "  dev-logs     - Show development logs"
	@echo "  dev-down     - Stop development environment"
	@echo ""
	@echo "Production:"
	@echo "  prod         - Start production environment"
	@echo "  prod-build   - Build production images"
	@echo "  prod-logs    - Show production logs"
	@echo "  prod-down    - Stop production environment"
	@echo ""
	@echo "Testing:"
	@echo "  test         - Start test environment"
	@echo "  test-build   - Build test images"
	@echo "  test-logs    - Show test logs"
	@echo "  test-down    - Stop test environment"
	@echo "  test-run     - Run tests in test environment"
	@echo ""
	@echo "Database:"
	@echo "  db-reset     - Reset database (WARNING: deletes all data)"
	@echo "  db-backup    - Backup database"
	@echo "  db-restore   - Restore database from backup"
	@echo ""
	@echo "Monitoring:"
	@echo "  monitoring   - Start monitoring stack (Prometheus + Grafana)"
	@echo "  monitoring-down - Stop monitoring stack"
	@echo "  monitoring-logs - Show monitoring logs"
	@echo ""
	@echo "Utilities:"
	@echo "  clean        - Clean up containers, images, and volumes"
	@echo "  logs         - Show logs for all services"
	@echo "  status       - Show status of all services"
	@echo "  shell-backend - Open shell in backend container"
	@echo "  shell-frontend - Open shell in frontend container"
	@echo "  shell-db     - Open shell in database container"

# Development commands
dev:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d

dev-build:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml build

dev-logs:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml logs -f

dev-down:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml down

# Production commands
prod:
	docker-compose up -d

prod-build:
	docker-compose build

prod-logs:
	docker-compose logs -f

prod-down:
	docker-compose down

# Database commands
db-reset:
	@echo "WARNING: This will delete all data in the database!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ]
	docker-compose down -v
	docker-compose up -d postgres
	@echo "Database reset complete"

db-backup:
	@mkdir -p backups
	docker-compose exec postgres pg_dump -U tms_user tms_db > backups/tms_backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "Database backup created in backups/ directory"

db-restore:
	@echo "Available backups:"
	@ls -la backups/*.sql 2>/dev/null || echo "No backups found"
	@read -p "Enter backup filename: " backup_file && \
	docker-compose exec -T postgres psql -U tms_user -d tms_db < backups/$$backup_file
	@echo "Database restored from $$backup_file"

# Test commands
test:
	docker-compose -f docker-compose.test.yml up -d

test-build:
	docker-compose -f docker-compose.test.yml build

test-logs:
	docker-compose -f docker-compose.test.yml logs -f

test-down:
	docker-compose -f docker-compose.test.yml down

test-run:
	docker-compose -f docker-compose.test.yml exec backend-test dotnet test

# Monitoring commands
monitoring:
	docker-compose -f docker-compose.monitoring.yml up -d

monitoring-down:
	docker-compose -f docker-compose.monitoring.yml down

monitoring-logs:
	docker-compose -f docker-compose.monitoring.yml logs -f

# Utility commands
clean:
	docker-compose down -v --rmi all --remove-orphans
	docker-compose -f docker-compose.test.yml down -v --rmi all --remove-orphans
	docker-compose -f docker-compose.monitoring.yml down -v --rmi all --remove-orphans
	docker system prune -f
	@echo "Cleanup complete"

logs:
	docker-compose logs -f

status:
	docker-compose ps

shell-backend:
	docker-compose exec backend /bin/bash

shell-frontend:
	docker-compose exec frontend /bin/sh

shell-db:
	docker-compose exec postgres psql -U tms_user -d tms_db

# Quick start for new developers
setup:
	@echo "Setting up TMS development environment..."
	@echo "1. Building images..."
	$(MAKE) dev-build
	@echo "2. Starting services..."
	$(MAKE) dev
	@echo "3. Waiting for services to be ready..."
	@sleep 30
	@echo "4. Checking service status..."
	$(MAKE) status
	@echo ""
	@echo "Setup complete! Services are running:"
	@echo "- Frontend: http://localhost:3000"
	@echo "- Backend API: http://localhost:5000"
	@echo "- Database: localhost:5432"
	@echo ""
	@echo "Use 'make dev-logs' to see logs"
	@echo "Use 'make dev-down' to stop services"
