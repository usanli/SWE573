from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CommentViewSet, TagViewSet, UserProfileView, SignUpView  # Import SignUpView

router = DefaultRouter()
router.register(r'posts', PostViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'tags', TagViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('user/profile/', UserProfileView.as_view(), name='user_profile'),  # User profile endpoint
    path('api/signup/', SignUpView.as_view(), name='signup'),  # Signup endpoint
]
