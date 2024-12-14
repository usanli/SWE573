# Use the official Python image from the Docker Hub
FROM python:3.13-slim

# Install only the necessary dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set working directory
WORKDIR /app

# Copy requirements.txt and install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Django project into the container
COPY . /app/

# Create static directory if it doesn't exist
RUN mkdir -p /app/static

# Collect static files
RUN python manage.py collectstatic --noinput --clear

# Expose port 8000
EXPOSE 8000

# Create a startup script
RUN echo '#!/bin/bash\n\
python manage.py makemigrations\n\
python manage.py migrate\n\
gunicorn --bind 0.0.0.0:8000 namethatobject.wsgi:application' > /app/start.sh

RUN chmod +x /app/start.sh

# Start using the startup script
CMD ["/app/start.sh"]
