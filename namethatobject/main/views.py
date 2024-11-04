# views.py

from django.shortcuts import render, get_object_or_404, redirect
from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny, IsAuthenticated
from .models import Post, Comment, Tag, UserProfile
from .forms import CommentForm
from .serializers import PostSerializer, CommentSerializer, TagSerializer, UserSerializer

def post_list(request):
    posts = Post.objects.all()
    return render(request, 'main/post_list.html', {'posts': posts})

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

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class SignUpView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate a token for the new user
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            "user_id": user.id,
            "username": user.username,
            "token": token.key
        }, status=status.HTTP_201_CREATED)

class UserProfileView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        }
        return Response(user_data, status=status.HTTP_200_OK)
