# Gondar Legal Affairs System

A comprehensive legal case management system built with Django REST Framework and React.

## Features

- Case registration and management with file attachments
- Role-based access control (Admin, Head, Legal Officer, Staff, Reporter)
- Document management with upload/download capabilities
- Hearing and deadline tracking with notifications
- Scholarship agreement management
- Real-time notifications system

## Local Development Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 16+

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Configure .env with your local settings (DB_HOST=localhost, etc.)
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Configure VITE_API_BASE_URL=http://localhost:8000
npm run dev
```

## Docker Setup

### Quick Start

```bash
# Copy environment file and configure
cp .env.example .env

# Start all services
docker-compose up --build

# Access the application at http://localhost
```

### Docker Services

- **db**: PostgreSQL 16 database with healthcheck
- **backend**: Django application with Gunicorn
- **frontend**: React application served by nginx

### Environment Variables

See `.env.example` for all required variables:

- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`: Database credentials
- `DB_HOST`: Use `db` for Docker, `localhost` for local development
- `SECRET_KEY`: Django secret key
- `DEBUG`: Set to `True` for development, `False` for production
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins
- `VITE_API_BASE_URL`: Backend API URL for frontend

### Docker Commands

```bash
# Build and start services
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Run migrations manually
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

## Security Note

The `/admin/` endpoint should not be exposed publicly without additional authentication/protection before any real deployment. Configure appropriate firewall rules and authentication mechanisms for production use.

## Project Structure

```
gondar-legal-system/
├── backend/                 # Django REST Framework backend
│   ├── accounts/           # User authentication
│   ├── cases/              # Case management
│   ├── documents/          # Document handling
│   ├── hearings/           # Hearings and deadlines
│   ├── agreements/         # Scholarship agreements
│   ├── notifications/      # Notification system
│   └── core/               # Shared models (campus, department, category)
├── frontend/               # React frontend
│   ├── src/
│   │   ├── api/           # API calls
│   │   ├── components/    # Reusable components
│   │   └── pages/         # Page components
│   └── public/
└── docker-compose.yml      # Docker orchestration
```

## API Endpoints

- `/api/auth/` - Authentication (login, register)
- `/api/cases/` - Case management
- `/api/documents/` - Document upload/download
- `/api/hearings/hearings/` - Hearing management
- `/api/hearings/deadlines/` - Deadline management
- `/api/agreements/` - Scholarship agreements
- `/api/notifications/` - User notifications

## License

Proprietary - All rights reserved
