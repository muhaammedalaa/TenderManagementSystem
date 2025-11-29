# 🚀 TMS Quick Start Guide

## Prerequisites
- Docker Desktop installed and running
- Git

## Quick Start (3 commands)

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

## Alternative: Using PowerShell (Windows)

```powershell
# 1. Clone the repository
git clone <repository-url>
cd tms

# 2. Start the application
.\scripts\start.ps1

# 3. Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

## What's Included

- ✅ **Frontend**: React application with modern UI
- ✅ **Backend**: ASP.NET Core Web API
- ✅ **Database**: PostgreSQL with pre-configured schema
- ✅ **Caching**: Redis for performance
- ✅ **File Storage**: Local file uploads
- ✅ **Health Checks**: Monitoring endpoints
- ✅ **Hot Reload**: Development mode with live updates

## Default Credentials

- **Username**: admin
- **Password**: Admin123!

## Common Commands

```bash
# Development
make dev          # Start with hot reload
make dev-logs     # View logs
make dev-down     # Stop services

# Production
make prod         # Start production mode
make prod-logs    # View logs
make prod-down    # Stop services

# Database
make db-backup    # Backup database
make db-restore   # Restore database

# Utilities
make status       # Check service status
make clean        # Clean up everything
```

## Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
netstat -tulpn | grep :3000

# Or change ports in docker-compose.yml
```

### Services Not Starting
```bash
# Check logs
make logs

# Restart services
make restart
```

### Database Issues
```bash
# Reset database
make db-reset

# Check database logs
docker-compose logs postgres
```

## Next Steps

1. **Customize**: Edit `.env` file for your configuration
2. **Develop**: Make changes to the code (hot reload enabled)
3. **Deploy**: Use production configuration for deployment
4. **Monitor**: Check health endpoints and logs

## Support

- Check `DOCKER_README.md` for detailed documentation
- Review logs with `make logs`
- Check service status with `make status`

---

**Happy Coding! 🎉**
