# CENTIFY PROJECT RUNBOOK

**Last Updated**: July 2026  
**Project**: Centify (Financial Management Application)  
**Status**: Production-Ready (Live at https://centifyapp.online)

---

## TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Local Development Setup](#local-development-setup)
5. [Running the Application Locally](#running-the-application-locally)
6. [Docker & Containerization](#docker--containerization)
7. [Docker Compose Deployment](#docker-compose-deployment)
8. [Production Deployment](#production-deployment)
9. [Operations & Maintenance](#operations--maintenance)
10. [Troubleshooting](#troubleshooting)
11. [Emergency Procedures](#emergency-procedures)

---

## PROJECT OVERVIEW

### What is Centify?

Centify is a full-stack financial management application that helps users track accounts, transactions, budgets, and investments.

### Tech Stack

- **Backend**: Spring Boot (Java 17) + Maven
- **Frontend**: Angular 17+ (TypeScript)
- **Database**: PostgreSQL 16
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: nginx
- **CI/CD**: GitHub Actions
- **Hosting**: DigitalOcean VPS
- **Monitoring**: UptimeRobot
- **Security**: TLS/HTTPS (Let's Encrypt)

### Key URLs

- **Production**: https://centifyapp.online
- **GitHub**: https://github.com/vickoh25/centify 
- **Docker Hub**: https://hub.docker.com/u/vickoh25
- **VPS Provider**: DigitalOcean (174.138.0.12)

---

## ARCHITECTURE

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Internet (Users)                         │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS (Port 443)
                         ↓
        ┌────────────────────────────────────┐
        │   nginx Reverse Proxy (Container)   │
        │   - Serves Angular frontend         │
        │   - Routes /api/* → backend         │
        │   - TLS termination                 │
        └────────┬─────────────────────┬──────┘
                 │ (Port 80)            │ (Port 8080)
        ┌────────↓────────┐    ┌───────↓──────────┐
        │   Angular App   │    │ Spring Boot API  │
        │   (Port 4200)   │    │   (Port 8080)    │
        │   - Dashboard   │    │ - Controllers    │
        │   - Components  │    │ - Services       │
        │   - Routing     │    │ - JWT Auth       │
        └────────┬────────┘    └───────┬──────────┘
                 │                     │
                 └──────────┬──────────┘
                            │ JDBC
                     ┌──────↓──────────┐
                     │  PostgreSQL DB  │
                     │  (Port 5432)    │
                     │  - Schema       │
                     │  - Data         │
                     │  - Persistence  │
                     └─────────────────┘

All running in Docker containers on DigitalOcean VPS (174.138.0.12)
```

### Service Communication

- **Frontend → Backend**: HTTP requests to `/api/*` endpoints
- **Backend → Database**: JDBC connection strings
- **nginx → Frontend**: Serves compiled Angular static files
- **nginx → Backend**: Reverse proxy via `proxy_pass`

---

## PREREQUISITES

### For Local Development
- **Java 17 LTS**: OpenJDK
- **Maven 3.8+**: https://maven.apache.org/
- **Node.js 18+**: https://nodejs.org/
- **Docker Desktop**: https://www.docker.com/products/docker-desktop
- **PostgreSQL 16**: https://www.postgresql.org/
- **Git**: Version control for source code

### For Production Deployment

- **DigitalOcean VPS**: 174.138.0.12
- **SSH Key Pair**: For secure server access
- **Domain Name**: `centifyapp.online` (registered & configured)
- **Docker**: Pre-installed on server
- **Docker Compose**: Plugin installed
- **certbot**: For Let's Encrypt certificates

### Environment Setup 

```bash
# Check Java version
java -version
# Expected: openjdk 17.x.x

# Check Maven
mvn -version
# Expected: Apache Maven 3.8+

# Check Node.js
node --version
npm --version
# Expected: Node v18+, npm 8+

# Check Docker
docker --version
docker compose version
# Expected: Docker 24+, Compose 2.x+
```

---

## LOCAL DEVELOPMENT SETUP

### 1. Clone the Repository

```bash
cd ~/Projects
git clone https://github.com/vickoh25/centify.git
cd centify
```

### 2. Project Structure

```
centify/
├── backend/                    # Spring Boot application
│   ├── src/main/java/
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── pom.xml                 # Maven dependencies
│   ├── Dockerfile              # Backend container image
│   └── mvnw                     # Maven wrapper
├── frontend/                   # Angular application
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   └── styles/
│   ├── package.json            # npm dependencies
│   ├── angular.json            # Angular config
│   ├── Dockerfile              # Frontend container image
│   └── nginx.conf              # nginx configuration
├── docker-compose.yml          # Full stack orchestration
├── .env                        # Environment variables (GITIGNORED)
└── README.md
```

### 3. Backend Setup

#### Install Dependencies

```bash
cd backend
mvn clean install
```

#### Configure Database Connection

Edit `backend/src/main/resources/application.properties`:

```properties
# PostgreSQL Connection
spring.datasource.url=jdbc:postgresql://localhost:5432/centify
spring.datasource.username=centify_user
spring.datasource.password=your_secure_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQL10Dialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# Server Port
server.port=8080

# CORS Configuration
spring.web.cors.allowed-origins=http://localhost:4200
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allow-credentials=true
```

### 4. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Configure API Base URL

Edit `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

---

## RUNNING THE APPLICATION LOCALLY

### Option 1: Manual Local Development (Recommended for Development)

#### Terminal 1: PostgreSQL

```bash
# Using Docker (easiest)
docker run --name centify-postgres \
  -e POSTGRES_DB=centify \
  -e POSTGRES_USER=centify_user \
  -e POSTGRES_PASSWORD=your_secure_password \
  -p 5432:5432 \
  postgres:16
```

Or install PostgreSQL locally and create database:

```bash
psql -U postgres
CREATE DATABASE centify;
CREATE USER centify_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE centify TO centify_user;
```

#### Terminal 2: Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
# Or: java -jar target/backend-0.0.1-SNAPSHOT.jar

# Expected output:
# Tomcat started on port(s): 8080 (http)
```

Test backend:

```bash
curl http://localhost:8080/api/health
# Expected: {"status":"UP"}
```

#### Terminal 3: Frontend (Angular Dev Server)

```bash
cd frontend
ng serve --open
# Or: npm start

# Opens http://localhost:4200 automatically
```

### Option 2: Full Docker Compose (Recommended for Testing Production Setup)

```bash
# From project root
docker compose up -d

# Check status
docker compose ps

# Expected output:
# NAME                 STATUS
# centify-backend      Up (healthy)
# centify-frontend     Up
# centify-postgres     Up (healthy)
# centify-nginx        Up
```

### Verify All Services are Running

```bash
# Backend health check
curl http://localhost:8080/api/health

# Frontend
open http://localhost:80
# or: curl http://localhost:80

# Database
docker exec -it centify-postgres psql -U centify_user -d centify -c "SELECT version();"
```

### Viewing Logs (Docker Compose)

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f centify-backend
docker compose logs -f centify-frontend
docker compose logs -f centify-postgres

# Last 100 lines
docker compose logs --tail=100
```

### Stopping Services

```bash
# Stop without removing containers
docker compose stop

# Stop and remove containers
docker compose down

# Stop and remove containers + volumes (DELETES DATA!)
docker compose down -v
```

---

## DOCKER & CONTAINERIZATION

### Understanding the Dockerfiles

#### Backend Dockerfile

```dockerfile
# Stage 1: Build
FROM maven:3.8-openjdk-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src src
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM openjdk:17-slim
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Key Points**:
- Multi-stage build (reduce final image size)
- Build stage: Compiles Java code using Maven
- Runtime stage: Runs the JAR (no source code included)
- Final image size: ~350MB

#### Frontend Dockerfile

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Runtime (nginx)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Key Points**:
- Builds Angular app in Node container
- Serves compiled files with nginx
- Small image size: ~50MB
- nginx handles SPA routing with `try_files`

### Building Images Locally

```bash
# Backend
docker build -t vickoh25/centify-backend:latest ./backend

# Frontend
docker build -t vickoh25/centify-frontend:latest ./frontend

# View images
docker images | grep centify
```

### Running Containers Individually

```bash
# PostgreSQL
docker run -d \
  --name centify-postgres \
  -e POSTGRES_DB=centify \
  -e POSTGRES_USER=centify_user \
  -e POSTGRES_PASSWORD=password \
  -v centify-postgres-data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16

# Backend
docker run -d \
  --name centify-backend \
  -e DATABASE_URL=jdbc:postgresql://centify-postgres:5432/centify \
  -e DATABASE_USER=centify_user \
  -e DATABASE_PASSWORD=password \
  --link centify-postgres \
  -p 8080:8080 \
  vickoh25/centify-backend:latest

# Frontend
docker run -d \
  --name centify-frontend \
  -p 80:80 \
  vickoh25/centify-frontend:latest

# nginx (reverse proxy)
docker run -d \
  --name centify-nginx \
  -v ./nginx.conf:/etc/nginx/conf.d/default.conf \
  -p 80:80 \
  -p 443:443 \
  nginx:alpine
```

---

## DOCKER COMPOSE DEPLOYMENT

### Docker Compose File Structure

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  centify-postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: centify
      POSTGRES_USER: centify_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - centify-postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U centify_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Spring Boot Backend
  centify-backend:
    image: vickoh25/centify-backend:latest
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://centify-postgres:5432/centify
      SPRING_DATASOURCE_USERNAME: centify_user
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
    ports:
      - "8080:8080"
    depends_on:
      centify-postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Angular Frontend
  centify-frontend:
    image: vickoh25/centify-frontend:latest
    ports:
      - "4200:80"
    depends_on:
      - centify-backend

  # nginx Reverse Proxy
  centify-nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - centify-frontend
      - centify-backend

volumes:
  centify-postgres-data:

networks:
  default:
    name: centify-network
```

### Environment File (.env)

Create `.env` in project root (NOT in git):

```bash
# Database
DB_PASSWORD=your_super_secure_password_123

# Application
ENVIRONMENT=development
DEBUG=false

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:4200,http://localhost

# Ports (for development)
BACKEND_PORT=8080
FRONTEND_PORT=4200
DB_PORT=5432
```

### Common Docker Compose Commands

```bash
# Start all services (background)
docker compose up -d

# Start and view logs
docker compose up

# Stop all services
docker compose stop

# Stop and remove containers
docker compose down

# Stop and remove everything including volumes (CAUTION!)
docker compose down -v

# View logs
docker compose logs -f

# Restart a service
docker compose restart centify-backend

# Rebuild images before starting
docker compose up --build -d

# Execute command in running container
docker compose exec centify-backend bash

# Check service health
docker compose ps
```

---

## PRODUCTION DEPLOYMENT

### Prerequisites for Production

1. **DigitalOcean Account** with running VPS (174.138.0.12)
2. **Domain Name** (centifyapp.online) pointing to VPS
3. **SSH Access** to server with non-root user
4. **Docker & Docker Compose** pre-installed on server
5. **GitHub Repository** with push access

### Step 1: Prepare Production Environment File

Create `.env.production` locally (DO NOT commit):

```bash
# Production Database
DB_PASSWORD=centify_production_super_secure_password_2024!

# Application
ENVIRONMENT=production
DEBUG=false

# CORS - Production URLs
CORS_ALLOWED_ORIGINS=https://centifyapp.online

# Ports
BACKEND_PORT=8080
FRONTEND_PORT=80
DB_PORT=5432
```

### Step 2: Push Images to Docker Hub

```bash
# Login to Docker Hub
docker login

# Tag images with version
docker tag vickoh25/centify-backend:latest vickoh25/centify-backend:1.0.0
docker tag vickoh25/centify-frontend:latest vickoh25/centify-frontend:1.0.0

# Push to registry
docker push vickoh25/centify-backend:latest
docker push vickoh25/centify-backend:1.0.0
docker push vickoh25/centify-frontend:latest
docker push vickoh25/centify-frontend:1.0.0

# Verify on Docker Hub
# https://hub.docker.com/r/vickoh25/
```

### Step 3: SSH into Production Server

```bash
# Using SSH key (password login is disabled for security)
ssh -i ~/.ssh/id_ed25519 deploy@174.138.0.12

```

### Step 4: Clone Repository on Server

```bash
# SSH into server first
cd centify
git clone https://github.com/vickoh25/centify.git
```

### Step 5: Create Production Environment File

```bash
# Create .env with production secrets
nano .env  

# Paste production environment variables
# Save: Ctrl+X → Y → Enter
```

### Step 6: Pull Images from Docker Hub

```bash
docker pull vickoh25/centify-backend:latest
docker pull vickoh25/centify-frontend:latest
```

### Step 7: Start Services with Docker Compose

```bash
# Start all services
docker compose -f docker-compose.yml up -d

# Verify services are running
docker compose ps

# Check logs
docker compose logs -f
```

### Step 8: Configure HTTPS with Let's Encrypt

```bash
# Install certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Issue certificate (stop nginx first)
docker compose stop centify-nginx

sudo certbot certonly --standalone \
  -d centifyapp.online 

# Copy certificates into nginx container
docker cp /etc/letsencrypt/live/centifyapp.online/fullchain.pem \
  nginx:/etc/nginx/certs/cert.pem

docker cp /etc/letsencrypt/live/centifyapp.online/privkey.pem \
  nginx:/etc/nginx/certs/key.pem

# Restart nginx
docker compose start nginx
```

### Step 9: Verify Production Deployment

```bash
# Test backend API
curl https://centifyapp.online/api/health

# Test frontend (open in browser)
# https://centifyapp.online

# Check DNS resolution
dig centifyapp.online
# Should return 174.138.0.12

# Check HTTPS certificate
openssl s_client -connect centifyapp.online:443 -brief
# Should show "SSL-Session" with certificate details
```

---

## OPERATIONS & MAINTENANCE

### Daily Operations

#### Check Service Status

```bash
# SSH to server
ssh -i ~/.ssh/id_rsa deploy@174.138.0.12

# Check running services
docker compose ps

# Check server health
df -h                    # Disk space
free -h                  # Memory
top                      # CPU usage
```

#### View Application Logs

```bash
# All services
docker compose logs -f --tail=100

# Specific service
docker compose logs -f centify-backend
docker compose logs -f centify-frontend
docker compose logs -f centify-postgres

# Real-time tail (latest 50 lines)
docker compose logs -f --tail=50
```

#### Restart Services (if needed)

```bash
# Restart single service
docker compose restart centify-backend

# Restart multiple services
docker compose restart centify-backend centify-frontend

# Stop and start (full restart)
docker compose down
docker compose up -d
```

### Weekly Maintenance

#### Check Disk Space

```bash
docker system df            # Docker disk usage
du -sh /var/lib/docker/     # Docker directory size

# Clean up unused images/containers
docker system prune -a --volumes  # CAUTION: removes all unused items
```

#### Check Database

```bash
# Access database
docker exec -it centify-postgres psql -U centify_user -d centify

# In psql:
\dt                     # List tables
SELECT COUNT(*) FROM users;  # Check record count
\q                      # Exit
```

### Monthly Tasks

#### Certificate Renewal Check

```bash
# Certbot auto-renewal (should be automatic)
sudo certbot renew --dry-run

# Check certificate expiry
openssl x509 -in /etc/letsencrypt/live/centifyapp.online/cert.pem -noout -dates

# Expected output:
# notBefore=Jan  1 00:00:00 2026 GMT
# notAfter=Apr  1 00:00:00 2027 GMT
```

#### Update Dependencies

```bash
# Pull latest images
docker compose pull

# Rebuild images if needed
docker compose build --pull

# Restart with new images
docker compose up -d
```

### Quarterly Tasks

#### Full System Backup

```bash
# Backup database
docker exec centify-postgres pg_dump -U centify_user -d centify | \
  gzip > backup/centify_$(date +%Y%m%d_%H%M%S).sql.gz

# Backup application configuration
tar -czf backup/centify_config_$(date +%Y%m%d).tar.gz \
  docker-compose.yml .env nginx.conf

# Verify backups
ls -lh backup/
```

#### Security Updates

```bash
# Update server packages
sudo apt update
sudo apt upgrade -y

# Update Docker images
docker pull postgres:16
docker pull nginx:alpine
docker pull openjdk:17-slim

# Rebuild application images with latest base images
docker compose build --pull --no-cache
docker compose up -d
```

---

## TROUBLESHOOTING

### Issue 1: 403 Forbidden on API Calls

**Problem**: Frontend getting 403 Forbidden errors on `/api/*` requests

**Diagnosis**:

```bash
# Check backend logs
docker compose logs centify-backend

# Test backend directly
curl -v http://localhost:8080/api/health

# Check CORS configuration
docker exec centify-backend cat /app/application.properties | grep cors
```

**Solutions**:

```bash
# Option 1: Update CORS in backend
# Edit backend/src/main/resources/application.properties
spring.web.cors.allowed-origins=https://centifyapp.online,http://localhost:4200

# Option 2: Check nginx reverse proxy headers
# Edit frontend/nginx.conf
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;

# Rebuild and restart
docker compose rebuild
docker compose up -d
```

### Issue 2: Database Connection Refused

**Problem**: Backend cannot connect to PostgreSQL

**Diagnosis**:

```bash
# Check postgres is running
docker compose ps centify-postgres

# Check database logs
docker compose logs centify-postgres

# Test connection from backend
docker compose exec centify-backend \
  psql -h centify-postgres -U centify_user -d centify -c "SELECT 1;"
```

**Solutions**:

```bash
# Option 1: Verify credentials in .env
cat .env | grep DB_

# Option 2: Restart PostgreSQL
docker compose restart centify-postgres

# Option 3: Check volume mounting
docker compose exec centify-postgres \
  ls -la /var/lib/postgresql/data/

# Option 4: Rebuild and restart
docker compose down -v  # CAUTION: deletes data!
docker compose up -d
```

### Issue 3: Certificate Expiry Warning

**Problem**: SSL certificate warning or expired certificate

**Diagnosis**:

```bash
# Check certificate expiry
sudo certbot certificates

# Check certbot renewal log
sudo journalctl -u certbot.timer
```

**Solutions**:

```bash
# Option 1: Manual renewal
sudo certbot renew --force-renewal

# Option 2: Test renewal without actually renewing
sudo certbot renew --dry-run

# Option 3: Force renewal if near expiry
sudo certbot renew --force-renewal --email admin@centifyapp.online
```

### Issue 4: High Memory/Disk Usage

**Problem**: Server running out of resources

**Diagnosis**:

```bash
# Check disk usage
df -h

# Check memory
free -h

# Docker usage
docker system df

# Database size
docker exec centify-postgres du -sh /var/lib/postgresql/data/
```

**Solutions**:

```bash
# Option 1: Clean up Docker
docker system prune -a

# Option 2: Clean up old PostgreSQL files
docker exec centify-postgres vacuumdb -U centify_user -d centify

# Option 3: Remove old logs
docker compose logs --tail=0 | wc -l
docker logs --tail=0 $(docker ps -aq)

```

### Issue 5: Frontend Not Loading

**Problem**: Browser shows blank page or 404

**Diagnosis**:

```bash
# Check nginx logs
docker compose logs nginx

# Check if frontend container is running
docker compose ps centify-frontend

# Test nginx
curl -v http://localhost:80

# Check built files in container
docker exec centify-frontend ls -la /usr/share/nginx/html/
```

**Solutions**:

```bash
# Option 1: Rebuild frontend
cd frontend
npm run build
docker compose build centify-frontend

# Option 2: Fix nginx configuration
# Edit frontend/nginx.conf:
location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
}

# Option 3: Clear browser cache
# Ctrl+Shift+Delete in browser

# Option 4: Restart frontend
docker compose restart centify-frontend
```

### Issue 6: Deep Link Refresh Shows 404

**Problem**: Refreshing a deep link (e.g., /dashboard/accounts) returns 404

**Diagnosis**:

```bash
# Check nginx config
docker exec centify-nginx cat /etc/nginx/conf.d/default.conf | grep try_files

# Expected: try_files $uri $uri/ /index.html;
```

**Solutions**:

```bash
# Option 1: Update nginx.conf in frontend directory
location / {
    root /usr/share/nginx/html;
    index index.html;
    try_files $uri $uri/ /index.html;
}

# Option 2: Rebuild frontend
docker compose rebuild centify-frontend
docker compose restart centify-frontend

# Option 3: Verify fix
curl -I https://centifyapp.online/dashboard/accounts
# Should return 200, not 404
```

---

## EMERGENCY PROCEDURES

### Complete Service Failure

**Scenario**: All services down, need to bring back up quickly

```bash
# 1. SSH to server
ssh -i ~/.ssh/id_rsa deploy@174.138.0.12

# 2. Check what's running
docker compose ps

# 3. Check logs for errors
docker compose logs --tail=200

# 4. Restart all services
docker compose down
docker compose up -d

# 5. Verify services are healthy
docker compose ps
# All should show "Up"

# 6. Test application
curl https://centifyapp.online/api/health
open https://centifyapp.online
```

### Database Corruption

**Scenario**: PostgreSQL data corruption or won't start

```bash
# 1. Stop services
docker compose down

# 2. Backup corrupted volume
docker run --rm -v centify-postgres-data:/data -v $(pwd):/backup \
  alpine tar -czf /backup/postgres_backup_$(date +%s).tar.gz -C /data .

# 3. Remove corrupted volume
docker volume rm centify-postgres-data

# 4. Restore from backup (if available)
docker volume create centify-postgres-data
docker run --rm -v centify-postgres-data:/data -v $(pwd):/backup \
  alpine tar -xzf /backup/postgres_backup_*.tar.gz -C /data

# 5. Restart services
docker compose up -d

# 6. Verify database
docker compose exec centify-postgres psql -U centify_user -d centify -c "SELECT COUNT(*) FROM users;"
```

### Out of Disk Space

**Scenario**: /dev/sda running at 100%

```bash
# 1. Check disk usage
df -h

# 2. Find large files
du -sh /var/lib/docker/*
du -sh /var/log/*

# 3. Clean Docker (safe)
docker system prune -a --volumes

# 4. Clean logs (safe)
docker logs $(docker ps -aq) > /dev/null 2>&1
journalctl --vacuum=50M

# 5. Check disk again
df -h

# 6. If still full, upgrade droplet in DigitalOcean console
```

### Rollback to Previous Version

**Scenario**: Current deployment is broken, need to go back

```bash
# 1. Tag current images as "broken"
docker tag vickoh25/centify-backend:latest vickoh25/centify-backend:broken
docker tag vickoh25/centify-frontend:latest vickoh25/centify-frontend:broken

# 2. Pull previous version
docker pull vickoh25/centify-backend:1.0.0
docker pull vickoh25/centify-frontend:1.0.0

# 3. Update docker-compose.yml to use :1.0.0 tag
# OR update image names directly

# 4. Restart services
docker compose down
docker compose up -d

# 5. Verify
docker compose ps
curl https://centifyapp.online/api/health
```

### Certificate Emergency Renewal

**Scenario**: Certificate expiring in 1 day

```bash
# 1. Check expiry
sudo certbot certificates

# 2. Force immediate renewal
sudo certbot renew --force-renewal

# 3. Verify new certificate
sudo certbot certificates

# 4. Update nginx (if using Docker)
docker-compose restart nginx

# 5. Verify HTTPS is working
openssl s_client -connect centifyapp.online:443 -brief
```

---

## CONTACT & SUPPORT

**Project Lead**: Victor Okello  
**Email**: okellov911@gmail.com  
**GitHub**: https://github.com/vickoh25  
**Docker Hub**: https://hub.docker.com/u/vickoh25

---

## CHANGELOG

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-07-02 | Initial runbook - All modules 00-10 complete |

---

**Last Updated**: July 2026  
**Status**: Production
