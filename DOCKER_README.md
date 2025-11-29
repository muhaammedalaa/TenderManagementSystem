# 🐳 TMS Docker Setup

This guide explains how to run the Tender Management System (TMS) using Docker containers.

## 📋 Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0+
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd tms
```

### 2. Environment Setup
```bash
# Copy environment file
cp env.example .env

# Edit environment variables if needed
nano .env
```

### 3. Start the Application

#### For Development (with hot reload):
```bash
# Using Makefile (recommended)
make setup

# Or using docker-compose directly
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
```

#### For Production:
```bash
# Using Makefile
make prod

# Or using docker-compose directly
docker-compose up -d
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432
- **Redis**: localhost:6379

## 🛠️ Available Commands

### Development Commands
```bash
make dev          # Start development environment
make dev-build    # Build development images
make dev-logs     # Show development logs
make dev-down     # Stop development environment
```

### Production Commands
```bash
make prod         # Start production environment
make prod-build   # Build production images
make prod-logs    # Show production logs
make prod-down    # Stop production environment
```

### Database Commands
```bash
make db-reset     # Reset database (WARNING: deletes all data)
make db-backup    # Backup database
make db-restore   # Restore database from backup
```

### Utility Commands
```bash
make clean        # Clean up containers, images, and volumes
make logs         # Show logs for all services
make status       # Show status of all services
make shell-backend    # Open shell in backend container
make shell-frontend   # Open shell in frontend container
make shell-db         # Open shell in database container
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   PostgreSQL    │
│   (React)       │◄──►│   (ASP.NET)     │◄──►│   Database      │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │     Redis       │
                    │   (Optional)    │
                    │   Port: 6379    │
                    └─────────────────┘
```

## 📁 Project Structure

```
tms/
├── docker-compose.yml              # Main production compose file
├── docker-compose.dev.yml          # Development compose file
├── docker-compose.override.yml     # Local development overrides
├── Makefile                        # Convenient commands
├── env.example                     # Environment variables template
├── TMS.API/
│   ├── Dockerfile                  # Production backend image
│   ├── Dockerfile.dev              # Development backend image
│   └── .dockerignore               # Backend ignore file
├── Frontend/
│   ├── Dockerfile                  # Production frontend image
│   ├── Dockerfile.dev              # Development frontend image
│   ├── nginx.conf                  # Nginx configuration
│   └── .dockerignore               # Frontend ignore file
└── database_schema.sql             # Database initialization
```

## 🔧 Configuration

### Environment Variables

Key environment variables you can customize in `.env`:

```bash
# Database
POSTGRES_DB=tms_db
POSTGRES_USER=tms_user
POSTGRES_PASSWORD=tms_password

# Backend
JWT_KEY=YourSuperSecretKeyThatIsAtLeast32CharactersLong!
ASPNETCORE_ENVIRONMENT=Production

# Frontend
REACT_APP_API_URL=http://localhost:5000
```

### Ports

- **Frontend**: 3000 (HTTP)
- **Backend**: 5000 (HTTP)
- **Database**: 5432 (PostgreSQL)
- **Redis**: 6379 (Redis)

### Volumes

- `postgres_data`: Database persistent storage
- `uploads_data`: File uploads storage
- `redis_data`: Redis persistent storage

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :3000
   
   # Kill the process or change ports in docker-compose.yml
   ```

2. **Database connection issues**:
   ```bash
   # Check database logs
   make logs
   
   # Restart database
   docker-compose restart postgres
   ```

3. **Frontend not loading**:
   ```bash
   # Check if backend is running
   curl http://localhost:5000/health
   
   # Check frontend logs
   docker-compose logs frontend
   ```

4. **Permission issues**:
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Reset Everything

```bash
# Stop and remove everything
make clean

# Start fresh
make setup
```

## 📊 Monitoring

### Health Checks

All services include health checks:

```bash
# Check service status
make status

# Check specific service health
docker-compose ps
```

### Logs

```bash
# All services
make logs

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

## 🚀 Deployment

### Production Deployment

1. **Update environment variables** for production
2. **Build production images**:
   ```bash
   make prod-build
   ```
3. **Start production services**:
   ```bash
   make prod
   ```

### Cloud Deployment

The Docker setup is ready for deployment on:
- AWS ECS/Fargate
- Azure Container Instances
- Google Cloud Run
- Kubernetes
- Any Docker-compatible platform

## 🔒 Security

### Production Security Checklist

- [ ] Change default passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Database encryption at rest
- [ ] Backup strategy

## 📝 Development

### Hot Reload

Development setup includes hot reload for both frontend and backend:

```bash
# Start development with hot reload
make dev

# View logs
make dev-logs
```

### Adding New Services

1. Add service to `docker-compose.yml`
2. Create Dockerfile if needed
3. Update Makefile with new commands
4. Test with `make dev`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker setup
5. Submit a pull request

## 📞 Support

For issues with Docker setup:
1. Check the troubleshooting section
2. Review logs: `make logs`
3. Check service status: `make status`
4. Create an issue with logs and error details
