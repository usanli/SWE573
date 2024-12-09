from django.shortcuts import render, get_object_or_404, redirect
from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.decorators import action, api_view, permission_classes
from .models import Post, Comment, UserProfile
from .forms import CommentForm
from .serializers import PostSerializer, CommentSerializer, UserSerializer, UserProfileSerializer

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

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        # Check if user is the author
        if instance.author != request.user:
            return Response(
                {"error": "Only the author can update this post"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Handle the eureka_comment update
        if 'eureka_comment' in request.data:
            instance.eureka_comment = request.data['eureka_comment']
        
        # Handle tags update
        if 'tags' in request.data:
            instance.tags = request.data['tags']
        
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def upvote(self, request, pk=None):
        post = self.get_object()
        post.upvotes += 1
        post.save()
        return Response({'points': post.points, 'upvotes': post.upvotes, 'downvotes': post.downvotes}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def downvote(self, request, pk=None):
        post = self.get_object()
        post.downvotes += 1
        post.save()
        return Response({'points': post.points, 'upvotes': post.upvotes, 'downvotes': post.downvotes}, status=status.HTTP_200_OK)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        
        # Check if user is the author
        if comment.author != request.user:
            return Response(
                {"error": "Only the author can delete this comment"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        # Check if comment is an eureka comment
        post = comment.post
        if post.eureka_comment == comment.id:
            return Response(
                {"error": "Cannot delete a eureka comment"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def upvote(self, request, pk=None):
        comment = self.get_object()
        comment.upvotes += 1
        comment.save()
        return Response(
            {
                'points': comment.points,
                'upvotes': comment.upvotes,
                'downvotes': comment.downvotes,
                'tag': comment.tag  # Include the tag in the response
            },
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def downvote(self, request, pk=None):
        comment = self.get_object()
        comment.downvotes += 1
        comment.save()
        return Response(
            {
                'points': comment.points,
                'upvotes': comment.upvotes,
                'downvotes': comment.downvotes,
                'tag': comment.tag  # Include the tag in the response
            },
            status=status.HTTP_200_OK
        )



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

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username=None):
        try:
            if username:
                user = get_object_or_404(User, username=username)
                profile = get_object_or_404(UserProfile, user=user)
            else:
                profile = get_object_or_404(UserProfile, user=request.user)
            
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'message': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def patch(self, request):
        try:
            profile = get_object_or_404(UserProfile, user=request.user)
            serializer = UserProfileSerializer(profile, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'message': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    try:
        user = request.user
        
        # Get all user's posts
        posts = Post.objects.filter(author=user)
        
        # Handle posts based on comments
        for post in posts:
            comment_count = Comment.objects.filter(post=post).count()
            if comment_count > 0:
                # If post has comments, mark as anonymous
                post.anonymize()
            else:
                # If no comments, mark as deleted
                post.is_deleted = True
                post.save()

        # Anonymize all comments
        Comment.objects.filter(author=user).update(is_anonymous=True)
        
        # Delete the user
        user.delete()
        
        return Response({"message": "Account successfully deleted"}, 
                      status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)
