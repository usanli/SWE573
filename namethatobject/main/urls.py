# main/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CommentViewSet, UserProfileView, SignUpView  # Removed TagViewSet

router = DefaultRouter()
router.register(r'posts', PostViewSet)
router.register(r'comments', CommentViewSet)

# Define URL patterns
urlpatterns = [
    path('', include(router.urls)),
    path('user/profile/', UserProfileView.as_view(), name='user_profile'),  # User profile endpoint
    path('user/profile/<str:username>/', UserProfileView.as_view(), name='user_profile_detail'),
    path('api/signup/', SignUpView.as_view(), name='signup'),  # Signup endpoint
]
