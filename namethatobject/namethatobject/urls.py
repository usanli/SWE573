# urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token
from django.conf import settings
from django.conf.urls.static import static
from main.views import SignUpView, CustomAuthToken  # Import the SignUpView and CustomAuthToken from your main app

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('main.urls')),  # Include main app URLs
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),  # Use default token auth
    path('signup/', SignUpView.as_view(), name='signup'),  # Sign-up endpoint
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
