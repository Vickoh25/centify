# Centify Runbook

This guide provides step-by-step instructions to set up, configure, and run the Centify financial management application.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
*   **Docker & Docker Compose** (Recommended for easiest setup)
*   **Java 17 JDK** (For local backend development)
*   **Node.js 24+ & npm** (For local frontend development)
*   **PostgreSQL 16** (If running without Docker)

---

## 🚀 Quick Start (Docker Compose)

The fastest way to get Centify up and running is using Docker Compose.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Vickoh25/centify.git
    cd centify
    ```

2.  **Configure Environment Variables (Optional but Recommended):**
    Create a `.env` file in the root directory to enable email notifications:
    ```env
    CENTIFY_MAIL_USERNAME=your-email@gmail.com
    CENTIFY_MAIL_PASSWORD=your-app-password
    ```

3.  **Start the application:**
    ```bash
    docker-compose up -d
    ```

4.  **Access the app:**
    *   **Frontend:** [http://localhost](http://localhost)
    *   **Backend API:** [http://localhost/api](http://localhost/api)
    *   **Database:** `localhost:5432` (User: `centify_user`, Pass: `centify123`)

---

## 🛠️ Local Development Setup

If you want to run the services individually for development:

### 1. Database (PostgreSQL)
Run a local PostgreSQL instance or use the one from Docker:
```bash
docker run --name centify-db -e POSTGRES_DB=centify -e POSTGRES_USER=centify_user -e POSTGRES_PASSWORD=centify123 -p 5432:5432 -d postgres:16
```

### 2. Backend (Spring Boot)
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Set required environment variables (optional for OTP sending):
    ```bash
    export CENTIFY_MAIL_USERNAME="your-email@gmail.com"
    export CENTIFY_MAIL_PASSWORD="your-app-password"
    ```
3.  Run the application:
    ```bash
    ./mvnw spring-boot:run
    ```
    *The backend will be available at `http://localhost:8080`.*

### 3. Frontend (Angular)
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm start
    ```
    *The frontend will be available at `http://localhost:4200`.*

---

## 📧 Email & OTP Configuration

Centify requires email verification to add accounts, transactions, investments, or budgets.

*   **Development Mode:** If `CENTIFY_MAIL_USERNAME` is not set, OTP codes will be printed to the **backend console/logs** instead of being sent via email.
*   **Production Mode:** Use a Gmail App Password or a dedicated SMTP provider.
    *   **Host:** `smtp.gmail.com` (Default)
    *   **Port:** `587` (Default)

---

## 🧪 Testing

### Backend
Run JUnit tests:
```bash
cd backend
./mvnw test
```

### Frontend
Run Vitest tests:
```bash
cd frontend
npm test
```

---

## 📁 Project Structure

*   `/backend`: Spring Boot application (Java 17).
*   `/frontend`: Angular application (v21).
*   `/nginx.conf`: Reverse proxy configuration for Docker setup.
*   `docker-compose.yml`: Orchestration for all services.
