from django.shortcuts import render, get_object_or_404, redirect
from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny, IsAuthenticated
from rest_framework.views import APIView
from .models import Post, Comment, UserProfile
from .forms import CommentForm
from .serializers import PostSerializer, CommentSerializer, UserSerializer

# Basic view for listing posts
def post_list(request):
    posts = Post.objects.all()
    return render(request, 'main/post_list.html', {'posts': posts})

# Basic view for post details, including comments
def post_detail(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    comments = post.comments.all()
    
    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.post = post
            comment.save()
            return redirect('post_detail', post_id=post.id)
    else:
        form = CommentForm()

    return render(request, 'main/post_detail.html', {
        'post': post,
        'comments': comments,
        'form': form
    })

# API ViewSet for managing posts
class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]  # Allow read-only access to unauthenticated users

    def perform_create(self, serializer):
        # Automatically assign the logged-in user as the author
        serializer.save(author=self.request.user)

# API ViewSet for managing comments
class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]  # Allow read-only access to unauthenticated users

    def perform_create(self, serializer):
        # Automatically assign the logged-in user as the author
        serializer.save(author=self.request.user)

# API View for user sign-up
class SignUpView(APIView):
    permission_classes = []

    def post(self, request, *args, **kwargs):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            "user_id": user.id,
            "username": user.username,
            "token": token.key
        }, status=status.HTTP_201_CREATED)

# API View for retrieving the user profile
class UserProfileView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            # You can extend this with additional info like posts, comments, etc.
        }
        return Response(user_data, status=status.HTTP_200_OK)
