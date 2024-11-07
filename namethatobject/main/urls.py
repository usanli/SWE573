# main/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CommentViewSet, TagViewSet, UserProfileView, SignUpView

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='posts')
router.register(r'comments', CommentViewSet, basename='comments')
router.register(r'tags', TagViewSet, basename='tags')

urlpatterns = [
    path('', include(router.urls)),  # Main router
    path('user/profile/', UserProfileView.as_view(), name='user_profile'),
    path('signup/', SignUpView.as_view(), name='signup'),
]
