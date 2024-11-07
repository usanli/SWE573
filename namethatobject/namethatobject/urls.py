# project_root/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('main.urls')),  # Include all main app URLs at root
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
    path('signup/', include('main.urls')),  # Avoid if duplicate with main
]

# Serve media files
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
