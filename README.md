# 🏗️ Tender Management System (TMS)

A comprehensive, full-stack tender management system built with ASP.NET Core, React, and PostgreSQL, fully containerized with Docker.

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Git

### 3-Command Setup
```bash
# 1. Clone the repository
git clone <repository-url>
cd tms

# 2. Start the application
make setup

# 3. Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

**Default Login:**
- Username: `admin`
- Password: `Admin123!`

## 📋 Features

### Core Functionality
- ✅ **Tender Management** - Create, edit, and manage tenders
- ✅ **Quotation System** - Submit and manage quotations
- ✅ **Contract Management** - Handle contract lifecycle
- ✅ **Supplier Management** - Manage supplier information
- ✅ **Assignment Orders** - Track assignment orders
- ✅ **Supply Deliveries** - Monitor delivery schedules
- ✅ **Guarantee Letters** - Bank and government guarantees
- ✅ **Support Matters** - Customer support system
- ✅ **Notifications** - Real-time notifications
- ✅ **File Uploads** - Document management
- ✅ **Dashboard** - Analytics and KPIs

### Technical Features
- ✅ **Multi-language Support** - Arabic/English with RTL/LTR
- ✅ **Dark/Light Mode** - Theme switching
- ✅ **Responsive Design** - Mobile-friendly interface
- ✅ **Real-time Updates** - Live data synchronization
- ✅ **Role-based Access** - User permissions system
- ✅ **API Documentation** - Swagger/OpenAPI
- ✅ **Health Monitoring** - System health checks
- ✅ **Logging** - Comprehensive logging system

## 🐳 Docker Architecture

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

## 🛠️ Available Commands

### Development
```bash
make dev          # Start development with hot reload
make dev-build    # Build development images
make dev-logs     # View development logs
make dev-down     # Stop development environment
```

### Production
```bash
make prod         # Start production environment
make prod-build   # Build production images
make prod-logs    # View production logs
make prod-down    # Stop production environment
```

### Testing
```bash
make test         # Start test environment
make test-build   # Build test images
make test-logs    # View test logs
make test-down    # Stop test environment
make test-run     # Run tests
```

### Monitoring
```bash
make monitoring   # Start monitoring stack (Prometheus + Grafana)
make monitoring-down # Stop monitoring stack
make monitoring-logs # View monitoring logs
```

### Database
```bash
make db-backup    # Backup database
make db-restore   # Restore database
make db-reset     # Reset database (WARNING: deletes all data)
```

### Utilities
```bash
make status       # Check service status
make logs         # View all logs
make clean        # Clean up everything
make shell-backend    # Open backend shell
make shell-frontend   # Open frontend shell
make shell-db         # Open database shell
```

## 📁 Project Structure

```
tms/
├── TMS.API/                 # ASP.NET Core Backend
│   ├── Controllers/         # API Controllers
│   ├── DTOs/               # Data Transfer Objects
│   ├── Entities/           # Database Entities
│   ├── Dockerfile          # Production Docker image
│   └── Dockerfile.dev      # Development Docker image
├── Frontend/               # React Frontend
│   ├── src/                # Source code
│   ├── public/             # Public assets
│   ├── Dockerfile          # Production Docker image
│   ├── Dockerfile.dev      # Development Docker image
│   └── nginx.conf          # Nginx configuration
├── docker-compose.yml      # Main production compose
├── docker-compose.dev.yml  # Development compose
├── docker-compose.test.yml # Testing compose
├── docker-compose.monitoring.yml # Monitoring stack
├── Makefile                # Convenient commands
├── scripts/                # Helper scripts
└── monitoring/             # Monitoring configurations
```

## 🔧 Configuration

### Environment Variables
Copy `env.example` to `.env` and customize:

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
- **Prometheus**: 9090 (Monitoring)
- **Grafana**: 3001 (Dashboards)

## 🚀 Deployment

### Local Development
```bash
make dev
```

### Production
```bash
# 1. Copy production environment
cp env.production .env

# 2. Edit environment variables
nano .env

# 3. Start production
make prod
```

### Cloud Deployment
The Docker setup is ready for:
- AWS ECS/Fargate
- Azure Container Instances
- Google Cloud Run
- Kubernetes
- Any Docker-compatible platform

## 📊 Monitoring

### Health Checks
- Backend: `http://localhost:5000/health`
- Frontend: `http://localhost:3000/health`

### Metrics & Dashboards
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001` (admin/admin)

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Check what's using the port
netstat -tulpn | grep :3000

# Or change ports in docker-compose.yml
```

**Services not starting:**
```bash
# Check logs
make logs

# Restart services
make restart
```

**Database issues:**
```bash
# Reset database
make db-reset

# Check database logs
docker-compose logs postgres
```

**Reset everything:**
```bash
make clean
make setup
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker setup
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

- Check `DOCKER_README.md` for detailed Docker documentation
- Review logs with `make logs`
- Check service status with `make status`
- Create an issue for bugs or feature requests

---

**Built with ❤️ using Docker, ASP.NET Core, React, and PostgreSQL**
