#!/bin/bash

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c '\q'; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is ready - running migrations"

# Run migrations
python manage.py migrate --noinput

echo "Starting Gunicorn"

# Start Gunicorn
exec gunicorn legalsystem.wsgi:application --bind 0.0.0.0:8000
