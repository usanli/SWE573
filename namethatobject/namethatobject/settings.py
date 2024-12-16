from pathlib import Path
import os
import environ
import logging
import dj_database_url

# Initialize environment variables
env = environ.Env()
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file
env_file = os.path.join(BASE_DIR, '.env')
if os.path.exists(env_file):
    print("Loading .env file...")  # Debug print
    environ.Env.read_env(env_file)
else:
    print("No .env file found.")  # Debug print

# Secret settings
SECRET_KEY = env('SECRET_KEY', default='django-insecure-rw+w$afnp_)3#t*!4v2@y4v8slmihuxuie^a-h0*$)1l8&1!0-')
DEBUG = env.bool('DEBUG', default=False)
print(f"DEBUG mode is {'ON' if DEBUG else 'OFF'}")  # Debug print

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['127.0.0.1'])
print(f"ALLOWED_HOSTS: {ALLOWED_HOSTS}")  # Debug print

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'main',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'cloudinary_storage',
    'cloudinary',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'namethatobject.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'namethatobject.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB'),
        'USER': os.getenv('POSTGRES_USER'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD'),
        'HOST': os.getenv('POSTGRES_HOST'),
        'PORT': os.getenv('POSTGRES_PORT'),
        'OPTIONS': {
            'sslmode': 'require',
        },
    }
}


AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://namethatobject.com",
    "http://85.95.239.229",
    "https://swe573-frontend.onrender.com"
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_ALL_ORIGINS = True

# Logging setup to output errors to console in development
if DEBUG:
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'handlers': {
            'console': {
                'class': 'logging.StreamHandler',
            },
        },
        'loggers': {
            'django.db.backends': {
                'handlers': ['console'],
                'level': 'DEBUG',
            },
        },
    }

    print("Logging is set to DEBUG mode")  # Debug print
else:
    print("Running in Production Mode")

# Media files configuration
if DEBUG:
    MEDIA_URL = '/media/'
    MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
else:
    # Cloudinary settings
    CLOUDINARY_URL = os.getenv('CLOUDINARY_URL', 'cloudinary://933862383921948:Oq3HNZcXLmU08kGXBlO-Qo6fzlM@dbrvvzoys')
    
    CLOUDINARY_STORAGE = {
        'CLOUD_NAME': 'dbrvvzoys',
        'API_KEY': '933862383921948',
        'API_SECRET': 'Oq3HNZcXLmU08kGXBlO-Qo6fzlM',
        'SECURE': True
    }
    
    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
    MEDIA_URL = 'https://res.cloudinary.com/dbrvvzoys/image/upload/'

# Add these settings for CSRF
CSRF_TRUSTED_ORIGINS = [
    "https://swe573-backend.onrender.com",
    "https://swe573-frontend.onrender.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Update security settings
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    CSRF_USE_SESSIONS = True
    CSRF_COOKIE_SAMESITE = 'Strict'

if not DEBUG:
    # Use whitenoise for static files in production
    MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
